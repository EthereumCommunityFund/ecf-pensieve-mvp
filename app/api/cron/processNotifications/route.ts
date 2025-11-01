import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { notifications, profiles } from '@/lib/db/schema';
import { type NotificationQueueItem } from '@/lib/db/schema/notificationQueue';
import type { NotificationData } from '@/lib/services/notification';
import { filterUsersBySettings } from '@/lib/services/notification/filter';
import { notificationQueue } from '@/lib/services/notification/queue';
import { getNotificationUsers } from '@/lib/services/notification/recipients';

export const maxDuration = 300;

async function processNotifications() {
  try {
    const queuedNotifications = await notificationQueue.dequeue();

    if (queuedNotifications.length === 0) {
      return;
    }

    console.log(
      `[Notification Processing] Starting to process ${queuedNotifications.length} notifications`,
    );

    const batchSize = 10;
    for (let i = 0; i < queuedNotifications.length; i += batchSize) {
      const batch = queuedNotifications.slice(i, i + batchSize);
      await Promise.all(
        batch.map((notification) => processSingleNotification(notification)),
      );
    }
  } catch (error) {
    console.error('Error processing notification queue:', error);
    throw error;
  }
}

async function processSingleNotification(item: NotificationQueueItem) {
  try {
    const payload = item.payload as NotificationData;

    await processMultiUserNotification(item, payload);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    await notificationQueue.markFailed(item.id, errorMessage);
  }
}

async function processMultiUserNotification(
  item: NotificationQueueItem,
  payload: NotificationData,
) {
  const baseData: NotificationData = {
    userId: payload.userId,
    projectId: payload.projectId,
    proposalId: payload.proposalId,
    itemProposalId: payload.itemProposalId,
    type: payload.type,
    reward: payload.reward,
    voter_id: payload.voter_id,
    metadata: payload.metadata,
    broadcast: payload.broadcast,
  };

  if (baseData.broadcast) {
    const allUsers = await db
      .select({ userId: profiles.userId })
      .from(profiles);

    if (allUsers.length > 0) {
      const notificationValues = allUsers.map(({ userId }) => ({
        userId,
        projectId: baseData.projectId ?? null,
        proposalId: baseData.proposalId,
        itemProposalId: baseData.itemProposalId,
        type: baseData.type,
        reward: baseData.reward,
        voter_id: baseData.voter_id,
        metadata: baseData.metadata ?? null,
      }));

      await db.insert(notifications).values(notificationValues);
    }

    await notificationQueue.markCompleted(item.id);
    return;
  }

  if (!baseData.userId) {
    throw new Error('Notification payload missing userId');
  }

  if (baseData.projectId === undefined || baseData.projectId === null) {
    throw new Error('Notification payload missing projectId');
  }

  const context = {
    projectId: baseData.projectId,
    notificationType: baseData.type,
    userId: baseData.userId,
    itemProposalId: baseData.itemProposalId,
  };

  const usersWithRoles = await getNotificationUsers(context);

  const contextMap = new Map<
    string,
    { isCreator?: boolean; isVoter?: boolean; isProjectOwner?: boolean }
  >();
  const userIds: string[] = [];

  usersWithRoles.forEach((userWithRole) => {
    userIds.push(userWithRole.userId);
    contextMap.set(userWithRole.userId, {
      isCreator: userWithRole.isCreator,
      isVoter: userWithRole.isVoter,
      isProjectOwner: userWithRole.isProjectOwner,
    });
  });

  const filteredUsers = await filterUsersBySettings(
    userIds,
    baseData.projectId,
    baseData.type,
    contextMap,
  );

  if (filteredUsers.length > 0) {
    const notificationValues = filteredUsers.map((userId) => ({
      userId,
      projectId: baseData.projectId,
      proposalId: baseData.proposalId,
      itemProposalId: baseData.itemProposalId,
      type: baseData.type,
      reward: baseData.reward,
      voter_id: baseData.voter_id,
      metadata: baseData.metadata ?? null,
    }));

    await db.insert(notifications).values(notificationValues);
  }

  await notificationQueue.markCompleted(item.id);
}

async function handleCronJob(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', {
        status: 401,
      });
    }
  }

  await processNotifications();

  await notificationQueue.cleanup(30);

  return NextResponse.json({
    success: true,
  });
}

export async function GET(request: Request) {
  try {
    return await handleCronJob(request);
  } catch (error) {
    console.error('Error processing notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process notifications' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    return await handleCronJob(request);
  } catch (error) {
    console.error('Error processing notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process notifications' },
      { status: 500 },
    );
  }
}
