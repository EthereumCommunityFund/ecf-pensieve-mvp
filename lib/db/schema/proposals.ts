import {
  bigint,
  bigserial,
  jsonb,
  pgTable,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { profiles } from './profiles';
import { projects } from './projects';

export const proposals = pgTable('proposals', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
  point: bigint('point', { mode: 'number' }),
  quorum: bigint('quorum', { mode: 'number' }),
  items: jsonb('items').array().notNull(),
  refs: jsonb('refs').array(),
  projectId: bigint('project_id', { mode: 'number' })
    .notNull()
    .references(() => projects.id),
  creator: uuid('creator')
    .notNull()
    .references(() => profiles.userId),
});
