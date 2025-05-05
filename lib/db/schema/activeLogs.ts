import { sql } from 'drizzle-orm';
import { bigint, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { profiles } from './profiles';
import { projects } from './projects';

export const activeLogs = pgTable('active_logs', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.userId),
  action: text('action').notNull(),
  type: text('type').notNull(),
  targetId: bigint('target_id', { mode: 'number' }).notNull(),
  projectId: bigint('project_id', { mode: 'number' }).references(
    () => projects.id,
  ),
});
