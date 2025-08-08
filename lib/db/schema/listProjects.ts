import {
  bigint,
  bigserial,
  index,
  integer,
  pgTable,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

import { lists } from './lists';
import { profiles } from './profiles';
import { projects } from './projects';

export const listProjects = pgTable(
  'list_projects',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    listId: bigint('list_id', { mode: 'number' })
      .notNull()
      .references(() => lists.id, { onDelete: 'cascade' }),
    projectId: bigint('project_id', { mode: 'number' })
      .notNull()
      .references(() => projects.id),
    addedBy: uuid('added_by')
      .notNull()
      .references(() => profiles.userId),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    listProjectUnique: unique().on(table.listId, table.projectId),
    listIdIdx: index('list_projects_list_id_idx').on(table.listId),
    projectIdIdx: index('list_projects_project_id_idx').on(table.projectId),
    listIdSortOrderIdx: index('list_projects_list_id_sort_order_idx').on(
      table.listId,
      table.sortOrder,
    ),
  }),
);

export type ListProject = typeof listProjects.$inferSelect;
export type NewListProject = typeof listProjects.$inferInsert;
