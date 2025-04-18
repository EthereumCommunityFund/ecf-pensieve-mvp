import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const authUsers = pgTable('auth.users', {
  id: uuid('id').primaryKey(),
  email: text('email'),
});

export const users = pgTable('users', {
  id: uuid('id')
    .primaryKey()
    .references(() => authUsers.id, {
      onDelete: 'cascade',
    }),
  name: text('name'),
  avatar_url: text('avatar_url'),
  address: text('address'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});
