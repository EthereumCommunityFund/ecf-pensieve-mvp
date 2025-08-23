import { NextResponse } from 'next/server';

import type { NotificationData } from '@/lib/services/notification';
import { addNotificationDirect } from '@/lib/services/notification';
import { notificationQueue } from '@/lib/services/notification/queue';

export const maxDuration = 300;

async function processNotifications(batchSize: number = 20) {
  const results = {
    processed: 0,
    succeeded: 0,
    failed: 0,
    errors: [] as Array<{ id: number; error: string }>,
  };

  try {
    const notifications = await notificationQueue.dequeue(batchSize);

    if (notifications.length === 0) {
      return results;
    }

    results.processed = notifications.length;

    const processPromises = notifications.map(async (item) => {
      try {
        const notificationData = item.payload as NotificationData;

        await addNotificationDirect(notificationData);

        await notificationQueue.markCompleted(item.id);

        results.succeeded++;
        return { id: item.id, status: 'success' };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';

        await notificationQueue.markFailed(item.id, errorMessage);

        results.failed++;
        results.errors.push({ id: item.id, error: errorMessage });

        return { id: item.id, status: 'failed', error: errorMessage };
      }
    });

    await Promise.allSettled(processPromises);
  } catch (error) {
    console.error('Error processing notification queue:', error);
    throw error;
  }

  return results;
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

  const stats = await notificationQueue.getStats();

  return NextResponse.json({
    success: true,
    results,
    stats,
    timestamp: new Date().toISOString(),
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
