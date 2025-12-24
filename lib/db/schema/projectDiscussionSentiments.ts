import { InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  bigserial,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { profiles } from './profiles';
import { projectDiscussionAnswers } from './projectDiscussionAnswers';
import { projectDiscussionThreads } from './projectDiscussionThreads';

export const projectDiscussionSentiments = pgTable(
  'project_discussion_sentiments',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    threadId: bigint('thread_id', { mode: 'number' }).references(
      () => projectDiscussionThreads.id,
    ),
    answerId: bigint('answer_id', { mode: 'number' }).references(
      () => projectDiscussionAnswers.id,
    ),
    creator: uuid('creator')
      .notNull()
      .references(() => profiles.userId),
    type: text('type').notNull(),
  },
  (table) => ({
    threadIdx: index('project_discussion_sentiments_thread_id_idx').on(
      table.threadId,
    ),
    answerIdx: index('project_discussion_sentiments_answer_id_idx').on(
      table.answerId,
    ),
    threadCreatorUniqueIdx: uniqueIndex(
      'project_discussion_sentiments_thread_creator_idx',
    ).on(table.threadId, table.creator),
    answerCreatorUniqueIdx: uniqueIndex(
      'project_discussion_sentiments_answer_creator_idx',
    ).on(table.answerId, table.creator),
  }),
);

export type ProjectDiscussionSentiment = InferSelectModel<
  typeof projectDiscussionSentiments
>;
