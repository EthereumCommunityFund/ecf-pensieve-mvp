import { TRPCError } from '@trpc/server';
import { and, desc, eq, gt, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';

import {
  ESSENTIAL_ITEM_AMOUNT,
  ESSENTIAL_ITEM_WEIGHT_AMOUNT,
  QUORUM_AMOUNT,
  REWARD_PERCENT,
  WEIGHT,
} from '@/lib/constants';
import { projectLogs, projects, voteRecords } from '@/lib/db/schema';
import { itemProposals } from '@/lib/db/schema/itemProposals';
import { proposals } from '@/lib/db/schema/proposals';
import { POC_ITEMS } from '@/lib/pocItems';
import {
  addRewardNotification,
  createRewardNotification,
} from '@/lib/services/notification';
import { updateUserWeight } from '@/lib/services/userWeightService';
import { protectedProcedure, publicProcedure, router } from '@/lib/trpc/server';

import { proposalRouter } from './proposal';

export const projectRouter = router({
  createProject: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Name cannot be empty'),
        tagline: z.string().min(1, 'Tagline cannot be empty'),
        categories: z
          .array(z.string())
          .min(1, 'At least one category is required'),
        mainDescription: z.string().min(1, 'Main description cannot be empty'),
        logoUrl: z.string().min(1, 'Logo URL cannot be empty'),
        websites: z
          .array(
            z.object({
              title: z.string().min(1, 'Website title cannot be empty'),
              url: z.string().min(1, 'Website URL cannot be empty'),
            }),
          )
          .min(1, 'At least one website is required'),
        appUrl: z.string().optional(),
        dateFounded: z.date(),
        dateLaunch: z.date().optional(),
        devStatus: z.string().min(1, 'Development status cannot be empty'),
        fundingStatus: z.string().optional(),
        openSource: z.boolean(),
        codeRepo: z.string().optional(),
        tokenContract: z.string().optional(),
        orgStructure: z
          .string()
          .min(1, 'Organization structure cannot be empty'),
        publicGoods: z.boolean(),
        founders: z
          .array(
            z.object({
              name: z.string().min(1, 'Founder name cannot be empty'),
              title: z.string().min(1, 'Founder title cannot be empty'),
            }),
          )
          .min(1, 'At least one founder is required'),
        tags: z.array(z.string()).min(1, 'At least one tag is required'),
        whitePaper: z.string().optional(),
        dappSmartContracts: z.string().optional(),
        refs: z
          .array(
            z.object({
              key: z.string().min(1, 'Key cannot be empty'),
              value: z.string().min(1, 'Value cannot be empty'),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.transaction(async (tx) => {
          const proposalItems = Object.entries(input)
            .filter(([key]) => key !== 'refs')
            .map(([key, value]) => {
              return { key, value };
            });

          const hasProposalKeys = proposalItems.map((item) => item.key);

          const [project] = await tx
            .insert(projects)
            .values({
              ...input,
              creator: ctx.user.id,
              hasProposalKeys,
            })
            .returning();

          if (!project) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'project not found',
            });
          }
          const caller = proposalRouter.createCaller({
            ...ctx,
            db: tx as any,
          });

          await updateUserWeight(
            ctx.user.id,
            ESSENTIAL_ITEM_WEIGHT_AMOUNT * REWARD_PERCENT,
            tx,
          );

          const proposal = await caller.createProposal({
            projectId: project.id,
            items: proposalItems,
            ...(input.refs && { refs: input.refs }),
          });

          await addRewardNotification(
            createRewardNotification.createProposal(
              ctx.user.id,
              project.id,
              proposal.id,
              ESSENTIAL_ITEM_WEIGHT_AMOUNT * REWARD_PERCENT,
            ),
            tx,
          );

          return project;
        });
      } catch (error) {
        console.error('Error in createProject:', {
          userId: ctx.user.id,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        });
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create project',
          cause: error,
        });
      }
    }),

  getProjects: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(50),
          cursor: z.number().optional(),
          isPublished: z.boolean().optional().default(false),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 50;
      const cursor = input?.cursor;
      const isPublished = input?.isPublished ?? false;

      const baseCondition = eq(projects.isPublished, isPublished);
      const whereCondition = cursor
        ? and(baseCondition, gt(projects.id, cursor))
        : baseCondition;

      const queryOptions: any = {
        creator: true,
      };

      if (!isPublished) {
        queryOptions.proposals = {
          with: {
            voteRecords: {
              with: {
                creator: true,
              },
            },
            creator: true,
          },
        };
      }

      const [results, totalCountResult] = await Promise.all([
        ctx.db.query.projects.findMany({
          with: queryOptions,
          where: whereCondition,
          orderBy: desc(projects.id),
          limit,
        }),
        ctx.db
          .select({ count: sql`count(*)::int` })
          .from(projects)
          .where(eq(projects.isPublished, isPublished)),
      ]);

      const nextCursor =
        results.length === limit ? results[results.length - 1].id : undefined;

      const totalCount = Number(totalCountResult[0]?.count ?? 0);

      return {
        items: results,
        nextCursor,
        totalCount,
      };
    }),

  getProjectById: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.query.projects.findFirst({
        with: {
          creator: true,
          proposals: {
            with: {
              voteRecords: {
                with: {
                  creator: true,
                },
              },
              creator: true,
            },
          },
        },
        where: eq(projects.id, input.id),
      });

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }

      return project;
    }),

  scanPendingProject: publicProcedure.query(async ({ ctx }) => {
    try {
      const pocItemsConfig = Object.entries(POC_ITEMS)
        .filter(([_, config]) => config.isEssential)
        .map(([key, config]) => ({
          key,
          required_weight: config.accountability_metric * WEIGHT,
        }));

      const eligibleProjectsQuery = sql`
        WITH poc_config AS (
          SELECT * FROM (VALUES ${sql.join(
            pocItemsConfig.map(
              ({ key, required_weight }) =>
                sql`(${key}, ${required_weight}::numeric)`,
            ),
            sql`, `,
          )}) AS t(key, required_weight)
        ),
        project_proposal_votes AS (
          SELECT 
            p.id as project_id,
            prop.id as proposal_id,
            prop.creator as proposal_creator,
            prop.items,
            prop.created_at as proposal_created_at,
            vr.key as vote_key,
            COUNT(DISTINCT CASE WHEN vr.key = item_key.key THEN vr.creator END) as key_voters,
            SUM(CASE WHEN vr.key = item_key.key THEN vr.weight ELSE 0 END) as key_weight,
            pc.required_weight
          FROM projects p
          JOIN proposals prop ON p.id = prop.project_id
          JOIN vote_records vr ON prop.id = vr.proposal_id 
            AND vr.project_id = p.id
          CROSS JOIN LATERAL (
            SELECT (unnest(prop.items)->>'key') as key
          ) item_key
          JOIN poc_config pc ON vr.key = pc.key AND item_key.key = pc.key
          WHERE p.is_published = false
            AND vr.item_proposal_id IS NULL 
          GROUP BY p.id, prop.id, prop.creator, prop.items, prop.created_at, vr.key, item_key.key, pc.required_weight
        ),
        valid_proposals AS (
          SELECT 
            project_id,
            proposal_id,
            proposal_creator,
            items,
            proposal_created_at,
            SUM(key_weight) as total_weight
          FROM project_proposal_votes
          WHERE key_voters >= ${QUORUM_AMOUNT}
            AND key_weight > required_weight
          GROUP BY project_id, proposal_id, proposal_creator, items, proposal_created_at
          HAVING COUNT(*) = ${ESSENTIAL_ITEM_AMOUNT}
        ),
        ranked_proposals AS (
          SELECT 
            project_id,
            proposal_id,
            proposal_creator,
            items,
            total_weight,
            ROW_NUMBER() OVER (
              PARTITION BY project_id 
              ORDER BY total_weight DESC, proposal_created_at DESC
            ) as rn
          FROM valid_proposals
        )
        SELECT 
          project_id,
          proposal_id,
          proposal_creator,
          items
        FROM ranked_proposals
        WHERE rn = 1
      `;

      const eligibleProjects = await ctx.db.execute(eligibleProjectsQuery);

      if (eligibleProjects.length === 0) {
        return {
          success: true,
          processedCount: 0,
          message: 'No projects found that meet the publishing criteria',
        };
      }

      const results = await ctx.db.transaction(async (tx) => {
        let processedCount = 0;

        for (const project of eligibleProjects) {
          try {
            const projectId = Number(project.project_id);
            const proposalId = Number(project.proposal_id);
            const proposalCreator = String(project.proposal_creator);

            const projectVoteRecords = await tx.query.voteRecords.findMany({
              where: and(
                eq(voteRecords.projectId, projectId),
                eq(voteRecords.proposalId, proposalId),
                isNull(voteRecords.itemProposalId),
              ),
            });

            const itemsTopWeight: Record<string, number> = {};
            for (const voteRecord of projectVoteRecords) {
              const key = String(voteRecord.key);
              itemsTopWeight[key] =
                (itemsTopWeight[key] || 0) + (voteRecord.weight ?? 0);
            }

            const [updatedProject] = await tx
              .update(projects)
              .set({
                isPublished: true,
                itemsTopWeight,
              })
              .where(eq(projects.id, projectId))
              .returning({
                id: projects.id,
                name: projects.name,
                tagline: projects.tagline,
                logoUrl: projects.logoUrl,
              });

            const originalProposal = await tx.query.proposals.findFirst({
              where: eq(proposals.id, proposalId),
            });

            if (originalProposal && originalProposal.items) {
              const itemProposalMap: Record<string, number> = {};

              const formatRefs = (refs: any, key: string) => {
                if (!refs || !Array.isArray(refs) || refs.length === 0) {
                  return null;
                }

                return refs.find((ref: any) => ref.key === key)?.value || null;
              };

              for (const item of originalProposal.items as any[]) {
                if (item.key) {
                  const [newItemProposal] = await tx
                    .insert(itemProposals)
                    .values({
                      key: item.key,
                      value: item.value ?? '',
                      projectId: projectId,
                      creator: originalProposal.creator,
                      ref: formatRefs(originalProposal.refs, item.key),
                    })
                    .returning();

                  if (newItemProposal) {
                    itemProposalMap[item.key] = newItemProposal.id;
                    await tx.insert(projectLogs).values({
                      projectId,
                      key: item.key,
                      itemProposalId: newItemProposal.id,
                    });
                  }
                }
              }

              for (const voteRecord of projectVoteRecords) {
                const itemProposalId = itemProposalMap[voteRecord.key];

                if (itemProposalId) {
                  await tx.insert(voteRecords).values({
                    key: voteRecord.key,
                    itemProposalId: itemProposalId,
                    creator: voteRecord.creator,
                    weight: voteRecord.weight,
                    projectId: voteRecord.projectId,
                  });
                }
              }
            }

            if (proposalCreator) {
              await updateUserWeight(
                proposalCreator,
                ESSENTIAL_ITEM_WEIGHT_AMOUNT * (1 - REWARD_PERCENT),
                tx,
              );

              await addRewardNotification(
                createRewardNotification.proposalPass(
                  proposalCreator,
                  projectId,
                  proposalId,
                  ESSENTIAL_ITEM_WEIGHT_AMOUNT * (1 - REWARD_PERCENT),
                ),
                tx,
              );
            }

            processedCount++;
            //Todo: need to update social image
            /*if (updatedProject) {
              await sendProjectPublishTweet(updatedProject);
            }*/
          } catch (error) {
            console.error(
              `Failed to process project ${project.project_id}:`,
              error,
            );
            throw error;
          }
        }

        return processedCount;
      });

      return {
        success: true,
        processedCount: results,
        message: `Successfully processed ${results} projects`,
      };
    } catch (error) {
      console.error('scanPendingProjectOptimized failed:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to scan pending projects',
        cause: error,
      });
    }
  }),
});
