import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';
import { type NotificationQueueItem } from '@/lib/db/schema/notificationQueue';
import type { NotificationData } from '@/lib/services/notification';
import { filterUsersBySettings } from '@/lib/services/notification/filter';
import { notificationQueue } from '@/lib/services/notification/queue';
import { getNotificationUsers } from '@/lib/services/notification/recipients';

export const maxDuration = 300;

interface ProcessingStats {
  processed: number;
  succeeded: number;
  failed: number;
  filtered: number;
  expanded: number;
  errors: Array<{ id: number; error: string }>;
  startTime?: number;
  endTime?: number;
}

async function processNotifications() {
  const results: ProcessingStats = {
    processed: 0,
    succeeded: 0,
    failed: 0,
    filtered: 0,
    expanded: 0,
    errors: [],
    startTime: Date.now(),
  };

  try {
    const queuedNotifications = await notificationQueue.dequeue();

    if (queuedNotifications.length === 0) {
      results.endTime = Date.now();
      return results;
    }

    results.processed = queuedNotifications.length;
    console.log(
      `[Notification Processing] Starting to process ${queuedNotifications.length} notifications`,
    );

    const batchSize = 10;
    for (let i = 0; i < queuedNotifications.length; i += batchSize) {
      const batch = queuedNotifications.slice(i, i + batchSize);
      await Promise.all(
        batch.map((notification) =>
          processSingleNotification(notification, results),
        ),
      );
    }

    results.endTime = Date.now();
  } catch (error) {
    console.error('Error processing notification queue:', error);
    results.endTime = Date.now();
    throw error;
  }

  return results;
}

async function processSingleNotification(
  item: NotificationQueueItem,
  results: ProcessingStats,
) {
  try {
    const payload = item.payload as NotificationData;

    await processMultiUserNotification(item, payload, results);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    await notificationQueue.markFailed(item.id, errorMessage);

    results.failed++;
    results.errors.push({ id: item.id, error: errorMessage });
  }
}

async function processMultiUserNotification(
  item: NotificationQueueItem,
  payload: NotificationData,
  results: ProcessingStats,
) {
  const baseData: NotificationData = {
    userId: payload.userId,
    projectId: payload.projectId,
    proposalId: payload.proposalId,
    itemProposalId: payload.itemProposalId,
    type: payload.type,
  };

  const context = {
    projectId: baseData.projectId,
    notificationType: baseData.type,
    userId: baseData.userId,
    itemProposalId: baseData.itemProposalId,
  };

  const users = await getNotificationUsers(context);

  const filteredUsers = await filterUsersBySettings(
    users,
    baseData.projectId,
    baseData.type,
  );

  if (filteredUsers.length > 0) {
    const notificationValues = filteredUsers.map((userId) => ({
      ...baseData,
      userId,
    }));

    await db.insert(notifications).values(notificationValues);
    results.expanded += notificationValues.length;
  }

  await notificationQueue.markCompleted(item.id);
  results.succeeded++;
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

  const results = await processNotifications();

  await notificationQueue.cleanup(30);

  return NextResponse.json({
    success: true,
    results: {
      processed: results.processed,
      succeeded: results.succeeded,
      failed: results.failed,
      filtered: results.filtered,
      expanded: results.expanded,
      errors: results.errors,
    },
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
