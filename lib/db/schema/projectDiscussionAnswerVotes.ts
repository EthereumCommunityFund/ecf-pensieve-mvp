import { InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  bigserial,
  index,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { profiles } from './profiles';
import { projectDiscussionAnswers } from './projectDiscussionAnswers';

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
  },
  (table) => ({
    answerIdIdx: index('project_discussion_answer_votes_answer_id_idx').on(
      table.answerId,
    ),
    uniqueVoteIdx: uniqueIndex(
      'project_discussion_answer_votes_answer_id_voter_idx',
    ).on(table.answerId, table.voter),
  }),
);

export type ProjectDiscussionAnswerVote = InferSelectModel<
  typeof projectDiscussionAnswerVotes
>;
