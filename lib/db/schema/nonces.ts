import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const loginNonces = pgTable('login_nonces', {
  address: text('address').notNull().primaryKey(),
  nonce: text('nonce').notNull(),
  expiresAt: timestamp('expires_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
});
