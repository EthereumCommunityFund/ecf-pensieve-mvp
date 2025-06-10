import { eq, sum } from 'drizzle-orm';

import { db } from '../db';
import { likeRecords, profiles } from '../db/schema';

export const updateUserWeight = async (
  userId: string,
  reward: number,
  tx?: any,
) => {
  const currentDb = tx ?? db;
  const userProfile = await currentDb.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });

  await currentDb
    .update(profiles)
    .set({
      weight: (userProfile?.weight ?? 0) + reward,
    })
    .where(eq(profiles.userId, userId));
};

export const getUserUsedWeight = async (userId: string, tx?: any) => {
  const currentDb = tx ?? db;

  const result = await currentDb
    .select({
      totalUsedWeight: sum(likeRecords.weight),
    })
    .from(likeRecords)
    .where(eq(likeRecords.creator, userId));

  return Number(result[0]?.totalUsedWeight ?? 0);
};

export const getUserAvailableWeight = async (userId: string, tx?: any) => {
  const currentDb = tx ?? db;

  const [userProfile, usedWeight] = await Promise.all([
    currentDb.query.profiles.findFirst({
      where: eq(profiles.userId, userId),
    }),
    getUserUsedWeight(userId, currentDb),
  ]);

  const totalWeight = userProfile?.weight ?? 0;
  return Math.max(0, totalWeight - usedWeight);
};

export const deductUserWeight = async (
  userId: string,
  amount: number,
  tx?: any,
) => {
  const availableWeight = await getUserAvailableWeight(userId, tx);

  if (availableWeight < amount) {
    throw new Error(
      `Insufficient weight. Available: ${availableWeight}, Requested: ${amount}`,
    );
  }

  return availableWeight - amount;
};
