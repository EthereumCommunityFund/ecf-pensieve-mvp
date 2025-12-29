import { InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  bigserial,
  boolean,
  doublePrecision,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { profiles } from './profiles';
import { projects } from './projects';

export const projectDiscussionThreads = pgTable(
  'project_discussion_threads',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    projectId: bigint('project_id', { mode: 'number' })
      .notNull()
      .references(() => projects.id),
    creator: uuid('creator')
      .notNull()
      .references(() => profiles.userId),
    title: text('title').notNull(),
    post: text('post').notNull(),
    category: text('category').array().notNull().default([]),
    tags: text('tags').array().notNull().default([]),
    isScam: boolean('is_scam').notNull().default(false),
    support: doublePrecision('support').notNull().default(0),
    answerCount: integer('answer_count').notNull().default(0),
    redressedAnswerCount: integer('redressed_answer_count')
      .notNull()
      .default(0),
  },
  (table) => ({
    projectCreatedAtIdx: index(
      'project_discussion_threads_project_created_at_idx',
    ).on(table.projectId, table.createdAt.desc()),
    categoryGinIdx: index('project_discussion_threads_category_gin_idx').using(
      'gin',
      table.category,
    ),
    tagsGinIdx: index('project_discussion_threads_tags_gin_idx').using(
      'gin',
      table.tags,
    ),
    projectScamIdx: index('project_discussion_threads_project_scam_idx').on(
      table.projectId,
      table.isScam,
    ),
    projectSupportIdx: index(
      'project_discussion_threads_project_support_idx',
    ).on(table.projectId, table.support.desc()),
  }),
);

export type ProjectDiscussionThread = InferSelectModel<
  typeof projectDiscussionThreads
>;
