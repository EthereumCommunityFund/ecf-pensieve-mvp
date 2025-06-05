import { and, eq } from 'drizzle-orm';

import {
  ESSENTIAL_ITEM_LIST,
  QUORUM_AMOUNT,
  REWARD_PERCENT,
  WEIGHT,
} from '@/lib/constants';
import { profiles, projectLogs, projects, voteRecords } from '@/lib/db/schema';
import { POC_ITEMS } from '@/lib/pocItems';
import { logUserActivity } from '@/lib/services/activeLogsService';
import {
  addRewardNotification,
  createRewardNotification,
} from '@/lib/services/notification';
import { dbLog, memLog, perfLog } from '@/utils/devLog';

export const calculateReward = (key: string): number => {
  const item = POC_ITEMS[key as keyof typeof POC_ITEMS];
  if (!item) {
    throw new Error(`Unknown item key: ${key}`);
  }
  return item.accountability_metric * WEIGHT * REWARD_PERCENT;
};

export const isEssentialItem = (key: string): boolean => {
  return ESSENTIAL_ITEM_LIST.some((item) => item.key === key);
};

export const handleVoteRecord = async (
  tx: any,
  {
    userId,
    projectId,
    itemProposalId,
    key,
    weight,
    existingVoteRecord,
    proposalCreatorId,
  }: {
    userId: string;
    projectId: number;
    itemProposalId: number;
    key: string;
    weight: number;
    existingVoteRecord?: any;
    proposalCreatorId?: string;
  },
) => {
  if (!existingVoteRecord) {
    const [vote] = await tx
      .insert(voteRecords)
      .values({
        creator: userId,
        projectId,
        itemProposalId,
        key,
        weight,
      })
      .returning();

    logUserActivity.vote.create(
      {
        userId,
        targetId: vote.id,
        projectId,
        items: [{ field: key }],
        proposalCreatorId,
      },
      tx,
    );

    return vote;
  } else {
    await tx
      .update(voteRecords)
      .set({
        weight,
        itemProposalId,
      })
      .where(eq(voteRecords.id, existingVoteRecord.id));

    logUserActivity.vote.update(
      {
        userId,
        targetId: existingVoteRecord.id,
        projectId,
        items: [{ field: key }],
        proposalCreatorId,
      },
      tx,
    );

    return existingVoteRecord;
  }
};

export const checkNeedQuorum = async (
  tx: any,
  { projectId, key }: { projectId: number; key: string },
) => {
  const isEssentialItem = ESSENTIAL_ITEM_LIST.some((item) => item.key === key);
  if (isEssentialItem) return false;

  const hasLeadingProposal = await tx.query.projectLogs.findFirst({
    where: and(eq(projectLogs.projectId, projectId), eq(projectLogs.key, key)),
  });

  return !hasLeadingProposal;
};

export const processItemProposalVoteResult = async (
  tx: any,
  {
    votes,
    itemProposal,
    project,
    key,
    needCheckQuorum,
    userId,
  }: {
    votes: any[];
    itemProposal: any;
    project: any;
    key: string;
    needCheckQuorum: boolean;
    userId: string;
  },
) => {
  const totalStartTime = performance.now();
  const startMem = memLog('processItemProposalVoteResult - Start');

  try {
    // 1. 检查法定人数要求
    const quorumCheckStartTime = performance.now();
    if (needCheckQuorum && votes.length < QUORUM_AMOUNT) {
      perfLog(
        '[processItemProposalVoteResult] 1. Quorum check failed - insufficient votes',
        performance.now() - quorumCheckStartTime,
        {
          needCheckQuorum,
          votesCount: votes.length,
          requiredQuorum: QUORUM_AMOUNT,
          key,
          itemProposalId: itemProposal?.id,
          projectId: itemProposal?.projectId,
          userId,
          result: 'early_return_insufficient_votes',
        },
      );
      memLog('processItemProposalVoteResult - Early Return (Quorum)', startMem);
      return;
    }
    perfLog(
      '[processItemProposalVoteResult] 1. Quorum check passed',
      performance.now() - quorumCheckStartTime,
      {
        needCheckQuorum,
        votesCount: votes.length,
        requiredQuorum: QUORUM_AMOUNT,
        key,
        itemProposalId: itemProposal?.id,
        projectId: itemProposal?.projectId,
        userId,
        quorumSatisfied: !needCheckQuorum || votes.length >= QUORUM_AMOUNT,
      },
    );

    // 2. 计算投票总权重
    const voteCalculationStartTime = performance.now();
    const voteSum = votes.reduce((acc, vote) => {
      acc += vote.weight ?? 0;
      return acc;
    }, 0);
    perfLog(
      '[processItemProposalVoteResult] 2. Calculate vote sum',
      performance.now() - voteCalculationStartTime,
      {
        votesCount: votes.length,
        voteSum,
        key,
        itemProposalId: itemProposal?.id,
        projectId: itemProposal?.projectId,
        userId,
        votesData: votes.map((v) => ({
          id: v.id,
          creator: v.creator,
          weight: v.weight ?? 0,
        })),
        averageVoteWeight: votes.length > 0 ? voteSum / votes.length : 0,
      },
    );

    // 3. 获取当前key的最高权重
    const weightComparisonStartTime = performance.now();
    const itemsTopWeight = project?.itemsTopWeight as
      | Record<string, number>
      | undefined;
    const keyWeight = itemsTopWeight?.[key] ?? 0;
    perfLog(
      '[processItemProposalVoteResult] 3. Get current key weight',
      performance.now() - weightComparisonStartTime,
      {
        key,
        currentKeyWeight: keyWeight,
        newVoteSum: voteSum,
        weightDifference: voteSum - keyWeight,
        willUpdate: voteSum > keyWeight,
        itemProposalId: itemProposal?.id,
        projectId: itemProposal?.projectId,
        userId,
        allItemsTopWeight: itemsTopWeight,
      },
    );

    // 4. 检查是否需要更新（投票权重是否更高）
    if (voteSum > keyWeight) {
      // 5. 计算奖励
      const rewardCalculationStartTime = performance.now();
      const rewardMultiplier = !needCheckQuorum ? 1 : 1 - REWARD_PERCENT;
      const reward =
        POC_ITEMS[key as keyof typeof POC_ITEMS].accountability_metric *
        WEIGHT *
        rewardMultiplier;
      const finalWeight = (itemProposal.creator.weight ?? 0) + reward;
      perfLog(
        '[processItemProposalVoteResult] 5. Calculate reward',
        performance.now() - rewardCalculationStartTime,
        {
          key,
          needCheckQuorum,
          rewardMultiplier,
          baseReward:
            POC_ITEMS[key as keyof typeof POC_ITEMS].accountability_metric *
            WEIGHT,
          finalReward: reward,
          creatorCurrentWeight: itemProposal.creator.weight ?? 0,
          creatorFinalWeight: finalWeight,
          itemProposalId: itemProposal?.id,
          projectId: itemProposal?.projectId,
          userId,
          creatorUserId: itemProposal.creator.userId,
          rewardCalculation: {
            accountabilityMetric:
              POC_ITEMS[key as keyof typeof POC_ITEMS].accountability_metric,
            weight: WEIGHT,
            rewardPercent: REWARD_PERCENT,
            rewardMultiplier,
          },
        },
      );

      // 6. 检查是否存在旧的项目日志
      const oldLogCheckStartTime = performance.now();
      const oldLog = await tx.query.projectLogs.findFirst({
        where: and(
          eq(projectLogs.projectId, itemProposal.projectId),
          eq(projectLogs.itemProposalId, itemProposal.id),
        ),
      });
      dbLog(
        'SELECT',
        '[processItemProposalVoteResult] projectLogs (old log check)',
        performance.now() - oldLogCheckStartTime,
        oldLog ? 1 : 0,
      );
      perfLog(
        '[processItemProposalVoteResult] 6. Check existing project log',
        performance.now() - oldLogCheckStartTime,
        {
          itemProposalId: itemProposal?.id,
          projectId: itemProposal?.projectId,
          key,
          userId,
          foundOldLog: !!oldLog,
          oldLogId: oldLog?.id,
          oldLogIsNotLeading: oldLog?.isNotLeading,
          oldLogCreatedAt: oldLog?.createdAt,
          queryCondition: {
            projectId: itemProposal.projectId,
            itemProposalId: itemProposal.id,
          },
        },
      );

      if (oldLog) {
        // 7a. 更新现有日志
        const updateExistingStartTime = performance.now();
        await Promise.all([
          tx
            .update(projectLogs)
            .set({
              isNotLeading: false,
              createdAt: new Date(),
            })
            .where(eq(projectLogs.id, oldLog.id)),
          tx.update(projects).set({
            itemsTopWeight: {
              ...(project?.itemsTopWeight ?? {}),
              [key]: voteSum,
            },
          }),
        ]);
        dbLog(
          'UPDATE',
          '[processItemProposalVoteResult] projectLogs + projects (existing log)',
          performance.now() - updateExistingStartTime,
          2,
        );
        perfLog(
          '[processItemProposalVoteResult] 7a. Update existing project log',
          performance.now() - updateExistingStartTime,
          {
            oldLogId: oldLog.id,
            itemProposalId: itemProposal?.id,
            projectId: itemProposal?.projectId,
            key,
            voteSum,
            userId,
            updatedLogData: {
              isNotLeading: false,
              createdAt: new Date(),
            },
            updatedProjectData: {
              itemsTopWeight: {
                ...(project?.itemsTopWeight ?? {}),
                [key]: voteSum,
              },
            },
            operationsCount: 2,
          },
        );

        // 记录总执行时间
        memLog(
          'processItemProposalVoteResult - End (Update Existing)',
          startMem,
        );
        perfLog(
          '[processItemProposalVoteResult] TOTAL execution (update existing)',
          performance.now() - totalStartTime,
          {
            itemProposalId: itemProposal?.id,
            projectId: itemProposal?.projectId,
            key,
            voteSum,
            keyWeight,
            userId,
            action: 'update_existing_log',
            oldLogId: oldLog.id,
          },
        );
        return;
      }

      // 7b. 创建新的项目日志和更新
      const createNewStartTime = performance.now();
      await Promise.all([
        tx.insert(projectLogs).values({
          projectId: itemProposal.projectId,
          itemProposalId: itemProposal.id,
          key,
        }),
        tx.update(projects).set({
          itemsTopWeight: {
            ...(project?.itemsTopWeight ?? {}),
            [key]: voteSum,
          },
        }),
        tx
          .update(profiles)
          .set({
            weight: finalWeight,
          })
          .where(eq(profiles.userId, itemProposal.creator.userId)),
      ]);
      dbLog(
        'INSERT + UPDATE',
        '[processItemProposalVoteResult] projectLogs + projects + profiles (new log)',
        performance.now() - createNewStartTime,
        3,
      );
      perfLog(
        '[processItemProposalVoteResult] 7b. Create new project log and updates',
        performance.now() - createNewStartTime,
        {
          itemProposalId: itemProposal?.id,
          projectId: itemProposal?.projectId,
          key,
          voteSum,
          reward,
          finalWeight,
          userId,
          creatorUserId: itemProposal.creator.userId,
          newLogData: {
            projectId: itemProposal.projectId,
            itemProposalId: itemProposal.id,
            key,
          },
          updatedProjectData: {
            itemsTopWeight: {
              ...(project?.itemsTopWeight ?? {}),
              [key]: voteSum,
            },
          },
          updatedProfileData: {
            userId: itemProposal.creator.userId,
            newWeight: finalWeight,
          },
          operationsCount: 3,
        },
      );

      // 8. 添加奖励通知
      const notificationStartTime = performance.now();
      await addRewardNotification(
        createRewardNotification.itemProposalPass(
          userId,
          itemProposal.projectId,
          itemProposal.id,
          reward,
        ),
        tx,
      );
      dbLog(
        'INSERT',
        '[processItemProposalVoteResult] notifications',
        performance.now() - notificationStartTime,
        1,
      );
      perfLog(
        '[processItemProposalVoteResult] 8. Add reward notification',
        performance.now() - notificationStartTime,
        {
          userId,
          itemProposalId: itemProposal?.id,
          projectId: itemProposal?.projectId,
          reward,
          key,
          notificationData: {
            userId,
            projectId: itemProposal.projectId,
            itemProposalId: itemProposal.id,
            reward,
          },
        },
      );

      // 记录总执行时间和返回结果
      const result = { reward, finalWeight, voteSum };
      memLog('processItemProposalVoteResult - End (Success)', startMem);
      perfLog(
        '[processItemProposalVoteResult] TOTAL execution (success)',
        performance.now() - totalStartTime,
        {
          itemProposalId: itemProposal?.id,
          projectId: itemProposal?.projectId,
          key,
          voteSum,
          keyWeight,
          reward,
          finalWeight,
          userId,
          creatorUserId: itemProposal.creator.userId,
          action: 'create_new_log_and_reward',
          result,
          votesCount: votes.length,
          needCheckQuorum,
          rewardMultiplier,
        },
      );

      return result;
    }

    // 9. 投票权重不足，无需更新
    memLog('processItemProposalVoteResult - End (No Update)', startMem);
    perfLog(
      '[processItemProposalVoteResult] TOTAL execution (no update needed)',
      performance.now() - totalStartTime,
      {
        itemProposalId: itemProposal?.id,
        projectId: itemProposal?.projectId,
        key,
        voteSum,
        keyWeight,
        userId,
        reason: 'vote_sum_not_greater_than_key_weight',
        votesCount: votes.length,
        needCheckQuorum,
      },
    );

    return null;
  } catch (error) {
    // 记录错误
    memLog('processItemProposalVoteResult - Error', startMem);
    perfLog(
      '[processItemProposalVoteResult] ERROR during execution',
      performance.now() - totalStartTime,
      {
        itemProposalId: itemProposal?.id,
        projectId: itemProposal?.projectId,
        key,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        votesCount: votes.length,
        needCheckQuorum,
      },
    );

    // 重新抛出错误
    throw error;
  }
};

export const processItemProposalUpdate = async (
  tx: any,
  {
    votes,
    project,
    key,
  }: {
    votes: any[];
    project: any;
    key: string;
  },
) => {
  const voteSum = votes.reduce((acc, vote) => {
    acc += vote.weight ?? 0;
    return acc;
  }, 0);

  await tx.update(projects).set({
    itemsTopWeight: {
      ...(project?.itemsTopWeight ?? {}),
      [key]: voteSum,
    },
  });
};

export const handleOriginalProposalUpdate = async (
  tx: any,
  {
    originalItemProposalId,
    projectId,
    key,
    project,
  }: {
    originalItemProposalId: number;
    projectId: number;
    key: string;
    project: any;
  },
) => {
  const originalLeadingCheck = await tx.query.projectLogs.findFirst({
    where: and(eq(projectLogs.projectId, projectId), eq(projectLogs.key, key)),
    orderBy: (projectLogs: any, { desc }: any) => [desc(projectLogs.createdAt)],
  });

  if (originalLeadingCheck?.itemProposalId === originalItemProposalId) {
    const originalVotes = await tx.query.voteRecords.findMany({
      where: and(
        eq(voteRecords.itemProposalId, originalItemProposalId),
        eq(voteRecords.key, key),
      ),
    });

    const originalVoteSum = originalVotes.reduce((acc: number, vote: any) => {
      acc += vote.weight ?? 0;
      return acc;
    }, 0);

    const itemsTopWeight = project?.itemsTopWeight as
      | Record<string, number>
      | undefined;
    const keyWeight = itemsTopWeight?.[key] ?? 0;

    if (originalVoteSum < keyWeight) {
      await tx
        .update(projectLogs)
        .set({
          isNotLeading: true,
        })
        .where(eq(projectLogs.id, originalLeadingCheck.id));
    }
  }
};
