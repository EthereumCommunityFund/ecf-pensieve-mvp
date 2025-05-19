import {
  bigint,
  bigserial,
  index,
  jsonb,
  pgTable,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { profiles } from './profiles';
import { projects } from './projects';

export const proposals = pgTable(
  'proposals',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    items: jsonb('items').array().notNull(),
    refs: jsonb('refs').array(),
    projectId: bigint('project_id', { mode: 'number' })
      .notNull()
      .references(() => projects.id),
    creator: uuid('creator')
      .notNull()
      .references(() => profiles.userId),
  },
  (table) => {
    return {
      projectIdIdx: index('proposals_project_id_idx').on(table.projectId),
      creatorIdx: index('proposals_creator_idx').on(table.creator),
    };
  },
);
