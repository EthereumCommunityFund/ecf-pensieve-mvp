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
import { dbLog, memLog, perfLog } from '@/utils/devLog';

import { protectedProcedure, router } from '../server';

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
          { key: input.key, exists: !!existingProposal },
        );

        // 3. 创建新的item proposal
        const insertStartTime = performance.now();
        const [itemProposal] = await tx
          .insert(itemProposals)
          .values({
            ...input,
            creator: ctx.user.id,
          })
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
          { itemProposalId: itemProposal?.id },
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
          { userId: ctx.user.id, hasVoteRecord: !!voteRecord },
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
        if (voteRecord) {
          await caller.switchItemProposalVote({
            itemProposalId: itemProposal.id,
            key: input.key,
          });
          perfLog(
            '6. Switch item proposal vote',
            performance.now() - voteStartTime,
            { itemProposalId: itemProposal.id },
          );
        } else {
          await caller.createItemProposalVote({
            itemProposalId: itemProposal.id,
            key: input.key,
          });
          perfLog(
            '6. Create item proposal vote',
            performance.now() - voteStartTime,
            { itemProposalId: itemProposal.id },
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
          perfLog('7. Calculate reward', performance.now() - rewardStartTime, {
            reward,
            oldWeight: userProfile?.weight ?? 0,
            newWeight: finalWeight,
          });

          // 8. 并行执行更新操作
          const updateStartTime = performance.now();
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

            addRewardNotification(
              createRewardNotification.createItemProposal(
                ctx.user.id,
                input.projectId,
                itemProposal.id,
                reward,
              ),
              tx,
            ),

            logUserActivity.itemProposal.create(
              {
                userId: ctx.user.id,
                targetId: itemProposal.id,
                projectId: itemProposal.projectId,
                items: [{ field: input.key }],
              },
              tx,
            ),
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
            { userId: ctx.user.id, reward },
          );
        } else {
          // 9. 记录更新活动
          const logStartTime = performance.now();
          await logUserActivity.itemProposal.update(
            {
              userId: ctx.user.id,
              targetId: itemProposal.id,
              projectId: itemProposal.projectId,
              items: [{ field: input.key }],
            },
            tx,
          );
          dbLog('INSERT', 'activities', performance.now() - logStartTime, 1);
          perfLog('9. Log update activity', performance.now() - logStartTime, {
            itemProposalId: itemProposal.id,
          });
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
            isNewProposal: !existingProposal,
          },
        );

        return itemProposal;
      });
    }),
});
