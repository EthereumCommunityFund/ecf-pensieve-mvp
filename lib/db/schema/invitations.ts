import { InferSelectModel } from 'drizzle-orm';
import {
  bigserial,
  integer,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const invitationCodes = pgTable('invitation_codes', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  code: text('code').notNull().unique(),
  maxUses: integer('max_uses').notNull().default(3),
  currentUses: integer('current_uses').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
});

export type InvitationCode = InferSelectModel<typeof invitationCodes>;
