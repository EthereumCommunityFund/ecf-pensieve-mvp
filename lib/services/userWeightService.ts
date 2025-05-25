import { eq } from 'drizzle-orm';

import { profiles } from '../db/schema';
import { db } from '../db';

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
