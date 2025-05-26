import { db } from '../db';
import { notifications } from '../db/schema';

export const addRewardNotification = async (notification: {
  userId: string;
  projectId: number;
  proposalId: number;
  reward: number;
  type: 'createProposal' | 'proposalPass';
}) => {
  const [newNotification] = await db
    .insert(notifications)
    .values(notification)
    .returning();

  return newNotification;
};
