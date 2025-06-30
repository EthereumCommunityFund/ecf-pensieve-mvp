import {
  bigserial,
  doublePrecision,
  index,
  pgTable,
  timestamp,
} from 'drizzle-orm/pg-core';

import { projects } from './projects';

export const ranks = pgTable(
  'ranks',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    projectId: bigserial('project_id', { mode: 'number' })
      .notNull()
      .references(() => projects.id),
    publishedGenesisWeight: doublePrecision('published_genesis_weight')
      .notNull()
      .default(0),
  },
  (table) => {
    return {
      projectIdIdx: index('ranks_project_id_idx').on(table.projectId),
      publishedGenesisWeightIdx: index('ranks_published_genesis_weight_idx').on(
        table.publishedGenesisWeight.desc(),
      ),
      rankingIdx: index('ranks_ranking_idx').on(
        table.publishedGenesisWeight.desc(),
        table.projectId,
      ),
    };
  },
);
