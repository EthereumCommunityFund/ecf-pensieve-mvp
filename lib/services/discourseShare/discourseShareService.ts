import { and, eq, isNull, sql } from 'drizzle-orm';
import { LRUCache } from 'lru-cache';

import { REDRESSED_SUPPORT_THRESHOLD } from '@/constants/discourse';
import { db } from '@/lib/db';
import {
  projectDiscussionAnswerVotes,
  projectDiscussionAnswers,
  projectDiscussionComments,
  projectDiscussionThreads,
  projectDiscussionVotes,
  shareLinks,
} from '@/lib/db/schema';
import { resolveTopicLabel } from '@/lib/services/discourseMeta';
import { ensurePublishedProject } from '@/lib/services/projectGuards';
import { generateUniqueShortCode } from '@/lib/utils/shortCodeUtils';
import { buildAbsoluteUrl, getAppOrigin } from '@/lib/utils/url';

import { buildDiscourseShareUrl } from './url';

type ShareLinkRecord = typeof shareLinks.$inferSelect;

export type DiscourseShareEntity =
  | { kind: 'thread'; threadId: number }
  | { kind: 'answer'; threadId: number; answerId: number };

export type DiscourseShareVariant =
  | 'generalThread'
  | 'scamThread'
  | 'answer'
  | 'counterClaim';

export type DiscourseShareStatus = 'Open' | 'Unanswered' | 'Redressed';
// Scam thread uses richer statuses on the product page.
export type DiscourseShareScamStatus =
  | 'Alert Displayed on Page'
  | 'Claim Redressed';

export type DiscourseShareSnapshot = {
  snapshotAt: number;
  entity: DiscourseShareEntity;
  stableMeta: {
    title: string;
    description?: string;
    label: string;
  };
  uiStable: {
    projectName: string;
    projectLogoUrl?: string | null;
    threadTitle: string;
    authorName?: string | null;
    authorAvatarUrl?: string | null;
  };
};

export type DiscourseSharePayload = {
  code: string;
  sharePath: string;
  targetUrl: string;
  entity: DiscourseShareEntity;
  variant: DiscourseShareVariant;
  label: string;
  stable: DiscourseShareSnapshot['uiStable'];
  status: DiscourseShareStatus | DiscourseShareScamStatus;
  stats: {
    upvotesCpTotal?: number;
    supportersCount?: number;
    answersCount?: number;
    counterClaimsCount?: number;
    discussionCommentsCount?: number;
    answerCommentsCount?: number;
  };
  metadata: {
    title: string;
    description?: string;
  };
  imageVersion: string;
  imageTimestamp: number;
};

const STABLE_SNAPSHOT_TTL_MS = 10 * 60 * 1000;

const discoursePayloadCache = new LRUCache<string, Promise<unknown>>({
  max: 512,
  ttl: 1000 * 30,
});

async function getCachedValue<T>(
  key: string,
  loader: () => Promise<T>,
  cache: LRUCache<string, Promise<unknown>> = discoursePayloadCache,
): Promise<T> {
  const cached = cache.get(key) as Promise<T> | undefined;
  if (cached) {
    return cached;
  }

  const pending = loader().catch((error) => {
    cache.delete(key);
    throw error;
  });
  cache.set(key, pending as Promise<unknown>);
  return pending;
}

function encodeEntityId(entity: DiscourseShareEntity): string {
  if (entity.kind === 'thread') {
    return `thread:${entity.threadId}`;
  }
  return `answer:${entity.threadId}:${entity.answerId}`;
}

function decodeEntityId(entityId: string): DiscourseShareEntity | null {
  const trimmed = (entityId ?? '').trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('thread:')) {
    const threadId = Number(trimmed.slice('thread:'.length));
    if (!Number.isFinite(threadId)) return null;
    return { kind: 'thread', threadId };
  }

  if (trimmed.startsWith('answer:')) {
    const parts = trimmed.slice('answer:'.length).split(':');
    if (parts.length !== 2) return null;
    const threadId = Number(parts[0]);
    const answerId = Number(parts[1]);
    if (!Number.isFinite(threadId) || !Number.isFinite(answerId)) return null;
    return { kind: 'answer', threadId, answerId };
  }

  return null;
}

function stripHtml(value?: string | null): string {
  if (!value) return '';
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(value: string, limit: number): string {
  if (!value) return '';
  if (value.length <= limit) return value;
  return `${value.slice(0, Math.max(0, limit - 3))}...`;
}

function buildDescription(value?: string | null, fallback?: string): string {
  const cleaned = truncate(stripHtml(value), 160);
  return cleaned || (fallback ?? '');
}

function computeThreadStatus(thread: {
  support?: number | null;
  answerCount?: number | null;
  redressedAnswerCount?: number | null;
  isScam?: boolean | null;
}): DiscourseShareStatus | DiscourseShareScamStatus {
  if (thread.isScam) {
    const hasAlert = (thread.support ?? 0) >= REDRESSED_SUPPORT_THRESHOLD;
    if (hasAlert) {
      return 'Alert Displayed on Page';
    }

    const counterRedressedCount = thread.redressedAnswerCount ?? 0;
    if (counterRedressedCount > 0) {
      return 'Claim Redressed';
    }

    return 'Open';
  }
  if ((thread.redressedAnswerCount ?? 0) > 0) {
    return 'Redressed';
  }
  if ((thread.answerCount ?? 0) === 0) {
    return 'Unanswered';
  }
  return 'Open';
}

function computeVariant(
  thread: { isScam?: boolean | null },
  entity: DiscourseShareEntity,
): DiscourseShareVariant {
  if (entity.kind === 'thread') {
    return thread.isScam ? 'scamThread' : 'generalThread';
  }
  return thread.isScam ? 'counterClaim' : 'answer';
}

function parseSnapshot(raw: unknown): DiscourseShareSnapshot | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  const snapshotAt = Number(record.snapshotAt);
  if (!Number.isFinite(snapshotAt) || snapshotAt <= 0) return null;
  const entityRaw = record.entity;
  if (!entityRaw || typeof entityRaw !== 'object') return null;

  const stableMetaRaw = record.stableMeta;
  if (!stableMetaRaw || typeof stableMetaRaw !== 'object') return null;
  const stableMeta = stableMetaRaw as Record<string, unknown>;
  if (typeof stableMeta.title !== 'string') return null;
  if (typeof stableMeta.label !== 'string') return null;
  if (
    stableMeta.description != null &&
    typeof stableMeta.description !== 'string'
  ) {
    return null;
  }

  const uiStableRaw = record.uiStable;
  if (!uiStableRaw || typeof uiStableRaw !== 'object') return null;
  const uiStable = uiStableRaw as Record<string, unknown>;
  if (typeof uiStable.projectName !== 'string') return null;
  if (typeof uiStable.threadTitle !== 'string') return null;

  const entity = entityRaw as Record<string, unknown>;
  const kind = entity.kind;
  if (kind === 'thread' && Number.isFinite(Number(entity.threadId))) {
    return raw as DiscourseShareSnapshot;
  }
  if (
    kind === 'answer' &&
    Number.isFinite(Number(entity.threadId)) &&
    Number.isFinite(Number(entity.answerId))
  ) {
    return raw as DiscourseShareSnapshot;
  }

  return null;
}

function isSnapshotValid(
  snapshot: DiscourseShareSnapshot,
  entity: DiscourseShareEntity,
  now: number,
): boolean {
  if (now - snapshot.snapshotAt > STABLE_SNAPSHOT_TTL_MS) {
    return false;
  }
  if (snapshot.entity.kind !== entity.kind) return false;
  if (snapshot.entity.threadId !== entity.threadId) return false;
  if (entity.kind === 'answer') {
    return (
      snapshot.entity.kind === 'answer' &&
      snapshot.entity.answerId === entity.answerId
    );
  }
  return true;
}

async function ensureUniqueCode(): Promise<string> {
  return generateUniqueShortCode(async (code) => {
    const existing = await db.query.shareLinks.findFirst({
      where: eq(shareLinks.code, code),
      columns: { id: true },
    });
    return Boolean(existing);
  });
}

async function writeSnapshot(
  linkId: number,
  snapshot: DiscourseShareSnapshot,
): Promise<void> {
  try {
    await db
      .update(shareLinks)
      .set({ ogSnapshot: snapshot as any })
      .where(eq(shareLinks.id, linkId));
  } catch (error) {
    console.error('[discourseShare] failed to write ogSnapshot', error);
  }
}

async function loadThread(threadId: number) {
  const thread = await db.query.projectDiscussionThreads.findFirst({
    where: eq(projectDiscussionThreads.id, threadId),
    with: {
      creator: {
        columns: {
          userId: true,
          name: true,
          avatarUrl: true,
        },
      },
      project: {
        columns: {
          id: true,
          name: true,
          tagline: true,
          logoUrl: true,
          categories: true,
        },
        with: {
          projectSnap: {
            columns: {
              items: true,
              categories: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!thread) {
    return null;
  }

  try {
    await ensurePublishedProject(db, thread.projectId);
  } catch {
    return null;
  }
  return thread;
}

async function loadThreadForPayload(threadId: number) {
  const thread = await db.query.projectDiscussionThreads.findFirst({
    where: eq(projectDiscussionThreads.id, threadId),
    columns: {
      id: true,
      projectId: true,
      updatedAt: true,
      title: true,
      category: true,
      tags: true,
      isScam: true,
      support: true,
      answerCount: true,
      redressedAnswerCount: true,
    },
  });

  if (!thread) {
    return null;
  }

  try {
    await ensurePublishedProject(db, thread.projectId);
  } catch {
    return null;
  }

  return thread;
}

function buildProjectSummary(project?: any | null) {
  if (!project) {
    return null;
  }
  const snapItems = project.projectSnap?.items ?? [];
  const snapMap = (Array.isArray(snapItems) ? snapItems : []).reduce<
    Record<string, unknown>
  >((acc, item: any) => {
    if (item?.key) {
      acc[item.key] = item.value;
    }
    return acc;
  }, {});

  const name =
    (snapMap['name'] as string | undefined) ??
    project.projectSnap?.name ??
    project.name ??
    null;
  const tagline =
    (snapMap['tagline'] as string | undefined) ?? project.tagline ?? null;
  const logoUrl =
    (snapMap['logoUrl'] as string | undefined) ??
    project.logoUrl ??
    (snapMap['logo'] as string | undefined) ??
    null;

  return {
    id: project.id,
    name,
    tagline,
    logoUrl,
  };
}

async function loadAnswer(answerId: number) {
  return db.query.projectDiscussionAnswers.findFirst({
    where: and(
      eq(projectDiscussionAnswers.id, answerId),
      eq(projectDiscussionAnswers.isDeleted, false),
    ),
    with: {
      creator: {
        columns: {
          userId: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });
}

async function loadAnswerForPayload(answerId: number) {
  return db.query.projectDiscussionAnswers.findFirst({
    where: and(
      eq(projectDiscussionAnswers.id, answerId),
      eq(projectDiscussionAnswers.isDeleted, false),
    ),
    columns: {
      id: true,
      threadId: true,
      updatedAt: true,
    },
  });
}

function buildStableSnapshotFromContext(params: {
  entity: DiscourseShareEntity;
  thread: any;
  answer?: any | null;
}): {
  stableMeta: DiscourseShareSnapshot['stableMeta'];
  uiStable: DiscourseShareSnapshot['uiStable'];
} | null {
  const project = buildProjectSummary(params.thread.project);
  const label = resolveTopicLabel(
    params.thread.category?.[0] ?? params.thread.tags?.[0],
  );
  const projectName = project?.name?.trim() || 'Pensieve';
  const threadTitle = params.thread.title;

  if (params.entity.kind === 'thread') {
    const title = `[Pensieve Discourse]-[${label}]-${threadTitle}-${projectName}`;
    const description = buildDescription(
      params.thread.post ?? project?.tagline,
      'Join the discussion on Pensieve.',
    );
    return {
      stableMeta: { title, description, label },
      uiStable: {
        projectName,
        projectLogoUrl: project?.logoUrl ?? null,
        threadTitle,
        authorName: params.thread.creator?.name ?? null,
        authorAvatarUrl: params.thread.creator?.avatarUrl ?? null,
      },
    };
  }

  const answer = params.answer;
  if (!answer || answer.threadId !== params.thread.id) {
    return null;
  }

  const fallbackTitle = params.thread.isScam
    ? `Counter Claim · ${threadTitle}`
    : `Answer · ${threadTitle}`;
  const answerHeadline =
    truncate(stripHtml(answer.content), 80) || fallbackTitle;
  const title = answerHeadline;
  const description = buildDescription(
    answer.content ?? project?.tagline,
    'See how the community is responding on Pensieve.',
  );

  return {
    stableMeta: { title, description, label },
    uiStable: {
      projectName,
      projectLogoUrl: project?.logoUrl ?? null,
      threadTitle,
      authorName: answer.creator?.name ?? null,
      authorAvatarUrl: answer.creator?.avatarUrl ?? null,
    },
  };
}

async function fetchThreadAggregates(threadId: number) {
  const [votes, comments] = await Promise.all([
    db
      .select({
        supportersCount: sql<number>`count(distinct ${projectDiscussionVotes.voter})::int`,
        latestVoteAt: sql<Date | null>`max(${projectDiscussionVotes.createdAt})`,
      })
      .from(projectDiscussionVotes)
      .where(eq(projectDiscussionVotes.threadId, threadId))
      .then((rows) => rows[0] ?? null),
    db
      .select({
        discussionCommentsCount: sql<number>`count(*)::int`,
        latestCommentAt: sql<Date | null>`max(${projectDiscussionComments.updatedAt})`,
      })
      .from(projectDiscussionComments)
      .where(
        and(
          eq(projectDiscussionComments.threadId, threadId),
          isNull(projectDiscussionComments.answerId),
          eq(projectDiscussionComments.isDeleted, false),
        ),
      )
      .then((rows) => rows[0] ?? null),
  ]);

  return {
    supportersCount: votes?.supportersCount ?? 0,
    latestVoteAt: votes?.latestVoteAt ?? null,
    discussionCommentsCount: comments?.discussionCommentsCount ?? 0,
    latestCommentAt: comments?.latestCommentAt ?? null,
  };
}

async function fetchAnswerAggregates(answerId: number) {
  const [votes, comments] = await Promise.all([
    db
      .select({
        supportersCount: sql<number>`count(distinct ${projectDiscussionAnswerVotes.voter})::int`,
        latestVoteAt: sql<Date | null>`max(${projectDiscussionAnswerVotes.createdAt})`,
      })
      .from(projectDiscussionAnswerVotes)
      .where(eq(projectDiscussionAnswerVotes.answerId, answerId))
      .then((rows) => rows[0] ?? null),
    db
      .select({
        answerCommentsCount: sql<number>`count(*)::int`,
        latestCommentAt: sql<Date | null>`max(${projectDiscussionComments.updatedAt})`,
      })
      .from(projectDiscussionComments)
      .where(
        and(
          eq(projectDiscussionComments.answerId, answerId),
          eq(projectDiscussionComments.isDeleted, false),
        ),
      )
      .then((rows) => rows[0] ?? null),
  ]);

  return {
    supportersCount: votes?.supportersCount ?? 0,
    latestVoteAt: votes?.latestVoteAt ?? null,
    answerCommentsCount: comments?.answerCommentsCount ?? 0,
    latestCommentAt: comments?.latestCommentAt ?? null,
  };
}

function buildTargetUrl(entity: DiscourseShareEntity): string {
  if (entity.kind === 'thread') {
    return `/discourse/${entity.threadId}`;
  }
  return `/discourse/${entity.threadId}?answerId=${entity.answerId}`;
}

function resolveImageMeta(values: Array<Date | number | null | undefined>): {
  version: string;
  timestamp: number;
} {
  const timestamps = values
    .map((value) => {
      if (!value) return 0;
      if (value instanceof Date) return value.getTime();
      const numeric = Number(value);
      return Number.isFinite(numeric) ? numeric : 0;
    })
    .filter((value) => Number.isFinite(value) && value > 0);

  const timestamp = timestamps.length ? Math.max(...timestamps) : Date.now();
  return { version: String(timestamp), timestamp };
}

async function buildPayloadFromRecord(
  record: ShareLinkRecord,
  options?: { cacheKeySuffix?: string | null },
): Promise<DiscourseSharePayload | null> {
  const entity = decodeEntityId(record.entityId);
  if (!entity) return null;

  const normalizedSuffix = options?.cacheKeySuffix?.trim();
  const cacheKey = normalizedSuffix
    ? `discourseShare:payload:${record.code}:${normalizedSuffix}`
    : `discourseShare:payload:${record.code}`;
  return getCachedValue(cacheKey, async () => {
    const now = Date.now();
    const snapshot = parseSnapshot(record.ogSnapshot);

    let stableFromSnapshot =
      snapshot && isSnapshotValid(snapshot, entity, now) ? snapshot : null;

    let thread = stableFromSnapshot
      ? await loadThreadForPayload(entity.threadId)
      : await loadThread(entity.threadId);
    if (!thread) return null;

    if (stableFromSnapshot && entity.kind === 'answer') {
      const legacyTitle = `Answer · ${thread.title}`;
      if (stableFromSnapshot.stableMeta.title === legacyTitle) {
        stableFromSnapshot = null;
        thread = await loadThread(entity.threadId);
        if (!thread) return null;
      }
    }

    const variant = computeVariant(thread, entity);
    const needsThreadAggregates =
      variant === 'generalThread' || variant === 'scamThread';

    const label = resolveTopicLabel(thread.category?.[0] ?? thread.tags?.[0]);
    const project = stableFromSnapshot
      ? null
      : buildProjectSummary((thread as any).project);
    const projectName =
      stableFromSnapshot?.uiStable.projectName ??
      project?.name?.trim() ??
      'Pensieve';

    let stableMeta = stableFromSnapshot?.stableMeta ?? null;
    let uiStable = stableFromSnapshot?.uiStable ?? null;

    const [threadAgg, answerAgg, answer] = await Promise.all([
      needsThreadAggregates ? fetchThreadAggregates(thread.id) : null,
      entity.kind === 'answer' ? fetchAnswerAggregates(entity.answerId) : null,
      entity.kind === 'answer'
        ? stableFromSnapshot
          ? loadAnswerForPayload(entity.answerId)
          : loadAnswer(entity.answerId)
        : Promise.resolve(null),
    ]);

    if (entity.kind === 'answer') {
      if (!answer || (answer as any).threadId !== thread.id) {
        return null;
      }
    }

    const safeThreadAgg =
      threadAgg ??
      ({
        supportersCount: 0,
        latestVoteAt: null,
        discussionCommentsCount: 0,
        latestCommentAt: null,
      } as const);

    if (!stableMeta || !uiStable) {
      const computed = buildStableSnapshotFromContext({
        entity,
        thread,
        answer,
      });

      if (computed) {
        stableMeta = computed.stableMeta;
        uiStable = computed.uiStable;
        const nextSnapshot: DiscourseShareSnapshot = {
          snapshotAt: now,
          entity,
          stableMeta,
          uiStable,
        };
        await writeSnapshot(record.id, nextSnapshot);
      }
    }

    if (!stableMeta || !uiStable) {
      stableMeta = {
        title: 'Pensieve Discourse',
        description: 'Join the discussion on Pensieve.',
        label,
      };
      uiStable = {
        projectName,
        projectLogoUrl: project?.logoUrl ?? null,
        threadTitle: thread.title,
        authorName: (thread as any).creator?.name ?? null,
        authorAvatarUrl: (thread as any).creator?.avatarUrl ?? null,
      };
    }

    const status = computeThreadStatus(thread);

    const upvotesCpTotal = Number(thread.support ?? 0);
    const threadAnswersCount = Math.max(0, thread.answerCount ?? 0);
    const threadCounterClaimsCount = threadAnswersCount;

    const stats: DiscourseSharePayload['stats'] = {};

    if (variant === 'generalThread') {
      stats.upvotesCpTotal = upvotesCpTotal;
      stats.answersCount = threadAnswersCount;
      stats.discussionCommentsCount = safeThreadAgg.discussionCommentsCount;
    } else if (variant === 'scamThread') {
      stats.supportersCount = safeThreadAgg.supportersCount;
      stats.counterClaimsCount = threadCounterClaimsCount;
      stats.discussionCommentsCount = safeThreadAgg.discussionCommentsCount;
    } else if (variant === 'answer' || variant === 'counterClaim') {
      stats.supportersCount = answerAgg?.supportersCount ?? 0;
      stats.answerCommentsCount = answerAgg?.answerCommentsCount ?? 0;
    }

    const imageMeta = resolveImageMeta([
      record.updatedAt,
      thread.updatedAt,
      needsThreadAggregates ? safeThreadAgg.latestCommentAt : null,
      needsThreadAggregates ? safeThreadAgg.latestVoteAt : null,
      entity.kind === 'answer' ? (answer as any)?.updatedAt : null,
      entity.kind === 'answer' ? answerAgg?.latestCommentAt : null,
      entity.kind === 'answer' ? answerAgg?.latestVoteAt : null,
      thread.id,
      entity.kind === 'answer' ? entity.answerId : null,
    ]);

    const sharePath = `/discourse/s/${record.code}`;
    const targetUrl = buildTargetUrl(entity);

    return {
      code: record.code,
      sharePath,
      targetUrl,
      entity,
      variant,
      label: stableMeta.label || label,
      stable: {
        ...uiStable,
        projectLogoUrl: uiStable.projectLogoUrl ?? project?.logoUrl ?? null,
        projectName: uiStable.projectName ?? projectName,
        threadTitle: uiStable.threadTitle ?? thread.title,
      },
      status,
      stats,
      metadata: {
        title: stableMeta.title,
        description: stableMeta.description,
      },
      imageVersion: imageMeta.version,
      imageTimestamp: imageMeta.timestamp,
    };
  });
}

export async function getDiscourseSharePayload(
  code: string,
  options?: { cacheKeySuffix?: string | null },
): Promise<DiscourseSharePayload | null> {
  const normalized = (code ?? '').trim();
  if (!normalized) return null;

  const record = await db.query.shareLinks.findFirst({
    where: and(
      eq(shareLinks.code, normalized),
      eq(shareLinks.entityType, 'discourse'),
    ),
  });

  if (!record) {
    return null;
  }

  return buildPayloadFromRecord(record, options);
}

export async function ensureDiscourseShareLink(params: {
  entity: DiscourseShareEntity;
  createdBy?: string;
}): Promise<{ code: string; shareUrl: string; targetUrl: string }> {
  const entityId = encodeEntityId(params.entity);
  const targetUrl = buildTargetUrl(params.entity);
  const origin = getAppOrigin();

  const existing = await db.query.shareLinks.findFirst({
    where: and(
      eq(shareLinks.entityType, 'discourse'),
      eq(shareLinks.entityId, entityId),
    ),
  });

  if (existing) {
    if (existing.targetUrl !== targetUrl) {
      await db
        .update(shareLinks)
        .set({ targetUrl })
        .where(eq(shareLinks.id, existing.id));
    }

    discoursePayloadCache.delete(`discourseShare:payload:${existing.code}`);
    return {
      code: existing.code,
      shareUrl: buildDiscourseShareUrl(existing.code, origin),
      targetUrl,
    };
  }

  const code = await ensureUniqueCode();
  await db.insert(shareLinks).values({
    code,
    entityType: 'discourse',
    entityId,
    targetUrl,
    visibility: 'public',
    createdBy: params.createdBy,
  });

  discoursePayloadCache.delete(`discourseShare:payload:${code}`);
  return {
    code,
    shareUrl: buildDiscourseShareUrl(code, origin),
    targetUrl,
  };
}

const DiscourseShareService = {
  getSharePayload: getDiscourseSharePayload,
  ensureShareLink: ensureDiscourseShareLink,
  buildShareUrl: buildDiscourseShareUrl,
  buildAbsoluteUrl,
};

export default DiscourseShareService;
