import type {
  BroadcastNotificationType,
  NotificationMetadata,
} from '@/types/notification';

import { db } from '../db';
import { notifications } from '../db/schema';

export type {
  BroadcastNotificationType,
  NotificationMetadata,
} from '@/types/notification';

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
  | 'itemProposalLostLeading'
  | 'systemUpdate'
  | 'newItemsAvailable';

export interface NotificationData {
  userId?: string;
  projectId?: number | null;
  proposalId?: number;
  itemProposalId?: number;
  reward?: number;
  voter_id?: string;
  type: NotificationType;
  metadata?: NotificationMetadata;
  broadcast?: boolean;
  operatorId?: string;
}

export interface RewardNotificationData extends NotificationData {
  userId: string;
  projectId: number;
  reward: number;
}

export interface MultiUserNotificationData
  extends Omit<NotificationData, 'userId'> {
  userId?: string;
}

type NotificationInsert = typeof notifications.$inferInsert;

const buildNotificationInsert = (
  notification: NotificationData & { userId: string },
): NotificationInsert => ({
  userId: notification.userId,
  projectId: notification.projectId ?? null,
  proposalId: notification.proposalId,
  itemProposalId: notification.itemProposalId,
  reward: notification.reward,
  voter_id: notification.voter_id,
  type: notification.type,
  metadata: notification.metadata ?? null,
});

export const addNotificationDirect = async (
  notification: NotificationData,
  tx?: any,
): Promise<typeof notifications.$inferSelect> => {
  try {
    const currentDb = tx ?? db;

    if (!notification.userId) {
      throw new Error('Direct notification requires userId');
    }

    const [newNotification] = await currentDb
      .insert(notifications)
      .values(
        buildNotificationInsert(
          notification as NotificationData & { userId: string },
        ),
      )
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

export const enqueueBroadcastNotification = async (
  input: {
    type: BroadcastNotificationType;
    metadata: NotificationMetadata;
    projectId?: number | null;
    operatorId?: string;
    operatorWallet?: string;
  },
  options?: QueueOptions,
): Promise<void> => {
  const metadata: NotificationMetadata = {
    ...input.metadata,
    operatorUserId: input.operatorId,
    operatorWallet: input.metadata.operatorWallet ?? input.operatorWallet,
  };

  const payload: NotificationData = {
    projectId: input.projectId ?? null,
    type: input.type,
    metadata,
    broadcast: true,
    operatorId: input.operatorId,
  };

  await addNotificationToQueue(payload, options);
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
    voterId: string,
  ): MultiUserNotificationData => ({
    type: 'itemProposalSupported',
    projectId,
    itemProposalId,
    userId,
    voter_id: voterId,
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
