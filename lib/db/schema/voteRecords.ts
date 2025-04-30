import {
  bigint,
  bigserial,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { profiles } from './profiles';
import { proposals } from './proposals';

export const voteRecords = pgTable('vote_records', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
  key: text('key').notNull(),
  proposalId: bigint('proposal_id', { mode: 'number' })
    .notNull()
    .references(() => proposals.id),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.userId),
});
