import {
  bigint,
  bigserial,
  doublePrecision,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { itemProposals } from './itemProposals';
import { profiles } from './profiles';
import { proposals } from './proposals';

export const voteRecords = pgTable(
  'vote_records',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    key: text('key').notNull(),
    proposalId: bigint('proposal_id', { mode: 'number' }).references(
      () => proposals.id,
    ),
    itemProposalId: bigint('item_proposal_id', { mode: 'number' }).references(
      () => itemProposals.id,
    ),
    creator: uuid('creator')
      .notNull()
      .references(() => profiles.userId),
    weight: doublePrecision('weight'),
  },
  (table) => {
    return {
      proposalIdIdx: index('vote_records_proposal_id_idx').on(table.proposalId),
      creatorIdx: index('vote_records_creator_idx').on(table.creator),
      keyIdx: index('vote_records_key_idx').on(table.key),
      creatorKeyIdx: index('vote_records_creator_key_idx').on(
        table.creator,
        table.key,
      ),
      creatorProposalKeyIdx: index('vote_records_creator_proposal_key_idx').on(
        table.creator,
        table.proposalId,
        table.key,
      ),
    };
  },
);
