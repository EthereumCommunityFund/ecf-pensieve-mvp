import { and, desc, eq } from 'drizzle-orm';

import { db, type Database } from '@/lib/db';
import { shareLinks, sieves } from '@/lib/db/schema';
import ShareService, {
  buildShareUrl,
  type SharePayload,
} from '@/lib/services/share';

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
}

export interface UpdateSieveInput {
  sieveId: number;
  creatorId: string;
  name?: string;
  description?: string | null;
  targetPath?: string;
  visibility?: SieveVisibility;
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
): Promise<SieveWithShareLink> {
  const resolvedPayload =
    payload ?? (await ShareService.getSharePayload(shareLink.code));

  if (!resolvedPayload) {
    throw new SieveServiceError('Failed to resolve share payload', 500);
  }

  return {
    ...sieve,
    shareLink,
    shareUrl: buildShareUrl(shareLink.code),
    sharePayload: resolvedPayload,
  };
}

export async function createSieve(
  input: CreateSieveInput,
  currentDb: DatabaseClient = db,
): Promise<SieveWithShareLink> {
  const name = coerceName(input.name);
  const description = coerceDescription(input.description);

  const payload = await ensureCustomFilterShareLink({
    targetPath: input.targetPath,
    visibility: input.visibility,
    createdBy: input.creatorId,
  });

  const shareLinkRecord = await fetchShareLinkByCode(payload.code, currentDb);

  try {
    const [created] = await currentDb
      .insert(sieves)
      .values({
        name,
        description,
        targetPath: payload.targetUrl,
        visibility: payload.visibility as SieveVisibility,
        creator: input.creatorId,
        shareLinkId: shareLinkRecord.id,
      })
      .returning();

    if (!created) {
      throw new SieveServiceError('Failed to create sieve', 500);
    }

    return mapToSieveWithPayload(created, shareLinkRecord, payload);
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
    const payload = await ShareService.getSharePayload(record.shareLink.code);
    if (!payload) {
      continue;
    }
    mapped.push({
      ...record,
      shareLink: record.shareLink,
      shareUrl: buildShareUrl(record.shareLink.code),
      sharePayload: payload,
    });
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
    const payload = await ShareService.getSharePayload(record.shareLink.code);
    if (!payload) {
      continue;
    }
    mapped.push({
      ...record,
      shareLink: record.shareLink,
      shareUrl: buildShareUrl(record.shareLink.code),
      sharePayload: payload,
    });
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

  const updates: Partial<typeof sieves.$inferInsert> = {};
  let nextShareLink = existing.shareLink;
  let nextPayload: SharePayload | null = null;

  const nextVisibility =
    input.visibility ?? (existing.sieve.visibility as SieveVisibility);

  const shouldUpdateTarget =
    typeof input.targetPath === 'string' &&
    input.targetPath.trim().length > 0 &&
    input.targetPath !== existing.sieve.targetPath;

  if (shouldUpdateTarget || input.visibility) {
    nextPayload = await ensureCustomFilterShareLink({
      targetPath: shouldUpdateTarget
        ? input.targetPath!
        : existing.sieve.targetPath,
      visibility: nextVisibility,
      createdBy: input.creatorId,
    });

    nextShareLink = await fetchShareLinkByCode(nextPayload.code, currentDb);

    if (shouldUpdateTarget) {
      updates.targetPath = nextPayload.targetUrl;
      updates.shareLinkId = nextShareLink.id;
    }

    updates.visibility = nextPayload.visibility as SieveVisibility;
  }

  if (typeof input.name === 'string') {
    updates.name = coerceName(input.name);
  }

  if (input.description !== undefined) {
    updates.description = coerceDescription(input.description ?? null);
  }

  if (Object.keys(updates).length === 0) {
    return mapToSieveWithPayload(existing.sieve, nextShareLink);
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

  return {
    ...sieveRecord,
    shareLink: shareLinkRecord,
    shareUrl: buildShareUrl(code),
    sharePayload: payload,
  };
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
  checkSieveOwnership,
};

export default SieveService;
