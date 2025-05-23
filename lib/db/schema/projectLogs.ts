import { InferSelectModel, sql } from 'drizzle-orm';
import { bigint, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { itemProposals } from './itemProposals';
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
  itemProposalId: bigint('item_proposal_id', { mode: 'number' }).references(
    () => itemProposals.id,
  ),
  key: text('key'),
});

export type ProjectLog = InferSelectModel<typeof projectLogs>;
