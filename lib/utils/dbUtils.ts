import { sql, SQL } from 'drizzle-orm';
import type { PgTableWithColumns } from 'drizzle-orm/pg-core';

import type { db } from '@/lib/db';

/**
 * Generic function to get an estimated count from any table with any condition
 * @param database - The database instance (typeof db)
 * @param table - The table to query
 * @param condition - The where condition (optional SQL expression)
 * @returns Promise<number> - The estimated count
 */
export async function getEstimatedCount(
  database: typeof db,
  table: PgTableWithColumns<any>,
  condition?: SQL<unknown>,
): Promise<number> {
  try {
    const query = database.select({ count: sql`COUNT(*)::int` }).from(table);

    const result = condition ? await query.where(condition) : await query;

    return Number(result[0]?.count ?? 0);
  } catch {
    return 0;
  }
}
