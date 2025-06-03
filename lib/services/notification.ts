import { performance } from 'perf_hooks';

import { dbLog, perfLog } from '@/utils/devLog';

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
  const startTime = performance.now();

  try {
    const currentDb = tx ?? db;

    const insertStartTime = performance.now();
    const [newNotification] = await currentDb
      .insert(notifications)
      .values(notification)
      .returning();
    dbLog('INSERT', 'notifications', performance.now() - insertStartTime, 1);

    if (!newNotification) {
      throw new Error('Failed to create notification');
    }

    perfLog(
      `addRewardNotification (type: ${notification.type})`,
      performance.now() - startTime,
      {
        userId: notification.userId,
        projectId: notification.projectId,
        reward: notification.reward,
      },
    );

    return newNotification;
  } catch (error) {
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
