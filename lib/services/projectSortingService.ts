import { SQL, and, asc, desc, eq, sql } from 'drizzle-orm';
import { PgColumn } from 'drizzle-orm/pg-core';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { db } from '../db';
import { profiles, projectSnaps, projects, ranks } from '../db/schema';
import { SortBy, SortOrder } from '../types/sorting';

export interface SortingConfig {
  field: SortBy;
  order: SortOrder;
  dbColumn?: SQL | PgColumn;
  needsJoin?: 'projectSnaps' | 'ranks';
}

export interface SortingParams {
  sortBy?: SortBy | SortBy[];
  sortOrder?: SortOrder | SortOrder[];
  offset?: number;
  limit?: number;
  isPublished?: boolean;
  categories?: string[];
}

export interface CacheKeyParams {
  sortBy?: SortBy | SortBy[];
  sortOrder?: SortOrder | SortOrder[];
  isPublished?: boolean;
  categories?: string[];
  limit?: number;
}

export class ProjectSortingService {
  private db: PostgresJsDatabase<any>;

  constructor(database?: PostgresJsDatabase<any>) {
    this.db = database ?? db;
  }

  buildSortedQuery(params: SortingParams): any {
    const {
      sortBy,
      sortOrder,
      offset = 0,
      limit = 50,
      isPublished,
      categories,
    } = params;

    const sortConfigs = this.getSortingConfigs(sortBy, sortOrder);

    const needsRanks = sortConfigs.some(
      (config) => config.needsJoin === 'ranks',
    );

    let query = this.db
      .select({
        id: projects.id,
        createdAt: projects.createdAt,
        support: projects.support,
        isPublished: projects.isPublished,
        itemsTopWeight: projects.itemsTopWeight,
        name: projects.name,
        categories: projects.categories,
        currentName: projectSnaps.name,
        currentCategories: projectSnaps.categories,
        creator: {
          name: profiles.name,
          avatarUrl: profiles.avatarUrl,
          address: profiles.address,
          weight: profiles.weight,
        },
        ...(needsRanks && {
          publishedGenesisWeight: ranks.publishedGenesisWeight,
        }),
      })
      .from(projects)
      .leftJoin(profiles, eq(projects.creator, profiles.userId))
      .leftJoin(projectSnaps, eq(projects.id, projectSnaps.projectId));

    if (needsRanks) {
      query = (query as any).leftJoin(ranks, eq(projects.id, ranks.projectId));
    }

    const conditions: SQL[] = [];

    if (isPublished) {
      conditions.push(eq(projects.isPublished, isPublished));
    }

    if (categories && categories.length > 0 && isPublished === true) {
      conditions.push(
        sql`${projectSnaps.categories} && ARRAY[${sql.join(
          categories.map((cat) => sql`${cat}`),
          sql`, `,
        )}]`,
      );
    }

    if (conditions.length > 0) {
      const combinedConditions =
        conditions.length === 1 ? conditions[0] : and(...conditions);
      query = (query as any).where(combinedConditions);
    }

    const orderByColumns: SQL[] = sortConfigs.map((config) => {
      let column: SQL | PgColumn;

      if (config.field === SortBy.ACTIVITY) {
        column = this.getItemsTopWeightSum();
      } else if (config.dbColumn) {
        column = config.dbColumn;
      } else {
        throw new Error(`No column defined for sort field: ${config.field}`);
      }

      return config.order === SortOrder.ASC ? asc(column) : desc(column);
    });

    orderByColumns.push(desc(projects.id));

    query = (query as any).orderBy(...orderByColumns);

    if (limit) {
      query = (query as any).limit(limit);
    }

    if (offset) {
      query = (query as any).offset(offset);
    }

    return query;
  }

  getSortingConfigs(
    sortBy: SortBy | SortBy[] | undefined,
    sortOrder: SortOrder | SortOrder[] | undefined,
  ): SortingConfig[] {
    if (!sortBy) {
      return [
        {
          field: SortBy.CREATED_AT,
          order: SortOrder.DESC,
          dbColumn: projects.createdAt,
        },
      ];
    }

    const sortByArray = Array.isArray(sortBy) ? sortBy : [sortBy];
    const sortOrderArray = Array.isArray(sortOrder) ? sortOrder : [sortOrder];

    if (
      sortOrderArray.length > 1 &&
      sortOrderArray.length !== sortByArray.length
    ) {
      throw new Error(
        `Mismatch between sortBy and sortOrder arrays: sortBy has ${sortByArray.length} fields, but sortOrder has ${sortOrderArray.length} values. They must have the same length or sortOrder must have exactly 1 value.`,
      );
    }

    return sortByArray.map((field, index) => {
      const order =
        sortOrderArray[index] || sortOrderArray[0] || SortOrder.DESC;

      switch (field) {
        case SortBy.CREATED_AT:
          return {
            field,
            order,
            dbColumn: projects.createdAt,
          };

        case SortBy.COMMUNITY_TRUSTED:
          return {
            field,
            order,
            dbColumn: projects.support,
            needsJoin: 'ranks' as const,
          };

        case SortBy.TRANSPARENT:
          return {
            field,
            order,
            dbColumn: ranks.publishedGenesisWeight,
            needsJoin: 'ranks' as const,
          };

        case SortBy.NAME:
          return {
            field,
            order,
            dbColumn: projects.name,
          };

        case SortBy.ACTIVITY:
          return {
            field,
            order,
          };

        default:
          throw new Error(`Unsupported sort field: ${field}`);
      }
    });
  }

  getItemsTopWeightSum(): SQL<number> {
    return sql<number>`
      CASE
        WHEN ${projects.itemsTopWeight} IS NULL THEN 0
        ELSE COALESCE((
          SELECT SUM(CAST(value AS NUMERIC))
          FROM jsonb_each_text(${projects.itemsTopWeight}::jsonb)
          WHERE value ~ '^[0-9]+(\.[0-9]+)?$'
        ), 0)
      END
    `;
  }
}
