import {
  bigint,
  bigserial,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { profiles } from './profiles';
import { projects } from './projects';

export const itemProposals = pgTable(
  'item_proposals',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    key: text('key').notNull(),
    value: jsonb('value'),
    ref: text('ref'),
    projectId: bigint('project_id', { mode: 'number' })
      .notNull()
      .references(() => projects.id),
    creator: uuid('creator')
      .notNull()
      .references(() => profiles.userId),
    reason: text('reason'),
  },
  (table) => {
    return {
      projectIdIdx: index('item_proposals_project_id_idx').on(table.projectId),
      creatorIdx: index('item_proposals_creator_idx').on(table.creator),
      keyIdx: index('item_proposals_key_idx').on(table.key),
    };
  },
);
