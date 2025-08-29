import { and, desc, eq, inArray, lt, or } from 'drizzle-orm';

import { db } from '@/lib/db';
import {
  notificationQueue,
  type NotificationQueueItem,
} from '@/lib/db/schema/notificationQueue';

import type { NotificationData } from '../../notification';

export interface QueueOptions {
  priority?: number;
  scheduledAt?: Date;
  maxAttempts?: number;
}

export interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  total: number;
}

export class DatabaseNotificationQueue {
  async enqueue(
    notification: NotificationData,
    options?: QueueOptions,
  ): Promise<NotificationQueueItem> {
    const [queued] = await db
      .insert(notificationQueue)
      .values({
        payload: notification,
        priority: options?.priority ?? 0,
        scheduledAt: options?.scheduledAt,
        maxAttempts: options?.maxAttempts ?? 3,
      })
      .returning();

    return queued;
  }

  async enqueueBatch(
    notifications: Array<{ data: NotificationData; options?: QueueOptions }>,
  ): Promise<NotificationQueueItem[]> {
    const values = notifications.map(({ data, options }) => ({
      payload: data,
      priority: options?.priority ?? 0,
      scheduledAt: options?.scheduledAt,
      maxAttempts: options?.maxAttempts ?? 3,
    }));

    return db.insert(notificationQueue).values(values).returning();
  }

  async dequeue(): Promise<NotificationQueueItem[]> {
    return await db.transaction(async (tx) => {
      const items = await tx
        .select()
        .from(notificationQueue)
        .where(eq(notificationQueue.status, 'pending'));

      if (items.length === 0) return [];

      const ids = items.map((i) => i.id);
      await tx
        .update(notificationQueue)
        .set({
          status: 'processing',
          processingAt: new Date(),
        })
        .where(inArray(notificationQueue.id, ids));

      return items;
    });
  }

  async markCompleted(id: number): Promise<void> {
    await db
      .update(notificationQueue)
      .set({
        status: 'completed',
        completedAt: new Date(),
      })
      .where(eq(notificationQueue.id, id));
  }

  async markFailed(id: number, error: string): Promise<void> {
    const [item] = await db
      .select()
      .from(notificationQueue)
      .where(eq(notificationQueue.id, id));

    if (!item) return;

    const attempts = item.attempts + 1;
    const shouldRetry = attempts < item.maxAttempts;

    await db
      .update(notificationQueue)
      .set({
        status: shouldRetry ? 'pending' : 'failed',
        attempts,
        error,
        failedAt: shouldRetry ? null : new Date(),
        processingAt: null,
        scheduledAt: shouldRetry
          ? new Date(Date.now() + Math.pow(2, attempts) * 1000 * 60)
          : item.scheduledAt,
      })
      .where(eq(notificationQueue.id, id));
  }

  async cleanup(daysToKeep: number = 7): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    await db
      .delete(notificationQueue)
      .where(
        and(
          or(
            eq(notificationQueue.status, 'completed'),
            eq(notificationQueue.status, 'failed'),
          ),
          lt(notificationQueue.createdAt, cutoffDate),
        ),
      );
  }

  async getStats(): Promise<QueueStats> {
    const results = await db
      .select({
        status: notificationQueue.status,
        count: notificationQueue.id,
      })
      .from(notificationQueue)
      .groupBy(notificationQueue.status);

    const stats: QueueStats = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      total: 0,
    };

    results.forEach((row) => {
      const count = Number(row.count) || 0;
      stats[row.status as keyof QueueStats] = count;
      stats.total += count;
    });

    return stats;
  }

  async getFailedNotifications(
    limit: number = 100,
  ): Promise<NotificationQueueItem[]> {
    return db
      .select()
      .from(notificationQueue)
      .where(eq(notificationQueue.status, 'failed'))
      .orderBy(desc(notificationQueue.failedAt))
      .limit(limit);
  }

  async retryFailed(ids: number[]): Promise<void> {
    await db
      .update(notificationQueue)
      .set({
        status: 'pending',
        attempts: 0,
        error: null,
        failedAt: null,
        scheduledAt: new Date(),
      })
      .where(inArray(notificationQueue.id, ids));
  }

  async cancel(ids: number[]): Promise<void> {
    await db
      .delete(notificationQueue)
      .where(
        and(
          inArray(notificationQueue.id, ids),
          eq(notificationQueue.status, 'pending'),
        ),
      );
  }
}
