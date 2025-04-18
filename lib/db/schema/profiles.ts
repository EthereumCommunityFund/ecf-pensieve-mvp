import { pgSchema, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

const authSchema = pgSchema('auth');

const users = authSchema.table('users', {
  id: uuid('id').primaryKey(),
});

export const profiles = pgTable('profiles', {
  user_id: uuid('user_id')
    .primaryKey()
    .references(() => users.id, {
      onDelete: 'cascade',
    }),
  name: text('name').notNull(),
  avatar_url: text('avatar_url'),
  address: text('address').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});
