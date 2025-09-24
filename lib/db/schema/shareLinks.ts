import {
  bigserial,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { profiles } from './profiles';

export const shareLinks = pgTable(
  'share_links',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    code: text('code').notNull().unique(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id').notNull(),
    parentId: text('parent_id'),
    targetUrl: text('target_url').notNull(),
    visibility: text('visibility').notNull().default('public'),
    ogSnapshot: jsonb('og_snapshot'),
    channelOverrides: jsonb('channel_overrides'),
    stats: jsonb('stats'),
    createdBy: uuid('created_by').references(() => profiles.userId),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }),
  },
  (table) => ({
    entityTypeIdx: index('share_links_entity_type_idx').on(table.entityType),
    entityUniqueIdx: uniqueIndex('share_links_entity_unique_idx').on(
      table.entityType,
      table.entityId,
    ),
  }),
);
