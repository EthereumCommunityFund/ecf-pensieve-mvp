import { and, eq } from 'drizzle-orm';

import {
  ESSENTIAL_ITEM_LIST,
  QUORUM_AMOUNT,
  REWARD_PERCENT,
  WEIGHT,
} from '@/lib/constants';
import {
  itemProposals,
  profiles,
  projectLogs,
  projects,
  projectSnaps,
  ranks,
  voteRecords,
} from '@/lib/db/schema';
import { POC_ITEMS } from '@/lib/pocItems';
import { logUserActivity } from '@/lib/services/activeLogsService';
import {
  addMultiUserNotification,
  addNotification,
  addRewardNotification,
  createMultiUserNotification,
  createNotification,
  createRewardNotification,
} from '@/lib/services/notification';
import { calculatePublishedGenesisWeight } from '@/lib/utils/rankUtils';

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

export const updateProjectSnaps = async (
  tx: any,
  projectId: number,
  key: string,
  value: any,
): Promise<void> => {
  const projectSnap = await tx.query.projectSnaps.findFirst({
    where: eq(projectSnaps.projectId, projectId),
  });
  if (!projectSnap) {
    return;
  }
  const updatedItems = projectSnap.items.filter(
    (item: any) => item.key !== key,
  );
  updatedItems.push({ key, value });
  await tx
    .update(projectSnaps)
    .set({ items: updatedItems })
    .where(eq(projectSnaps.id, projectSnap.id));
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
    proposalCreatorId?: string;
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

    logUserActivity.vote.create(
      {
        userId,
        targetId: vote.id,
        projectId,
        items: [{ field: key }],
        proposalCreatorId,
      },
      tx,
    );

    return vote;
  } else {
    await tx
      .update(voteRecords)
      .set({
        weight,
        itemProposalId,
      })
      .where(eq(voteRecords.id, existingVoteRecord.id));

    logUserActivity.vote.update(
      {
        userId,
        targetId: existingVoteRecord.id,
        projectId,
        items: [{ field: key }],
        proposalCreatorId,
      },
      tx,
    );

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
  const genesisWeight =
    POC_ITEMS[key as keyof typeof POC_ITEMS].accountability_metric * WEIGHT;
  const keyWeight = itemsTopWeight?.[key] ?? genesisWeight;

  if (voteSum > keyWeight) {
    const rewardMultiplier = !needCheckQuorum ? 1 : 1 - REWARD_PERCENT;
    const reward = genesisWeight * rewardMultiplier;

    const finalWeight = (itemProposal.creator.weight ?? 0) + reward;

    const oldLog = await tx.query.projectLogs.findFirst({
      where: and(
        eq(projectLogs.projectId, itemProposal.projectId),
        eq(projectLogs.itemProposalId, itemProposal.id),
      ),
    });

    const newItemsTopWeight = {
      ...(project?.itemsTopWeight ?? {}),
      [key]: voteSum,
    };

    if (oldLog) {
      await Promise.all([
        tx
          .update(projectLogs)
          .set({
            isNotLeading: false,
            createdAt: new Date(),
          })
          .where(eq(projectLogs.id, oldLog.id)),
        tx
          .update(projects)
          .set({
            itemsTopWeight: newItemsTopWeight,
          })
          .where(eq(projects.id, itemProposal.projectId)),
        addNotification(
          createNotification.itemProposalBecameLeading(
            itemProposal.creator.userId,
            itemProposal.projectId,
            itemProposal.id,
          ),
          tx,
        ),
        updateProjectSnaps(tx, itemProposal.projectId, key, itemProposal.value),
      ]);
      return;
    }

    const newPublishedGenesisWeight = calculatePublishedGenesisWeight(
      Object.keys(newItemsTopWeight),
    );

    await Promise.all([
      tx.insert(projectLogs).values({
        projectId: itemProposal.projectId,
        itemProposalId: itemProposal.id,
        key,
      }),
      tx
        .update(projects)
        .set({
          itemsTopWeight: newItemsTopWeight,
        })
        .where(eq(projects.id, itemProposal.projectId)),
      tx
        .update(ranks)
        .set({
          publishedGenesisWeight: newPublishedGenesisWeight,
        })
        .where(eq(ranks.projectId, itemProposal.projectId)),
      tx
        .update(profiles)
        .set({
          weight: finalWeight,
        })
        .where(eq(profiles.userId, itemProposal.creator.userId)),
      addRewardNotification(
        createRewardNotification.itemProposalPass(
          itemProposal.creator.userId,
          itemProposal.projectId,
          itemProposal.id,
          reward,
        ),
        tx,
      ),
      addMultiUserNotification(
        createMultiUserNotification.itemProposalBecameLeading(
          itemProposal.creator.userId,
          itemProposal.projectId,
          itemProposal.id,
        ),
      ),
      updateProjectSnaps(tx, itemProposal.projectId, key, itemProposal.value),
    ]);

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
  }: {
    votes: any[];
    project: any;
    key: string;
  },
) => {
  const voteSum = votes.reduce((acc, vote) => {
    acc += vote.weight ?? 0;
    return acc;
  }, 0);

  await tx
    .update(projects)
    .set({
      itemsTopWeight: {
        ...(project?.itemsTopWeight ?? {}),
        [key]: voteSum,
      },
    })
    .where(eq(projects.id, project.id));

  const leadingLog = await tx.query.projectLogs.findFirst({
    where: and(
      eq(projectLogs.projectId, project.id),
      eq(projectLogs.key, key),
      eq(projectLogs.isNotLeading, false),
    ),
    orderBy: (projectLogs: any, { desc }: any) => [desc(projectLogs.createdAt)],
    with: {
      itemProposal: true,
    },
  });

  if (leadingLog?.itemProposal) {
    await updateProjectSnaps(
      tx,
      project.id,
      key,
      leadingLog.itemProposal.value,
    );
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
      const originalItemProposal = await tx.query.itemProposals.findFirst({
        where: eq(itemProposals.id, originalItemProposalId),
        with: {
          creator: true,
        },
      });

      await Promise.all([
        tx
          .update(projectLogs)
          .set({
            isNotLeading: true,
          })
          .where(eq(projectLogs.id, originalLeadingCheck.id)),
        originalItemProposal
          ? addNotification(
              createNotification.itemProposalLostLeading(
                originalItemProposal.creator.userId,
                projectId,
                originalItemProposalId,
              ),
              tx,
            )
          : Promise.resolve(),
      ]);
    }
  }
};
