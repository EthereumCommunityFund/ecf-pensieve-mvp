import { performance } from 'perf_hooks';

import { eq } from 'drizzle-orm';

import { dbLog, perfLog } from '@/utils/devLog';

import { db } from '../db';
import { profiles } from '../db/schema';

export const updateUserWeight = async (
  userId: string,
  reward: number,
  tx?: any,
) => {
  const startTime = performance.now();
  const currentDb = tx ?? db;

  // 查询用户权重
  const queryStartTime = performance.now();
  const userProfile = await currentDb.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });
  dbLog('SELECT', 'profiles', performance.now() - queryStartTime, 1);

  // 更新用户权重
  const updateStartTime = performance.now();
  const newWeight = (userProfile?.weight ?? 0) + reward;
  await currentDb
    .update(profiles)
    .set({
      weight: newWeight,
    })
    .where(eq(profiles.userId, userId));
  dbLog('UPDATE', 'profiles', performance.now() - updateStartTime, 1);

  perfLog(
    `updateUserWeight (userId: ${userId}, reward: ${reward})`,
    performance.now() - startTime,
    { oldWeight: userProfile?.weight ?? 0, newWeight },
  );
};
