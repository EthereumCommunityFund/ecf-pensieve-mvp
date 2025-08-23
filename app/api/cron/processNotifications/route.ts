import { NextResponse } from 'next/server';

import { type NotificationQueueItem } from '@/lib/db/schema/notificationQueue';
import type { NotificationData } from '@/lib/services/notification';
import { addNotificationDirect } from '@/lib/services/notification';
import { filterRecipientsBySettings } from '@/lib/services/notification/filter';
import { notificationQueue } from '@/lib/services/notification/queue';
import { getNotificationRecipients } from '@/lib/services/notification/recipients';

export const maxDuration = 300;

interface ProcessingStats {
  processed: number;
  succeeded: number;
  failed: number;
  filtered: number;
  expanded: number;
  errors: Array<{ id: number; error: string }>;
}

async function processNotifications(batchSize: number = 20) {
  const results: ProcessingStats = {
    processed: 0,
    succeeded: 0,
    failed: 0,
    filtered: 0,
    expanded: 0,
    errors: [],
  };

  try {
    const queuedNotifications = await notificationQueue.dequeue();

    if (queuedNotifications.length === 0) {
      return results;
    }

    results.processed = queuedNotifications.length;

    for (const notification of queuedNotifications) {
      await processSingleNotification(notification, results);
    }
  } catch (error) {
    console.error('Error processing notification queue:', error);
    throw error;
  }

  return results;
}

async function processSingleNotification(
  item: NotificationQueueItem,
  results: ProcessingStats,
) {
  try {
    const payload = item.payload as any;

    if (payload._expandRecipients) {
      // Process multi-user notification
      await processMultiUserNotification(item, payload, results);
    } else {
      // Process single-user notification
      await processSingleUserNotification(
        item,
        payload as NotificationData,
        results,
      );
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    await notificationQueue.markFailed(item.id, errorMessage);

    results.failed++;
    results.errors.push({ id: item.id, error: errorMessage });
  }
}

async function processSingleUserNotification(
  item: NotificationQueueItem,
  data: NotificationData,
  results: ProcessingStats,
) {
  // Check if user has muted notifications for this project
  const filteredUserIds = await filterRecipientsBySettings(
    [data.userId],
    data.projectId,
    data.type,
  );

  if (filteredUserIds.length === 0) {
    // User has muted notifications - mark as completed but filtered
    await notificationQueue.markCompleted(item.id);
    results.filtered++;
    results.succeeded++;
    return;
  }

  // Create the notification
  await addNotificationDirect(data);
  await notificationQueue.markCompleted(item.id);

  results.succeeded++;
  results.expanded++;
}

async function processMultiUserNotification(
  item: NotificationQueueItem,
  payload: any,
  results: ProcessingStats,
) {
  // Extract base notification data
  const baseData: NotificationData = {
    userId: payload.userId,
    projectId: payload.projectId,
    proposalId: payload.proposalId,
    itemProposalId: payload.itemProposalId,
    reward: payload.reward,
    voter_id: payload.voter_id,
    type: payload.type,
  };

  // Get all potential recipients based on notification type
  const context = {
    projectId: baseData.projectId,
    notificationType: baseData.type,
    originalRecipient: baseData.userId,
    metadata: payload._metadata,
  };

  const potentialRecipients = await getNotificationRecipients(context);

  // Filter recipients based on their notification settings (mute/my_contributions/all_events)
  const filteredRecipients = await filterRecipientsBySettings(
    potentialRecipients,
    baseData.projectId,
    baseData.type,
  );

  // Track filtered count
  const filteredOutCount =
    potentialRecipients.length - filteredRecipients.length;
  results.filtered += filteredOutCount;

  // Create notifications for all filtered recipients
  for (const userId of filteredRecipients) {
    const notificationData: NotificationData = {
      ...baseData,
      userId,
    };
    await addNotificationDirect(notificationData);
    results.expanded++;
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
