import {
  bigint,
  bigserial,
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { itemProposals } from './itemProposals';
import { projectLogs } from './projectLogs';
import { projects } from './projects';

export const projectRelations = pgTable(
  'project_relations',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    sourceProjectId: bigint('source_project_id', { mode: 'number' })
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    targetProjectId: bigint('target_project_id', { mode: 'number' })
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    relationType: text('relation_type', {
      enum: ['organization', 'donator'],
    }).notNull(),
    itemProposalId: bigint('item_proposal_id', { mode: 'number' }).references(
      () => itemProposals.id,
    ),
    projectLogId: uuid('project_log_id').references(() => projectLogs.id),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    sourceActiveIdx: index('pr_source_active_idx').on(
      table.sourceProjectId,
      table.isActive,
    ),
    targetActiveIdx: index('pr_target_active_idx').on(
      table.targetProjectId,
      table.isActive,
    ),
    projectLogIdx: index('pr_project_log_idx').on(table.projectLogId),
    uniqueRelationIdx: uniqueIndex('pr_unique_relation_idx').on(
      table.sourceProjectId,
      table.targetProjectId,
      table.relationType,
    ),
  }),
);
