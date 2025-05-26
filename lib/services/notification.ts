import { db } from '../db';
import { notifications } from '../db/schema';

export type NotificationType = 'createProposal' | 'proposalPass';

export interface RewardNotificationData {
  userId: string;
  projectId: number;
  proposalId: number;
  reward: number;
  type: NotificationType;
}

export const addRewardNotification = async (
  notification: RewardNotificationData,
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
};
