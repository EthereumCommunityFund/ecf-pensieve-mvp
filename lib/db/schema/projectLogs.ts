import { InferSelectModel, sql } from 'drizzle-orm';
import { bigint, json, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';

import { projects } from './projects';
import { proposals } from './proposals';

export const projectLogs = pgTable('project_logs', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
  projectId: bigint('project_id', { mode: 'number' }).references(
    () => projects.id,
  ),
  proposalId: bigint('proposal_id', { mode: 'number' }).references(
    () => proposals.id,
  ),
  items: json('items'),
});

export type ProjectLog = InferSelectModel<typeof projectLogs>;
