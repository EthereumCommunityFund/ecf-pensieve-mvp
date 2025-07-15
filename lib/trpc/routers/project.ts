import { TRPCError } from '@trpc/server';
import { and, desc, eq, inArray, isNull, lt, sql } from 'drizzle-orm';
import { unstable_cache as nextCache, revalidateTag } from 'next/cache';
import { z } from 'zod';

import {
  CACHE_TAGS,
  ESSENTIAL_ITEM_AMOUNT,
  ESSENTIAL_ITEM_WEIGHT_AMOUNT,
  QUORUM_AMOUNT,
  REWARD_PERCENT,
  WEIGHT,
} from '@/lib/constants';
import { projectLogs, projects, ranks, voteRecords } from '@/lib/db/schema';
import { itemProposals } from '@/lib/db/schema/itemProposals';
import { proposals } from '@/lib/db/schema/proposals';
import { POC_ITEMS } from '@/lib/pocItems';
import {
  addNotification,
  addRewardNotification,
  createNotification,
  createRewardNotification,
} from '@/lib/services/notification';
import { sendProjectPublishTweet } from '@/lib/services/twitter';
import { updateUserWeight } from '@/lib/services/userWeightService';
import { protectedProcedure, publicProcedure, router } from '@/lib/trpc/server';
import { calculatePublishedGenesisWeight } from '@/lib/utils/rankUtils';

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
        ? and(baseCondition, lt(projects.id, cursor))
        : baseCondition;

      const queryOptions: any = {
        creator: true,
        projectSnap: true,
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

      const getProjects = async () => {
        const [results, totalCountResult] = await Promise.all([
          ctx.db.query.projects.findMany({
            with: queryOptions,
            where: whereCondition,
            orderBy: desc(projects.id),
            limit: limit + 1,
          }),
          ctx.db
            .select({ count: sql`count(*)::int` })
            .from(projects)
            .where(eq(projects.isPublished, isPublished)),
        ]);

        const hasNextPage = results.length > limit;
        const items = hasNextPage ? results.slice(0, limit) : results;
        const nextCursor = hasNextPage ? items[items.length - 1].id : undefined;
        const totalCount = Number(totalCountResult[0]?.count ?? 0);

        return {
          items,
          nextCursor,
          totalCount,
        };
      };

      if (isPublished && !cursor) {
        const getCachedProjects = nextCache(
          getProjects,
          [`projects-published-${limit}-first-page`],
          {
            revalidate: 3600,
            tags: [CACHE_TAGS.PROJECTS],
          },
        );
        return getCachedProjects();
      }

      return getProjects();
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
          items,
          p.creator as project_creator
        FROM ranked_proposals rp
        JOIN projects p ON rp.project_id = p.id
        WHERE rp.rn = 1
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
        const processedCount = eligibleProjects.length;

        const projectIds = eligibleProjects.map((p) => Number(p.project_id));
        const proposalIds = eligibleProjects.map((p) => Number(p.proposal_id));

        const allVoteRecords = await tx.query.voteRecords.findMany({
          where: and(
            inArray(voteRecords.projectId, projectIds),
            inArray(voteRecords.proposalId, proposalIds),
            isNull(voteRecords.itemProposalId),
          ),
        });

        const voteRecordsByProject = new Map<number, any[]>();
        for (const vr of allVoteRecords) {
          const projectId = vr.projectId;
          if (!voteRecordsByProject.has(projectId)) {
            voteRecordsByProject.set(projectId, []);
          }
          voteRecordsByProject.get(projectId)!.push(vr);
        }

        const allProposals = await tx.query.proposals.findMany({
          where: inArray(proposals.id, proposalIds),
        });
        const proposalsMap = new Map(allProposals.map((p) => [p.id, p]));

        const projectProposalCreators = new Map<number, Set<string>>();

        const allProjectProposals = await tx.query.proposals.findMany({
          where: inArray(proposals.projectId, projectIds),
          columns: { creator: true, projectId: true },
        });

        for (const proposal of allProjectProposals) {
          const projectId = proposal.projectId;
          if (!projectProposalCreators.has(projectId)) {
            projectProposalCreators.set(projectId, new Set());
          }
          projectProposalCreators.get(projectId)!.add(proposal.creator);
        }

        const projectUpdates: Array<{
          id: number;
          itemsTopWeight: Record<string, number>;
        }> = [];
        const itemProposalBatch: any[] = [];
        const voteRecordBatch: any[] = [];
        const weightUpdates: Array<{ userId: string; amount: number }> = [];
        const notifications: any[] = [];
        const projectPublishNotifications: any[] = [];
        const proposalPassedNotifications: any[] = [];

        for (const project of eligibleProjects) {
          const projectId = Number(project.project_id);
          const proposalId = Number(project.proposal_id);
          const proposalCreator = String(project.proposal_creator);

          const projectVoteRecords = voteRecordsByProject.get(projectId) || [];

          const itemsTopWeight: Record<string, number> = {};
          for (const voteRecord of projectVoteRecords) {
            const key = voteRecord.key;
            itemsTopWeight[key] =
              (itemsTopWeight[key] || 0) + (voteRecord.weight || 0);
          }

          projectUpdates.push({ id: projectId, itemsTopWeight });

          const originalProposal = proposalsMap.get(proposalId);
          if (originalProposal && originalProposal.items) {
            const formatRefs = (refs: any, key: string) => {
              if (!refs || !Array.isArray(refs) || refs.length === 0) {
                return null;
              }
              return refs.find((ref: any) => ref.key === key)?.value || null;
            };

            const itemProposalMap: Record<string, number> = {};
            let itemProposalIdCounter = Date.now() * 1000;

            for (const item of originalProposal.items as any[]) {
              if (item.key) {
                const tempId = itemProposalIdCounter++;
                itemProposalMap[item.key] = tempId;

                itemProposalBatch.push({
                  key: item.key,
                  value: item.value ?? '',
                  projectId: projectId,
                  creator: originalProposal.creator,
                  ref: formatRefs(originalProposal.refs, item.key),
                  tempId,
                });
              }
            }

            for (const voteRecord of projectVoteRecords) {
              const tempItemProposalId = itemProposalMap[voteRecord.key];
              if (tempItemProposalId) {
                voteRecordBatch.push({
                  key: voteRecord.key,
                  tempItemProposalId,
                  creator: voteRecord.creator,
                  weight: voteRecord.weight,
                  projectId: voteRecord.projectId,
                });
              }
            }
          }

          if (proposalCreator) {
            weightUpdates.push({
              userId: proposalCreator,
              amount: ESSENTIAL_ITEM_WEIGHT_AMOUNT * (1 - REWARD_PERCENT),
            });

            notifications.push(
              createRewardNotification.proposalPass(
                proposalCreator,
                projectId,
                proposalId,
                ESSENTIAL_ITEM_WEIGHT_AMOUNT * (1 - REWARD_PERCENT),
              ),
            );

            proposalPassedNotifications.push(
              createNotification.proposalPassed(
                proposalCreator,
                projectId,
                proposalId,
              ),
            );
          }

          const proposalCreators = projectProposalCreators.get(projectId);
          if (proposalCreators && proposalCreators.size > 0) {
            for (const creator of proposalCreators) {
              projectPublishNotifications.push(
                createNotification.projectPublished(creator, projectId),
              );
            }
          }
        }

        for (const update of projectUpdates) {
          await tx
            .update(projects)
            .set({
              isPublished: true,
              itemsTopWeight: update.itemsTopWeight,
            })
            .where(eq(projects.id, update.id));
        }

        const ranksData = [];
        for (const project of eligibleProjects) {
          const projectId = Number(project.project_id);

          const updatedProject = await tx.query.projects.findFirst({
            where: eq(projects.id, projectId),
            columns: { hasProposalKeys: true },
          });

          if (updatedProject) {
            const publishedGenesisWeight = calculatePublishedGenesisWeight(
              updatedProject.hasProposalKeys || [],
            );

            ranksData.push({
              projectId,
              publishedGenesisWeight,
            });
          }
        }

        if (ranksData.length > 0) {
          await tx.insert(ranks).values(ranksData);
        }

        if (itemProposalBatch.length > 0) {
          const insertedItemProposals = await tx
            .insert(itemProposals)
            .values(itemProposalBatch.map(({ tempId, ...item }) => item))
            .returning({
              id: itemProposals.id,
              key: itemProposals.key,
              projectId: itemProposals.projectId,
            });

          const tempToRealIdMap = new Map<number, number>();
          for (let i = 0; i < insertedItemProposals.length; i++) {
            tempToRealIdMap.set(
              itemProposalBatch[i].tempId,
              insertedItemProposals[i].id,
            );
          }

          const projectLogData = insertedItemProposals.map((item) => ({
            projectId: item.projectId,
            key: item.key,
            itemProposalId: item.id,
          }));

          if (projectLogData.length > 0) {
            await tx.insert(projectLogs).values(projectLogData);
          }

          const voteRecordData = voteRecordBatch
            .map((vr) => {
              const realItemProposalId = tempToRealIdMap.get(
                vr.tempItemProposalId,
              );
              if (!realItemProposalId) return null;

              return {
                key: vr.key,
                itemProposalId: realItemProposalId,
                creator: vr.creator,
                weight: vr.weight,
                projectId: vr.projectId,
              };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);

          if (voteRecordData.length > 0) {
            await tx.insert(voteRecords).values(voteRecordData);
          }
        }

        for (const update of weightUpdates) {
          await updateUserWeight(update.userId, update.amount, tx);
        }

        for (const notification of notifications) {
          await addRewardNotification(notification, tx);
        }

        for (const notification of projectPublishNotifications) {
          await addNotification(notification, tx);
        }

        for (const notification of proposalPassedNotifications) {
          await addNotification(notification, tx);
        }

        return processedCount;
      });

      if (results > 0) {
        revalidateTag(CACHE_TAGS.PROJECTS);

        try {
          const projectIds = eligibleProjects.map((p) => Number(p.project_id));
          const publishedProjects = await ctx.db.query.projects.findMany({
            where: inArray(projects.id, projectIds),
            columns: {
              id: true,
              name: true,
              tagline: true,
              logoUrl: true,
            },
          });

          for (const project of publishedProjects) {
            const success = await sendProjectPublishTweet(project);
            if (success) {
              console.log(`Tweet sent successfully for project ${project.id}`);
            } else {
              console.log(`Failed to send tweet for project ${project.id}`);
            }
          }
        } catch (error) {
          console.error('Failed to send tweet notifications:', error);
        }
      }

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
