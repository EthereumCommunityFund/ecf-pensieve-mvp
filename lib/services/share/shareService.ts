import { and, asc, desc, eq, sql } from 'drizzle-orm';

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

export type ShareEntityType = 'proposal' | 'itemProposal' | 'project';
const SUPPORTED_ENTITY_TYPES: ShareEntityType[] = [
  'proposal',
  'itemProposal',
  'project',
];

export type ShareVisibility = 'public' | 'unlisted' | 'private';
export type ShareLayout =
  | 'proposal'
  | 'itemProposal'
  | 'project'
  | 'projectPublished'
  | 'projectPending';

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
}

async function fetchProjectRecord(
  entityId: string,
): Promise<ProjectRecord | null> {
  const numericId = Number(entityId);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return null;
  }

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
}

async function fetchLatestProjectSnap(
  projectId: number,
): Promise<ProjectSnapRecord | null> {
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
  const imageVersion = String(
    Math.max(
      proposal.createdAt?.getTime?.() ?? 0,
      proposal.project.updatedAt?.getTime?.() ?? 0,
      latestVoteTimestamp,
    ),
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

async function resolveItemProposalContext(
  entityId: string,
): Promise<EntityContext | null> {
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
  ]);

  const latestLogTimestamp = latestProjectLog?.createdAt?.getTime?.() ?? 0;
  const latestValidatedTimestamp =
    latestValidatedLog?.createdAt?.getTime?.() ?? 0;
  const voteSupporterCount = voteAggregate?.supporterCount ?? 0;
  const totalVoteWeight = Number(voteAggregate?.totalWeight ?? 0);
  const latestVoteAt = voteAggregate?.latestVoteAt ?? null;
  const latestVoteTimestamp =
    latestVoteAt instanceof Date ? (latestVoteAt.getTime?.() ?? 0) : 0;

  const primarySummary =
    valueText && valueText.length > 0
      ? truncate(valueText, 160)
      : typeof itemProposal.reason === 'string' && itemProposal.reason
        ? truncate(itemProposal.reason, 160)
        : itemProposal.project.tagline
          ? truncate(itemProposal.project.tagline, 160)
          : undefined;

  const isCurrentValidated =
    latestValidatedLog?.itemProposalId === itemProposal.id;
  const hasValidatedLog = Boolean(latestValidatedLog);
  const hasAnySubmission = submissionsCount > 0;

  let itemType: ShareItemMetadata['type'];
  if (isCurrentValidated) {
    itemType = 'item';
  } else if (!hasValidatedLog && !hasAnySubmission) {
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
  };

  const visibility = itemProposal.project.isPublished ? 'public' : 'unlisted';
  const targetUrl = `/project/${itemProposal.project.id}?tab=project-data&notificationType=viewSubmission&itemName=${itemNameParam}`;
  const imageVersion = String(
    Math.max(
      itemProposal.createdAt?.getTime?.() ?? 0,
      itemProposal.project.updatedAt?.getTime?.() ?? 0,
      latestLogTimestamp,
      latestValidatedTimestamp,
      latestVoteTimestamp,
      Number(itemProposal.id),
    ),
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

async function resolveProjectContext(
  entityId: string,
): Promise<EntityContext | null> {
  const project = await fetchProjectRecord(entityId);
  if (!project) {
    return null;
  }

  const [latestSnap, projectProposals, projectVotes, itemProposalCreators] =
    await Promise.all([
      fetchLatestProjectSnap(project.id),
      db.query.proposals.findMany({
        where: eq(proposals.projectId, project.id),
        columns: {
          id: true,
          createdAt: true,
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
        orderBy: () => [asc(proposals.createdAt), asc(proposals.id)],
      }),
      db.query.voteRecords.findMany({
        where: eq(voteRecords.projectId, project.id),
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
      db
        .select({ creatorId: itemProposals.creator })
        .from(itemProposals)
        .where(eq(itemProposals.projectId, project.id))
        .groupBy(itemProposals.creator),
    ]);

  const uniqueContributorIds = new Set<string>();
  projectVotes
    .map((vote) => vote.creator?.userId)
    .filter((id): id is string => Boolean(id))
    .forEach((id) => uniqueContributorIds.add(id));

  projectProposals
    .map((proposal) => proposal.creator?.userId)
    .filter((id): id is string => Boolean(id))
    .forEach((id) => uniqueContributorIds.add(id));

  itemProposalCreators
    .map((record) => record.creatorId)
    .filter((id): id is string => Boolean(id))
    .forEach((id) => uniqueContributorIds.add(id));
  const categories = project.categories ?? latestSnap?.categories ?? [];
  const tags = Array.from(new Set(categories.filter(Boolean))).slice(0, 6);
  const snapItems = latestSnap?.items ?? [];
  const itemsTopWeight = normalizeItemsTopWeight(project.itemsTopWeight);
  const transparencyScore = calculateTransparencyScore(itemsTopWeight);

  const summaryFromSnap = getItemValueFromSnap(snapItems, 'mainDescription');
  const taglineFromSnap = getItemValueFromSnap(snapItems, 'tagline');
  const description = summaryFromSnap || project.tagline;
  const subtitle = taglineFromSnap || project.tagline;

  const latestVoteTimestamp = projectVotes.reduce((latest, vote) => {
    const time = vote.createdAt?.getTime?.() ?? 0;
    return time > latest ? time : latest;
  }, 0);

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
        primary: formatInteger(uniqueContributorIds.size),
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
    title: project.name,
    subtitle: subtitle ? truncate(subtitle, 140) : undefined,
    description: description ? truncate(description, 200) : undefined,
    project: {
      id: project.id,
      name: project.name,
      tagline: project.tagline,
      categories,
      logoUrl: project.logoUrl,
      isPublished: project.isPublished,
    },
    tags,
    statusBadge,
    stats,
  };

  const targetUrl = project.isPublished
    ? `/project/${project.id}`
    : `/project/pending/${project.id}`;

  const visibility: ShareVisibility = project.isPublished
    ? 'public'
    : 'unlisted';

  const imageVersion = String(
    Math.max(
      project.updatedAt?.getTime?.() ?? 0,
      latestSnap?.createdAt?.getTime?.() ?? 0,
      latestVoteTimestamp,
    ),
  );

  return {
    layout,
    targetUrl,
    visibility,
    parentId: null,
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
    case 'project':
      return resolveProjectContext(entityId);
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
