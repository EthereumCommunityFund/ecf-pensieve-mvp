import {
  bigint,
  bigserial,
  index,
  pgTable,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

import { profiles } from './profiles';
import { sieves } from './sieves';

export const sieveFollows = pgTable(
  'sieve_follows',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    sieveId: bigint('sieve_id', { mode: 'number' })
      .notNull()
      .references(() => sieves.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.userId),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    sieveFollowUnique: unique().on(table.sieveId, table.userId),
    sieveIdIdx: index('sieve_follows_sieve_id_idx').on(table.sieveId),
    userIdIdx: index('sieve_follows_user_id_idx').on(table.userId),
  }),
);

export type SieveFollow = typeof sieveFollows.$inferSelect;
export type NewSieveFollow = typeof sieveFollows.$inferInsert;
