import {
  bigint,
  bigserial,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import type { StoredSieveFilterConditions } from '@/types/sieve';

import { profiles } from './profiles';
import { shareLinks } from './shareLinks';

export const sieves = pgTable(
  'sieves',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    targetPath: text('target_path').notNull(),
    visibility: text('visibility', { enum: ['public', 'private'] })
      .default('public')
      .notNull()
      .$type<'public' | 'private'>(),
    creator: uuid('creator')
      .notNull()
      .references(() => profiles.userId),
    shareLinkId: bigint('share_link_id', { mode: 'number' })
      .notNull()
      .references(() => shareLinks.id, { onDelete: 'cascade' }),
    followCount: integer('follow_count').default(0).notNull(),
    filterConditions: jsonb(
      'filter_conditions',
    ).$type<StoredSieveFilterConditions | null>(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    creatorIdx: index('sieves_creator_idx').on(table.creator),
    shareLinkIdx: uniqueIndex('sieves_share_link_idx').on(table.shareLinkId),
    createdAtIdx: index('sieves_created_at_idx').on(table.createdAt.desc()),
  }),
);

export type Sieve = typeof sieves.$inferSelect;
export type NewSieve = typeof sieves.$inferInsert;
