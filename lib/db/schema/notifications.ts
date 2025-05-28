import {
  bigint,
  bigserial,
  doublePrecision,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { itemProposals } from './itemProposals';
import { profiles } from './profiles';
import { projects } from './projects';
import { proposals } from './proposals';

export const notifications = pgTable('notifications', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.userId),
  projectId: bigint('project_id', { mode: 'number' }).references(
    () => projects.id,
  ),
  proposalId: bigint('proposal_id', { mode: 'number' }).references(
    () => proposals.id,
  ),
  itemProposalId: bigint('item_proposal_id', { mode: 'number' }).references(
    () => itemProposals.id,
  ),
  type: text('type').notNull(),
  reward: doublePrecision('reward'),
  readAt: timestamp('read_at', { withTimezone: true, mode: 'date' }),
});

export type Notification = typeof notifications.$inferInsert;
