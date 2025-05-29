import { and, eq } from 'drizzle-orm';

import {
  ESSENTIAL_ITEM_LIST,
  QUORUM_AMOUNT,
  REWARD_PERCENT,
  WEIGHT,
} from '@/lib/constants';
import { profiles, projectLogs, projects, voteRecords } from '@/lib/db/schema';
import { POC_ITEMS } from '@/lib/pocItems';
import { logUserActivity } from '@/lib/services/activeLogsService';
import {
  addRewardNotification,
  createRewardNotification,
} from '@/lib/services/notification';

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
    proposalCreatorId,
  }: {
    userId: string;
    projectId: number;
    itemProposalId: number;
    key: string;
    weight: number;
    existingVoteRecord?: any;
    proposalCreatorId: string;
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
      proposalCreatorId,
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
      proposalCreatorId,
    });

    return existingVoteRecord;
  }
};

export const checkNeedQuorum = async (
  tx: any,
  { projectId, key }: { projectId: number; key: string },
) => {
  const isEssentialItem = ESSENTIAL_ITEM_LIST.some((item) => item.key === key);
  if (isEssentialItem) return false;

  const hasLeadingProposal = await tx.query.projectLogs.findFirst({
    where: and(eq(projectLogs.projectId, projectId), eq(projectLogs.key, key)),
  });

  return !hasLeadingProposal;
};

export const processItemProposalVoteResult = async (
  tx: any,
  {
    votes,
    itemProposal,
    project,
    key,
    needCheckQuorum,
    userId,
  }: {
    votes: any[];
    itemProposal: any;
    project: any;
    key: string;
    needCheckQuorum: boolean;
    userId: string;
  },
) => {
  if (needCheckQuorum && votes.length < QUORUM_AMOUNT) {
    return;
  }

  const voteSum = votes.reduce((acc, vote) => {
    acc += vote.weight ?? 0;
    return acc;
  }, 0);

  const itemsTopWeight = project?.itemsTopWeight as
    | Record<string, number>
    | undefined;
  const keyWeight = itemsTopWeight?.[key] ?? 0;

  if (voteSum > keyWeight) {
    const rewardMultiplier = needCheckQuorum ? 1 : 1 - REWARD_PERCENT;
    const reward =
      POC_ITEMS[key as keyof typeof POC_ITEMS].accountability_metric *
      WEIGHT *
      rewardMultiplier;

    const finalWeight = (itemProposal.creator.weight ?? 0) + reward;

    await Promise.all([
      tx.insert(projectLogs).values({
        projectId: itemProposal.projectId,
        itemProposalId: itemProposal.id,
        key,
      }),
      tx.update(projects).set({
        itemsTopWeight: {
          ...(project?.itemsTopWeight ?? {}),
          [key]: voteSum,
        },
      }),
      tx
        .update(profiles)
        .set({
          weight: finalWeight,
        })
        .where(eq(profiles.userId, itemProposal.creator.userId)),
    ]);

    await addRewardNotification(
      createRewardNotification.itemProposalPass(
        userId,
        itemProposal.projectId,
        itemProposal.id,
        reward,
      ),
    );

    return { reward, finalWeight, voteSum };
  }

  return null;
};

export const processItemProposalUpdate = async (
  tx: any,
  {
    votes,
    project,
    key,
    projectLog,
  }: {
    votes: any[];
    project: any;
    key: string;
    projectLog: any;
  },
) => {
  const voteSum = votes.reduce((acc, vote) => {
    acc += vote.weight ?? 0;
    return acc;
  }, 0);

  const itemsTopWeight = project?.itemsTopWeight as
    | Record<string, number>
    | undefined;
  const keyWeight = itemsTopWeight?.[key] ?? 0;

  if (!projectLog.isNotLeading) {
    await tx.update(projects).set({
      itemsTopWeight: {
        ...(project?.itemsTopWeight ?? {}),
        [key]: voteSum,
      },
    });
    return;
  }

  if (voteSum > keyWeight && projectLog.isNotLeading) {
    await Promise.all([
      tx.update(projects).set({
        itemsTopWeight: {
          ...(project?.itemsTopWeight ?? {}),
          [key]: voteSum,
        },
      }),
      tx
        .update(projectLogs)
        .set({
          isNotLeading: false,
        })
        .where(eq(projectLogs.id, projectLog.id)),
    ]);
    return;
  }
};

export const handleOriginalProposalUpdate = async (
  tx: any,
  {
    originalItemProposalId,
    projectId,
    key,
    project,
  }: {
    originalItemProposalId: number;
    projectId: number;
    key: string;
    project: any;
  },
) => {
  const originalLeadingCheck = await tx.query.projectLogs.findFirst({
    where: and(eq(projectLogs.projectId, projectId), eq(projectLogs.key, key)),
    orderBy: (projectLogs: any, { desc }: any) => [desc(projectLogs.createdAt)],
  });

  if (originalLeadingCheck?.itemProposalId === originalItemProposalId) {
    const originalVotes = await tx.query.voteRecords.findMany({
      where: and(
        eq(voteRecords.itemProposalId, originalItemProposalId),
        eq(voteRecords.key, key),
      ),
    });

    const originalVoteSum = originalVotes.reduce((acc: number, vote: any) => {
      acc += vote.weight ?? 0;
      return acc;
    }, 0);

    const itemsTopWeight = project?.itemsTopWeight as
      | Record<string, number>
      | undefined;
    const keyWeight = itemsTopWeight?.[key] ?? 0;

    if (originalVoteSum < keyWeight) {
      await tx
        .update(projectLogs)
        .set({
          isNotLeading: true,
        })
        .where(eq(projectLogs.id, originalLeadingCheck.id));
    }
  }
};
