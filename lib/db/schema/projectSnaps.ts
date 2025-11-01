import { InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  bigserial,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

import { IProposalItem } from '@/types/item';

import { projects } from './projects';

export const projectSnaps = pgTable(
  'project_snaps',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    projectId: bigint('project_id', { mode: 'number' })
      .notNull()
      .references(() => projects.id),
    items: jsonb('items').$type<IProposalItem[]>().notNull(),
    name: text('name'),
    categories: text('categories').array(),
  },
  (table) => {
    return {
      projectIdIdx: index('project_snaps_project_id_idx').on(table.projectId),
      createdAtIdx: index('project_snaps_created_at_idx').on(table.createdAt),
      projectIdCreatedAtIdx: index(
        'project_snaps_project_id_created_at_idx',
      ).on(table.projectId, table.createdAt.desc()),
      categoriesGinIdx: index('project_snaps_categories_gin_idx').using(
        'gin',
        table.categories,
      ),
    };
  },
);

export type ProjectSnap = InferSelectModel<typeof projectSnaps>;
