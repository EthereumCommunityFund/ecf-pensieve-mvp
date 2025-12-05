import { InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  bigserial,
  boolean,
  doublePrecision,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { profiles } from './profiles';
import { projectDiscussionThreads } from './projectDiscussionThreads';

export const projectDiscussionAnswers = pgTable(
  'project_discussion_answers',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    threadId: bigint('thread_id', { mode: 'number' })
      .notNull()
      .references(() => projectDiscussionThreads.id),
    creator: uuid('creator')
      .notNull()
      .references(() => profiles.userId),
    content: text('content').notNull(),
    isDeleted: boolean('is_deleted').notNull().default(false),
    deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
    support: doublePrecision('support').notNull().default(0),
  },
  (table) => ({
    threadCreatedAtIdx: index(
      'project_discussion_answers_thread_created_at_idx',
    ).on(table.threadId, table.createdAt.desc()),
  }),
);

export type ProjectDiscussionAnswer = InferSelectModel<
  typeof projectDiscussionAnswers
>;
