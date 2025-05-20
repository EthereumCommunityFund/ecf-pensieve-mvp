import {
  bigint,
  bigserial,
  index,
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
    item: text('item').notNull(),
    ref: text('ref').notNull(),
    projectId: bigint('project_id', { mode: 'number' })
      .notNull()
      .references(() => projects.id),
    creator: uuid('creator')
      .notNull()
      .references(() => profiles.userId),
  },
  (table) => {
    return {
      projectIdIdx: index('item_proposals_project_id_idx').on(table.projectId),
      creatorIdx: index('item_proposals_creator_idx').on(table.creator),
      itemIdx: index('item_proposals_item_idx').on(table.item),
    };
  },
);
