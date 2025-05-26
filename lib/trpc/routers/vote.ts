import { TRPCError } from '@trpc/server';
import { and, eq, inArray, ne } from 'drizzle-orm';
import { z } from 'zod';

import {
  ESSENTIAL_ITEM_LIST,
  QUORUM_AMOUNT,
  REWARD_PERCENT,
  WEIGHT,
} from '@/lib/constants';
import {
  itemProposals,
  profiles,
  projects,
  proposals,
  voteRecords,
} from '@/lib/db/schema';
import { projectLogs } from '@/lib/db/schema/projectLogs';
import { POC_ITEMS } from '@/lib/pocItems';
import { logUserActivity } from '@/lib/services/activeLogsService';
import {
  addRewardNotification,
  createRewardNotification,
} from '@/lib/services/notification';

import { protectedProcedure, publicProcedure, router } from '../server';

export const voteRouter = router({
  createVote: protectedProcedure
    .input(
      z.object({
        proposalId: z.number(),
        key: z.string().min(1, 'Key cannot be empty'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { proposalId, key } = input;

      const [proposalWithProject, userProfile, existingVote] =
        await Promise.all([
          ctx.db.query.proposals.findFirst({
            where: eq(proposals.id, proposalId),
            with: {
              project: true,
            },
          }),
          ctx.db.query.profiles.findFirst({
            where: eq(profiles.userId, ctx.user.id),
          }),
          ctx.db.query.voteRecords.findFirst({
            where: and(
              eq(voteRecords.creator, ctx.user.id),
              eq(voteRecords.key, key),
              eq(voteRecords.proposalId, proposalId),
            ),
          }),
        ]);

      if (!proposalWithProject) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Proposal not found',
        });
      }

      if (!proposalWithProject.project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Associated project not found',
        });
      }

      const projectId = proposalWithProject.projectId;

      if (proposalWithProject.project.isPublished) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot vote on proposals for published projects',
        });
      }

      if (existingVote) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You have already voted for this key in this proposal',
        });
      }

      const otherVote = await ctx.db.query.voteRecords.findFirst({
        where: and(
          eq(voteRecords.creator, ctx.user.id),
          eq(voteRecords.key, key),
          eq(voteRecords.projectId, projectId),
          ne(voteRecords.proposalId, proposalId),
        ),
      });

      if (otherVote) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'You have already voted for the same key in another proposal of this project',
        });
      }

      const [vote] = await ctx.db
        .insert(voteRecords)
        .values({
          key,
          proposalId,
          creator: ctx.user.id,
          weight: userProfile?.weight ?? 0,
          projectId,
        })
        .returning();

      logUserActivity.vote.create({
        userId: ctx.user.id,
        targetId: vote.id,
        projectId,
        items: [{ field: key }],
        proposalCreatorId: proposalWithProject.creator,
      });

      return vote;
    }),

  switchVote: protectedProcedure
    .input(
      z.object({
        proposalId: z.number(),
        key: z.string().min(1, 'Key cannot be empty'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { proposalId, key } = input;

      const targetProposal = await ctx.db.query.proposals.findFirst({
        where: eq(proposals.id, proposalId),
        with: {
          project: true,
        },
      });

      if (!targetProposal) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Target proposal not found',
        });
      }

      if (!targetProposal.project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Associated project not found',
        });
      }

      if (targetProposal.project.isPublished) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot switch votes on proposals for published projects',
        });
      }

      const [userProfile, voteToSwitch] = await Promise.all([
        ctx.db.query.profiles.findFirst({
          where: eq(profiles.userId, ctx.user.id),
        }),
        ctx.db.query.voteRecords.findFirst({
          where: and(
            eq(voteRecords.creator, ctx.user.id),
            eq(voteRecords.key, key),
            eq(voteRecords.projectId, targetProposal.projectId),
          ),
          with: {
            proposal: true,
          },
        }),
      ]);

      if (!voteToSwitch) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No conflicting vote found to switch',
        });
      }

      if (
        voteToSwitch.proposal &&
        voteToSwitch.proposal.creator === ctx.user.id
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot switch vote from your own proposal',
        });
      }

      if (voteToSwitch.proposalId === proposalId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You have already voted for this key in the target proposal',
        });
      }

      const [updatedVote] = await ctx.db
        .update(voteRecords)
        .set({
          proposalId,
          weight: userProfile?.weight ?? 0,
        })
        .where(eq(voteRecords.id, voteToSwitch.id))
        .returning();

      logUserActivity.vote.update({
        userId: ctx.user.id,
        targetId: updatedVote.id,
        projectId: targetProposal.projectId,
        items: [{ field: key }],
        proposalCreatorId: targetProposal.creator,
      });

      return updatedVote;
    }),

  cancelVote: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      const condition = and(
        eq(voteRecords.id, id),
        eq(voteRecords.creator, ctx.user.id),
      );

      const voteWithDetails = await ctx.db.query.voteRecords.findFirst({
        where: condition,
        with: {
          proposal: {
            with: {
              project: true,
            },
          },
        },
      });

      if (!voteWithDetails || !voteWithDetails.proposal) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Vote record not found',
        });
      }

      if (!voteWithDetails.proposal.project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Associated project not found',
        });
      }

      if (voteWithDetails.proposal.creator === ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot cancel vote on your own proposal',
        });
      }

      if (voteWithDetails.proposal.project.isPublished) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot cancel votes on proposals for published projects',
        });
      }

      const [deletedVote] = await ctx.db
        .delete(voteRecords)
        .where(condition)
        .returning();

      logUserActivity.vote.delete({
        userId: ctx.user.id,
        targetId: deletedVote.id,
        projectId: voteWithDetails.proposal!.projectId,
        items: [{ field: voteWithDetails.key }],
        proposalCreatorId: voteWithDetails.proposal!.creator,
      });

      return deletedVote;
    }),

  getVotesByProposalId: publicProcedure
    .input(
      z.object({
        proposalId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const votes = await ctx.db.query.voteRecords.findMany({
        with: {
          creator: true,
        },
        where: eq(voteRecords.proposalId, input.proposalId),
      });

      return votes;
    }),

  getVotesByProjectId: publicProcedure
    .input(
      z.object({
        projectId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { projectId } = input;

      const projectProposals = await ctx.db.query.proposals.findMany({
        where: eq(proposals.projectId, projectId),
      });

      if (!projectProposals || projectProposals.length === 0) {
        return [];
      }

      const proposalIds = projectProposals.map((p) => p.id);

      const votes = await ctx.db.query.voteRecords.findMany({
        with: {
          creator: true,
        },
        where: inArray(voteRecords.proposalId, proposalIds),
      });

      return votes;
    }),

  createItemProposalVote: protectedProcedure
    .input(
      z.object({
        itemProposalId: z.number(),
        key: z.string().min(1, 'Key cannot be empty'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { itemProposalId, key } = input;

      const [itemProposal, userProfile] = await Promise.all([
        ctx.db.query.itemProposals.findFirst({
          where: eq(itemProposals.id, itemProposalId),
          with: {
            creator: true,
          },
        }),
        ctx.db.query.profiles.findFirst({
          where: eq(profiles.userId, ctx.user.id),
        }),
      ]);
      if (!itemProposal) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Item proposal not found',
        });
      }

      const existingVote = await ctx.db.query.voteRecords.findMany({
        where: and(
          eq(voteRecords.creator, ctx.user.id),
          eq(voteRecords.projectId, itemProposal.projectId),
          eq(voteRecords.key, key),
        ),
      });

      if (existingVote.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You have already voted for this key in this project',
        });
      }

      const [vote] = await ctx.db
        .insert(voteRecords)
        .values({
          key,
          itemProposalId,
          creator: ctx.user.id,
          weight: userProfile?.weight ?? 0,
          projectId: itemProposal.projectId,
        })
        .returning();

      const [votes, project] = await Promise.all([
        ctx.db.query.voteRecords.findMany({
          where: and(
            eq(voteRecords.itemProposalId, itemProposalId),
            eq(voteRecords.key, key),
          ),
        }),
        ctx.db.query.projects.findFirst({
          where: eq(projects.id, itemProposal.projectId),
        }),
      ]);

      let needCheckQuorum = false;
      const isEssentialItem = ESSENTIAL_ITEM_LIST.some(
        (item) => item.key === input.key,
      );

      if (!isEssentialItem) {
        const hasLeadingProposal = await ctx.db.query.projectLogs.findFirst({
          where: and(
            eq(projectLogs.projectId, itemProposal.projectId),
            eq(projectLogs.key, input.key),
          ),
        });
        if (!hasLeadingProposal) {
          needCheckQuorum = true;
        }
      }
      if (!needCheckQuorum) {
        const voteSum = votes.reduce((acc, vote) => {
          acc += vote.weight ?? 0;
          return acc;
        }, 0);

        const itemsTopWeight = project?.itemsTopWeight as
          | Record<string, number>
          | undefined;
        const keyWeight = itemsTopWeight?.[key] ?? 0;

        if (voteSum > keyWeight) {
          const reward =
            POC_ITEMS[input.key as keyof typeof POC_ITEMS]
              .accountability_metric *
            WEIGHT *
            (1 - REWARD_PERCENT);
          const finalWeight = (itemProposal.creator.weight ?? 0) + reward;
          await Promise.all([
            ctx.db.insert(projectLogs).values({
              projectId: itemProposal.projectId,
              itemProposalId,
              key,
            }),
            ctx.db.update(projects).set({
              itemsTopWeight: {
                ...(project?.itemsTopWeight ?? {}),
                [key]: voteSum,
              },
            }),
            ctx.db
              .update(profiles)
              .set({
                weight: finalWeight,
              })
              .where(eq(profiles.userId, itemProposal.creator.userId)),
          ]);

          await addRewardNotification(
            createRewardNotification.proposalPass(
              ctx.user.id,
              itemProposal.projectId,
              itemProposal.id,
              reward,
            ),
          );
        }
      } else {
        const votes = await ctx.db.query.voteRecords.findMany({
          where: and(
            eq(voteRecords.itemProposalId, itemProposalId),
            eq(voteRecords.key, key),
          ),
        });
        if (votes.length >= QUORUM_AMOUNT) {
          const voteSum = votes.reduce((acc, vote) => {
            acc += vote.weight ?? 0;
            return acc;
          }, 0);

          const itemsTopWeight = project?.itemsTopWeight as
            | Record<string, number>
            | undefined;
          const keyWeight = itemsTopWeight?.[key] ?? 0;

          if (voteSum > keyWeight) {
            const reward =
              POC_ITEMS[input.key as keyof typeof POC_ITEMS]
                .accountability_metric * WEIGHT;
            const finalWeight = (itemProposal.creator.weight ?? 0) + reward;
            await Promise.all([
              ctx.db.insert(projectLogs).values({
                projectId: itemProposal.projectId,
                itemProposalId,
                key,
              }),
              ctx.db.update(projects).set({
                itemsTopWeight: {
                  ...(project?.itemsTopWeight ?? {}),
                  [key]: voteSum,
                },
              }),
              ctx.db
                .update(profiles)
                .set({
                  weight: finalWeight,
                })
                .where(eq(profiles.userId, itemProposal.creator.userId)),
            ]);
            await addRewardNotification(
              createRewardNotification.proposalPass(
                ctx.user.id,
                itemProposal.projectId,
                itemProposal.id,
                reward,
              ),
            );
          }
        }
      }

      logUserActivity.vote.create({
        userId: ctx.user.id,
        targetId: vote.id,
        projectId: itemProposal.projectId,
        items: [{ field: key }],
        proposalCreatorId: itemProposal.creator,
      });

      return vote;
    }),

  switchItemProposalVote: protectedProcedure
    .input(
      z.object({
        itemProposalId: z.number(),
        key: z.string().min(1, 'Key cannot be empty'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { itemProposalId, key } = input;

      const [targetItemProposal, userProfile] = await Promise.all([
        ctx.db.query.itemProposals.findFirst({
          where: eq(itemProposals.id, itemProposalId),
          with: {
            creator: true,
          },
        }),
        ctx.db.query.profiles.findFirst({
          where: eq(profiles.userId, ctx.user.id),
        }),
      ]);

      if (!targetItemProposal) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Target item proposal not found',
        });
      }

      const projectId = targetItemProposal.projectId;

      const voteToSwitch = await ctx.db.query.voteRecords.findFirst({
        where: and(
          eq(voteRecords.creator, ctx.user.id),
          eq(voteRecords.key, key),
          eq(voteRecords.projectId, projectId),
        ),
      });

      if (!voteToSwitch) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No conflicting vote found to switch',
        });
      }

      if (voteToSwitch.itemProposalId === itemProposalId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'You have already voted for this key in the target item proposal',
        });
      }

      const [updatedVote] = await ctx.db
        .update(voteRecords)
        .set({
          itemProposalId,
          proposalId: null,
          weight: userProfile?.weight ?? 0,
        })
        .where(eq(voteRecords.id, voteToSwitch.id))
        .returning();

      const [votes, project] = await Promise.all([
        ctx.db.query.voteRecords.findMany({
          where: and(
            eq(voteRecords.itemProposalId, itemProposalId),
            eq(voteRecords.key, key),
          ),
        }),
        ctx.db.query.projects.findFirst({
          where: eq(projects.id, projectId),
        }),
      ]);

      let needCheckQuorum = false;
      const isEssentialItem = ESSENTIAL_ITEM_LIST.some(
        (item) => item.key === input.key,
      );

      if (!isEssentialItem) {
        const hasLeadingProposal = await ctx.db.query.projectLogs.findFirst({
          where: and(
            eq(projectLogs.projectId, projectId),
            eq(projectLogs.key, input.key),
          ),
        });
        if (!hasLeadingProposal) {
          needCheckQuorum = true;
        }
      }

      if (!needCheckQuorum) {
        const voteSum = votes.reduce((acc, vote) => {
          acc += vote.weight ?? 0;
          return acc;
        }, 0);

        const itemsTopWeight = project?.itemsTopWeight as
          | Record<string, number>
          | undefined;
        const keyWeight = itemsTopWeight?.[key] ?? 0;

        if (voteSum > keyWeight) {
          const reward =
            POC_ITEMS[input.key as keyof typeof POC_ITEMS]
              .accountability_metric *
            WEIGHT *
            (1 - REWARD_PERCENT);
          const finalWeight = (targetItemProposal.creator.weight ?? 0) + reward;
          await Promise.all([
            ctx.db.insert(projectLogs).values({
              projectId,
              itemProposalId,
              key,
            }),
            ctx.db.update(projects).set({
              itemsTopWeight: {
                ...(project?.itemsTopWeight ?? {}),
                [key]: voteSum,
              },
            }),
            ctx.db
              .update(profiles)
              .set({
                weight: finalWeight,
              })
              .where(eq(profiles.userId, targetItemProposal.creator.userId)),
          ]);
          await addRewardNotification(
            createRewardNotification.proposalPass(
              ctx.user.id,
              targetItemProposal.projectId,
              targetItemProposal.id,
              reward,
            ),
          );
        }
      } else {
        if (votes.length >= QUORUM_AMOUNT) {
          const voteSum = votes.reduce((acc, vote) => {
            acc += vote.weight ?? 0;
            return acc;
          }, 0);

          const itemsTopWeight = project?.itemsTopWeight as
            | Record<string, number>
            | undefined;
          const keyWeight = itemsTopWeight?.[key] ?? 0;

          if (voteSum > keyWeight) {
            const reward =
              POC_ITEMS[input.key as keyof typeof POC_ITEMS]
                .accountability_metric * WEIGHT;
            const finalWeight =
              (targetItemProposal.creator.weight ?? 0) + reward;
            await Promise.all([
              ctx.db.insert(projectLogs).values({
                projectId,
                itemProposalId,
                key,
              }),
              ctx.db.update(projects).set({
                itemsTopWeight: {
                  ...(project?.itemsTopWeight ?? {}),
                  [key]: voteSum,
                },
              }),
              ctx.db
                .update(profiles)
                .set({
                  weight: finalWeight,
                })
                .where(eq(profiles.userId, targetItemProposal.creator.userId)),
            ]);
            await addRewardNotification(
              createRewardNotification.proposalPass(
                ctx.user.id,
                targetItemProposal.projectId,
                targetItemProposal.id,
                reward,
              ),
            );
          }
        }
      }

      if (voteToSwitch.itemProposalId) {
        const originalLeadingCheck = await ctx.db.query.projectLogs.findFirst({
          where: and(
            eq(projectLogs.projectId, projectId),
            eq(projectLogs.key, key),
          ),
          orderBy: (projectLogs, { desc }) => [desc(projectLogs.createdAt)],
        });
        if (voteToSwitch.itemProposalId === originalLeadingCheck?.proposalId) {
          const votes = await ctx.db.query.voteRecords.findMany({
            where: and(
              eq(voteRecords.itemProposalId, originalLeadingCheck?.proposalId),
              eq(voteRecords.key, key),
            ),
          });
          const voteSum = votes.reduce((acc, vote) => {
            acc += vote.weight ?? 0;
            return acc;
          }, 0);

          const itemsTopWeight = project?.itemsTopWeight as
            | Record<string, number>
            | undefined;
          const keyWeight = itemsTopWeight?.[key] ?? 0;

          if (voteSum < keyWeight) {
            await ctx.db.update(projectLogs).set({
              isNotLeading: true,
            });
          }
        }
      }

      logUserActivity.vote.update({
        userId: ctx.user.id,
        targetId: updatedVote.id,
        projectId,
        items: [{ field: key }],
        proposalCreatorId: targetItemProposal.creator,
      });

      return updatedVote;
    }),
});
