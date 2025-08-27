import {
  bigint,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { profiles } from './profiles';
import { projects } from './projects';

export const projectNotificationSettings = pgTable(
  'project_notification_settings',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.userId, { onDelete: 'cascade' }),
    projectId: bigint('project_id', { mode: 'number' })
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    notificationMode: text('notification_mode', {
      enum: ['muted', 'my_contributions', 'all_events'],
    })
      .notNull()
      .default('all_events'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.projectId] }),
    };
  },
);

export type ProjectNotificationSetting =
  typeof projectNotificationSettings.$inferSelect;
export type NewProjectNotificationSetting =
  typeof projectNotificationSettings.$inferInsert;
