import { InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  bigserial,
  doublePrecision,
  index,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { profiles } from './profiles';
import { projectDiscussionThreads } from './projectDiscussionThreads';

export const projectDiscussionVotes = pgTable(
  'project_discussion_votes',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    threadId: bigint('thread_id', { mode: 'number' })
      .notNull()
      .references(() => projectDiscussionThreads.id),
    voter: uuid('voter')
      .notNull()
      .references(() => profiles.userId),
    weight: doublePrecision('weight').notNull().default(0),
  },
  (table) => ({
    threadIdIdx: index('project_discussion_votes_thread_id_idx').on(
      table.threadId,
    ),
    uniqueVoteIdx: uniqueIndex(
      'project_discussion_votes_thread_id_voter_idx',
    ).on(table.threadId, table.voter),
  }),
);

export type ProjectDiscussionVote = InferSelectModel<
  typeof projectDiscussionVotes
>;
