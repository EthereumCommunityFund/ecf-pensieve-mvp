import {
  bigserial,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { profiles } from './profiles';

export const lists = pgTable(
  'lists',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    privacy: text('privacy', { enum: ['private', 'public'] })
      .notNull()
      .$type<'private' | 'public'>(),
    creator: uuid('creator')
      .notNull()
      .references(() => profiles.userId),
    slug: text('slug').notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    followCount: integer('follow_count').notNull().default(0),
  },
  (table) => ({
    creatorIdx: index('lists_creator_idx').on(table.creator),
    privacyIdx: index('lists_privacy_idx').on(table.privacy),
    slugIdx: index('lists_slug_idx').on(table.slug),
    createdAtIdx: index('lists_created_at_idx').on(table.createdAt.desc()),
  }),
);

export type List = typeof lists.$inferSelect;
export type NewList = typeof lists.$inferInsert;
