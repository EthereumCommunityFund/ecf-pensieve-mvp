import { db } from '../db';
import { notifications } from '../db/schema';

import type { QueueOptions } from './notification/queue';
import { notificationQueue } from './notification/queue';

export type NotificationType =
  | 'createProposal'
  | 'proposalPass'
  | 'proposalPassed'
  | 'createItemProposal'
  | 'itemProposalPass'
  | 'projectPublished'
  | 'proposalSupported'
  | 'itemProposalSupported'
  | 'itemProposalPassed'
  | 'itemProposalBecameLeading'
  | 'itemProposalLostLeading';

export interface NotificationData {
  userId: string;
  projectId: number;
  proposalId?: number;
  itemProposalId?: number;
  reward?: number;
  voter_id?: string;
  type: NotificationType;
}

export interface RewardNotificationData extends NotificationData {
  reward: number;
}

export interface MultiUserNotificationData
  extends Omit<NotificationData, 'userId'> {
  userId?: string;
  metadata?: {
    key?: string;
    itemProposalId?: number;
    proposalId?: number;
  };
}

export const addNotificationDirect = async (
  notification: NotificationData,
  tx?: any,
): Promise<typeof notifications.$inferSelect> => {
  try {
    const currentDb = tx ?? db;

    const [newNotification] = await currentDb
      .insert(notifications)
      .values(notification)
      .returning();

    if (!newNotification) {
      throw new Error('Failed to create notification');
    }

    return newNotification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const addNotificationToQueue = async (
  notification: NotificationData,
  options?: QueueOptions,
) => {
  return notificationQueue.enqueue(notification, options);
};

export const addNotification = async (
  notification: NotificationData,
  tx?: any,
): Promise<typeof notifications.$inferSelect | null> => {
  if (tx) {
    return addNotificationDirect(notification, tx);
  }

  await addNotificationToQueue(notification);

  return null;
};

export const addRewardNotification = async (
  notification: RewardNotificationData,
  tx?: any,
): Promise<typeof notifications.$inferSelect | null> => {
  return addNotification(notification, tx);
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

export const addMultiUserNotification = async (
  baseData: MultiUserNotificationData,
): Promise<void> => {
  await notificationQueue.enqueue(baseData as NotificationData);
};

export const createNotification = {
  projectPublished: (userId: string, projectId: number): NotificationData => ({
    userId,
    projectId,
    type: 'projectPublished' as const,
  }),

  proposalPassed: (
    userId: string,
    projectId: number,
    proposalId: number,
  ): NotificationData => ({
    userId,
    projectId,
    proposalId,
    type: 'proposalPassed' as const,
  }),

  proposalSupported: (
    userId: string,
    projectId: number,
    proposalId: number,
    voterId: string,
  ): NotificationData => ({
    userId,
    projectId,
    proposalId,
    voter_id: voterId,
    type: 'proposalSupported' as const,
  }),

  itemProposalSupported: (
    userId: string,
    projectId: number,
    itemProposalId: number,
    voterId: string,
  ): NotificationData => ({
    userId,
    projectId,
    itemProposalId,
    voter_id: voterId,
    type: 'itemProposalSupported' as const,
  }),

  itemProposalBecameLeading: (
    userId: string,
    projectId: number,
    itemProposalId: number,
  ): NotificationData => ({
    userId,
    projectId,
    itemProposalId,
    type: 'itemProposalBecameLeading' as const,
  }),

  itemProposalLostLeading: (
    userId: string,
    projectId: number,
    itemProposalId: number,
  ): NotificationData => ({
    userId,
    projectId,
    itemProposalId,
    type: 'itemProposalLostLeading' as const,
  }),
};

export const createMultiUserNotification = {
  itemProposalBecameLeading: (
    userId: string,
    projectId: number,
    itemProposalId: number,
  ): MultiUserNotificationData => ({
    type: 'itemProposalBecameLeading',
    projectId,
    itemProposalId,
    userId,
  }),

  itemProposalLostLeading: (
    userId: string,
    projectId: number,
    itemProposalId: number,
  ): MultiUserNotificationData => ({
    type: 'itemProposalLostLeading',
    projectId,
    itemProposalId,
    userId,
  }),

  itemProposalSupported: (
    userId: string,
    projectId: number,
    itemProposalId: number,
  ): MultiUserNotificationData => ({
    type: 'itemProposalSupported',
    projectId,
    itemProposalId,
    userId,
  }),

  createItemProposal: (
    userId: string,
    projectId: number,
    itemProposalId: number,
  ): MultiUserNotificationData => ({
    type: 'createItemProposal',
    projectId,
    itemProposalId,
    userId,
  }),
};
