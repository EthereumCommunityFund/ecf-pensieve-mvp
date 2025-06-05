import { performance } from 'perf_hooks';

import { dbLog, memLog, perfLog } from '@/utils/devLog';

import { db } from '../db';
import { notifications } from '../db/schema';

export type NotificationType =
  | 'createProposal'
  | 'proposalPass'
  | 'createItemProposal'
  | 'itemProposalPass';

export interface RewardNotificationData {
  userId: string;
  projectId: number;
  proposalId?: number;
  itemProposalId?: number;
  reward: number;
  type: NotificationType;
}

export const addRewardNotification = async (
  notification: RewardNotificationData,
  tx?: any,
): Promise<typeof notifications.$inferSelect> => {
  const totalStartTime = performance.now();
  const startMem = memLog('addRewardNotification - Start');

  try {
    // 1. 获取数据库连接
    const dbConnectionStartTime = performance.now();
    const currentDb = tx ?? db;
    const usingTransaction = !!tx;
    perfLog(
      '[addRewardNotification] 1. Get database connection',
      performance.now() - dbConnectionStartTime,
      {
        usingTransaction,
        notificationType: notification.type,
        userId: notification.userId,
        projectId: notification.projectId,
        proposalId: notification.proposalId,
        itemProposalId: notification.itemProposalId,
        reward: notification.reward,
        hasTransaction: !!tx,
      },
    );

    // 2. 插入通知记录
    const insertStartTime = performance.now();
    const [newNotification] = await currentDb
      .insert(notifications)
      .values(notification)
      .returning();
    dbLog(
      'INSERT',
      '[addRewardNotification] notifications',
      performance.now() - insertStartTime,
      1,
    );
    perfLog(
      '[addRewardNotification] 2. Insert notification record',
      performance.now() - insertStartTime,
      {
        notificationId: newNotification?.id,
        insertData: notification,
        userId: notification.userId,
        projectId: notification.projectId,
        proposalId: notification.proposalId,
        itemProposalId: notification.itemProposalId,
        reward: notification.reward,
        type: notification.type,
        usingTransaction,
        insertSuccess: !!newNotification,
      },
    );

    // 3. 验证插入结果
    const validationStartTime = performance.now();
    if (!newNotification) {
      perfLog(
        '[addRewardNotification] 3. Validation failed - no notification created',
        performance.now() - validationStartTime,
        {
          notification,
          usingTransaction,
          error: 'Failed to create notification',
        },
      );
      throw new Error('Failed to create notification');
    }
    perfLog(
      '[addRewardNotification] 3. Validation passed',
      performance.now() - validationStartTime,
      {
        notificationId: newNotification.id,
        userId: newNotification.userId,
        projectId: newNotification.projectId,
        proposalId: newNotification.proposalId,
        itemProposalId: newNotification.itemProposalId,
        reward: newNotification.reward,
        type: newNotification.type,
        createdAt: newNotification.createdAt,
        usingTransaction,
      },
    );

    // 4. 记录总执行时间和内存使用
    memLog('addRewardNotification - End', startMem);
    perfLog(
      '[addRewardNotification] TOTAL execution',
      performance.now() - totalStartTime,
      {
        notificationId: newNotification.id,
        userId: notification.userId,
        projectId: notification.projectId,
        proposalId: notification.proposalId,
        itemProposalId: notification.itemProposalId,
        reward: notification.reward,
        type: notification.type,
        usingTransaction,
        finalNotificationData: {
          id: newNotification.id,
          userId: newNotification.userId,
          projectId: newNotification.projectId,
          proposalId: newNotification.proposalId,
          itemProposalId: newNotification.itemProposalId,
          reward: newNotification.reward,
          type: newNotification.type,
          createdAt: newNotification.createdAt,
        },
      },
    );

    return newNotification;
  } catch (error) {
    // 记录错误
    memLog('addRewardNotification - Error', startMem);
    perfLog(
      '[addRewardNotification] ERROR during execution',
      performance.now() - totalStartTime,
      {
        userId: notification.userId,
        projectId: notification.projectId,
        proposalId: notification.proposalId,
        itemProposalId: notification.itemProposalId,
        reward: notification.reward,
        type: notification.type,
        usingTransaction: !!tx,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
      },
    );

    console.error('Error creating reward notification:', error);
    throw error;
  }
};

export const createRewardNotification = {
  createProposal: (
    userId: string,
    projectId: number,
    proposalId: number,
    reward: number,
  ): RewardNotificationData => ({
    userId,
    projectId,
    proposalId,
    reward,
    type: 'createProposal' as const,
  }),

  createItemProposal: (
    userId: string,
    projectId: number,
    itemProposalId: number,
    reward: number,
  ): RewardNotificationData => ({
    userId,
    projectId,
    itemProposalId,
    reward,
    type: 'createItemProposal' as const,
  }),

  proposalPass: (
    userId: string,
    projectId: number,
    proposalId: number,
    reward: number,
  ): RewardNotificationData => ({
    userId,
    projectId,
    proposalId,
    reward,
    type: 'proposalPass' as const,
  }),

  itemProposalPass: (
    userId: string,
    projectId: number,
    itemProposalId: number,
    reward: number,
  ): RewardNotificationData => ({
    userId,
    projectId,
    itemProposalId,
    reward,
    type: 'itemProposalPass' as const,
  }),
};
