#!/usr/bin/env tsx

import { config } from 'dotenv';

config();

import { eq, sql } from 'drizzle-orm';

import { db } from '../lib/db';
import { shareLinks, sieveFollows, sieves, type Sieve } from '../lib/db/schema';
import { buildPublicSievePath } from '../lib/services/share';
import { resolveFilterState } from '../lib/services/sieveFilterService';
import type { StoredSieveFilterConditions } from '../types/sieve';

type ShareLinkRecord = typeof shareLinks.$inferSelect;

type SieveWithRelations = Sieve & {
  shareLink?: ShareLinkRecord | null;
};

const CUSTOM_FILTER_ENTITY_PREFIX = 'customFilter:';

function normalizeCustomFilterTargetPath(rawPath: string): string {
  const trimmed = (rawPath ?? '').trim();
  if (!trimmed) {
    throw new Error('Custom filter target path is required');
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      return `${url.pathname}${url.search}` || '/';
    } catch (error) {
      throw new Error('Invalid custom filter target URL');
    }
  }

  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  if (trimmed.startsWith('?')) {
    return `/${trimmed}`;
  }

  return `/${trimmed}`;
}

function encodeCustomFilterEntityId(targetPath: string): string {
  const normalized = normalizeCustomFilterTargetPath(targetPath);
  const encoded = Buffer.from(normalized, 'utf-8').toString('base64url');
  return `${CUSTOM_FILTER_ENTITY_PREFIX}${encoded}`;
}

async function loadFollowCounts(): Promise<Map<number, number>> {
  const results = await db
    .select({
      sieveId: sieveFollows.sieveId,
      count: sql<number>`count(*)::int`,
    })
    .from(sieveFollows)
    .groupBy(sieveFollows.sieveId);

  const map = new Map<number, number>();
  results.forEach((row) => {
    map.set(row.sieveId, row.count ?? 0);
  });
  return map;
}

async function migrateExistingSieveFilters() {
  const args = new Set(process.argv.slice(2));
  const isDryRun = args.has('--dry-run');
  const processAll = args.has('--all');

  try {
    console.log('Starting sieve filter migration…');
    console.log(
      `Options: dryRun=${isDryRun ? 'yes' : 'no'}, mode=${
        processAll ? 'all sieves' : 'missing only'
      }`,
    );

    const followCountMap = await loadFollowCounts();

    const records = await db.query.sieves.findMany({
      with: {
        shareLink: true,
      },
    });

    const summary = {
      scanned: records.length,
      processed: 0,
      sieveUpdates: 0,
      shareLinkUpdates: 0,
      skipped: 0,
      missingShareLink: 0,
    };

    for (const record of records as SieveWithRelations[]) {
      const shareLink = record.shareLink;

      if (!shareLink) {
        summary.missingShareLink++;
        console.warn(
          `[skip] sieve ${record.id} has no associated share link; please check manually.`,
        );
        summary.skipped++;
        continue;
      }

      const filterState = resolveFilterState({
        targetPath: record.targetPath,
        stored: record.filterConditions as StoredSieveFilterConditions | null,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      });

      const canonicalTargetPath = filterState.targetPath;
      const canonicalConditions = filterState.conditions;
      const canonicalConditionsJson = JSON.stringify(canonicalConditions);
      const existingConditionsJson = JSON.stringify(
        record.filterConditions ?? null,
      );
      const expectedFollowCount = followCountMap.get(record.id) ?? 0;

      const sieveUpdates: Partial<typeof sieves.$inferInsert> = {};
      const shareLinkUpdates: Partial<typeof shareLinks.$inferInsert> = {};

      const shouldUpdateFilters =
        !record.filterConditions ||
        processAll ||
        existingConditionsJson !== canonicalConditionsJson;

      if (
        shouldUpdateFilters &&
        existingConditionsJson !== canonicalConditionsJson
      ) {
        sieveUpdates.filterConditions = canonicalConditions;
      }

      if (record.targetPath !== canonicalTargetPath) {
        sieveUpdates.targetPath = canonicalTargetPath;
      }

      if ((record.followCount ?? 0) !== expectedFollowCount) {
        sieveUpdates.followCount = expectedFollowCount;
      }

      const expectedShareTarget = buildPublicSievePath(shareLink.code);
      if (shareLink.targetUrl !== expectedShareTarget) {
        shareLinkUpdates.targetUrl = expectedShareTarget;
      }

      const expectedEntityId = encodeCustomFilterEntityId(canonicalTargetPath);
      if (shareLink.entityId !== expectedEntityId) {
        shareLinkUpdates.entityId = expectedEntityId;
      }

      const hasSieveUpdates = Object.keys(sieveUpdates).length > 0;
      const hasShareUpdates = Object.keys(shareLinkUpdates).length > 0;

      if (!hasSieveUpdates && !hasShareUpdates) {
        summary.skipped++;
        continue;
      }

      summary.processed++;

      if (isDryRun) {
        console.log(`[dry-run] Sieve ${record.id} updates:`, {
          sieve: hasSieveUpdates ? sieveUpdates : undefined,
          shareLink: hasShareUpdates ? shareLinkUpdates : undefined,
        });
        continue;
      }

      await db.transaction(async (tx) => {
        if (hasSieveUpdates) {
          await tx
            .update(sieves)
            .set(sieveUpdates)
            .where(eq(sieves.id, record.id));
          summary.sieveUpdates++;
        }

        if (hasShareUpdates) {
          await tx
            .update(shareLinks)
            .set(shareLinkUpdates)
            .where(eq(shareLinks.id, shareLink.id));
          summary.shareLinkUpdates++;
        }
      });
    }

    console.log('\nMigration summary:');
    console.table([
      { metric: 'Total sieves scanned', value: summary.scanned },
      { metric: 'Processed (needed updates)', value: summary.processed },
      { metric: 'Sieve rows updated', value: summary.sieveUpdates },
      { metric: 'Share links updated', value: summary.shareLinkUpdates },
      { metric: 'Skipped (up-to-date)', value: summary.skipped },
      { metric: 'Missing share links', value: summary.missingShareLink },
      { metric: 'Mode', value: processAll ? 'all' : 'missing-filter' },
      { metric: 'Dry run', value: isDryRun ? 'yes' : 'no' },
    ]);

    if (isDryRun) {
      console.log(
        '\nNo changes were written because dry-run mode is enabled. Re-run without --dry-run to apply updates.',
      );
    } else {
      console.log('\nSieve filter migration completed successfully.');
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  migrateExistingSieveFilters()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Migration encountered an error:', error);
      process.exit(1);
    });
}

export { migrateExistingSieveFilters };
