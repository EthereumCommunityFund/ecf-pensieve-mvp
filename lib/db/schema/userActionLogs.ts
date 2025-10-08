import { InferSelectModel } from 'drizzle-orm';
import { bigserial, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { profiles } from './profiles';

export const userActionLogs = pgTable('user_action_logs', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.userId),
  action: text('action').notNull(),
  type: text('type').notNull(),
});

export type UserActionLog = InferSelectModel<typeof userActionLogs>;
