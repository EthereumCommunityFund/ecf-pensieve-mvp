import { InferSelectModel, sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { itemProposals } from './itemProposals';
import { projects } from './projects';
import { proposals } from './proposals';

export const projectLogs = pgTable(
  'project_logs',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    projectId: bigint('project_id', { mode: 'number' }).references(
      () => projects.id,
    ),
    proposalId: bigint('proposal_id', { mode: 'number' }).references(
      () => proposals.id,
    ),
    itemProposalId: bigint('item_proposal_id', { mode: 'number' }).references(
      () => itemProposals.id,
    ),
    key: text('key'),
    isNotLeading: boolean('is_not_leading').notNull().default(false),
  },
  (table) => {
    return {
      projectIdKeyIdx: index('project_logs_project_id_key_idx').on(
        table.projectId,
        table.key,
      ),
      createdAtIdx: index('project_logs_created_at_idx').on(table.createdAt),
      projectIdIdx: index('project_logs_project_id_idx').on(table.projectId),
      keyIdx: index('project_logs_key_idx').on(table.key),
      projectIdKeyCreatedAtIdx: index(
        'project_logs_project_id_key_created_at_idx',
      ).on(table.projectId, table.key, table.createdAt),
    };
  },
);

export type ProjectLog = InferSelectModel<typeof projectLogs>;
