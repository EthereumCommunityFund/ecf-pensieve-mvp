import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const notificationQueue = pgTable('notification_queue', {
  id: serial('id').primaryKey(),
  status: text('status').notNull().default('pending'),
  priority: integer('priority').notNull().default(0),
  payload: jsonb('payload').notNull(),
  attempts: integer('attempts').notNull().default(0),
  maxAttempts: integer('max_attempts').notNull().default(3),
  scheduledAt: timestamp('scheduled_at'),
  processingAt: timestamp('processing_at'),
  completedAt: timestamp('completed_at'),
  failedAt: timestamp('failed_at'),
  error: text('error'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type NotificationQueueItem = typeof notificationQueue.$inferSelect;
