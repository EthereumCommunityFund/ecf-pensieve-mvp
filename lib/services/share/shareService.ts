import { and, eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { itemProposals, proposals, shareLinks } from '@/lib/db/schema';
import { generateUniqueShortCode } from '@/lib/utils/shortCodeUtils';
import { buildAbsoluteUrl, getAppOrigin } from '@/lib/utils/url';

type ShareLinkRecord = typeof shareLinks.$inferSelect;
type ShareLinkInsert = typeof shareLinks.$inferInsert;

type ProposalRecord = {
  id: number;
  projectId: number;
  createdAt: Date;
  items: unknown[];
  refs: unknown[] | null;
  project: {
    id: number;
    name: string;
    tagline: string;
    categories: string[];
    logoUrl: string;
    isPublished: boolean;
    updatedAt: Date;
  } | null;
  creator: {
    userId: string;
    name: string;
    avatarUrl: string | null;
    address: string;
  } | null;
};

type ItemProposalRecord = {
  id: number;
  projectId: number;
  key: string;
  value: unknown;
  ref: string | null;
  reason: string | null;
  createdAt: Date;
  project: {
    id: number;
    name: string;
    tagline: string;
    categories: string[];
    logoUrl: string;
    isPublished: boolean;
    updatedAt: Date;
  } | null;
  creator: {
    userId: string;
    name: string;
    avatarUrl: string | null;
    address: string;
  } | null;
};

export type ShareEntityType = 'proposal' | 'itemProposal' | 'project';
const SUPPORTED_ENTITY_TYPES: ShareEntityType[] = ['proposal', 'itemProposal'];

export type ShareVisibility = 'public' | 'unlisted' | 'private';
export type ShareLayout = 'proposal' | 'itemProposal' | 'project';

export interface ShareHighlight {
  label: string;
  value: string;
}

export interface ShareAuthorMetadata {
  name?: string | null;
  address?: string | null;
  avatarUrl?: string | null;
}

export interface ShareProjectMetadata {
  id: number;
  name: string;
  tagline?: string | null;
  categories: string[];
  logoUrl?: string | null;
  isPublished?: boolean;
}

export interface ShareMetadata {
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  project: ShareProjectMetadata;
  author?: ShareAuthorMetadata;
  tags?: string[];
  highlights?: ShareHighlight[];
  timestamp?: string;
}

export interface SharePayload {
  code: string;
  entityType: ShareEntityType;
  entityId: string;
  sharePath: string;
  targetUrl: string;
  parentId?: string | null;
  visibility: ShareVisibility;
  metadata: ShareMetadata;
  imageVersion: string;
  layout: ShareLayout;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateShareLinkInput {
  entityType: ShareEntityType;
  entityId: number | string;
  visibility?: ShareVisibility;
  createdBy?: string;
  parentId?: number | string | null;
}

interface EntityContext {
  layout: ShareLayout;
  targetUrl: string;
  visibility: ShareVisibility;
  parentId?: string | null;
  metadata: ShareMetadata;
  imageVersion: string;
}

const VISIBILITY_WEIGHT: Record<ShareVisibility, number> = {
  public: 0,
  unlisted: 1,
  private: 2,
};

export class ShareServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = 'ShareServiceError';
  }
}
function normalizeEntityType(entityType: string): ShareEntityType {
  if ((SUPPORTED_ENTITY_TYPES as string[]).includes(entityType)) {
    return entityType as ShareEntityType;
  }
  throw new ShareServiceError(`Unsupported entity type: ${entityType}`, 400);
}

function normalizeVisibility(value?: string | null): ShareVisibility {
  if (value === 'private' || value === 'unlisted' || value === 'public') {
    return value;
  }
  return 'public';
}

function mergeVisibility(
  a: ShareVisibility,
  b: ShareVisibility,
): ShareVisibility {
  return VISIBILITY_WEIGHT[a] >= VISIBILITY_WEIGHT[b] ? a : b;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 1).trim()}...`;
}

function formatReadableKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(.)/, (match) => match.toUpperCase());
}

function valueToText(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    const parts = value
      .map((item) => valueToText(item))
      .filter((item) => item && item.length > 0);
    const unique = Array.from(new Set(parts));
    return unique.join(', ');
  }

  if (isRecord(value)) {
    const preferredKeys = ['value', 'label', 'name', 'title', 'url'];
    for (const key of preferredKeys) {
      if (key in value && value[key] != null) {
        const text = valueToText(value[key]);
        if (text) {
          return text;
        }
      }
    }
    return truncate(JSON.stringify(value), 120);
  }

  return '';
}

function shortenAddress(
  address?: string | null,
  length: number = 4,
): string | undefined {
  if (!address || address.length < length * 2 + 2) {
    return address ?? undefined;
  }
  return `${address.slice(0, length + 2)}...${address.slice(-length)}`;
}

function extractArray<T = string>(value: unknown): T[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value as T[];
}

function buildProposalHighlights(
  items: Array<{ key: string; value: unknown }>,
): ShareHighlight[] {
  const highlights: ShareHighlight[] = [];
  const preferredKeys = [
    'tagline',
    'mainDescription',
    'categories',
    'appUrl',
    'websites',
  ];

  const usedKeys = new Set<string>();

  for (const key of preferredKeys) {
    const item = items.find((entry) => entry.key === key);
    if (!item) continue;
    const valueText = valueToText(item.value);
    if (valueText) {
      highlights.push({ label: formatReadableKey(key), value: valueText });
      usedKeys.add(key);
    }
  }

  if (highlights.length < 3) {
    for (const item of items) {
      if (usedKeys.has(item.key)) {
        continue;
      }
      const valueText = valueToText(item.value);
      if (!valueText) {
        continue;
      }
      highlights.push({
        label: formatReadableKey(item.key),
        value: valueText,
      });
      usedKeys.add(item.key);
      if (highlights.length >= 4) {
        break;
      }
    }
  }

  return highlights.slice(0, 4);
}

function buildProposalDescription(options: {
  byline?: string;
  summary?: string;
  categories?: string[];
}): string | undefined {
  const segments: string[] = [];
  if (options.byline) {
    segments.push(options.byline);
  }
  if (options.summary) {
    segments.push(options.summary);
  }
  if (options.categories && options.categories.length > 0) {
    segments.push(`Focus: ${options.categories.slice(0, 3).join(', ')}`);
  }

  if (segments.length === 0) {
    return undefined;
  }

  return truncate(segments.join(' · '), 220);
}

async function fetchProposal(entityId: string): Promise<ProposalRecord | null> {
  const numericId = Number(entityId);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return null;
  }

  const proposal = await db.query.proposals.findFirst({
    where: eq(proposals.id, numericId),
    columns: {
      id: true,
      projectId: true,
      createdAt: true,
      items: true,
      refs: true,
    },
    with: {
      project: {
        columns: {
          id: true,
          name: true,
          tagline: true,
          categories: true,
          logoUrl: true,
          isPublished: true,
          updatedAt: true,
        },
      },
      creator: {
        columns: {
          userId: true,
          name: true,
          avatarUrl: true,
          address: true,
        },
      },
    },
  });

  return proposal ?? null;
}

async function fetchItemProposal(
  entityId: string,
): Promise<ItemProposalRecord | null> {
  const numericId = Number(entityId);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return null;
  }

  const itemProposal = await db.query.itemProposals.findFirst({
    where: eq(itemProposals.id, numericId),
    columns: {
      id: true,
      projectId: true,
      key: true,
      value: true,
      ref: true,
      reason: true,
      createdAt: true,
    },
    with: {
      project: {
        columns: {
          id: true,
          name: true,
          tagline: true,
          categories: true,
          logoUrl: true,
          isPublished: true,
          updatedAt: true,
        },
      },
      creator: {
        columns: {
          userId: true,
          name: true,
          avatarUrl: true,
          address: true,
        },
      },
    },
  });

  return itemProposal ?? null;
}

async function resolveProposalContext(
  entityId: string,
): Promise<EntityContext | null> {
  const proposal = await fetchProposal(entityId);
  if (!proposal || !proposal.project) {
    return null;
  }

  const items = Array.isArray(proposal.items)
    ? (proposal.items as Array<{ key: string; value: unknown }>)
    : [];

  const projectCategories = proposal.project.categories ?? [];
  const taglineFromItems = valueToText(
    items.find((item) => item.key === 'tagline')?.value,
  );
  const summaryFromItems = valueToText(
    items.find((item) => item.key === 'mainDescription')?.value,
  );
  const categoriesFromItems = extractArray<string>(
    items.find((item) => item.key === 'categories')?.value,
  );

  const categories =
    categoriesFromItems.length > 0 ? categoriesFromItems : projectCategories;

  const authorName = proposal.creator?.name;
  const authorAddress = proposal.creator?.address;
  const byline = authorName
    ? `Submitted by ${authorName}`
    : authorAddress
      ? `Submitted by ${shortenAddress(authorAddress)}`
      : undefined;

  const highlights = buildProposalHighlights(items);

  const metadata: ShareMetadata = {
    title: `${proposal.project.name} · Proposal`,
    subtitle: taglineFromItems || proposal.project.tagline,
    description: buildProposalDescription({
      byline,
      summary: summaryFromItems,
      categories,
    }),
    badge: 'Proposal',
    project: {
      id: proposal.project.id,
      name: proposal.project.name,
      tagline: proposal.project.tagline,
      categories: proposal.project.categories ?? [],
      logoUrl: proposal.project.logoUrl,
      isPublished: proposal.project.isPublished,
    },
    author: proposal.creator
      ? {
          name: proposal.creator.name,
          address: proposal.creator.address,
          avatarUrl: proposal.creator.avatarUrl,
        }
      : undefined,
    tags: categories,
    highlights,
    timestamp: proposal.createdAt?.toISOString?.(),
  };

  const visibility = proposal.project.isPublished ? 'public' : 'unlisted';
  const targetUrl = `/project/pending/${proposal.project.id}/proposal/${proposal.id}`;
  const imageVersion = String(
    proposal.createdAt?.getTime?.() ??
      proposal.project.updatedAt?.getTime?.() ??
      proposal.id,
  );

  return {
    layout: 'proposal',
    targetUrl,
    visibility,
    parentId: String(proposal.project.id),
    metadata,
    imageVersion,
  };
}

function buildItemProposalDescription(options: {
  reason?: string | null;
  valueText?: string;
  authorName?: string | null;
  authorAddress?: string | null;
}): string | undefined {
  const segments: string[] = [];
  if (options.authorName) {
    segments.push(`Proposed by ${options.authorName}`);
  } else if (options.authorAddress) {
    segments.push(`Proposed by ${shortenAddress(options.authorAddress)}`);
  }
  if (options.reason) {
    segments.push(options.reason);
  }
  if (options.valueText) {
    segments.push(`Suggested update: ${options.valueText}`);
  }

  if (segments.length === 0) {
    return undefined;
  }

  return truncate(segments.join(' · '), 220);
}

async function resolveItemProposalContext(
  entityId: string,
): Promise<EntityContext | null> {
  const itemProposal = await fetchItemProposal(entityId);
  if (!itemProposal || !itemProposal.project) {
    return null;
  }

  const rawKey = String(itemProposal.key);
  const itemNameParam = encodeURIComponent(rawKey);
  const label = formatReadableKey(rawKey);
  const valueText = valueToText(itemProposal.value);

  const metadata: ShareMetadata = {
    title: `${itemProposal.project.name} · ${label} Proposal`,
    subtitle: `Item proposal: ${label}`,
    description: buildItemProposalDescription({
      reason:
        typeof itemProposal.reason === 'string'
          ? itemProposal.reason
          : undefined,
      valueText,
      authorName: itemProposal.creator?.name ?? null,
      authorAddress: itemProposal.creator?.address ?? null,
    }),
    badge: 'Item Proposal',
    project: {
      id: itemProposal.project.id,
      name: itemProposal.project.name,
      tagline: itemProposal.project.tagline,
      categories: itemProposal.project.categories ?? [],
      logoUrl: itemProposal.project.logoUrl,
      isPublished: itemProposal.project.isPublished,
    },
    author: itemProposal.creator
      ? {
          name: itemProposal.creator.name,
          address: itemProposal.creator.address,
          avatarUrl: itemProposal.creator.avatarUrl,
        }
      : undefined,
    tags: itemProposal.project.categories ?? [],
    highlights: valueText ? [{ label, value: valueText }] : undefined,
    timestamp: itemProposal.createdAt?.toISOString?.(),
  };

  const visibility = itemProposal.project.isPublished ? 'public' : 'unlisted';
  const targetUrl = `/project/${itemProposal.project.id}?tab=project-data&notificationType=viewSubmission&itemName=${itemNameParam}`;
  const imageVersion = String(
    itemProposal.createdAt?.getTime?.() ??
      itemProposal.project.updatedAt?.getTime?.() ??
      itemProposal.id,
  );

  return {
    layout: 'itemProposal',
    targetUrl,
    visibility,
    parentId: String(itemProposal.project.id),
    metadata,
    imageVersion,
  };
}

async function resolveEntityContext(
  entityType: ShareEntityType,
  entityId: string,
): Promise<EntityContext | null> {
  switch (entityType) {
    case 'proposal':
      return resolveProposalContext(entityId);
    case 'itemProposal':
      return resolveItemProposalContext(entityId);
    default:
      return null;
  }
}
async function maybeRefreshShareLink(
  record: ShareLinkRecord,
  context: EntityContext,
  visibility: ShareVisibility,
): Promise<void> {
  const updates: Partial<ShareLinkInsert> = {};

  if (record.targetUrl !== context.targetUrl) {
    updates.targetUrl = context.targetUrl;
  }

  if (record.visibility !== visibility) {
    updates.visibility = visibility;
  }

  if (context.parentId && record.parentId !== context.parentId) {
    updates.parentId = context.parentId;
  }

  if (Object.keys(updates).length === 0) {
    return;
  }

  await db.update(shareLinks).set(updates).where(eq(shareLinks.id, record.id));
}

async function buildPayloadFromRecord(
  record: ShareLinkRecord,
): Promise<SharePayload | null> {
  const entityType = normalizeEntityType(record.entityType);
  const context = await resolveEntityContext(entityType, record.entityId);

  if (!context) {
    return null;
  }

  const recordVisibility = normalizeVisibility(record.visibility);
  const effectiveVisibility = mergeVisibility(
    recordVisibility,
    context.visibility,
  );

  await maybeRefreshShareLink(record, context, effectiveVisibility);

  return {
    code: record.code,
    entityType,
    entityId: record.entityId,
    sharePath: `/s/${record.code}`,
    targetUrl: context.targetUrl,
    parentId: context.parentId ?? record.parentId ?? null,
    visibility: effectiveVisibility,
    metadata: context.metadata,
    imageVersion: context.imageVersion,
    layout: context.layout,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function isUniqueConstraintError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message || '';
  return (
    message.includes('share_links_code_unique') ||
    message.includes('share_links_entity_unique_idx')
  );
}
export async function ensureShareLink(
  input: CreateShareLinkInput,
): Promise<SharePayload> {
  const entityType = normalizeEntityType(input.entityType);
  const entityId = String(input.entityId);

  const existing = await db.query.shareLinks.findFirst({
    where: and(
      eq(shareLinks.entityType, entityType),
      eq(shareLinks.entityId, entityId),
    ),
  });

  if (existing) {
    const payload = await buildPayloadFromRecord(existing);
    if (!payload) {
      throw new ShareServiceError('Share payload unavailable', 404);
    }
    return payload;
  }

  const context = await resolveEntityContext(entityType, entityId);
  if (!context) {
    throw new ShareServiceError('Share entity not found or not shareable', 404);
  }

  const requestedVisibility = input.visibility
    ? normalizeVisibility(input.visibility)
    : undefined;
  const visibility = requestedVisibility
    ? mergeVisibility(requestedVisibility, context.visibility)
    : context.visibility;

  const parentId =
    input.parentId != null
      ? String(input.parentId)
      : (context.parentId ?? null);

  const code = await generateUniqueShortCode(async (candidate) => {
    const existingCode = await db.query.shareLinks.findFirst({
      where: eq(shareLinks.code, candidate),
      columns: { id: true },
    });
    return !!existingCode;
  });

  try {
    const [created] = await db
      .insert(shareLinks)
      .values({
        code,
        entityType,
        entityId,
        parentId,
        targetUrl: context.targetUrl,
        visibility,
        createdBy: input.createdBy ?? null,
      })
      .returning();

    if (!created) {
      throw new ShareServiceError('Failed to create share link', 500);
    }

    const payload = await buildPayloadFromRecord(created);
    if (!payload) {
      throw new ShareServiceError('Share payload unavailable', 404);
    }
    return payload;
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      const fallback = await db.query.shareLinks.findFirst({
        where: and(
          eq(shareLinks.entityType, entityType),
          eq(shareLinks.entityId, entityId),
        ),
      });
      if (fallback) {
        const payload = await buildPayloadFromRecord(fallback);
        if (payload) {
          return payload;
        }
      }
    }

    console.error('Failed to ensure share link:', error);
    throw error instanceof ShareServiceError
      ? error
      : new ShareServiceError('Failed to create share link', 500);
  }
}

export async function getSharePayload(
  code: string,
): Promise<SharePayload | null> {
  if (!code) {
    return null;
  }

  const record = await db.query.shareLinks.findFirst({
    where: eq(shareLinks.code, code),
  });

  if (!record) {
    return null;
  }

  return buildPayloadFromRecord(record);
}

export async function getSharePayloadByEntity(
  entityType: ShareEntityType,
  entityId: number | string,
): Promise<SharePayload | null> {
  const normalizedType = normalizeEntityType(entityType);
  const normalizedId = String(entityId);

  const record = await db.query.shareLinks.findFirst({
    where: and(
      eq(shareLinks.entityType, normalizedType),
      eq(shareLinks.entityId, normalizedId),
    ),
  });

  if (!record) {
    return null;
  }

  return buildPayloadFromRecord(record);
}

export function buildShareUrl(
  code: string,
  origin: string = getAppOrigin(),
): string {
  return buildAbsoluteUrl(`/s/${code}`, origin);
}

export const ShareService = {
  ensureShareLink,
  getSharePayload,
  getSharePayloadByEntity,
  buildShareUrl,
};

export default ShareService;
