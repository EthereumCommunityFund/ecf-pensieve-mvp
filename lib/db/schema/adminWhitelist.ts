import {
  bigserial,
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const adminWhitelistRoleEnum = pgEnum('admin_whitelist_role', [
  'super_admin',
  'admin',
  'extra',
]);

export const adminWhitelist = pgTable('admin_whitelist', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  address: text('address').notNull().unique(),
  nickname: text('nickname'),
  role: adminWhitelistRoleEnum('role').notNull().default('admin'),
  isDisabled: boolean('is_disabled').notNull().default(false),
});

export type AdminWhitelist = typeof adminWhitelist.$inferSelect;
export type AdminWhitelistInsert = typeof adminWhitelist.$inferInsert;
