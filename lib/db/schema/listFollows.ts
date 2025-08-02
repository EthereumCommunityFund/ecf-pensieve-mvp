import {
  bigint,
  bigserial,
  index,
  pgTable,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

import { lists } from './lists';
import { profiles } from './profiles';

export const listFollows = pgTable(
  'list_follows',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    listId: bigint('list_id', { mode: 'number' })
      .notNull()
      .references(() => lists.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.userId),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    listFollowUnique: unique().on(table.listId, table.userId),
    listIdIdx: index('list_follows_list_id_idx').on(table.listId),
    userIdIdx: index('list_follows_user_id_idx').on(table.userId),
  }),
);

export type ListFollow = typeof listFollows.$inferSelect;
export type NewListFollow = typeof listFollows.$inferInsert;
