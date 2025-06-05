import { TRPCError } from '@trpc/server';
import { and, eq, ne } from 'drizzle-orm';
import { z } from 'zod';

import {
  itemProposals,
  profiles,
  projectLogs,
  projects,
  proposals,
  voteRecords,
} from '@/lib/db/schema';
import { logUserActivity } from '@/lib/services/activeLogsService';
import {
  checkNeedQuorum,
  handleOriginalProposalUpdate,
  handleVoteRecord,
  processItemProposalUpdate,
  processItemProposalVoteResult,
} from '@/lib/utils/itemProposalUtils';
import { dbLog, memLog, perfLog, transactionLog } from '@/utils/devLog';

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
      const totalStartTime = performance.now();
      const startMem = memLog('createVote - Start');

      return await ctx.db.transaction(async (tx) => {
        const transactionStartTime = performance.now();
        perfLog('Transaction started', 0, {
          method: 'createVote',
          proposalId,
          key,
          userId: ctx.user.id,
        });

        try {
          // 1. 并行获取提案、用户资料和现有投票记录
          const parallelQueryStartTime = performance.now();
          const [proposalWithProject, userProfile, existingVote] =
            await Promise.all([
              tx.query.proposals.findFirst({
                where: eq(proposals.id, proposalId),
                with: {
                  project: true,
                },
              }),
              tx.query.profiles.findFirst({
                where: eq(profiles.userId, ctx.user.id),
              }),
              tx.query.voteRecords.findFirst({
                where: and(
                  eq(voteRecords.creator, ctx.user.id),
                  eq(voteRecords.key, key),
                  eq(voteRecords.proposalId, proposalId),
                ),
              }),
            ]);
          dbLog(
            'SELECT',
            'proposals + profiles + voteRecords',
            performance.now() - parallelQueryStartTime,
            (proposalWithProject ? 1 : 0) +
              (userProfile ? 1 : 0) +
              (existingVote ? 1 : 0),
          );
          perfLog(
            '1. Get proposal, user profile and existing vote',
            performance.now() - parallelQueryStartTime,
            {
              proposalId,
              userId: ctx.user.id,
              key,
              creator: ctx.user.id,
              queryParams: { proposalId, userId: ctx.user.id, key },
              existingVoteCondition: { creator: ctx.user.id, key, proposalId },
              hasExistingVote: !!existingVote,
              foundProposal: !!proposalWithProject,
              foundUserProfile: !!userProfile,
            },
          );

          // 2. 验证提案和项目存在性
          const validationStartTime = performance.now();
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
          perfLog(
            '2. Validate proposal and project',
            performance.now() - validationStartTime,
            { projectId, isPublished: proposalWithProject.project.isPublished },
          );

          // 3. 检查是否在同项目其他提案中已投票
          const otherVoteCheckStartTime = performance.now();
          const otherVote = await tx.query.voteRecords.findFirst({
            where: and(
              eq(voteRecords.creator, ctx.user.id),
              eq(voteRecords.key, key),
              eq(voteRecords.projectId, projectId),
              ne(voteRecords.proposalId, proposalId),
            ),
          });
          dbLog(
            'SELECT',
            'voteRecords (other vote check)',
            performance.now() - otherVoteCheckStartTime,
            otherVote ? 1 : 0,
          );
          perfLog(
            '3. Check other votes in project',
            performance.now() - otherVoteCheckStartTime,
            {
              projectId,
              key,
              creator: ctx.user.id,
              excludeProposalId: proposalId,
              otherVoteCondition: {
                creator: ctx.user.id,
                key,
                projectId,
                excludeProposalId: proposalId,
              },
              hasOtherVote: !!otherVote,
              otherVoteId: otherVote?.id,
              otherVoteProposalId: otherVote?.proposalId,
            },
          );

          if (otherVote) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message:
                'You have already voted for the same key in another proposal of this project',
            });
          }

          // 4. 创建投票记录
          const insertVoteStartTime = performance.now();
          const voteData = {
            key,
            proposalId,
            creator: ctx.user.id,
            weight: userProfile?.weight ?? 0,
            projectId,
          };
          const [vote] = await tx
            .insert(voteRecords)
            .values(voteData)
            .returning();
          dbLog(
            'INSERT',
            'voteRecords',
            performance.now() - insertVoteStartTime,
            1,
          );
          perfLog(
            '4. Insert vote record',
            performance.now() - insertVoteStartTime,
            {
              voteId: vote.id,
              insertData: voteData,
              weight: userProfile?.weight ?? 0,
              userProfileWeight: userProfile?.weight,
              finalWeight: voteData.weight,
            },
          );

          // 5. 记录用户活动
          const activityStartTime = performance.now();
          const activityData = {
            userId: ctx.user.id,
            targetId: vote.id,
            projectId,
            items: [{ field: key }],
            proposalCreatorId: proposalWithProject.creator,
          };
          await logUserActivity.vote.create(activityData, tx);
          dbLog(
            'INSERT',
            'activities',
            performance.now() - activityStartTime,
            1,
          );
          perfLog(
            '5. Log vote activity',
            performance.now() - activityStartTime,
            {
              voteId: vote.id,
              activityData,
              userId: ctx.user.id,
              targetId: vote.id,
              proposalCreatorId: proposalWithProject.creator,
            },
          );

          // 6. 记录总执行时间和内存使用
          memLog('createVote - End', startMem);
          perfLog(
            'TOTAL createVote execution',
            performance.now() - totalStartTime,
            {
              voteId: vote.id,
              proposalId,
              projectId,
              key,
              creator: ctx.user.id,
              userId: ctx.user.id,
              weight: userProfile?.weight ?? 0,
              userProfileWeight: userProfile?.weight,
              proposalCreatorId: proposalWithProject.creator,
              isPublished: proposalWithProject.project.isPublished,
              finalVoteData: {
                id: vote.id,
                key: vote.key,
                proposalId: vote.proposalId,
                creator: vote.creator,
                weight: vote.weight,
                projectId: vote.projectId,
              },
            },
          );

          perfLog(
            'Transaction completed successfully',
            performance.now() - transactionStartTime,
            {
              method: 'createVote',
              voteId: vote.id,
              transactionDuration: performance.now() - transactionStartTime,
            },
          );

          return vote;
        } catch (error) {
          // 记录事务回滚
          perfLog(
            '🔄 Transaction ROLLBACK',
            performance.now() - transactionStartTime,
            {
              method: 'createVote',
              proposalId,
              key,
              userId: ctx.user.id,
              error: error instanceof Error ? error.message : 'Unknown error',
              transactionDuration: performance.now() - transactionStartTime,
            },
          );

          memLog('createVote - Rollback', startMem);

          // 重新抛出错误
          throw error;
        }
      });
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

      return await ctx.db.transaction(async (tx) => {
        const targetProposal = await tx.query.proposals.findFirst({
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
          tx.query.profiles.findFirst({
            where: eq(profiles.userId, ctx.user.id),
          }),
          tx.query.voteRecords.findFirst({
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

        if (voteToSwitch.proposalId === proposalId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message:
              'You have already voted for this key in the target proposal',
          });
        }

        const [updatedVote] = await tx
          .update(voteRecords)
          .set({
            proposalId,
            weight: userProfile?.weight ?? 0,
          })
          .where(eq(voteRecords.id, voteToSwitch.id))
          .returning();

        logUserActivity.vote.update(
          {
            userId: ctx.user.id,
            targetId: updatedVote.id,
            projectId: targetProposal.projectId,
            items: [{ field: key }],
            proposalCreatorId: targetProposal.creator,
          },
          tx,
        );

        return updatedVote;
      });
    }),

  cancelVote: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const totalStartTime = performance.now();
      const startMem = memLog('cancelVote - Start');

      return await ctx.db.transaction(async (tx) => {
        const transactionStartTime = performance.now();
        perfLog('Transaction started', 0, {
          method: 'cancelVote',
          voteId: id,
          userId: ctx.user.id,
        });

        try {
          // 1. 查询投票详情
          const queryStartTime = performance.now();
          const condition = and(
            eq(voteRecords.id, id),
            eq(voteRecords.creator, ctx.user.id),
          );

          const voteWithDetails = await tx.query.voteRecords.findFirst({
            where: condition,
            with: {
              proposal: {
                with: {
                  project: true,
                },
              },
            },
          });
          dbLog(
            'SELECT',
            'voteRecords with proposal and project',
            performance.now() - queryStartTime,
            voteWithDetails ? 1 : 0,
          );
          perfLog(
            '1. Get vote with details',
            performance.now() - queryStartTime,
            {
              voteId: id,
              userId: ctx.user.id,
              creator: ctx.user.id,
              conditionParams: { id, creator: ctx.user.id },
              found: !!voteWithDetails,
            },
          );

          // 2. 验证投票和相关数据存在性
          const validationStartTime = performance.now();
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
              message:
                'Cannot cancel votes on proposals for published projects',
            });
          }
          perfLog(
            '2. Validate vote permissions',
            performance.now() - validationStartTime,
            {
              proposalId: voteWithDetails.proposal.id,
              isPublished: voteWithDetails.proposal.project.isPublished,
              isOwnProposal: voteWithDetails.proposal.creator === ctx.user.id,
            },
          );

          // 3. 删除投票记录
          const deleteStartTime = performance.now();
          const [deletedVote] = await tx
            .delete(voteRecords)
            .where(condition)
            .returning();
          dbLog(
            'DELETE',
            'voteRecords',
            performance.now() - deleteStartTime,
            1,
          );
          perfLog(
            '3. Delete vote record',
            performance.now() - deleteStartTime,
            {
              voteId: deletedVote.id,
              weight: deletedVote.weight,
            },
          );

          // 4. 记录删除活动
          const activityStartTime = performance.now();
          await logUserActivity.vote.delete(
            {
              userId: ctx.user.id,
              targetId: deletedVote.id,
              projectId: voteWithDetails.proposal!.projectId,
              items: [{ field: voteWithDetails.key }],
              proposalCreatorId: voteWithDetails.proposal!.creator,
            },
            tx,
          );
          dbLog(
            'INSERT',
            'activities',
            performance.now() - activityStartTime,
            1,
          );
          perfLog(
            '4. Log delete activity',
            performance.now() - activityStartTime,
            { voteId: deletedVote.id },
          );

          // 5. 记录总执行时间和内存使用
          memLog('cancelVote - End', startMem);
          perfLog(
            'TOTAL cancelVote execution',
            performance.now() - totalStartTime,
            {
              voteId: deletedVote.id,
              proposalId: voteWithDetails.proposal!.id,
              key: voteWithDetails.key,
              weight: deletedVote.weight,
            },
          );

          perfLog(
            'Transaction completed successfully',
            performance.now() - transactionStartTime,
            {
              method: 'cancelVote',
              voteId: deletedVote.id,
              transactionDuration: performance.now() - transactionStartTime,
            },
          );

          return deletedVote;
        } catch (error) {
          // 记录事务回滚
          perfLog(
            '🔄 Transaction ROLLBACK',
            performance.now() - transactionStartTime,
            {
              method: 'cancelVote',
              voteId: id,
              userId: ctx.user.id,
              error: error instanceof Error ? error.message : 'Unknown error',
              transactionDuration: performance.now() - transactionStartTime,
            },
          );

          memLog('cancelVote - Rollback', startMem);

          // 重新抛出错误
          throw error;
        }
      });
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

      const votes = await ctx.db.query.voteRecords.findMany({
        with: {
          creator: true,
        },
        where: eq(voteRecords.projectId, projectId),
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
      const totalStartTime = performance.now();
      const startMem = memLog('createItemProposalVote - Start');

      return await ctx.db.transaction(async (tx) => {
        const transactionStartTime = performance.now();
        transactionLog.start('createItemProposalVote', {
          itemProposalId,
          key,
          userId: ctx.user.id,
        });

        try {
          // 1. 并行获取item proposal和用户资料
          const parallelQueryStartTime = performance.now();
          const [itemProposal, userProfile] = await Promise.all([
            tx.query.itemProposals.findFirst({
              where: eq(itemProposals.id, itemProposalId),
              with: {
                creator: true,
              },
            }),
            tx.query.profiles.findFirst({
              where: eq(profiles.userId, ctx.user.id),
            }),
          ]);
          dbLog(
            'SELECT',
            '[createItemProposalVote] itemProposals + profiles',
            performance.now() - parallelQueryStartTime,
            (itemProposal ? 1 : 0) + (userProfile ? 1 : 0),
          );
          perfLog(
            '[createItemProposalVote] 1. Get item proposal and user profile',
            performance.now() - parallelQueryStartTime,
            {
              itemProposalId,
              userId: ctx.user.id,
              key,
              foundItemProposal: !!itemProposal,
              foundUserProfile: !!userProfile,
              itemProposalCreator: itemProposal?.creator?.userId,
              userWeight: userProfile?.weight,
              projectId: itemProposal?.projectId,
            },
          );

          // 2. 验证item proposal存在性
          const validationStartTime = performance.now();
          if (!itemProposal) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Item proposal not found',
            });
          }
          perfLog(
            '[createItemProposalVote] 2. Validate item proposal exists',
            performance.now() - validationStartTime,
            {
              itemProposalId,
              projectId: itemProposal.projectId,
              itemProposalKey: itemProposal.key,
              itemProposalValue: itemProposal.value,
            },
          );

          // 3. 检查现有投票记录
          const existingVoteCheckStartTime = performance.now();
          const existingVote = await tx.query.voteRecords.findFirst({
            where: and(
              eq(voteRecords.creator, ctx.user.id),
              eq(voteRecords.projectId, itemProposal.projectId),
              eq(voteRecords.key, key),
            ),
          });
          dbLog(
            'SELECT',
            '[createItemProposalVote] voteRecords (existing vote check)',
            performance.now() - existingVoteCheckStartTime,
            existingVote ? 1 : 0,
          );
          perfLog(
            '[createItemProposalVote] 3. Check existing vote',
            performance.now() - existingVoteCheckStartTime,
            {
              projectId: itemProposal.projectId,
              key,
              creator: ctx.user.id,
              existingVoteCondition: {
                creator: ctx.user.id,
                projectId: itemProposal.projectId,
                key,
              },
              hasExistingVote: !!existingVote,
              existingVoteId: existingVote?.id,
              existingVoteItemProposalId: existingVote?.itemProposalId,
              existingVoteProposalId: existingVote?.proposalId,
              existingVoteWeight: existingVote?.weight,
            },
          );

          if (existingVote) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'You have already voted for this key in this project',
            });
          }

          // 4. 处理投票记录
          const handleVoteStartTime = performance.now();
          const vote = await handleVoteRecord(tx, {
            userId: ctx.user.id,
            projectId: itemProposal.projectId,
            itemProposalId,
            key,
            weight: userProfile?.weight ?? 0,
          });
          perfLog(
            '[createItemProposalVote] 4. Handle vote record',
            performance.now() - handleVoteStartTime,
            {
              voteId: vote?.id,
              userId: ctx.user.id,
              projectId: itemProposal.projectId,
              itemProposalId,
              key,
              weight: userProfile?.weight ?? 0,
              voteRecordData: {
                userId: ctx.user.id,
                projectId: itemProposal.projectId,
                itemProposalId,
                key,
                weight: userProfile?.weight ?? 0,
              },
            },
          );

          // 5. 并行获取投票、项目和领先提案数据
          const parallelDataStartTime = performance.now();
          const [votes, project, leadingProposal] = await Promise.all([
            tx.query.voteRecords.findMany({
              where: and(
                eq(voteRecords.itemProposalId, itemProposalId),
                eq(voteRecords.key, key),
              ),
            }),
            tx.query.projects.findFirst({
              where: eq(projects.id, itemProposal.projectId),
            }),
            tx.query.projectLogs.findFirst({
              where: and(
                eq(projectLogs.projectId, itemProposal.projectId),
                eq(projectLogs.key, key),
                eq(projectLogs.isNotLeading, false),
              ),
              orderBy: (projectLogs, { desc }) => [desc(projectLogs.createdAt)],
            }),
          ]);
          dbLog(
            'SELECT',
            '[createItemProposalVote] voteRecords + projects + projectLogs',
            performance.now() - parallelDataStartTime,
            votes.length + (project ? 1 : 0) + (leadingProposal ? 1 : 0),
          );
          perfLog(
            '[createItemProposalVote] 5. Get votes, project and leading proposal',
            performance.now() - parallelDataStartTime,
            {
              votesCount: votes.length,
              projectId: itemProposal.projectId,
              key,
              itemProposalId,
              foundProject: !!project,
              foundLeadingProposal: !!leadingProposal,
              leadingProposalItemId: leadingProposal?.itemProposalId,
              isCurrentProposalLeading:
                leadingProposal?.itemProposalId === itemProposalId,
              votesData: votes.map((v) => ({
                id: v.id,
                creator: v.creator,
                weight: v.weight,
                itemProposalId: v.itemProposalId,
              })),
            },
          );

          // 6. 处理投票结果逻辑
          const processVoteStartTime = performance.now();
          if (leadingProposal?.itemProposalId === itemProposalId) {
            await processItemProposalUpdate(tx, {
              votes,
              project,
              key,
            });
            perfLog(
              '[createItemProposalVote] 6. Process item proposal update (leading proposal)',
              performance.now() - processVoteStartTime,
              {
                itemProposalId,
                key,
                votesCount: votes.length,
                projectId: itemProposal.projectId,
                action: 'processItemProposalUpdate',
                isLeadingProposal: true,
              },
            );
          } else {
            const needCheckQuorum = await checkNeedQuorum(tx, {
              projectId: itemProposal.projectId,
              key,
            });

            await processItemProposalVoteResult(tx, {
              votes,
              itemProposal,
              project,
              key,
              needCheckQuorum,
              userId: ctx.user.id,
            });
            perfLog(
              '[createItemProposalVote] 6. Process item proposal vote result',
              performance.now() - processVoteStartTime,
              {
                itemProposalId,
                key,
                votesCount: votes.length,
                projectId: itemProposal.projectId,
                needCheckQuorum,
                userId: ctx.user.id,
                action: 'processItemProposalVoteResult',
                isLeadingProposal: false,
              },
            );
          }

          // 7. 记录总执行时间和内存使用
          memLog('createItemProposalVote - End', startMem);
          perfLog(
            '[createItemProposalVote] TOTAL execution',
            performance.now() - totalStartTime,
            {
              voteId: vote?.id,
              itemProposalId,
              key,
              userId: ctx.user.id,
              projectId: itemProposal.projectId,
              weight: userProfile?.weight ?? 0,
              votesCount: votes.length,
              isLeadingProposal:
                leadingProposal?.itemProposalId === itemProposalId,
              itemProposalCreator: itemProposal.creator?.userId,
              finalVoteData: vote
                ? {
                    id: vote.id,
                    key: vote.key,
                    itemProposalId: vote.itemProposalId,
                    creator: vote.creator,
                    weight: vote.weight,
                    projectId: vote.projectId,
                  }
                : null,
            },
          );

          transactionLog.success(
            'createItemProposalVote',
            performance.now() - transactionStartTime,
            {
              voteId: vote?.id,
              itemProposalId,
              key,
              userId: ctx.user.id,
            },
          );

          return vote;
        } catch (error) {
          // 记录事务回滚
          transactionLog.rollback(
            'createItemProposalVote',
            performance.now() - transactionStartTime,
            error instanceof Error ? error.message : 'Unknown error',
            {
              itemProposalId,
              key,
              userId: ctx.user.id,
            },
          );

          memLog('createItemProposalVote - Rollback', startMem);

          // 重新抛出错误
          throw error;
        }
      });
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
      const totalStartTime = performance.now();
      const startMem = memLog('switchItemProposalVote - Start');

      return await ctx.db.transaction(async (tx) => {
        const transactionStartTime = performance.now();
        transactionLog.start('switchItemProposalVote', {
          itemProposalId,
          key,
          userId: ctx.user.id,
        });

        try {
          // 1. 并行获取目标item proposal和用户资料
          const parallelQueryStartTime = performance.now();
          const [targetItemProposal, userProfile] = await Promise.all([
            tx.query.itemProposals.findFirst({
              where: eq(itemProposals.id, itemProposalId),
              with: {
                creator: true,
              },
            }),
            tx.query.profiles.findFirst({
              where: eq(profiles.userId, ctx.user.id),
            }),
          ]);
          dbLog(
            'SELECT',
            '[switchItemProposalVote] itemProposals + profiles',
            performance.now() - parallelQueryStartTime,
            (targetItemProposal ? 1 : 0) + (userProfile ? 1 : 0),
          );
          perfLog(
            '[switchItemProposalVote] 1. Get target item proposal and user profile',
            performance.now() - parallelQueryStartTime,
            {
              itemProposalId,
              userId: ctx.user.id,
              key,
              foundTargetItemProposal: !!targetItemProposal,
              foundUserProfile: !!userProfile,
              targetItemProposalCreator: targetItemProposal?.creator?.userId,
              userWeight: userProfile?.weight,
              projectId: targetItemProposal?.projectId,
            },
          );

          // 2. 验证目标item proposal存在性
          const validationStartTime = performance.now();
          if (!targetItemProposal) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Target item proposal not found',
            });
          }

          const projectId = targetItemProposal.projectId;
          perfLog(
            '[switchItemProposalVote] 2. Validate target item proposal',
            performance.now() - validationStartTime,
            {
              itemProposalId,
              projectId,
              targetItemProposalKey: targetItemProposal.key,
              targetItemProposalValue: targetItemProposal.value,
              targetItemProposalCreator: targetItemProposal.creator?.userId,
            },
          );

          // 3. 查找要切换的投票记录
          const voteToSwitchStartTime = performance.now();
          const voteToSwitch = await tx.query.voteRecords.findFirst({
            where: and(
              eq(voteRecords.creator, ctx.user.id),
              eq(voteRecords.key, key),
              eq(voteRecords.projectId, projectId),
            ),
          });
          dbLog(
            'SELECT',
            '[switchItemProposalVote] voteRecords (vote to switch)',
            performance.now() - voteToSwitchStartTime,
            voteToSwitch ? 1 : 0,
          );
          perfLog(
            '[switchItemProposalVote] 3. Find vote to switch',
            performance.now() - voteToSwitchStartTime,
            {
              projectId,
              key,
              creator: ctx.user.id,
              voteToSwitchCondition: {
                creator: ctx.user.id,
                key,
                projectId,
              },
              foundVoteToSwitch: !!voteToSwitch,
              voteToSwitchId: voteToSwitch?.id,
              voteToSwitchItemProposalId: voteToSwitch?.itemProposalId,
              voteToSwitchProposalId: voteToSwitch?.proposalId,
              voteToSwitchWeight: voteToSwitch?.weight,
            },
          );

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

          const originalItemProposalId = voteToSwitch.itemProposalId;

          // 4. 更新投票记录
          const updateVoteStartTime = performance.now();
          const [updatedVote] = await tx
            .update(voteRecords)
            .set({
              itemProposalId,
              proposalId: null,
              weight: userProfile?.weight ?? 0,
            })
            .where(eq(voteRecords.id, voteToSwitch.id))
            .returning();
          dbLog(
            'UPDATE',
            '[switchItemProposalVote] voteRecords',
            performance.now() - updateVoteStartTime,
            1,
          );
          perfLog(
            '[switchItemProposalVote] 4. Update vote record',
            performance.now() - updateVoteStartTime,
            {
              voteId: voteToSwitch.id,
              originalItemProposalId,
              newItemProposalId: itemProposalId,
              oldWeight: voteToSwitch.weight,
              newWeight: userProfile?.weight ?? 0,
              updateData: {
                itemProposalId,
                proposalId: null,
                weight: userProfile?.weight ?? 0,
              },
              updatedVoteId: updatedVote?.id,
            },
          );

          // 5. 并行获取投票、项目和领先提案数据
          const parallelDataStartTime = performance.now();
          const [votes, project, leadingProposal] = await Promise.all([
            tx.query.voteRecords.findMany({
              where: and(
                eq(voteRecords.itemProposalId, itemProposalId),
                eq(voteRecords.key, key),
              ),
            }),
            tx.query.projects.findFirst({
              where: eq(projects.id, projectId),
            }),
            tx.query.projectLogs.findFirst({
              where: and(
                eq(projectLogs.projectId, targetItemProposal.projectId),
                eq(projectLogs.key, key),
                eq(projectLogs.isNotLeading, false),
              ),
              orderBy: (projectLogs, { desc }) => [desc(projectLogs.createdAt)],
            }),
          ]);
          dbLog(
            'SELECT',
            '[switchItemProposalVote] voteRecords + projects + projectLogs',
            performance.now() - parallelDataStartTime,
            votes.length + (project ? 1 : 0) + (leadingProposal ? 1 : 0),
          );
          perfLog(
            '[switchItemProposalVote] 5. Get votes, project and leading proposal',
            performance.now() - parallelDataStartTime,
            {
              votesCount: votes.length,
              projectId,
              key,
              itemProposalId,
              foundProject: !!project,
              foundLeadingProposal: !!leadingProposal,
              leadingProposalItemId: leadingProposal?.itemProposalId,
              isCurrentProposalLeading:
                leadingProposal?.itemProposalId === itemProposalId,
              votesData: votes.map((v) => ({
                id: v.id,
                creator: v.creator,
                weight: v.weight,
                itemProposalId: v.itemProposalId,
              })),
            },
          );

          // 6. 处理投票结果逻辑
          const processVoteStartTime = performance.now();
          if (leadingProposal?.itemProposalId === itemProposalId) {
            await processItemProposalUpdate(tx, {
              votes,
              project,
              key,
            });
            perfLog(
              '[switchItemProposalVote] 6. Process item proposal update (leading proposal)',
              performance.now() - processVoteStartTime,
              {
                itemProposalId,
                key,
                votesCount: votes.length,
                projectId,
                action: 'processItemProposalUpdate',
                isLeadingProposal: true,
              },
            );
          } else {
            const needCheckQuorum = await checkNeedQuorum(tx, {
              projectId,
              key,
            });

            await processItemProposalVoteResult(tx, {
              votes,
              itemProposal: targetItemProposal,
              project,
              key,
              needCheckQuorum,
              userId: ctx.user.id,
            });
            perfLog(
              '[switchItemProposalVote] 6. Process item proposal vote result',
              performance.now() - processVoteStartTime,
              {
                itemProposalId,
                key,
                votesCount: votes.length,
                projectId,
                needCheckQuorum,
                userId: ctx.user.id,
                action: 'processItemProposalVoteResult',
                isLeadingProposal: false,
              },
            );
          }

          // 7. 处理原始提案更新
          const originalProposalStartTime = performance.now();
          if (originalItemProposalId) {
            await handleOriginalProposalUpdate(tx, {
              originalItemProposalId,
              projectId,
              key,
              project,
            });
            perfLog(
              '[switchItemProposalVote] 7. Handle original proposal update',
              performance.now() - originalProposalStartTime,
              {
                originalItemProposalId,
                projectId,
                key,
                action: 'handleOriginalProposalUpdate',
              },
            );
          } else {
            perfLog(
              '[switchItemProposalVote] 7. Skip original proposal update (no original item proposal)',
              performance.now() - originalProposalStartTime,
              {
                originalItemProposalId,
                reason: 'originalItemProposalId is null',
              },
            );
          }

          // 8. 记录用户活动
          const activityStartTime = performance.now();
          logUserActivity.vote.update(
            {
              userId: ctx.user.id,
              targetId: updatedVote.id,
              projectId,
              items: [{ field: key }],
              proposalCreatorId: targetItemProposal.creator.userId,
            },
            tx,
          );
          dbLog(
            'INSERT',
            '[switchItemProposalVote] activities',
            performance.now() - activityStartTime,
            1,
          );
          perfLog(
            '[switchItemProposalVote] 8. Log vote update activity',
            performance.now() - activityStartTime,
            {
              userId: ctx.user.id,
              targetId: updatedVote.id,
              projectId,
              key,
              proposalCreatorId: targetItemProposal.creator.userId,
              activityData: {
                userId: ctx.user.id,
                targetId: updatedVote.id,
                projectId,
                items: [{ field: key }],
                proposalCreatorId: targetItemProposal.creator.userId,
              },
            },
          );

          // 9. 记录总执行时间和内存使用
          memLog('switchItemProposalVote - End', startMem);
          perfLog(
            '[switchItemProposalVote] TOTAL execution',
            performance.now() - totalStartTime,
            {
              updatedVoteId: updatedVote.id,
              itemProposalId,
              originalItemProposalId,
              key,
              userId: ctx.user.id,
              projectId,
              oldWeight: voteToSwitch.weight,
              newWeight: userProfile?.weight ?? 0,
              votesCount: votes.length,
              isLeadingProposal:
                leadingProposal?.itemProposalId === itemProposalId,
              targetItemProposalCreator: targetItemProposal.creator.userId,
              finalUpdatedVoteData: {
                id: updatedVote.id,
                key: updatedVote.key,
                itemProposalId: updatedVote.itemProposalId,
                proposalId: updatedVote.proposalId,
                creator: updatedVote.creator,
                weight: updatedVote.weight,
                projectId: updatedVote.projectId,
              },
            },
          );

          transactionLog.success(
            'switchItemProposalVote',
            performance.now() - transactionStartTime,
            {
              updatedVoteId: updatedVote.id,
              itemProposalId,
              originalItemProposalId,
              key,
              userId: ctx.user.id,
            },
          );

          return updatedVote;
        } catch (error) {
          // 记录事务回滚
          transactionLog.rollback(
            'switchItemProposalVote',
            performance.now() - transactionStartTime,
            error instanceof Error ? error.message : 'Unknown error',
            {
              itemProposalId,
              key,
              userId: ctx.user.id,
            },
          );

          memLog('switchItemProposalVote - Rollback', startMem);

          // 重新抛出错误
          throw error;
        }
      });
    }),
});
