import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import { LRUCache } from 'lru-cache';

import { AllItemConfig } from '@/constants/itemConfig';
import { ProjectTableFieldCategory } from '@/constants/tableConfig';
import { ALL_POC_ITEM_MAP, ESSENTIAL_ITEM_QUORUM_SUM } from '@/lib/constants';
import { db } from '@/lib/db';
import {
  itemProposals,
  projectLogs,
  projectSnaps,
  projects,
  proposals,
  shareLinks,
  voteRecords,
} from '@/lib/db/schema';
import { generateUniqueShortCode } from '@/lib/utils/shortCodeUtils';
import { buildAbsoluteUrl, getAppOrigin } from '@/lib/utils/url';
import { IPocItemKey } from '@/types/item';
import ProposalVoteUtils from '@/utils/proposal';

import {
  calculateTransparencyScore,
  extractArray,
  formatInteger,
  formatReadableKey,
  getItemValueFromSnap,
  normalizeItemsTopWeight,
  shortenAddress,
  truncate,
  valueToText,
} from './shareUtils';

type ShareLinkRecord = typeof shareLinks.$inferSelect;

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
    itemsTopWeight: unknown;
    hasProposalKeys: string[];
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
    itemsTopWeight: unknown;
    hasProposalKeys: string[];
  } | null;
  creator: {
    userId: string;
    name: string;
    avatarUrl: string | null;
    address: string;
  } | null;
};

type ProjectRecord = {
  id: number;
  name: string;
  tagline: string;
  categories: string[];
  logoUrl: string;
  isPublished: boolean;
  updatedAt: Date;
  itemsTopWeight: unknown;
  support: number;
};

type ProjectSnapRecord = {
  id: number;
  projectId: number;
  createdAt: Date;
  name: string | null;
  categories: string[] | null;
  items: Array<{ key: string; value: unknown }>;
};

export type ShareEntityType =
  | 'proposal'
  | 'itemProposal'
  | 'project'
  | 'customFilter';
const SUPPORTED_ENTITY_TYPES: ShareEntityType[] = [
  'proposal',
  'itemProposal',
  'project',
  'customFilter',
];

export type ShareVisibility = 'public' | 'unlisted' | 'private';
export type ShareLayout =
  | 'proposal'
  | 'itemProposal'
  | 'project'
  | 'projectPublished'
  | 'projectPending'
  | 'customFilter';

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

export interface ShareBadge {
  label: string;
  tone?: 'neutral' | 'info' | 'success' | 'warning';
}

export interface ShareMetric {
  key: string;
  title: string;
  primary: string;
  secondary?: string;
  unit?: string;
}
export interface ShareItemMetadata {
  key: string;
  category: string;
  rawKey?: string;
  updates?: number;
  submissions?: number;
  weight?: number | string;
  supported?: number;
  initialWeight?: number | string;
  type: 'item' | 'pending' | 'empty';
}
export interface ShareMetadata {
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  project: ShareProjectMetadata;
  item?: ShareItemMetadata;
  author?: ShareAuthorMetadata;
  tags?: string[];
  highlights?: ShareHighlight[];
  timestamp?: string;
  statusBadge?: ShareBadge;
  badges?: ShareBadge[];
  stats?: ShareMetric[];
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
  imageTimestamp: number;
  layout: ShareLayout;
  createdAt: Date;
  updatedAt: Date;
}

const shareLookupCache = new LRUCache<string, Promise<unknown>>({
  max: 512,
  ttl: 1000 * 30,
});

async function getCachedValue<T>(
  key: string,
  loader: () => Promise<T>,
): Promise<T> {
  const cached = shareLookupCache.get(key) as Promise<T> | undefined;
  if (cached) {
    return cached;
  }

  const pending = loader().catch((error) => {
    shareLookupCache.delete(key);
    throw error;
  });

  shareLookupCache.set(key, pending as Promise<unknown>);
  return pending;
}

const PROJECT_FIELD_OVERRIDE_KEYS = [
  'name',
  'tagline',
  'logoUrl',
  'categories',
] as const;
type ProjectFieldOverrideKey = (typeof PROJECT_FIELD_OVERRIDE_KEYS)[number];

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
  imageTimestamp: number;
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

const CUSTOM_FILTER_ENTITY_PREFIX = 'customFilter:';

function normalizeCustomFilterTargetPath(rawPath: string): string {
  const trimmed = (rawPath ?? '').trim();
  if (!trimmed) {
    throw new ShareServiceError('Custom filter target path is required', 400);
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      return `${url.pathname}${url.search}` || '/';
    } catch (error) {
      throw new ShareServiceError('Invalid custom filter target URL', 400);
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

function decodeCustomFilterEntityId(entityId: string): string | null {
  if (!entityId.startsWith(CUSTOM_FILTER_ENTITY_PREFIX)) {
    return null;
  }

  const encoded = entityId.slice(CUSTOM_FILTER_ENTITY_PREFIX.length);
  try {
    const decoded = Buffer.from(encoded, 'base64url').toString('utf-8');
    return normalizeCustomFilterTargetPath(decoded);
  } catch (error) {
    console.error('Failed to decode custom filter entity id', error);
    return null;
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

function resolveImageMeta(
  values: Array<Date | number | string | null | undefined>,
): { version: string; timestamp: number } {
  const numericValues = values
    .map((value) => {
      if (value == null) {
        return 0;
      }
      if (value instanceof Date) {
        return value.getTime();
      }
      const coerced =
        typeof value === 'number'
          ? value
          : typeof value === 'string'
            ? Number(value)
            : Number.NaN;
      if (!Number.isNaN(coerced)) {
        return coerced;
      }
      const parsed = new Date(String(value)).getTime();
      return Number.isNaN(parsed) ? 0 : parsed;
    })
    .filter((value) => Number.isFinite(value) && value > 0);

  const timestamp = numericValues.length
    ? Math.max(...numericValues)
    : Date.now();

  return {
    version: String(timestamp),
    timestamp,
  };
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

  return getCachedValue(`proposal:${numericId}`, async () => {
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
            itemsTopWeight: true,
            hasProposalKeys: true,
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
  });
}

async function fetchItemProposal(
  entityId: string,
): Promise<ItemProposalRecord | null> {
  const numericId = Number(entityId);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return null;
  }

  return getCachedValue(`itemProposal:${numericId}`, async () => {
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
            itemsTopWeight: true,
            hasProposalKeys: true,
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
  });
}

async function fetchProjectRecord(
  entityId: string,
): Promise<ProjectRecord | null> {
  const numericId = Number(entityId);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return null;
  }

  return getCachedValue(`project:${numericId}`, async () => {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, numericId),
      columns: {
        id: true,
        name: true,
        tagline: true,
        categories: true,
        logoUrl: true,
        isPublished: true,
        updatedAt: true,
        itemsTopWeight: true,
        support: true,
      },
    });

    return project ?? null;
  });
}

async function fetchLatestProjectSnap(
  projectId: number,
): Promise<ProjectSnapRecord | null> {
  return getCachedValue(`projectSnap:${projectId}`, async () => {
    const snap = await db.query.projectSnaps.findFirst({
      where: eq(projectSnaps.projectId, projectId),
      columns: {
        id: true,
        projectId: true,
        createdAt: true,
        name: true,
        categories: true,
        items: true,
      },
      orderBy: (table) => [desc(table.createdAt)],
    });

    if (!snap) {
      return null;
    }

    return {
      ...snap,
      items: Array.isArray(snap.items)
        ? (snap.items as Array<{ key: string; value: unknown }>)
        : [],
    };
  });
}

async function resolveProposalContext(
  entityId: string,
): Promise<EntityContext | null> {
  const proposal = await fetchProposal(entityId);
  if (!proposal || !proposal.project) {
    return null;
  }

  const [projectVotes, projectProposals] = await Promise.all([
    db.query.voteRecords.findMany({
      where: eq(voteRecords.projectId, proposal.projectId),
      columns: {
        id: true,
        createdAt: true,
        proposalId: true,
        key: true,
        weight: true,
        projectId: true,
      },
      with: {
        creator: {
          columns: {
            userId: true,
            name: true,
            avatarUrl: true,
            address: true,
          },
        },
      },
    }),
    db.query.proposals.findMany({
      where: eq(proposals.projectId, proposal.projectId),
      columns: {
        id: true,
        createdAt: true,
      },
      orderBy: () => [asc(proposals.createdAt), asc(proposals.id)],
    }),
  ]);

  const votesForProposal = projectVotes.filter(
    (vote) => vote.proposalId === proposal.id,
  );

  const proposalVoteResult = ProposalVoteUtils.getVoteResultOfProposal({
    proposalId: proposal.id,
    votesOfProposal: votesForProposal as any,
  });

  const projectVoteResult = ProposalVoteUtils.getVoteResultOfProject({
    projectId: proposal.projectId,
    votesOfProject: projectVotes as any,
    proposals: projectProposals as any,
  });

  const proposalIndex = projectProposals.findIndex(
    (item) => item.id === proposal.id,
  );
  const proposalNumber = proposalIndex >= 0 ? proposalIndex + 1 : 1;

  const isLeading =
    projectVoteResult.leadingProposalId === proposal.id &&
    proposalVoteResult.percentageOfProposal > 0;
  const isWinner =
    isLeading && projectVoteResult.leadingProposalResult?.isProposalValidated;

  const statusBadge: ShareBadge = proposal.project.isPublished
    ? { label: 'Published Project', tone: 'success' }
    : { label: 'Pending Project', tone: 'info' };

  const badges: ShareBadge[] = [
    {
      label: `Proposal #${proposalNumber}`,
      tone: 'neutral',
    },
  ];

  if (isLeading || isWinner) {
    badges.push({
      label: isWinner ? 'Winning Proposal' : 'Leading Proposal',
      tone: isWinner ? 'success' : 'info',
    });
  }

  const stats: ShareMetric[] = [
    {
      key: 'progress',
      title: 'Progress',
      primary: proposalVoteResult.formattedPercentageOfProposal,
    },
    {
      key: 'support',
      title: 'Total Support',
      primary: formatInteger(proposalVoteResult.totalSupportedPointsOfProposal),
    },
    {
      key: 'participation',
      title: 'Minimum Participation',
      primary: `${proposalVoteResult.totalValidQuorumOfProposal} / ${ESSENTIAL_ITEM_QUORUM_SUM}`,
    },
  ];

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
    statusBadge,
    badges,
    stats,
  };

  const visibility = proposal.project.isPublished ? 'public' : 'unlisted';
  const targetUrl = `/project/pending/${proposal.project.id}/proposal/${proposal.id}`;
  const latestVoteTimestamp =
    proposalVoteResult.latestVotingEndedAt?.getTime?.() ?? 0;
  const imageMeta = resolveImageMeta([
    proposal.createdAt,
    proposal.project.updatedAt,
    latestVoteTimestamp,
  ]);

  return {
    layout: 'proposal',
    targetUrl,
    visibility,
    parentId: String(proposal.project.id),
    metadata,
    imageVersion: imageMeta.version,
    imageTimestamp: imageMeta.timestamp,
  };
}

function buildItemProposalDescription(options: {
  reason?: string | null;
  valueText?: string;
  authorName?: string | null;
  authorAddress?: string | null;
  projectTagline?: string | null;
  projectCategories?: string[];
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
  if (options.projectTagline) {
    segments.push(options.projectTagline);
  }
  if (options.projectCategories && options.projectCategories.length > 0) {
    segments.push(`Focus: ${options.projectCategories.slice(0, 3).join(', ')}`);
  }

  if (segments.length === 0) {
    return undefined;
  }

  return truncate(segments.join(' · '), 220);
}

function resolveItemCategoryLabels(key: string): {
  category: string;
  item: string;
} {
  const typedKey = key as IPocItemKey;
  const config = AllItemConfig[typedKey];
  const itemLabel = config?.label ?? formatReadableKey(key);

  if (config) {
    const categoryConfig = ProjectTableFieldCategory.find(
      (category) => category.key === config.category,
    );

    const categoryLabel =
      categoryConfig?.label ??
      categoryConfig?.title ??
      formatReadableKey(String(config.category));

    return {
      category: categoryLabel,
      item: itemLabel,
    };
  }

  return {
    category: 'Item',
    item: formatReadableKey(key),
  };
}

function extractMediaUrl(value: unknown): string | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (typeof record.url === 'string') {
      return record.url;
    }
    if (typeof record.value === 'string') {
      return record.value;
    }
  }

  return undefined;
}

function extractCategories(value: unknown): string[] {
  if (Array.isArray(value)) {
    return Array.from(
      new Set(
        value
          .map((entry) => {
            if (!entry) return null;
            if (typeof entry === 'string') {
              return entry.trim();
            }
            if (typeof entry === 'object') {
              const record = entry as Record<string, unknown>;
              const candidate =
                record.label ?? record.name ?? record.value ?? record.title;
              if (
                typeof candidate === 'string' &&
                candidate.trim().length > 0
              ) {
                return candidate.trim();
              }
            }
            return null;
          })
          .filter((item): item is string => Boolean(item)),
      ),
    );
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  return [];
}

interface ProjectSnapshotBaseFields {
  baseName: string;
  baseTagline: string;
  baseLogo?: string;
  baseCategories: string[];
  summaryFromSnap: string;
}

function buildProjectSnapshotBaseFields(
  project: ProjectRecord,
  snap: ProjectSnapRecord | null,
): ProjectSnapshotBaseFields {
  const snapItems = snap?.items ?? [];
  const snapItemValueMap = new Map<string, unknown>(
    snapItems.map((item) => [item.key, item.value]),
  );
  const getSnapValue = (key: string): unknown => {
    return snapItemValueMap.has(key) ? snapItemValueMap.get(key) : undefined;
  };

  const nameFromSnap = valueToText(getSnapValue('name'));
  const taglineFromSnap = valueToText(getSnapValue('tagline'));
  const logoFromSnap = extractMediaUrl(getSnapValue('logoUrl'));
  const categoriesFromSnapItems = extractCategories(getSnapValue('categories'));
  const categoriesFromProject = Array.isArray(project.categories)
    ? project.categories
    : [];
  const categoriesFromSnapMeta = Array.isArray(snap?.categories)
    ? (snap.categories as string[])
    : [];

  const baseName = nameFromSnap || project.name || '';
  const baseTagline = taglineFromSnap || project.tagline || '';
  const baseLogo = logoFromSnap || project.logoUrl || undefined;
  const baseCategories =
    categoriesFromSnapItems.length > 0
      ? categoriesFromSnapItems
      : categoriesFromProject.length > 0
        ? categoriesFromProject
        : categoriesFromSnapMeta;

  const summaryFromSnap = getItemValueFromSnap(snapItems, 'mainDescription');

  return {
    baseName,
    baseTagline,
    baseLogo,
    baseCategories,
    summaryFromSnap,
  };
}

function applyProjectOverridesFromItem(
  metadata: ShareMetadata,
  options: {
    rawKey: string;
    valueText?: string;
    rawValue: unknown;
    displayLabel?: string;
    isPrimaryKey?: boolean;
    context?: 'item' | 'project';
  },
): void {
  const projectMeta = metadata.project;
  if (!projectMeta) {
    return;
  }

  const isPrimary = options.isPrimaryKey ?? false;
  const displayLabel =
    options.displayLabel ??
    projectMeta.name ??
    formatReadableKey(options.rawKey);
  const context = options.context ?? 'item';

  switch (options.rawKey) {
    case 'name': {
      if (options.valueText && options.valueText.length > 0) {
        projectMeta.name = options.valueText;
        if (context === 'item' && isPrimary) {
          metadata.title = `Item Proposal · ${displayLabel} · ${projectMeta.name}`;
        }
        if (context === 'project') {
          metadata.title = projectMeta.name;
        }
      }
      break;
    }
    case 'tagline': {
      if (options.valueText && options.valueText.length > 0) {
        projectMeta.tagline = options.valueText;
        if (isPrimary || !metadata.subtitle || context === 'project') {
          metadata.subtitle = options.valueText;
        }
        if (isPrimary || !metadata.description || context === 'project') {
          metadata.description = options.valueText;
        }
      }
      break;
    }
    case 'logoUrl': {
      const mediaUrl = extractMediaUrl(options.rawValue);
      if (mediaUrl) {
        projectMeta.logoUrl = mediaUrl;
      }
      break;
    }
    case 'categories': {
      const categories = extractCategories(options.rawValue);
      if (categories.length > 0) {
        projectMeta.categories = categories.slice(0, 6);
        metadata.tags = categories.slice(0, 6);
      }
      break;
    }
    default:
      break;
  }
}

interface ProjectFieldOverride {
  key: ProjectFieldOverrideKey;
  valueText?: string;
  rawValue: unknown;
  displayLabel: string;
  createdAt: Date | null;
  isNotLeading: boolean;
}

type ProjectFieldCandidateSource = 'leading' | 'project' | 'submission';

interface ProjectFieldCandidate {
  id: number | null;
  source: ProjectFieldCandidateSource | null;
}

async function fetchLatestCandidatesForKeysBatch(
  projectId: number,
  keys: readonly string[],
): Promise<Map<string, ProjectFieldCandidate>> {
  if (!keys.length) {
    return new Map();
  }

  const keyList = sql.join(
    Array.from(keys).map((key) => sql`${key}`),
    sql`, `,
  );

  const rows = (await db.execute(
    sql`
      SELECT DISTINCT ON (src.key)
        src.key AS key,
        src.item_proposal_id AS item_proposal_id,
        src.origin AS origin
      FROM (
        SELECT
          pl.key,
          pl.item_proposal_id,
          1 AS priority,
          pl.created_at,
          'leading'::text AS origin
        FROM ${projectLogs} AS pl
        WHERE pl.project_id = ${projectId}
          AND pl.is_not_leading = false
          AND pl.key IN (${keyList})

        UNION ALL

        SELECT
          pl.key,
          pl.item_proposal_id,
          2 AS priority,
          pl.created_at,
          'project'::text AS origin
        FROM ${projectLogs} AS pl
        WHERE pl.project_id = ${projectId}
          AND pl.key IN (${keyList})

        UNION ALL

        SELECT
          ip.key,
          ip.id AS item_proposal_id,
          3 AS priority,
          ip.created_at,
          'submission'::text AS origin
        FROM ${itemProposals} AS ip
        WHERE ip.project_id = ${projectId}
          AND ip.key IN (${keyList})
      ) AS src
      WHERE src.item_proposal_id IS NOT NULL
      ORDER BY src.key, src.priority, src.created_at DESC;
    `,
  )) as Array<{
    key: string | null;
    item_proposal_id: number | string | null;
    origin: string | null;
  }>;

  const result = new Map<string, ProjectFieldCandidate>();

  for (const row of rows) {
    if (!row?.key) {
      continue;
    }

    const idValue =
      typeof row.item_proposal_id === 'number'
        ? row.item_proposal_id
        : row.item_proposal_id != null
          ? Number(row.item_proposal_id)
          : null;

    const origin =
      row.origin === 'leading' ||
      row.origin === 'project' ||
      row.origin === 'submission'
        ? row.origin
        : null;

    const numericId =
      typeof idValue === 'number' && Number.isFinite(idValue) ? idValue : null;

    result.set(row.key, {
      id: numericId,
      source: origin,
    });
  }

  for (const key of keys) {
    if (!result.has(key)) {
      result.set(key, { id: null, source: null });
    }
  }

  return result;
}

interface ItemProposalSnapshot {
  id: number;
  key: string;
  value: unknown;
  createdAt: Date | null;
}

async function resolveItemProposalsContextBatch(
  ids: readonly number[],
): Promise<Map<number, ItemProposalSnapshot>> {
  if (!ids.length) {
    return new Map();
  }

  const rows = await db.query.itemProposals.findMany({
    where: inArray(itemProposals.id, ids as number[]),
    columns: {
      id: true,
      key: true,
      value: true,
      createdAt: true,
    },
  });

  const snapshots = new Map<number, ItemProposalSnapshot>();
  for (const row of rows) {
    snapshots.set(row.id, {
      id: row.id,
      key: row.key,
      value: row.value,
      createdAt: row.createdAt ?? null,
    });
  }

  return snapshots;
}

interface ProjectShareAggregates {
  proposalCount: number;
  uniqueContributors: number;
  voteSupporterCount: number;
  voteTotalWeight: number;
  latestVoteAt: Date | null;
}

async function fetchProjectShareAggregates(
  projectId: number,
): Promise<ProjectShareAggregates> {
  return getCachedValue(`projectShareAggregates:${projectId}`, async () => {
    const rows = (await db.execute(
      sql`
      WITH proposal_creators AS (
        SELECT p.creator
        FROM ${proposals} AS p
        WHERE p.project_id = ${projectId}
      ),
      item_proposal_creators AS (
        SELECT ip.creator
        FROM ${itemProposals} AS ip
        WHERE ip.project_id = ${projectId}
      ),
      vote_creators AS (
        SELECT v.creator, v.weight, v.created_at
        FROM ${voteRecords} AS v
        WHERE v.project_id = ${projectId}
      ),
      combined_creators AS (
        SELECT creator FROM proposal_creators
        UNION
        SELECT creator FROM item_proposal_creators
        UNION
        SELECT creator FROM vote_creators
      )
        SELECT
          (SELECT COUNT(*)::int FROM ${proposals} AS p2 WHERE p2.project_id = ${projectId}) AS proposal_count,
          (SELECT COUNT(DISTINCT creator)::int FROM combined_creators WHERE creator IS NOT NULL) AS unique_contributors,
          (SELECT COUNT(DISTINCT creator)::int FROM vote_creators WHERE creator IS NOT NULL) AS vote_supporter_count,
          COALESCE((SELECT SUM(weight) FROM vote_creators), 0)::float AS vote_total_weight,
          (SELECT MAX(created_at) FROM vote_creators) AS latest_vote_at;
      `,
    )) as Array<{
      proposal_count: number | string | null;
      unique_contributors: number | string | null;
      vote_supporter_count: number | string | null;
      vote_total_weight: number | string | null;
      latest_vote_at: Date | string | null;
    }>;

    const record = rows[0] ?? null;

    return {
      proposalCount:
        record?.proposal_count != null ? Number(record.proposal_count) : 0,
      uniqueContributors:
        record?.unique_contributors != null
          ? Number(record.unique_contributors)
          : 0,
      voteSupporterCount:
        record?.vote_supporter_count != null
          ? Number(record.vote_supporter_count)
          : 0,
      voteTotalWeight:
        record?.vote_total_weight != null
          ? Number(record.vote_total_weight)
          : 0,
      latestVoteAt:
        record?.latest_vote_at instanceof Date
          ? record.latest_vote_at
          : record?.latest_vote_at
            ? new Date(record.latest_vote_at)
            : null,
    };
  });
}

async function fetchProjectFieldOverrides(
  projectId: number,
): Promise<ProjectFieldOverride[]> {
  return getCachedValue(`projectFieldOverrides:${projectId}`, async () => {
    const keys = PROJECT_FIELD_OVERRIDE_KEYS as readonly string[];
    const candidateMap = await fetchLatestCandidatesForKeysBatch(
      projectId,
      keys,
    );

    const candidateIds = Array.from(
      new Set(
        Array.from(candidateMap.values())
          .map((entry) => (entry?.id != null ? Number(entry.id) : null))
          .filter(
            (entry): entry is number =>
              typeof entry === 'number' && Number.isFinite(entry),
          ),
      ),
    );

    if (candidateIds.length === 0) {
      return [];
    }

    const snapshots = await resolveItemProposalsContextBatch(candidateIds);

    const overrides: ProjectFieldOverride[] = [];

    for (const key of PROJECT_FIELD_OVERRIDE_KEYS) {
      const selection = candidateMap.get(key);
      if (!selection?.id) {
        continue;
      }

      const snapshot = snapshots.get(selection.id);
      if (!snapshot || snapshot.key !== key) {
        continue;
      }

      const rawValue = snapshot.value ?? null;
      const textValue = valueToText(rawValue);

      overrides.push({
        key,
        valueText: textValue && textValue.length > 0 ? textValue : undefined,
        rawValue,
        displayLabel: formatReadableKey(key),
        createdAt: snapshot.createdAt,
        isNotLeading: selection.source !== 'leading',
      });
    }

    return overrides;
  });
}

async function resolveItemProposalContext(
  entityId: string,
): Promise<EntityContext | null> {
  return getCachedValue(`itemProposalContext:${entityId}`, async () => {
    const aggregateParams = parseItemAggregateEntityId(entityId);
    if (aggregateParams) {
      return resolveItemAggregateContext(aggregateParams);
    }

    const emptyParams = parseEmptyItemEntityId(entityId);
    if (emptyParams) {
      return resolveEmptyItemContext(emptyParams);
    }

    const itemProposal = await fetchItemProposal(entityId);
    if (!itemProposal || !itemProposal.project) {
      return null;
    }

    const rawKey = String(itemProposal.key);
    const itemNameParam = encodeURIComponent(rawKey);
    const { category: categoryLabel, item: itemDisplayName } =
      resolveItemCategoryLabels(rawKey);
    const fallbackLabel = formatReadableKey(rawKey);
    const displayLabel = itemDisplayName || fallbackLabel;
    const valueText = valueToText(itemProposal.value);
    const projectCategories = itemProposal.project.categories ?? [];
    const normalizedItemsTopWeight = normalizeItemsTopWeight(
      itemProposal.project.itemsTopWeight,
    );
    const itemWeightNumber = Number(normalizedItemsTopWeight[rawKey] ?? 0);
    const typedKey = rawKey as IPocItemKey;
    const baseWeight = ALL_POC_ITEM_MAP[typedKey]?.weight ?? 0;

    const [
      updatesCount,
      submissionsCount,
      latestProjectLog,
      latestValidatedLog,
      voteAggregate,
      latestOwnLog,
      projectFieldOverrides,
    ] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(projectLogs)
        .where(
          and(
            eq(projectLogs.projectId, itemProposal.projectId),
            eq(projectLogs.key, rawKey),
            eq(projectLogs.isNotLeading, false),
          ),
        )
        .then((rows) => rows[0]?.count ?? 0),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(itemProposals)
        .where(
          and(
            eq(itemProposals.projectId, itemProposal.projectId),
            eq(itemProposals.key, rawKey),
          ),
        )
        .then((rows) => rows[0]?.count ?? 0),
      db.query.projectLogs.findFirst({
        where: and(
          eq(projectLogs.projectId, itemProposal.projectId),
          eq(projectLogs.key, rawKey),
        ),
        orderBy: (logs, { desc }) => [desc(logs.createdAt)],
      }),
      db.query.projectLogs.findFirst({
        where: and(
          eq(projectLogs.projectId, itemProposal.projectId),
          eq(projectLogs.key, rawKey),
          eq(projectLogs.isNotLeading, false),
        ),
        orderBy: (logs, { desc }) => [desc(logs.createdAt)],
      }),
      db
        .select({
          totalWeight: sql<number>`COALESCE(sum(${voteRecords.weight}), 0)`,
          supporterCount: sql<number>`count(distinct ${voteRecords.creator})::int`,
          latestVoteAt: sql<Date | null>`max(${voteRecords.createdAt})`,
        })
        .from(voteRecords)
        .where(
          and(
            eq(voteRecords.projectId, itemProposal.projectId),
            eq(voteRecords.key, rawKey),
            eq(voteRecords.itemProposalId, itemProposal.id),
          ),
        )
        .then((rows) => rows[0] ?? null),
      db.query.projectLogs.findFirst({
        where: and(
          eq(projectLogs.projectId, itemProposal.projectId),
          eq(projectLogs.itemProposalId, itemProposal.id),
        ),
        orderBy: (logs, { desc }) => [desc(logs.createdAt)],
      }),
      fetchProjectFieldOverrides(itemProposal.project.id),
    ]);

    const latestLogTimestamp = latestProjectLog?.createdAt?.getTime?.() ?? 0;
    const latestValidatedTimestamp =
      latestValidatedLog?.createdAt?.getTime?.() ?? 0;
    const voteSupporterCount = voteAggregate?.supporterCount ?? 0;
    const totalVoteWeight = Number(voteAggregate?.totalWeight ?? 0);
    const latestVoteAt = voteAggregate?.latestVoteAt ?? null;
    const latestVoteTimestamp =
      latestVoteAt instanceof Date ? (latestVoteAt.getTime?.() ?? 0) : 0;
    const imageMeta = resolveImageMeta([
      itemProposal.createdAt,
      itemProposal.project.updatedAt,
      latestProjectLog?.createdAt ?? latestLogTimestamp,
      latestValidatedLog?.createdAt ?? latestValidatedTimestamp,
      latestVoteAt,
      itemProposal.id,
      latestOwnLog?.createdAt,
      ...projectFieldOverrides
        .map((override) => override.createdAt)
        .filter(Boolean),
    ]);

    const primarySummary =
      valueText && valueText.length > 0
        ? truncate(valueText, 160)
        : typeof itemProposal.reason === 'string' && itemProposal.reason
          ? truncate(itemProposal.reason, 160)
          : itemProposal.project.tagline
            ? truncate(itemProposal.project.tagline, 160)
            : undefined;

    const hasAnySubmission = submissionsCount > 0;

    const latestOwnLogIsNotLeading = latestOwnLog?.isNotLeading ?? null;
    const hasEverBeenLeading = Boolean(latestOwnLog);
    const isCurrentlyLeading =
      hasEverBeenLeading && latestOwnLogIsNotLeading === false;

    let itemType: ShareItemMetadata['type'];
    if (isCurrentlyLeading) {
      itemType = 'item';
    } else if (!hasAnySubmission) {
      itemType = 'empty';
    } else {
      itemType = 'pending';
    }

    const itemMetadata: ShareItemMetadata = {
      key: displayLabel,
      rawKey: rawKey,
      category: categoryLabel,
      type: itemType,
    };

    if (itemType === 'item') {
      itemMetadata.updates = updatesCount;
      itemMetadata.submissions = submissionsCount;
      itemMetadata.weight = formatInteger(itemWeightNumber);
    } else if (itemType === 'pending') {
      itemMetadata.supported = voteSupporterCount;
      itemMetadata.weight = formatInteger(totalVoteWeight);
    } else {
      itemMetadata.initialWeight = formatInteger(baseWeight);
    }

    let statusBadge: ShareBadge | undefined;

    if (isCurrentlyLeading) {
      statusBadge = { label: 'Leading Proposal', tone: 'success' };
    } else if (!hasAnySubmission) {
      statusBadge = { label: 'Empty Item', tone: 'info' };
    } else {
      statusBadge = { label: 'Pending Validation', tone: 'info' };
    }

    const metadata: ShareMetadata = {
      title: `Item Proposal · ${displayLabel} · ${itemProposal.project.name}`,
      subtitle: primarySummary || `Item proposal: ${displayLabel}`,
      description: buildItemProposalDescription({
        reason:
          typeof itemProposal.reason === 'string'
            ? itemProposal.reason
            : undefined,
        valueText,
        authorName: itemProposal.creator?.name ?? null,
        authorAddress: itemProposal.creator?.address ?? null,
        projectTagline: itemProposal.project.tagline,
        projectCategories,
      }),
      badge: 'Item Proposal',
      project: {
        id: itemProposal.project.id,
        name: itemProposal.project.name,
        tagline: itemProposal.project.tagline,
        categories: projectCategories,
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
      tags: projectCategories,
      highlights: valueText
        ? [{ label: displayLabel, value: valueText }]
        : undefined,
      item: itemMetadata,
      timestamp: itemProposal.createdAt?.toISOString?.(),
      statusBadge,
      badges: statusBadge ? [statusBadge] : undefined,
    };

    if (isCurrentlyLeading) {
      applyProjectOverridesFromItem(metadata, {
        rawKey,
        valueText,
        rawValue: itemProposal.value,
        displayLabel,
        isPrimaryKey: true,
        context: 'item',
      });
    }

    for (const override of projectFieldOverrides) {
      applyProjectOverridesFromItem(metadata, {
        rawKey: override.key,
        valueText: override.valueText,
        rawValue: override.rawValue,
        displayLabel: override.displayLabel,
        isPrimaryKey: override.key === rawKey,
        context: 'item',
      });
    }

    metadata.title = `Item Proposal · ${displayLabel} · ${metadata.project.name}`;
    metadata.tags = (metadata.project.categories ?? []).slice(0, 6);

    const visibility = itemProposal.project.isPublished ? 'public' : 'unlisted';
    const targetUrl = `/project/${itemProposal.project.id}?tab=profile&notificationType=viewSubmission&itemName=${itemNameParam}`;

    return {
      layout: 'itemProposal',
      targetUrl,
      visibility,
      parentId: String(itemProposal.project.id),
      metadata,
      imageVersion: imageMeta.version,
      imageTimestamp: imageMeta.timestamp,
    };
  });
}

function parseItemAggregateEntityId(
  entityId: string,
): { projectId: number; itemKey: string } | null {
  if (!entityId.startsWith('item:')) {
    return null;
  }

  const segments = entityId.split(':');
  if (segments.length < 3) {
    return null;
  }

  const projectId = Number(segments[1]);
  if (!Number.isInteger(projectId) || projectId <= 0) {
    return null;
  }

  const encodedKey = segments.slice(2).join(':');
  const decodedKey = decodeURIComponent(encodedKey);
  if (!decodedKey) {
    return null;
  }

  return {
    projectId,
    itemKey: decodedKey,
  };
}

function parseEmptyItemEntityId(
  entityId: string,
): { projectId: number; itemKey: string } | null {
  if (!entityId.startsWith('empty:')) {
    return null;
  }

  const segments = entityId.split(':');
  if (segments.length < 3) {
    return null;
  }

  const projectId = Number(segments[1]);
  if (!Number.isInteger(projectId) || projectId <= 0) {
    return null;
  }

  const encodedKey = segments.slice(2).join(':');
  const decodedKey = decodeURIComponent(encodedKey);
  if (!decodedKey) {
    return null;
  }

  return {
    projectId,
    itemKey: decodedKey,
  };
}

async function resolveEmptyItemContext({
  projectId,
  itemKey,
}: {
  projectId: number;
  itemKey: string;
}): Promise<EntityContext | null> {
  const project = await fetchProjectRecord(String(projectId));
  if (!project) {
    return null;
  }

  const rawKey = String(itemKey);
  const encodedKey = encodeURIComponent(rawKey);
  const { category: categoryLabel, item: itemDisplayName } =
    resolveItemCategoryLabels(rawKey);
  const fallbackLabel = formatReadableKey(rawKey);
  const displayLabel = itemDisplayName || fallbackLabel;
  const projectCategories = project.categories ?? [];
  const typedKey = rawKey as IPocItemKey;
  const baseWeight = ALL_POC_ITEM_MAP[typedKey]?.weight ?? 0;
  const formattedWeight = formatInteger(baseWeight);

  const metadata: ShareMetadata = {
    title: `Item Proposal · ${displayLabel} · ${project.name}`,
    subtitle: project.tagline
      ? truncate(project.tagline, 160)
      : 'This item does not have submissions yet.',
    description: `Help kick-start the "${displayLabel}" item by submitting the first proposal. Starting weight: ${formattedWeight}.`,
    badge: 'Item Proposal',
    statusBadge: { label: 'Empty Item', tone: 'info' },
    badges: [{ label: 'Empty Item', tone: 'info' }],
    project: {
      id: project.id,
      name: project.name,
      tagline: project.tagline,
      categories: projectCategories,
      logoUrl: project.logoUrl,
      isPublished: project.isPublished,
    },
    tags: projectCategories,
    item: {
      key: displayLabel,
      rawKey,
      category: categoryLabel,
      type: 'empty',
      initialWeight: formattedWeight,
    },
  };

  const overrides = await fetchProjectFieldOverrides(project.id);
  for (const override of overrides) {
    applyProjectOverridesFromItem(metadata, {
      rawKey: override.key,
      valueText: override.valueText,
      rawValue: override.rawValue,
      displayLabel: override.displayLabel,
      isPrimaryKey: override.key === rawKey,
      context: 'item',
    });
  }

  metadata.title = `Item Proposal · ${displayLabel} · ${metadata.project.name}`;
  metadata.tags = (metadata.project.categories ?? []).slice(0, 6);

  const visibility = project.isPublished ? 'public' : 'unlisted';
  const targetUrl = `/project/${project.id}?tab=profile&notificationType=viewSubmission&itemName=${encodedKey}`;
  const imageMeta = resolveImageMeta([
    project.updatedAt,
    project.id,
    ...overrides.map((override) => override.createdAt).filter(Boolean),
  ]);

  return {
    layout: 'itemProposal',
    targetUrl,
    visibility,
    parentId: String(project.id),
    metadata,
    imageVersion: imageMeta.version,
    imageTimestamp: imageMeta.timestamp,
  };
}

async function resolveItemAggregateContext({
  projectId,
  itemKey,
}: {
  projectId: number;
  itemKey: string;
}): Promise<EntityContext | null> {
  return getCachedValue(
    `itemAggregateContext:${projectId}:${itemKey}`,
    async () => {
      const rawKey = String(itemKey);

      const [latestLeadingLog, latestProjectLog, latestSubmission] =
        await Promise.all([
          db.query.projectLogs.findFirst({
            where: and(
              eq(projectLogs.projectId, projectId),
              eq(projectLogs.key, rawKey),
              eq(projectLogs.isNotLeading, false),
            ),
            orderBy: (logs, { desc }) => [desc(logs.createdAt)],
          }),
          db.query.projectLogs.findFirst({
            where: and(
              eq(projectLogs.projectId, projectId),
              eq(projectLogs.key, rawKey),
            ),
            orderBy: (logs, { desc }) => [desc(logs.createdAt)],
          }),
          db.query.itemProposals.findFirst({
            where: and(
              eq(itemProposals.projectId, projectId),
              eq(itemProposals.key, rawKey),
            ),
            orderBy: (table, { desc }) => [desc(table.createdAt)],
          }),
        ]);

      const candidateLog = latestLeadingLog ?? latestProjectLog;
      let candidateId: number | null = candidateLog?.itemProposalId ?? null;

      if (!candidateId && Number.isInteger(latestSubmission?.id)) {
        candidateId = latestSubmission?.id ?? null;
      }

      if (!candidateId || !Number.isInteger(candidateId)) {
        return resolveEmptyItemContext({ projectId, itemKey: rawKey });
      }

      const context = await resolveItemProposalContext(String(candidateId));
      if (context) {
        return context;
      }

      return resolveEmptyItemContext({ projectId, itemKey: rawKey });
    },
  );
}

async function resolveProjectContext(
  entityId: string,
): Promise<EntityContext | null> {
  const project = await fetchProjectRecord(entityId);
  if (!project) {
    return null;
  }

  const latestSnapPromise = fetchLatestProjectSnap(project.id);
  const fieldOverridesPromise = fetchProjectFieldOverrides(project.id);

  let latestSnap: ProjectSnapRecord | null = null;
  let projectFieldOverrides: ProjectFieldOverride[] = [];
  let projectProposals: Array<{ id: number; createdAt: Date | null }>; // minimal for pending projects
  let projectVotes: Array<{
    id: number;
    createdAt: Date | null;
    proposalId: number | null;
    key: string;
    weight: number | null;
    creator: { userId: string };
  }>;
  let projectAggregates: ProjectShareAggregates | null = null;

  if (project.isPublished) {
    const [snap, overrides, aggregates] = await Promise.all([
      latestSnapPromise,
      fieldOverridesPromise,
      fetchProjectShareAggregates(project.id),
    ]);

    latestSnap = snap;
    projectFieldOverrides = overrides;
    projectProposals = [];
    projectVotes = [];
    projectAggregates = aggregates;
  } else {
    const [snap, overrides, proposalRows, voteRows] = await Promise.all([
      latestSnapPromise,
      fieldOverridesPromise,
      db.query.proposals.findMany({
        where: eq(proposals.projectId, project.id),
        columns: {
          id: true,
          createdAt: true,
        },
      }),
      db.query.voteRecords.findMany({
        where: eq(voteRecords.projectId, project.id),
        columns: {
          id: true,
          createdAt: true,
          proposalId: true,
          key: true,
          weight: true,
        },
        with: {
          creator: {
            columns: {
              userId: true,
            },
          },
        },
      }),
    ]);

    latestSnap = snap;
    projectFieldOverrides = overrides;
    projectProposals = proposalRows.map((proposalRow) => ({
      id: proposalRow.id,
      createdAt: proposalRow.createdAt ?? null,
    }));
    projectVotes = voteRows.map((voteRow) => ({
      id: voteRow.id,
      createdAt: voteRow.createdAt ?? null,
      proposalId: voteRow.proposalId ?? null,
      key: voteRow.key,
      weight: voteRow.weight ?? null,
      creator: {
        userId: voteRow.creator?.userId ?? '',
      },
    }));
    projectAggregates = null;
  }

  const projectFieldOverrideMap = new Map<
    ProjectFieldOverrideKey,
    ProjectFieldOverride
  >(projectFieldOverrides.map((override) => [override.key, override]));

  const { baseName, baseTagline, baseLogo, baseCategories, summaryFromSnap } =
    buildProjectSnapshotBaseFields(project, latestSnap ?? null);

  const itemsTopWeight = normalizeItemsTopWeight(project.itemsTopWeight);
  const transparencyScore = calculateTransparencyScore(itemsTopWeight);

  const fallbackSubtitle = baseTagline || project.tagline || '';
  const fallbackDescription =
    summaryFromSnap || fallbackSubtitle || project.tagline || '';

  const overrideName = projectFieldOverrideMap.get('name');
  const overrideTagline = projectFieldOverrideMap.get('tagline');
  const overrideLogo = projectFieldOverrideMap.get('logoUrl');
  const overrideCategories = projectFieldOverrideMap.get('categories');

  const displayNameCandidate = overrideName?.valueText?.trim();
  const displayName =
    displayNameCandidate && displayNameCandidate.length > 0
      ? displayNameCandidate
      : baseName;

  const aggregatedTagline =
    overrideTagline?.valueText && overrideTagline.valueText.trim().length > 0
      ? overrideTagline.valueText.trim()
      : undefined;
  const displayTagline =
    aggregatedTagline || baseTagline || project.tagline || '';

  const aggregatedLogo = overrideLogo
    ? extractMediaUrl(overrideLogo.rawValue)
    : undefined;
  const displayLogo = aggregatedLogo || baseLogo;

  const overrideCategoriesList = overrideCategories
    ? extractCategories(overrideCategories.rawValue)
    : undefined;

  const displayCategories =
    overrideCategoriesList && overrideCategoriesList.length > 0
      ? overrideCategoriesList
      : baseCategories;

  const primaryDescriptionSource =
    summaryFromSnap || displayTagline || fallbackDescription;

  const totalContributions =
    project.isPublished && projectAggregates
      ? projectAggregates.uniqueContributors
      : 0;

  const displayTags = Array.from(
    new Set((displayCategories ?? []).filter(Boolean)),
  ).slice(0, 6);

  const statusBadge: ShareBadge = project.isPublished
    ? { label: 'Published Project', tone: 'success' }
    : { label: 'Pending Project', tone: 'info' };

  let stats: ShareMetric[];
  const layout: ShareLayout = project.isPublished
    ? 'projectPublished'
    : 'projectPending';

  if (project.isPublished) {
    const clampedTransparency = Math.min(100, Math.max(transparencyScore, 0));
    stats = [
      {
        key: 'transparency',
        title: 'Transparency',
        primary: `${clampedTransparency}%`,
      },
      {
        key: 'communityVotes',
        title: 'Community Votes',
        primary: formatInteger(project.support ?? 0),
      },
      {
        key: 'totalContributions',
        title: 'Total Contributions',
        primary: formatInteger(totalContributions),
      },
    ];
  } else {
    const projectVoteResult = ProposalVoteUtils.getVoteResultOfProject({
      projectId: project.id,
      votesOfProject: projectVotes as any,
      proposals: projectProposals as any,
    });

    const progressValue =
      projectVoteResult.leadingProposalResult?.formattedPercentageOfProposal ??
      '0%';

    stats = [
      {
        key: 'progress',
        title: 'Progress',
        primary: progressValue,
      },
      {
        key: 'totalProposals',
        title: 'Total Proposals',
        primary: formatInteger(projectProposals.length),
      },
    ];
  }

  const metadata: ShareMetadata = {
    title: displayName,
    subtitle: displayTagline
      ? truncate(displayTagline, 140)
      : fallbackSubtitle
        ? truncate(fallbackSubtitle, 140)
        : undefined,
    description: primaryDescriptionSource
      ? truncate(primaryDescriptionSource, 200)
      : undefined,
    project: {
      id: project.id,
      name: displayName,
      tagline: displayTagline || project.tagline,
      categories: displayCategories,
      logoUrl: displayLogo,
      isPublished: project.isPublished,
    },
    tags: displayTags,
    statusBadge,
    stats,
  };

  const targetUrl = project.isPublished
    ? `/project/${project.id}`
    : `/project/pending/${project.id}`;

  const visibility: ShareVisibility = project.isPublished
    ? 'public'
    : 'unlisted';
  const aggregateFieldTimestamps = projectFieldOverrides
    .map((override) => override.createdAt?.getTime?.())
    .filter(
      (value): value is number =>
        typeof value === 'number' && Number.isFinite(value) && value > 0,
    );

  const imageMeta = resolveImageMeta([
    project.updatedAt,
    latestSnap?.createdAt,
    ...aggregateFieldTimestamps,
  ]);

  return {
    layout,
    targetUrl,
    visibility,
    parentId: null,
    metadata,
    imageVersion: imageMeta.version,
    imageTimestamp: imageMeta.timestamp,
  };
}

async function resolveCustomFilterContext(
  entityId: string,
): Promise<EntityContext | null> {
  const targetPath = decodeCustomFilterEntityId(entityId);
  if (!targetPath) {
    return null;
  }

  const metadata: ShareMetadata = {
    title: 'Custom Filters',
    description: 'Shared project filters generated by Pensieve.',
    badge: 'Custom Filter',
    project: {
      id: 0,
      name: 'Pensieve',
      categories: [],
      isPublished: true,
    },
    badges: [{ label: 'Custom Filter', tone: 'info' }],
  };

  const imageMeta = resolveImageMeta([entityId, Date.now()]);

  return {
    layout: 'customFilter',
    targetUrl: targetPath,
    visibility: 'public',
    parentId: null,
    metadata,
    imageVersion: imageMeta.version,
    imageTimestamp: imageMeta.timestamp,
  };
}

async function resolveEntityContextDirect(
  entityType: ShareEntityType,
  entityId: string,
): Promise<EntityContext | null> {
  switch (entityType) {
    case 'customFilter':
      return resolveCustomFilterContext(entityId);
    case 'proposal':
      return resolveProposalContext(entityId);
    case 'itemProposal':
      return resolveItemProposalContext(entityId);
    case 'project':
      return resolveProjectContext(entityId);
    default:
      return null;
  }
}
async function resolveEntityContext(
  entityType: ShareEntityType,
  entityId: string,
): Promise<EntityContext | null> {
  const cacheKey = `entityContext:${entityType}:${entityId}`;
  return getCachedValue(cacheKey, () =>
    resolveEntityContextDirect(entityType, entityId),
  );
}

interface BuildPayloadOptions {
  preloadedContext?: EntityContext | null;
  disableCache?: boolean;
}

function buildPayloadCacheKey(record: ShareLinkRecord): string {
  const normalizedType = normalizeEntityType(record.entityType);
  const updatedSource =
    record.updatedAt ?? record.createdAt ?? new Date().toISOString();
  const updatedTimestamp =
    updatedSource instanceof Date
      ? updatedSource.getTime()
      : new Date(updatedSource).getTime();
  const safeTimestamp = Number.isFinite(updatedTimestamp)
    ? updatedTimestamp
    : Date.now();
  return `sharePayload:${normalizedType}:${record.entityId}:${record.code}:${safeTimestamp}`;
}

async function buildPayloadFromRecord(
  record: ShareLinkRecord,
  options?: BuildPayloadOptions,
): Promise<SharePayload | null> {
  const { preloadedContext, disableCache } = options ?? {};
  const cacheKey = buildPayloadCacheKey(record);

  const loader = async (): Promise<SharePayload | null> => {
    const entityType = normalizeEntityType(record.entityType);
    const context =
      preloadedContext ??
      (await resolveEntityContext(entityType, record.entityId));

    if (!context) {
      return null;
    }

    const recordVisibility = normalizeVisibility(record.visibility);
    const contextVisibility = context.visibility;

    const effectiveVisibility =
      recordVisibility === 'unlisted' && contextVisibility === 'public'
        ? 'public'
        : mergeVisibility(recordVisibility, contextVisibility);

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
      imageTimestamp: context.imageTimestamp,
      layout: context.layout,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  };

  if (disableCache) {
    return loader();
  }

  return getCachedValue(cacheKey, loader);
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
  const rawEntityId = String(input.entityId);
  const entityId =
    entityType === 'customFilter'
      ? encodeCustomFilterEntityId(rawEntityId)
      : rawEntityId;

  const existing = await db.query.shareLinks.findFirst({
    where: and(
      eq(shareLinks.entityType, entityType),
      eq(shareLinks.entityId, entityId),
    ),
  });

  let resolvedExisting = existing;

  if (
    !resolvedExisting &&
    entityType === 'itemProposal' &&
    entityId.startsWith('item:')
  ) {
    const aggregateParams = parseItemAggregateEntityId(entityId);
    if (aggregateParams) {
      const encodedKey = encodeURIComponent(aggregateParams.itemKey);
      const fallbackEntityIds = [
        `empty:${aggregateParams.projectId}:${encodedKey}`,
      ];

      const candidateProposalIds = await db
        .select({ id: itemProposals.id })
        .from(itemProposals)
        .where(
          and(
            eq(itemProposals.projectId, aggregateParams.projectId),
            eq(itemProposals.key, aggregateParams.itemKey),
          ),
        );

      fallbackEntityIds.push(
        ...candidateProposalIds
          .map((record) => (record.id != null ? String(record.id) : null))
          .filter((value): value is string => Boolean(value)),
      );

      if (fallbackEntityIds.length > 0) {
        const legacyLink = await db.query.shareLinks.findFirst({
          where: and(
            eq(shareLinks.entityType, entityType),
            inArray(shareLinks.entityId, fallbackEntityIds),
          ),
        });

        if (legacyLink) {
          if (legacyLink.entityId !== entityId) {
            await db
              .update(shareLinks)
              .set({ entityId })
              .where(eq(shareLinks.id, legacyLink.id));
          }

          resolvedExisting = await db.query.shareLinks.findFirst({
            where: eq(shareLinks.id, legacyLink.id),
          });
        }
      }
    }
  }

  if (resolvedExisting) {
    const payload = await buildPayloadFromRecord(resolvedExisting);
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

    const payload = await buildPayloadFromRecord(created, {
      preloadedContext: context,
    });
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

export async function ensureCustomFilterShareLink(params: {
  targetPath: string;
  createdBy?: string;
}): Promise<SharePayload> {
  return ensureShareLink({
    entityType: 'customFilter',
    entityId: params.targetPath,
    createdBy: params.createdBy,
  });
}

export const ShareService = {
  ensureShareLink,
  ensureCustomFilterShareLink,
  getSharePayload,
  getSharePayloadByEntity,
  buildShareUrl,
};

export default ShareService;
