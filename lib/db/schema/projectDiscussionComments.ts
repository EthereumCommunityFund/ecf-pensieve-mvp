import { InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  bigserial,
  boolean,
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { profiles } from './profiles';
import { projectDiscussionAnswers } from './projectDiscussionAnswers';
import { projectDiscussionThreads } from './projectDiscussionThreads';

export const projectDiscussionComments = pgTable(
  'project_discussion_comments',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    threadId: bigint('thread_id', { mode: 'number' }).references(
      () => projectDiscussionThreads.id,
    ),
    answerId: bigint('answer_id', { mode: 'number' }).references(
      () => projectDiscussionAnswers.id,
    ),
    parentCommentId: bigint('parent_comment_id', { mode: 'number' }),
    creator: uuid('creator')
      .notNull()
      .references(() => profiles.userId),
    content: text('content').notNull(),
    isDeleted: boolean('is_deleted').notNull().default(false),
    deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
  },
  (table) => ({
    parentCommentFk: foreignKey({
      columns: [table.parentCommentId],
      foreignColumns: [table.id],
      name: 'project_discussion_comments_parent_comment_id_fkey',
    }),
    threadCreatedAtIdx: index(
      'project_discussion_comments_thread_created_at_idx',
    ).on(table.threadId, table.createdAt.desc()),
    answerCreatedAtIdx: index(
      'project_discussion_comments_answer_created_at_idx',
    ).on(table.answerId, table.createdAt.desc()),
    parentCommentCreatedAtIdx: index(
      'project_discussion_comments_parent_created_at_idx',
    ).on(table.parentCommentId, table.createdAt.desc()),
  }),
);

export type ProjectDiscussionComment = InferSelectModel<
  typeof projectDiscussionComments
>;
