import {
  bigserial,
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { profiles } from './profiles';

export const projects = pgTable(
  'projects',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    name: text('name').notNull(),
    tagline: text('tagline').notNull(),
    categories: text('categories').array().notNull(),
    mainDescription: text('main_description').notNull(),
    logoUrl: text('logo_url').notNull(),
    websites: jsonb('websites').array().notNull(),
    appUrl: text('app_url'),
    dateFounded: timestamp('date_founded', {
      withTimezone: false,
      mode: 'date',
    }).notNull(),
    dateLaunch: timestamp('date_launch', { withTimezone: false, mode: 'date' }),
    devStatus: text('dev_status').notNull(),
    fundingStatus: text('funding_status'),
    openSource: boolean('open_source').notNull(),
    codeRepo: text('code_repo'),
    tokenContract: text('token_contract'),
    orgStructure: text('org_structure').notNull(),
    publicGoods: boolean('public_goods').notNull(),
    founders: jsonb('founders').array().notNull(),
    tags: text('tags').array().notNull(),
    whitePaper: text('white_paper'),
    dappSmartContracts: text('dapp_smart_contracts'),
    creator: uuid('creator')
      .notNull()
      .references(() => profiles.userId),
    refs: jsonb('refs').array(),
    isPublished: boolean('is_published').notNull().default(false),
    itemsTopWeight: jsonb('items_top_weight').notNull().default('{}'),
    support: doublePrecision('support').notNull().default(0),
    likeCount: integer('like_count').notNull().default(0),
    hasProposalKeys: text('has_proposal_keys').array().notNull().default([]),
    shortCode: text('short_code').unique(),
  },
  (table) => {
    return {
      creatorIdx: index('projects_creator_idx').on(table.creator),
      isPublishedIdx: index('projects_is_published_idx').on(table.isPublished),
      paginationIdx: index('projects_pagination_idx').on(
        table.isPublished,
        table.id.desc(),
      ),
      createdAtIdx: index('projects_created_at_idx').on(table.createdAt.desc()),
      categoriesGinIdx: index('projects_categories_gin_idx').using(
        'gin',
        table.categories,
      ),
    };
  },
);
