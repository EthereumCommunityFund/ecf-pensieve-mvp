import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import {
  itemProposals,
  profiles,
  projects,
  voteRecords,
} from '@/lib/db/schema';
import { logUserActivity } from '@/lib/services/activeLogsService';
import {
  addRewardNotification,
  createRewardNotification,
} from '@/lib/services/notification';
import { calculateReward } from '@/lib/utils/itemProposalUtils';
import { dbLog, memLog, perfLog, transactionLog } from '@/utils/devLog';

import { protectedProcedure, publicProcedure, router } from '../server';

import { voteRouter } from './vote';

export const itemProposalRouter = router({
  createItemProposal: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        key: z.string().min(1, 'Key cannot be empty'),
        value: z.any(),
        ref: z.string().optional(),
        reason: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const totalStartTime = performance.now();
      const startMem = memLog('createItemProposal - Start');

      // 1. 验证项目存在
      const projectCheckStartTime = performance.now();
      const project = await ctx.db.query.projects.findFirst({
        where: eq(projects.id, input.projectId),
      });
      dbLog('SELECT', 'projects', performance.now() - projectCheckStartTime, 1);
      perfLog(
        '1. Check project exists',
        performance.now() - projectCheckStartTime,
        { projectId: input.projectId },
      );

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        });
      }

      return await ctx.db.transaction(async (tx) => {
        const transactionStartTime = performance.now();
        transactionLog.start('createItemProposal', {
          projectId: input.projectId,
          key: input.key,
          userId: ctx.user.id,
        });

        try {
          // 2. 检查是否已存在相同key的提案
          const existingCheckStartTime = performance.now();
          const existingProposal = await tx.query.itemProposals.findFirst({
            where: and(
              eq(itemProposals.projectId, input.projectId),
              eq(itemProposals.key, input.key),
            ),
          });
          dbLog(
            'SELECT',
            'itemProposals',
            performance.now() - existingCheckStartTime,
            existingProposal ? 1 : 0,
          );
          perfLog(
            '2. Check existing proposal',
            performance.now() - existingCheckStartTime,
            {
              projectId: input.projectId,
              key: input.key,
              existingCheckCondition: {
                projectId: input.projectId,
                key: input.key,
              },
              exists: !!existingProposal,
              existingProposalId: existingProposal?.id,
              existingProposalCreator: existingProposal?.creator,
            },
          );

          // 3. 创建新的item proposal
          const insertStartTime = performance.now();
          const itemProposalData = {
            ...input,
            creator: ctx.user.id,
          };
          const [itemProposal] = await tx
            .insert(itemProposals)
            .values(itemProposalData)
            .returning();
          dbLog(
            'INSERT',
            'itemProposals',
            performance.now() - insertStartTime,
            1,
          );
          perfLog(
            '3. Insert item proposal',
            performance.now() - insertStartTime,
            {
              itemProposalId: itemProposal?.id,
              insertData: itemProposalData,
              projectId: input.projectId,
              key: input.key,
              value: input.value,
              ref: input.ref,
              reason: input.reason,
              creator: ctx.user.id,
            },
          );

          if (!itemProposal) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to create item proposal',
            });
          }

          // 4. 并行获取用户资料和投票记录
          const parallelQueryStartTime = performance.now();
          const [userProfile, voteRecord] = await Promise.all([
            tx.query.profiles.findFirst({
              where: eq(profiles.userId, ctx.user.id),
            }),
            tx.query.voteRecords.findFirst({
              where: and(
                eq(voteRecords.creator, ctx.user.id),
                eq(voteRecords.projectId, input.projectId),
                eq(voteRecords.key, input.key),
              ),
            }),
          ]);
          dbLog(
            'SELECT',
            'profiles + voteRecords',
            performance.now() - parallelQueryStartTime,
            (userProfile ? 1 : 0) + (voteRecord ? 1 : 0),
          );
          perfLog(
            '4. Get user profile and vote record',
            performance.now() - parallelQueryStartTime,
            {
              userId: ctx.user.id,
              creator: ctx.user.id,
              projectId: input.projectId,
              key: input.key,
              voteRecordCondition: {
                creator: ctx.user.id,
                projectId: input.projectId,
                key: input.key,
              },
              hasVoteRecord: !!voteRecord,
              foundUserProfile: !!userProfile,
              userWeight: userProfile?.weight,
              voteRecordId: voteRecord?.id,
              voteRecordWeight: voteRecord?.weight,
            },
          );

          // 5. 创建投票caller
          const callerStartTime = performance.now();
          const caller = voteRouter.createCaller({
            ...ctx,
            db: tx as any,
          });
          perfLog('5. Create vote caller', performance.now() - callerStartTime);

          // 6. 处理投票逻辑
          const voteStartTime = performance.now();
          const voteParams = {
            itemProposalId: itemProposal.id,
            key: input.key,
          };
          if (voteRecord) {
            await caller.switchItemProposalVote(voteParams);
            perfLog(
              '6. Switch item proposal vote',
              performance.now() - voteStartTime,
              {
                itemProposalId: itemProposal.id,
                key: input.key,
                voteParams,
                action: 'switch',
                existingVoteId: voteRecord.id,
                existingVoteWeight: voteRecord.weight,
              },
            );
          } else {
            await caller.createItemProposalVote(voteParams);
            perfLog(
              '6. Create item proposal vote',
              performance.now() - voteStartTime,
              {
                itemProposalId: itemProposal.id,
                key: input.key,
                voteParams,
                action: 'create',
                userWeight: userProfile?.weight ?? 0,
              },
            );
          }

          if (!existingProposal) {
            // 7. 计算奖励和更新数据
            const rewardStartTime = performance.now();
            const reward = calculateReward(input.key);
            const finalWeight = (userProfile?.weight ?? 0) + reward;
            const hasProposalKeys = new Set([
              ...project.hasProposalKeys,
              input.key,
            ]);
            perfLog(
              '7. Calculate reward',
              performance.now() - rewardStartTime,
              {
                key: input.key,
                reward,
                oldWeight: userProfile?.weight ?? 0,
                newWeight: finalWeight,
                userId: ctx.user.id,
                projectId: input.projectId,
                itemProposalId: itemProposal.id,
                originalHasProposalKeys: project.hasProposalKeys,
                newHasProposalKeys: Array.from(hasProposalKeys),
                rewardCalculation: { key: input.key, calculatedReward: reward },
              },
            );

            // 8. 并行执行更新操作
            const updateStartTime = performance.now();
            const notificationData =
              createRewardNotification.createItemProposal(
                ctx.user.id,
                input.projectId,
                itemProposal.id,
                reward,
              );
            const activityData = {
              userId: ctx.user.id,
              targetId: itemProposal.id,
              projectId: itemProposal.projectId,
              items: [{ field: input.key }],
            };

            await Promise.all([
              tx
                .update(profiles)
                .set({ weight: finalWeight })
                .where(eq(profiles.userId, ctx.user.id)),

              tx
                .update(projects)
                .set({
                  hasProposalKeys: Array.from(hasProposalKeys),
                })
                .where(eq(projects.id, input.projectId)),

              addRewardNotification(notificationData, tx),

              logUserActivity.itemProposal.create(activityData, tx),
            ]);
            dbLog(
              'UPDATE',
              'profiles + projects + notifications + activities',
              performance.now() - updateStartTime,
              4,
            );
            perfLog(
              '8. Update user weight and project data',
              performance.now() - updateStartTime,
              {
                userId: ctx.user.id,
                reward,
                profileUpdate: { userId: ctx.user.id, newWeight: finalWeight },
                projectUpdate: {
                  projectId: input.projectId,
                  newHasProposalKeys: Array.from(hasProposalKeys),
                },
                notificationData,
                activityData,
                operationsCount: 4,
              },
            );
          } else {
            // 9. 记录更新活动
            const logStartTime = performance.now();
            const updateActivityData = {
              userId: ctx.user.id,
              targetId: itemProposal.id,
              projectId: itemProposal.projectId,
              items: [{ field: input.key }],
            };
            await logUserActivity.itemProposal.update(updateActivityData, tx);
            dbLog('INSERT', 'activities', performance.now() - logStartTime, 1);
            perfLog(
              '9. Log update activity',
              performance.now() - logStartTime,
              {
                itemProposalId: itemProposal.id,
                updateActivityData,
                userId: ctx.user.id,
                targetId: itemProposal.id,
                projectId: itemProposal.projectId,
                key: input.key,
                existingProposalId: existingProposal?.id,
                action: 'update',
              },
            );
          }

          // 10. 记录总执行时间和内存使用
          memLog('createItemProposal - End', startMem);
          perfLog(
            'TOTAL createItemProposal execution',
            performance.now() - totalStartTime,
            {
              itemProposalId: itemProposal.id,
              projectId: input.projectId,
              key: input.key,
              value: input.value,
              ref: input.ref,
              reason: input.reason,
              creator: ctx.user.id,
              userId: ctx.user.id,
              isNewProposal: !existingProposal,
              existingProposalId: existingProposal?.id,
              hadExistingVoteRecord: !!voteRecord,
              voteAction: voteRecord ? 'switch' : 'create',
              userWeight: userProfile?.weight,
              finalItemProposal: {
                id: itemProposal.id,
                projectId: itemProposal.projectId,
                key: itemProposal.key,
                value: itemProposal.value,
                ref: itemProposal.ref,
                reason: itemProposal.reason,
                creator: itemProposal.creator,
                createdAt: itemProposal.createdAt,
              },
            },
          );

          transactionLog.success(
            'createItemProposal',
            performance.now() - transactionStartTime,
            {
              itemProposalId: itemProposal.id,
              projectId: input.projectId,
              key: input.key,
            },
          );

          return itemProposal;
        } catch (error) {
          // 记录事务回滚
          transactionLog.rollback(
            'createItemProposal',
            performance.now() - transactionStartTime,
            error instanceof Error ? error.message : 'Unknown error',
            {
              projectId: input.projectId,
              key: input.key,
              userId: ctx.user.id,
            },
          );

          memLog('createItemProposal - Rollback', startMem);

          // 重新抛出错误
          throw error;
        }
      });
    }),

  getItemProposalById: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const startTime = performance.now();
      const startMem = memLog('getItemProposalById - Start');

      // 查询item proposal详情
      const queryStartTime = performance.now();
      const itemProposal = await ctx.db.query.itemProposals.findFirst({
        where: eq(itemProposals.id, input.id),
        with: {
          creator: {
            columns: {
              userId: true,
              name: true,
              avatarUrl: true,
            },
          },
          project: {
            columns: {
              id: true,
              name: true,
              tagline: true,
              isPublished: true,
            },
          },
          voteRecords: {
            with: {
              creator: {
                columns: {
                  userId: true,
                  name: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      });

      dbLog(
        'SELECT',
        'itemProposals with relations',
        performance.now() - queryStartTime,
        itemProposal ? 1 : 0,
      );
      perfLog(
        '1. Get item proposal by id',
        performance.now() - queryStartTime,
        {
          itemProposalId: input.id,
          found: !!itemProposal,
          hasCreator: !!itemProposal?.creator,
          hasProject: !!itemProposal?.project,
          voteRecordsCount: itemProposal?.voteRecords?.length ?? 0,
        },
      );

      if (!itemProposal) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Item proposal not found',
        });
      }

      // 记录总执行时间和内存使用
      memLog('getItemProposalById - End', startMem);
      perfLog(
        'TOTAL getItemProposalById execution',
        performance.now() - startTime,
        {
          itemProposalId: itemProposal.id,
          projectId: itemProposal.projectId,
          key: itemProposal.key,
          creator: itemProposal.creator?.userId,
          voteRecordsCount: itemProposal.voteRecords?.length ?? 0,
        },
      );

      return itemProposal;
    }),
});
