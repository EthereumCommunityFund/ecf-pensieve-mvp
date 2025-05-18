import { InferSelectModel } from 'drizzle-orm';
import {
  doublePrecision,
  pgSchema,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { invitationCodes } from './invitations';

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
  weight: doublePrecision('weight'),
  invitationCodeId: uuid('invitation_code_id').references(
    () => invitationCodes.id,
  ),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Profile = InferSelectModel<typeof profiles>;
