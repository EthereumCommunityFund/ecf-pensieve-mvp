import { and, desc, eq, sql } from 'drizzle-orm';

import { db, type Database } from '@/lib/db';
import { shareLinks, sieveFollows, sieves } from '@/lib/db/schema';
import ShareService, {
  buildPublicSievePath,
  buildShareUrl,
  type SharePayload,
} from '@/lib/services/share';
import {
  buildTargetPathFromConditions,
  normalizeStoredConditions,
  parseTargetPathToConditions,
  resolveFilterState,
} from '@/lib/services/sieveFilterService';
import type { StoredSieveFilterConditions } from '@/types/sieve';

export type SieveVisibility = 'public' | 'private';

export class SieveServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = 'SieveServiceError';
  }
}

type DatabaseClient = Database;

type SieveRecord = typeof sieves.$inferSelect;
type ShareLinkRecord = typeof shareLinks.$inferSelect;

export interface CreateSieveInput {
  name: string;
  description?: string | null;
  targetPath: string;
  visibility: SieveVisibility;
  creatorId: string;
  filterConditions?: StoredSieveFilterConditions;
}

export interface UpdateSieveInput {
  sieveId: number;
  creatorId: string;
  name?: string;
  description?: string | null;
  targetPath?: string;
  visibility?: SieveVisibility;
  filterConditions?: StoredSieveFilterConditions;
}

export interface FollowSieveInput {
  sieveId: number;
  userId: string;
}

export interface UnfollowSieveInput {
  sieveId: number;
  userId: string;
}

export interface DeleteSieveInput {
  sieveId: number;
  creatorId: string;
  removeShareLink?: boolean;
}

export interface SieveWithShareLink extends SieveRecord {
  shareLink: ShareLinkRecord;
  shareUrl: string;
  sharePayload: SharePayload;
}

function coerceName(value: string): string {
  const trimmed = value?.trim?.() ?? '';
  if (!trimmed) {
    throw new SieveServiceError('Sieve name is required', 400);
  }
  return trimmed;
}

function coerceDescription(value?: string | null): string | null {
  const trimmed = value?.trim?.();
  return trimmed ? trimmed : null;
}

async function fetchShareLinkByCode(
  code: string,
  currentDb: DatabaseClient,
): Promise<ShareLinkRecord> {
  const record = await currentDb.query.shareLinks.findFirst({
    where: eq(shareLinks.code, code),
  });

  if (!record) {
    throw new SieveServiceError('Share link not found', 500);
  }

  return record;
}

async function ensureShareLinkTargetPath(
  link: ShareLinkRecord,
  code: string,
  currentDb: DatabaseClient,
): Promise<ShareLinkRecord> {
  const targetPath = buildPublicSievePath(code);
  if (link.targetUrl === targetPath) {
    return link;
  }

  const [updated] = await currentDb
    .update(shareLinks)
    .set({ targetUrl: targetPath })
    .where(eq(shareLinks.id, link.id))
    .returning();

  return updated ?? link;
}

async function ensureCustomFilterShareLink(params: {
  targetPath: string;
  visibility: SieveVisibility;
  createdBy: string;
}): Promise<SharePayload> {
  return ShareService.ensureCustomFilterShareLink({
    targetPath: params.targetPath,
    createdBy: params.createdBy,
    visibility: params.visibility,
  });
}

async function mapToSieveWithPayload(
  sieve: SieveRecord,
  shareLink: ShareLinkRecord,
  payload?: SharePayload,
  currentDb: DatabaseClient = db,
): Promise<SieveWithShareLink> {
  const normalizedShareLink = await ensureShareLinkTargetPath(
    shareLink,
    shareLink.code,
    currentDb,
  );

  const filterState = resolveFilterState({
    targetPath: sieve.targetPath,
    stored: sieve.filterConditions ?? undefined,
    createdAt: sieve.createdAt,
    updatedAt: sieve.updatedAt,
  });

  const resolvedPayload =
    payload ?? (await ShareService.getSharePayload(normalizedShareLink.code));

  if (!resolvedPayload) {
    throw new SieveServiceError('Failed to resolve share payload', 500);
  }

  return {
    ...sieve,
    targetPath: filterState.targetPath,
    filterConditions: filterState.conditions,
    shareLink: normalizedShareLink,
    shareUrl: buildShareUrl(normalizedShareLink.code),
    sharePayload: resolvedPayload,
  };
}

export async function createSieve(
  input: CreateSieveInput,
  currentDb: DatabaseClient = db,
): Promise<SieveWithShareLink> {
  const name = coerceName(input.name);
  const description = coerceDescription(input.description);

  const now = new Date();
  const baseConditions = input.filterConditions
    ? normalizeStoredConditions(input.filterConditions, {
        createdAt: input.filterConditions.metadata.createdAt ?? now,
        updatedAt: now,
      })
    : parseTargetPathToConditions(input.targetPath, {
        createdAt: now,
        updatedAt: now,
      });

  const canonicalTargetPath = buildTargetPathFromConditions(baseConditions);

  const payload = await ensureCustomFilterShareLink({
    targetPath: canonicalTargetPath,
    visibility: input.visibility,
    createdBy: input.creatorId,
  });

  const shareLinkRecord = await fetchShareLinkByCode(payload.code, currentDb);
  const normalizedShareLink = await ensureShareLinkTargetPath(
    shareLinkRecord,
    payload.code,
    currentDb,
  );

  try {
    const [created] = await currentDb
      .insert(sieves)
      .values({
        name,
        description,
        targetPath: canonicalTargetPath,
        visibility: payload.visibility as SieveVisibility,
        creator: input.creatorId,
        shareLinkId: normalizedShareLink.id,
        filterConditions: baseConditions,
      })
      .returning();

    if (!created) {
      throw new SieveServiceError('Failed to create sieve', 500);
    }

    return mapToSieveWithPayload(
      created,
      normalizedShareLink,
      payload,
      currentDb,
    );
  } catch (error) {
    if (error instanceof SieveServiceError) {
      throw error;
    }

    if (error instanceof Error && error.message.includes('sieves_share_link')) {
      throw new SieveServiceError('Feed already exists for this filter', 409);
    }

    throw new SieveServiceError('Failed to create sieve', 500);
  }
}

async function getSieveInternal(
  sieveId: number,
  currentDb: DatabaseClient,
): Promise<{ sieve: SieveRecord; shareLink: ShareLinkRecord } | null> {
  const record = await currentDb.query.sieves.findFirst({
    where: eq(sieves.id, sieveId),
    with: {
      shareLink: true,
    },
  });

  if (!record || !record.shareLink) {
    return null;
  }

  return { sieve: record, shareLink: record.shareLink };
}

async function refreshSieveFollowCount(
  tx: DatabaseClient,
  sieveId: number,
): Promise<void> {
  const result = await tx
    .select({ count: sql<number>`count(*)::int` })
    .from(sieveFollows)
    .where(eq(sieveFollows.sieveId, sieveId));

  const followCount = result[0]?.count ?? 0;

  await tx.update(sieves).set({ followCount }).where(eq(sieves.id, sieveId));
}

export async function getUserSieves(
  creatorId: string,
  currentDb: DatabaseClient = db,
): Promise<SieveWithShareLink[]> {
  const records = await currentDb.query.sieves.findMany({
    where: eq(sieves.creator, creatorId),
    orderBy: [desc(sieves.createdAt)],
    with: {
      shareLink: true,
    },
  });

  const mapped: SieveWithShareLink[] = [];
  for (const record of records) {
    if (!record.shareLink) {
      continue;
    }
    mapped.push(
      await mapToSieveWithPayload(
        record,
        record.shareLink,
        undefined,
        currentDb,
      ),
    );
  }

  return mapped;
}

export async function getPublicSievesByCreator(
  creatorId: string,
  currentDb: DatabaseClient = db,
): Promise<SieveWithShareLink[]> {
  const records = await currentDb.query.sieves.findMany({
    where: and(eq(sieves.creator, creatorId), eq(sieves.visibility, 'public')),
    orderBy: [desc(sieves.createdAt)],
    with: {
      shareLink: true,
    },
  });

  const mapped: SieveWithShareLink[] = [];
  for (const record of records) {
    if (!record.shareLink) {
      continue;
    }
    mapped.push(
      await mapToSieveWithPayload(
        record,
        record.shareLink,
        undefined,
        currentDb,
      ),
    );
  }

  return mapped;
}

export async function updateSieve(
  input: UpdateSieveInput,
  currentDb: DatabaseClient = db,
): Promise<SieveWithShareLink> {
  const existing = await getSieveInternal(input.sieveId, currentDb);

  if (!existing) {
    throw new SieveServiceError('Sieve not found', 404);
  }

  if (existing.sieve.creator !== input.creatorId) {
    throw new SieveServiceError('Forbidden', 403);
  }

  const existingState = resolveFilterState({
    targetPath: existing.sieve.targetPath,
    stored: existing.sieve.filterConditions ?? undefined,
    createdAt: existing.sieve.createdAt,
    updatedAt: existing.sieve.updatedAt,
  });

  const now = new Date();
  let nextState = existingState;
  let filterStateChanged = false;

  if (input.filterConditions) {
    const normalized = normalizeStoredConditions(input.filterConditions, {
      createdAt: existingState.conditions.metadata.createdAt,
      updatedAt: now,
    });
    nextState = {
      targetPath: buildTargetPathFromConditions(normalized),
      conditions: normalized,
    };
    filterStateChanged = true;
  } else if (
    typeof input.targetPath === 'string' &&
    input.targetPath.trim().length > 0 &&
    input.targetPath !== existingState.targetPath
  ) {
    nextState = resolveFilterState({
      targetPath: input.targetPath,
      createdAt: existingState.conditions.metadata.createdAt,
      updatedAt: now,
    });
    filterStateChanged = true;
  }

  const updates: Partial<typeof sieves.$inferInsert> = {};
  let nextShareLink = existing.shareLink;
  let nextPayload: SharePayload | null = null;

  const nextVisibility =
    input.visibility ?? (existing.sieve.visibility as SieveVisibility);

  const visibilityChanged =
    nextVisibility !== (existing.sieve.visibility as SieveVisibility);

  if (filterStateChanged) {
    updates.targetPath = nextState.targetPath;
    updates.filterConditions = nextState.conditions;
  } else if (!existing.sieve.filterConditions) {
    updates.filterConditions = existingState.conditions;
  }

  if (filterStateChanged || visibilityChanged) {
    nextPayload = await ensureCustomFilterShareLink({
      targetPath: nextState.targetPath,
      visibility: nextVisibility,
      createdBy: input.creatorId,
    });

    nextShareLink = await fetchShareLinkByCode(nextPayload.code, currentDb);

    if (nextShareLink.id !== existing.shareLink.id) {
      updates.shareLinkId = nextShareLink.id;
    }

    updates.visibility = nextPayload.visibility as SieveVisibility;
  }

  if (visibilityChanged && !updates.visibility) {
    updates.visibility = nextVisibility;
  }

  if (typeof input.name === 'string') {
    updates.name = coerceName(input.name);
  }

  if (input.description !== undefined) {
    updates.description = coerceDescription(input.description ?? null);
  }

  if (Object.keys(updates).length === 0) {
    return mapToSieveWithPayload(
      existing.sieve,
      nextShareLink,
      nextPayload ?? undefined,
      currentDb,
    );
  }

  const [updated] = await currentDb
    .update(sieves)
    .set(updates)
    .where(eq(sieves.id, input.sieveId))
    .returning();

  if (!updated) {
    throw new SieveServiceError('Failed to update sieve', 500);
  }

  return mapToSieveWithPayload(
    updated,
    nextShareLink,
    nextPayload ?? undefined,
    currentDb,
  );
}

export async function deleteSieve(
  input: DeleteSieveInput,
  currentDb: DatabaseClient = db,
): Promise<void> {
  const existing = await getSieveInternal(input.sieveId, currentDb);

  if (!existing) {
    throw new SieveServiceError('Sieve not found', 404);
  }

  if (existing.sieve.creator !== input.creatorId) {
    throw new SieveServiceError('Forbidden', 403);
  }

  await currentDb.transaction(async (tx) => {
    await tx.delete(sieves).where(eq(sieves.id, input.sieveId));

    if (input.removeShareLink !== false) {
      await tx
        .delete(shareLinks)
        .where(eq(shareLinks.id, existing.shareLink.id));
    }
  });
}

export async function getSieveByCode(
  code: string,
  currentDb: DatabaseClient = db,
): Promise<SieveWithShareLink | null> {
  if (!code) {
    return null;
  }

  const shareLinkRecord = await currentDb.query.shareLinks.findFirst({
    where: eq(shareLinks.code, code),
  });

  if (!shareLinkRecord) {
    return null;
  }

  const sieveRecord = await currentDb.query.sieves.findFirst({
    where: eq(sieves.shareLinkId, shareLinkRecord.id),
  });

  if (!sieveRecord) {
    return null;
  }

  const payload = await ShareService.getSharePayload(code);
  if (!payload) {
    return null;
  }

  const normalizedLink = await ensureShareLinkTargetPath(
    shareLinkRecord,
    code,
    currentDb,
  );

  return mapToSieveWithPayload(sieveRecord, normalizedLink, payload, currentDb);
}

export async function followSieve(
  input: FollowSieveInput,
  currentDb: DatabaseClient = db,
): Promise<SieveWithShareLink> {
  const existing = await getSieveInternal(input.sieveId, currentDb);

  if (!existing) {
    throw new SieveServiceError('Sieve not found', 404);
  }

  if (existing.sieve.creator === input.userId) {
    throw new SieveServiceError('Cannot follow your own sieve', 400);
  }

  if (
    (existing.sieve.visibility as SieveVisibility) !== 'public' &&
    existing.sieve.creator !== input.userId
  ) {
    throw new SieveServiceError('Access denied for this sieve', 403);
  }

  const alreadyFollowing = await currentDb.query.sieveFollows.findFirst({
    where: and(
      eq(sieveFollows.sieveId, input.sieveId),
      eq(sieveFollows.userId, input.userId),
    ),
  });

  if (alreadyFollowing) {
    throw new SieveServiceError('Already following this sieve', 409);
  }

  await currentDb.transaction(async (tx) => {
    await tx.insert(sieveFollows).values({
      sieveId: input.sieveId,
      userId: input.userId,
    });

    await refreshSieveFollowCount(tx, input.sieveId);
  });

  const refreshed = await getSieveInternal(input.sieveId, currentDb);
  if (!refreshed) {
    throw new SieveServiceError('Sieve not found after follow', 500);
  }

  return mapToSieveWithPayload(
    refreshed.sieve,
    refreshed.shareLink,
    undefined,
    currentDb,
  );
}

export async function unfollowSieve(
  input: UnfollowSieveInput,
  currentDb: DatabaseClient = db,
): Promise<SieveWithShareLink> {
  const existing = await getSieveInternal(input.sieveId, currentDb);

  if (!existing) {
    throw new SieveServiceError('Sieve not found', 404);
  }

  const followRecord = await currentDb.query.sieveFollows.findFirst({
    where: and(
      eq(sieveFollows.sieveId, input.sieveId),
      eq(sieveFollows.userId, input.userId),
    ),
  });

  if (!followRecord) {
    throw new SieveServiceError('Not following this sieve', 404);
  }

  await currentDb.transaction(async (tx) => {
    await tx
      .delete(sieveFollows)
      .where(
        and(
          eq(sieveFollows.sieveId, input.sieveId),
          eq(sieveFollows.userId, input.userId),
        ),
      );

    await refreshSieveFollowCount(tx, input.sieveId);
  });

  const refreshed = await getSieveInternal(input.sieveId, currentDb);
  if (!refreshed) {
    throw new SieveServiceError('Sieve not found after unfollow', 500);
  }

  return mapToSieveWithPayload(
    refreshed.sieve,
    refreshed.shareLink,
    undefined,
    currentDb,
  );
}

export async function getUserFollowedSieves(
  userId: string,
  currentDb: DatabaseClient = db,
): Promise<SieveWithShareLink[]> {
  const records = await currentDb.query.sieveFollows.findMany({
    where: eq(sieveFollows.userId, userId),
    orderBy: [desc(sieveFollows.createdAt)],
    with: {
      sieve: {
        with: {
          shareLink: true,
        },
      },
    },
  });

  const mapped: SieveWithShareLink[] = [];

  for (const record of records) {
    const sieveRecord = record.sieve;
    if (!sieveRecord || !sieveRecord.shareLink) {
      continue;
    }

    if (
      (sieveRecord.visibility as SieveVisibility) !== 'public' &&
      sieveRecord.creator !== userId
    ) {
      continue;
    }

    mapped.push(
      await mapToSieveWithPayload(
        sieveRecord,
        sieveRecord.shareLink,
        undefined,
        currentDb,
      ),
    );
  }

  return mapped;
}

export async function isUserFollowingSieve(
  sieveId: number,
  userId: string,
  currentDb: DatabaseClient = db,
): Promise<boolean> {
  const record = await currentDb.query.sieveFollows.findFirst({
    where: and(
      eq(sieveFollows.sieveId, sieveId),
      eq(sieveFollows.userId, userId),
    ),
  });

  return !!record;
}

export function checkSieveOwnership(
  sieve: { creator: string },
  userId?: string | null,
): boolean {
  if (!userId) {
    return false;
  }
  return sieve.creator === userId;
}

const SieveService = {
  createSieve,
  getUserSieves,
  getPublicSievesByCreator,
  updateSieve,
  deleteSieve,
  getSieveByCode,
  followSieve,
  unfollowSieve,
  getUserFollowedSieves,
  isUserFollowingSieve,
  checkSieveOwnership,
};

export default SieveService;
