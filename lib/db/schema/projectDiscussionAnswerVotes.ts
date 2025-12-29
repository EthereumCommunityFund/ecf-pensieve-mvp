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
import { projectDiscussionAnswers } from './projectDiscussionAnswers';
import { projectDiscussionThreads } from './projectDiscussionThreads';

export const projectDiscussionAnswerVotes = pgTable(
  'project_discussion_answer_votes',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    answerId: bigint('answer_id', { mode: 'number' })
      .notNull()
      .references(() => projectDiscussionAnswers.id),
    voter: uuid('voter')
      .notNull()
      .references(() => profiles.userId),
    weight: doublePrecision('weight').notNull().default(0),
    threadId: bigint('thread_id', { mode: 'number' }).references(
      () => projectDiscussionThreads.id,
    ),
  },
  (table) => ({
    answerIdIdx: index('project_discussion_answer_votes_answer_id_idx').on(
      table.answerId,
    ),
    uniqueVoteIdx: uniqueIndex(
      'project_discussion_answer_votes_answer_id_voter_idx',
    ).on(table.answerId, table.voter),
    threadIdIdx: index('project_discussion_answer_votes_thread_id_idx').on(
      table.threadId,
      table.voter,
    ),
  }),
);

export type ProjectDiscussionAnswerVote = InferSelectModel<
  typeof projectDiscussionAnswerVotes
>;
