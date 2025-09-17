import { eq, inArray, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import {
  ESSENTIAL_ITEM_WEIGHT_AMOUNT,
  REWARD_PERCENT,
  WEIGHT,
} from '@/lib/constants';
import * as schema from '@/lib/db/schema';
import { itemProposals, notifications, profiles } from '@/lib/db/schema';
import { POC_ITEMS } from '@/lib/pocItems';
import { LEGACY_ITEM_WEIGHTS } from '@/lib/pocLegacyWeights';
import type { NotificationType } from '@/lib/services/notification';

const changedKeys = [
  'launch_plan',
  'audit_status',
  'core_team',
  'token_sales',
  'budget_plans',
  'treasury_vault_address',
];

const TARGET_NOTIFICATION_TYPES: Array<
  Extract<
    NotificationType,
    | 'createProposal'
    | 'proposalPass'
    | 'createItemProposal'
    | 'itemProposalPass'
  >
> = [
  'createProposal',
  'proposalPass',
  'createItemProposal',
  'itemProposalPass',
];

interface NotificationRow {
  id: number;
  type: string;
  reward: number | null;
  userId: string;
  projectId: number | null;
  proposalId: number | null;
  itemProposalId: number | null;
  createdAt: Date;
}

interface ItemProposalRow {
  id: number;
  projectId: number;
  key: string | null;
  createdAt: Date | null;
}

interface RewardUpdate {
  notificationId: number;
  userId: string;
  type: NotificationRow['type'];
  oldReward: number;
  newReward: number;
  itemProposalKey?: string | null;
}

interface ScriptOptions {
  dryRun: boolean;
}
const parseOptions = (): ScriptOptions => {
  let dryRun = true;

  const envDryRun = process.env.DRY_RUN;
  if (typeof envDryRun === 'string') {
    const normalized = envDryRun.trim().toLowerCase();
    if (['false', '0', 'no', 'off'].includes(normalized)) {
      dryRun = false;
    } else if (['true', '1', 'yes', 'on'].includes(normalized)) {
      dryRun = true;
    }
  }

  return { dryRun };
};

const EPSILON = 0.000001;

const getGenesisWeight = (itemKey: string) => {
  const config = POC_ITEMS[itemKey as keyof typeof POC_ITEMS];
  if (!config) {
    throw new Error(`Unknown POC item key: ${itemKey}`);
  }
  return Number(config.accountability_metric) * WEIGHT;
};

const getLegacyGenesisWeight = (itemKey: string) => {
  const config =
    LEGACY_ITEM_WEIGHTS[itemKey as keyof typeof LEGACY_ITEM_WEIGHTS];
  if (!config) {
    throw new Error(`Unknown POC item key: ${itemKey}`);
  }
  return Number(config.accountability_metric) * WEIGHT;
};

const calculateCreateProposalReward = () =>
  ESSENTIAL_ITEM_WEIGHT_AMOUNT * REWARD_PERCENT;

const calculateProposalPassReward = () =>
  ESSENTIAL_ITEM_WEIGHT_AMOUNT * (1 - REWARD_PERCENT);
const calculateCreateItemProposalReward = (itemKey: string) => {
  return getGenesisWeight(itemKey) * REWARD_PERCENT;
};

const calculateDefaultItemProposalPassReward = (itemKey: string) => {
  const genesisWeight = getGenesisWeight(itemKey);

  return genesisWeight * (1 - REWARD_PERCENT);
};

const calculateItemProposalPassReward = (
  notification: NotificationRow,
  itemProposal: ItemProposalRow,
): number => {
  const itemKey = itemProposal.key;
  if (!itemKey) {
    throw new Error(`Item proposal ${itemProposal.id} missing key`);
  }

  const genesisWeight = getGenesisWeight(itemKey);

  if (notification.reward !== null) {
    if (
      notification.reward === genesisWeight ||
      notification.reward === genesisWeight * (1 - REWARD_PERCENT)
    ) {
      return notification.reward;
    }
    const legacyWeight = getLegacyGenesisWeight(itemKey);
    if (Math.abs(legacyWeight) < EPSILON) {
      throw new Error(`Legacy weight is zero for item key: ${itemKey}`);
    }
    const rewardRatio = notification.reward / legacyWeight;
    return genesisWeight * rewardRatio;
  }

  return calculateDefaultItemProposalPassReward(itemKey);
};
const calculateNewReward = (
  notification: NotificationRow,
  itemProposalMap: Map<number, ItemProposalRow>,
): number => {
  switch (notification.type) {
    case 'createProposal':
      return calculateCreateProposalReward();
    case 'proposalPass':
      return calculateProposalPassReward();
    case 'createItemProposal': {
      if (!notification.itemProposalId) {
        throw new Error(
          `Notification ${notification.id} missing itemProposalId for createItemProposal`,
        );
      }
      const itemProposal = itemProposalMap.get(notification.itemProposalId);
      if (!itemProposal || !itemProposal.key) {
        throw new Error(
          `Missing item proposal for notification ${notification.id}`,
        );
      }
      return calculateCreateItemProposalReward(itemProposal.key);
    }
    case 'itemProposalPass': {
      if (!notification.itemProposalId) {
        throw new Error(
          `Notification ${notification.id} missing itemProposalId for itemProposalPass`,
        );
      }
      const itemProposal = itemProposalMap.get(notification.itemProposalId);
      if (!itemProposal) {
        throw new Error(
          `Missing item proposal for notification ${notification.id}`,
        );
      }
      return calculateItemProposalPassReward(notification, itemProposal);
    }
    default:
      throw new Error(`Unsupported notification type ${notification.type}`);
  }
};
async function main() {
  const options = parseOptions();
  console.log(
    `Starting reward notification recalculation in ${options.dryRun ? 'DRY-RUN' : 'LIVE'} mode.`,
  );
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const client = postgres(connectionString);
  const db = drizzle(client, { schema });

  try {
    console.log('Fetching reward notifications...');

    const notificationRows = await db
      .select({
        id: notifications.id,
        type: notifications.type,
        reward: notifications.reward,
        userId: notifications.userId,
        projectId: notifications.projectId,
        proposalId: notifications.proposalId,
        itemProposalId: notifications.itemProposalId,
        createdAt: notifications.createdAt,
      })
      .from(notifications)
      .where(inArray(notifications.type, TARGET_NOTIFICATION_TYPES));

    console.log(`Found ${notificationRows.length} notifications to evaluate.`);

    if (notificationRows.length === 0) {
      return;
    }

    const itemProposalIds = notificationRows
      .map((row) => row.itemProposalId)
      .filter((id): id is number => typeof id === 'number');

    const uniqueItemProposalIds = [...new Set(itemProposalIds)];

    const itemProposalRows = uniqueItemProposalIds.length
      ? await db
          .select({
            id: itemProposals.id,
            projectId: itemProposals.projectId,
            key: itemProposals.key,
            createdAt: itemProposals.createdAt,
          })
          .from(itemProposals)
          .where(inArray(itemProposals.id, uniqueItemProposalIds))
      : [];

    const itemProposalMap = new Map<number, ItemProposalRow>();
    for (const item of itemProposalRows) {
      itemProposalMap.set(item.id, item);
    }

    const updates: RewardUpdate[] = [];

    for (const notification of notificationRows) {
      if (typeof notification.itemProposalId !== 'number') {
        continue;
      }
      const itemProposal = itemProposalMap.get(notification.itemProposalId);
      if (!itemProposal || !changedKeys.includes(itemProposal.key ?? '')) {
        continue;
      }
      const newReward = calculateNewReward(notification, itemProposalMap);
      const oldReward = Number(notification.reward ?? 0);

      if (Number.isNaN(newReward)) {
        throw new Error(
          `Calculated NaN reward for notification ${notification.id}`,
        );
      }

      if (Math.abs(newReward - oldReward) < EPSILON) {
        continue;
      }

      updates.push({
        notificationId: notification.id,
        userId: notification.userId,
        type: notification.type,
        oldReward,
        newReward,
        itemProposalKey: itemProposal?.key,
      });
    }

    if (updates.length === 0) {
      console.log('No reward differences detected.');
      return;
    }

    const uniqueUserIds = [...new Set(updates.map((update) => update.userId))];
    const userWeightRows = uniqueUserIds.length
      ? await db
          .select({ userId: profiles.userId, weight: profiles.weight })
          .from(profiles)
          .where(inArray(profiles.userId, uniqueUserIds))
      : [];

    const userWeightMap = new Map<string, number>();
    for (const row of userWeightRows) {
      userWeightMap.set(row.userId, Number(row.weight ?? 0));
    }

    const runningUserWeights = new Map<string, number>();

    console.log('Detailed reward adjustments per notification:');
    for (const update of updates) {
      const delta = update.newReward - update.oldReward;
      const previousWeight = runningUserWeights.has(update.userId)
        ? runningUserWeights.get(update.userId)!
        : (userWeightMap.get(update.userId) ?? 0);
      const nextWeight = previousWeight + delta;
      const keyInfo = update.itemProposalKey
        ? ` item key ${update.itemProposalKey}`
        : '';
      const changeLabel =
        delta > 0
          ? '[Weight increase]'
          : delta < 0
            ? '[Weight decrease]'
            : '[No weight change]';
      console.log(
        `${changeLabel} notification ${update.notificationId} (${update.type})${keyInfo}: reward ${update.oldReward} -> ${update.newReward} (Δ${delta}).`,
      );
      console.log(
        `  User ${update.userId} weight ${previousWeight} -> ${nextWeight}.`,
      );
      runningUserWeights.set(update.userId, nextWeight);
    }

    const userAdjustments = new Map<string, number>();

    for (const update of updates) {
      const delta = update.newReward - update.oldReward;
      userAdjustments.set(
        update.userId,
        (userAdjustments.get(update.userId) ?? 0) + delta,
      );
    }

    const totalDelta = updates.reduce(
      (acc, update) => acc + (update.newReward - update.oldReward),
      0,
    );

    console.log(`Prepared ${updates.length} notification updates.`);
    console.log('Aggregate weight delta:', totalDelta);

    console.log(options);
    return;

    if (options.dryRun) {
      for (const update of updates) {
        console.log(
          `Notification ${update.notificationId} (${update.type}) -> ${update.oldReward} => ${update.newReward}`,
        );
      }
      console.log('\nUser weight adjustments:');
      for (const [userId, delta] of userAdjustments.entries()) {
        console.log(`  ${userId}: ${delta}`);
      }
      return;
    }

    await db.transaction(async (tx) => {
      for (const update of updates) {
        await tx
          .update(notifications)
          .set({ reward: update.newReward })
          .where(eq(notifications.id, update.notificationId));
      }

      for (const [userId, delta] of userAdjustments.entries()) {
        if (Math.abs(delta) < EPSILON) continue;
        await tx
          .update(profiles)
          .set({ weight: sql`${profiles.weight} + ${delta}` })
          .where(eq(profiles.userId, userId));
      }
    });

    console.log('Reward notifications recalculated successfully.');
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Failed to recalculate reward notifications:', error);
  process.exit(1);
});
