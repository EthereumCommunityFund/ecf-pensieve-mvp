import { InferSelectModel } from 'drizzle-orm';
import { pgSchema, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

const authSchema = pgSchema('auth');

const users = authSchema.table('users', {
  id: uuid('id').primaryKey(),
});

export const profiles = pgTable('profiles', {
  userId: uuid('user_id')
    .primaryKey()
    .notNull()
    .references(() => users.id, {
      onDelete: 'cascade',
    }),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  address: text('address').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Profile = InferSelectModel<typeof profiles>;
