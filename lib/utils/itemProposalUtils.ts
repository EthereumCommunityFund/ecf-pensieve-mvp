import { eq } from 'drizzle-orm';

import { ESSENTIAL_ITEM_LIST, REWARD_PERCENT, WEIGHT } from '@/lib/constants';
import { voteRecords } from '@/lib/db/schema';
import { POC_ITEMS } from '@/lib/pocItems';
import { logUserActivity } from '@/lib/services/activeLogsService';

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
  }: {
    userId: string;
    projectId: number;
    itemProposalId: number;
    key: string;
    weight: number;
    existingVoteRecord?: any;
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

    logUserActivity.vote.create({
      userId,
      targetId: vote.id,
      projectId,
      items: [{ field: key }],
      proposalCreatorId: userId,
    });

    return vote;
  } else {
    await tx
      .update(voteRecords)
      .set({
        weight,
        itemProposalId,
      })
      .where(eq(voteRecords.id, existingVoteRecord.id));

    logUserActivity.vote.update({
      userId,
      targetId: existingVoteRecord.id,
      projectId,
      items: [{ field: key }],
      proposalCreatorId: userId,
    });

    return existingVoteRecord;
  }
};
