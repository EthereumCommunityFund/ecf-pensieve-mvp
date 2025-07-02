import {
  bigint,
  bigserial,
  doublePrecision,
  index,
  pgTable,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { profiles } from './profiles';
import { projects } from './projects';

export const likeRecords = pgTable(
  'like_records',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    projectId: bigint('project_id', { mode: 'number' }).references(
      () => projects.id,
    ),
    creator: uuid('creator')
      .notNull()
      .references(() => profiles.userId),
    weight: doublePrecision('weight'),
  },
  (table) => {
    return {
      projectIdIdx: index('like_records_project_id_idx').on(table.projectId),
      creatorIdx: index('like_records_creator_idx').on(table.creator),
      projectIdCreatorIdx: index('like_records_project_id_creator_idx').on(
        table.projectId,
        table.creator,
      ),
    };
  },
);
