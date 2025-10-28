import { desc, eq, getTableColumns, inArray, sql } from 'drizzle-orm';

import { db, projectSnaps, projects, ranks } from '@/lib/db';
import {
  ProjectSortingService,
  SortBy,
  SortOrder,
} from '@/lib/services/projectSortingService';
import { getHost } from '@/lib/utils';

interface ProjectData {
  id: number;
  name: string;
  tagline: string;
  logoUrl: string;
}

const MAX_TWEET_LENGTH = 280;
const DEFAULT_RANKING_LIST_LIMIT = 5;
const RANKING_QUERY_LIMIT = 200;
const CET_TIME_ZONE = 'Europe/Paris';
const RANKING_PLACEHOLDER = '—';
const RANKING_NAME_MAX_LENGTH = 30;

function truncateWithEllipsis(text: string, maxLength: number): string {
  if (maxLength <= 0) {
    return '';
  }

  const normalizedText = text.trim();

  if (normalizedText.length <= maxLength) {
    return normalizedText;
  }

  if (maxLength === 1) {
    return '…';
  }

  const sliceLength = maxLength - 1;
  let truncated = normalizedText.slice(0, sliceLength);

  for (let i = truncated.length - 1; i >= 0; i -= 1) {
    if (/\s/.test(truncated[i])) {
      truncated = truncated.slice(0, i);
      break;
    }
  }

  return `${truncated.trimEnd()}…`;
}

function buildTweet(
  projectName: string,
  projectTagline: string | null,
  platformUrl: string,
): string {
  const lines = ['!! New page on Pensieve!', `Name: ${projectName}`];

  if (projectTagline !== null) {
    lines.push(`Tagline: ${projectTagline}`);
  }

  lines.push(
    '',
    `✅ View + validate:: ${platformUrl}`,
    '',
    '',
    "Built by contributors. Governed by citizens. Help keep Ethereum's memory honest",
    '',
    '#PensieveECF: the open source knowledge base for Web3.',
  );

  return lines.join('\n');
}

async function getTwitterClient() {
  const { TwitterApi } = await import('twitter-api-v2');

  if (
    !process.env.TWITTER_API_KEY ||
    !process.env.TWITTER_API_SECRET ||
    !process.env.TWITTER_ACCESS_TOKEN ||
    !process.env.TWITTER_ACCESS_TOKEN_SECRET
  ) {
    throw new Error('Twitter OAuth 1.0a credentials not configured');
  }

  return new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  });
}

function generateTweetContent(project: ProjectData): string {
  const platformUrl = `${getHost()}/project/${project.id}`;
  const name = project.name.trim();
  const tagline = project.tagline.trim();

  let tweet = buildTweet(name, tagline, platformUrl);

  if (tweet.length <= MAX_TWEET_LENGTH) {
    return tweet;
  }

  const baseWithEmptyTagline = buildTweet(name, '', platformUrl);
  const availableForTagline = MAX_TWEET_LENGTH - baseWithEmptyTagline.length;

  if (availableForTagline > 0) {
    const truncatedTagline = truncateWithEllipsis(tagline, availableForTagline);
    tweet = truncatedTagline
      ? buildTweet(name, truncatedTagline, platformUrl)
      : buildTweet(name, null, platformUrl);

    if (tweet.length <= MAX_TWEET_LENGTH) {
      return tweet;
    }
  }

  tweet = buildTweet(name, null, platformUrl);

  if (tweet.length <= MAX_TWEET_LENGTH) {
    return tweet;
  }

  const baseWithEmptyName = buildTweet('', null, platformUrl);
  const availableForName = MAX_TWEET_LENGTH - baseWithEmptyName.length;
  const truncatedName = truncateWithEllipsis(name, availableForName);

  tweet = buildTweet(truncatedName, null, platformUrl);

  if (tweet.length <= MAX_TWEET_LENGTH) {
    return tweet;
  }

  return truncateWithEllipsis(tweet, MAX_TWEET_LENGTH);
}

type ProjectWithSnap = {
  id: number;
  name?: string | null;
  projectSnap?: {
    items?: Array<{ key: string; value: unknown }> | null;
  } | null;
  tokenContract?: unknown;
  publicGoods?: unknown;
  isPublished?: boolean;
  [key: string]: unknown;
};

function toCamelCase(value: string): string {
  return value.replace(/_([a-z])/g, (_, letter: string) =>
    letter.toUpperCase(),
  );
}

function isPlaceholderValue(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return (
    normalized.length === 0 ||
    normalized === 'n/a' ||
    normalized === 'na' ||
    normalized === 'not applicable' ||
    normalized === 'none'
  );
}

function normalizeStringValue(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return null;
    }

    if (isPlaceholderValue(trimmed)) {
      return null;
    }

    return trimmed;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (value === true) {
    return 'true';
  }

  if (value === false) {
    return 'false';
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const normalized = normalizeStringValue(item);
      if (normalized) {
        return normalized;
      }
    }
    return null;
  }

  if (value && typeof value === 'object') {
    const lookupOrder = [
      'value',
      'label',
      'name',
      'title',
      'address',
      'contractAddress',
    ];

    for (const key of lookupOrder) {
      const candidate = (value as Record<string, unknown>)[key];
      if (typeof candidate === 'string') {
        const normalized = normalizeStringValue(candidate);
        if (normalized) {
          return normalized;
        }
      }
    }
  }

  return null;
}

function getProjectFieldValue(project: ProjectWithSnap, key: string): unknown {
  if (!project) {
    return undefined;
  }

  const snapItems = project.projectSnap?.items;
  if (Array.isArray(snapItems)) {
    const matched = snapItems.find(
      (item) => item && item.key === key && item.value !== undefined,
    );
    if (matched && matched.value !== null) {
      return matched.value;
    }
  }

  const directValue = project[key];
  if (directValue !== undefined && directValue !== null) {
    return directValue;
  }

  const camelKey = toCamelCase(key);
  const camelValue = project[camelKey];
  if (camelValue !== undefined && camelValue !== null) {
    return camelValue;
  }

  return undefined;
}

function projectHasToken(project: ProjectWithSnap): boolean {
  const value = getProjectFieldValue(project, 'tokenContract');

  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === 'string') {
    const normalized = normalizeStringValue(value);
    return normalized !== null && normalized.length > 0;
  }

  if (Array.isArray(value)) {
    return value.some((entry) => {
      if (typeof entry === 'string') {
        const normalized = normalizeStringValue(entry);
        return normalized !== null && normalized.length > 0;
      }

      if (entry && typeof entry === 'object') {
        const normalized = normalizeStringValue(entry);
        return normalized !== null && normalized.length > 0;
      }

      return Boolean(entry);
    });
  }

  if (value && typeof value === 'object') {
    const normalized = normalizeStringValue(value);
    return normalized !== null && normalized.length > 0;
  }

  return Boolean(value);
}

function projectIsNoInvestmentStage(project: ProjectWithSnap): boolean {
  const value = getProjectFieldValue(project, 'investment_stage');
  const values = Array.isArray(value) ? value : [value];

  return values.some((entry) => {
    const normalized = normalizeStringValue(entry);
    return normalized !== null && normalized.toLowerCase() === 'no investment';
  });
}

function projectIsPublicGoodsYes(project: ProjectWithSnap): boolean {
  const value = getProjectFieldValue(project, 'publicGoods');
  const values = Array.isArray(value) ? value : [value];

  return values.some((entry) => {
    if (entry === true) {
      return true;
    }

    if (entry === false || entry === null || entry === undefined) {
      return false;
    }

    const normalized = normalizeStringValue(entry);
    if (!normalized) {
      return false;
    }

    const lowered = normalized.toLowerCase();
    return lowered === 'yes' || lowered === 'true';
  });
}

function projectMatchesRankingFilters(project: ProjectWithSnap): boolean {
  if (!project) {
    return false;
  }

  if (projectHasToken(project)) {
    return false;
  }

  if (!projectIsNoInvestmentStage(project)) {
    return false;
  }

  if (!projectIsPublicGoodsYes(project)) {
    return false;
  }

  return true;
}

function dedupeProjectsById<T extends { id?: number }>(items: T[]): T[] {
  const seen = new Set<number>();
  const deduped: T[] = [];

  for (const item of items) {
    const identifier = item?.id;

    if (typeof identifier !== 'number') {
      continue;
    }

    if (seen.has(identifier)) {
      continue;
    }

    seen.add(identifier);
    deduped.push(item);
  }

  return deduped;
}

async function normalizeProjectsWithSnap(
  projectsList: ProjectWithSnap[],
): Promise<ProjectWithSnap[]> {
  const deduped = dedupeProjectsById(projectsList).map((project) => ({
    ...project,
  }));

  if (deduped.length === 0) {
    return deduped;
  }

  const missingSnapIds = deduped
    .filter((project) => !Array.isArray(project.projectSnap?.items))
    .map((project) => project.id);

  if (missingSnapIds.length === 0) {
    deduped.forEach((project) => {
      if (!project.projectSnap) {
        project.projectSnap = { items: [] };
      } else if (!Array.isArray(project.projectSnap.items)) {
        project.projectSnap.items = [];
      }
    });
    return deduped;
  }

  const snaps = await db
    .select({
      projectId: projectSnaps.projectId,
      items: projectSnaps.items,
      createdAt: projectSnaps.createdAt,
    })
    .from(projectSnaps)
    .where(inArray(projectSnaps.projectId, missingSnapIds))
    .orderBy(desc(projectSnaps.createdAt));

  const snapMap = new Map<
    number,
    { items: Array<{ key: string; value: unknown }> }
  >();

  for (const snap of snaps) {
    if (!snapMap.has(snap.projectId)) {
      snapMap.set(snap.projectId, {
        items: Array.isArray(snap.items) ? snap.items : [],
      });
    }
  }

  for (const project of deduped) {
    if (Array.isArray(project.projectSnap?.items)) {
      continue;
    }

    const fallback = snapMap.get(project.id);
    project.projectSnap = {
      ...(project.projectSnap ?? {}),
      items: fallback?.items ?? [],
    };
  }

  return deduped;
}

async function fetchFilteredTransparentProjects(
  listLimit: number,
): Promise<ProjectWithSnap[]> {
  const sortingService = new ProjectSortingService();

  const rawProjects = (await sortingService.buildSortedQuery({
    sortBy: SortBy.TRANSPARENT,
    sortOrder: SortOrder.DESC,
    isPublished: true,
    offset: 0,
    limit: RANKING_QUERY_LIMIT,
  })) as ProjectWithSnap[];

  const projectsWithSnap = await normalizeProjectsWithSnap(rawProjects);
  const filtered = projectsWithSnap.filter(projectMatchesRankingFilters);

  return filtered.slice(0, listLimit);
}

async function fetchFilteredAccountableProjects(
  listLimit: number,
): Promise<ProjectWithSnap[]> {
  const genesisSupportScore = sql<number>`
    (${ranks.publishedGenesisWeight}) * sqrt(GREATEST(${projects.support}, 0))
  `;

  const rawRankings = await db
    .select({
      project: getTableColumns(projects),
      projectSnap: getTableColumns(projectSnaps),
      rankId: ranks.id,
      score: genesisSupportScore,
    })
    .from(ranks)
    .innerJoin(projects, eq(ranks.projectId, projects.id))
    .leftJoin(projectSnaps, eq(projects.id, projectSnaps.projectId))
    .where(eq(projects.isPublished, true))
    .orderBy(desc(genesisSupportScore), desc(ranks.id))
    .limit(RANKING_QUERY_LIMIT);

  const projectEntries = rawRankings.map((entry) => ({
    ...entry.project,
    projectSnap: entry.projectSnap,
  })) as ProjectWithSnap[];

  const projectsWithSnap = await normalizeProjectsWithSnap(projectEntries);
  const filtered = projectsWithSnap.filter(projectMatchesRankingFilters);

  return filtered.slice(0, listLimit);
}

function extractProjectName(project: ProjectWithSnap): string {
  if (!project) {
    return 'Unnamed';
  }

  if (typeof project.name === 'string' && project.name.trim().length > 0) {
    return project.name.trim();
  }

  const fallback = getProjectFieldValue(project, 'name');
  const normalized = normalizeStringValue(fallback);

  if (normalized && normalized.length > 0) {
    return normalized;
  }

  return `Project #${project.id}`;
}

function padList(values: string[], targetLength: number): string[] {
  const result = values.slice(0, targetLength);

  while (result.length < targetLength) {
    result.push(RANKING_PLACEHOLDER);
  }

  return result;
}

function formatSnapshotDateValue(date?: Date | string): string {
  if (typeof date === 'string') {
    return date;
  }

  const baseDate = date instanceof Date ? date : new Date();

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: CET_TIME_ZONE,
  }).format(baseDate);
}

function buildRankingSnapshotTweetContents(params: {
  snapshotDate?: Date | string;
  transparentNames: string[];
  accountableNames: string[];
  listLimit: number;
}): { transparent?: string; accountable?: string } {
  const { snapshotDate, transparentNames, accountableNames, listLimit } =
    params;
  const formattedDate = formatSnapshotDateValue(snapshotDate);

  const createTweet = (title: string, names: string[]): string | undefined => {
    if (!names.length) {
      return undefined;
    }

    let maxNameLength = 48;

    const compose = (nameLength: number) => {
      const lines = padList(names, listLimit).map((name, index) => {
        const displayName =
          name === RANKING_PLACEHOLDER
            ? name
            : truncateWithEllipsis(name, nameLength);
        return `${index + 1}.${displayName}`;
      });

      const section = [title, ...lines].join('\n');

      return [
        `📊 Today’s ranking snapshot (${formattedDate}, 12:00 CET).`,
        '',
        section,
      ].join('\n');
    };

    let content = compose(maxNameLength);

    while (content.length > MAX_TWEET_LENGTH && maxNameLength > 6) {
      maxNameLength -= 2;
      content = compose(maxNameLength);
    }

    if (content.length > MAX_TWEET_LENGTH) {
      content = compose(6);

      if (content.length > MAX_TWEET_LENGTH) {
        throw new Error('Ranking snapshot tweet exceeds the maximum length');
      }
    }

    return content;
  };

  return {
    transparent: createTweet('Top Transparent Projects:', transparentNames),
    accountable: createTweet('Top Accountable Projects:', accountableNames),
  };
}

async function generateProjectImage(project: ProjectData): Promise<Buffer> {
  const params = new URLSearchParams({
    projectName: project.name,
    logoUrl: project.logoUrl,
    tagline: project.tagline,
  });

  const imageUrl = `${getHost()}/api/generateXImage?${params.toString()}`;

  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(
      `Image generation failed: ${response.status} ${response.statusText}`,
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  console.log('Generated image size:', arrayBuffer.byteLength);
  return Buffer.from(arrayBuffer);
}

export async function sendProjectPublishTweet(
  project: ProjectData,
): Promise<boolean> {
  try {
    const client = await getTwitterClient();
    const tweetContent = generateTweetContent(project);

    const imageBuffer = await generateProjectImage(project);

    const mediaId = await client.v1.uploadMedia(imageBuffer, {
      mimeType: 'image/png',
      target: 'tweet',
    });

    const tweet = await client.v2.tweet({
      text: tweetContent,
      media: { media_ids: [mediaId] },
    });

    return true;
  } catch (error) {
    if (error && typeof error === 'object') {
      console.error('Error object:', JSON.stringify(error, null, 2));
    }

    return false;
  }
}

interface RankingSnapshotTweetOptions {
  listLimit?: number;
  snapshotDate?: Date | string;
}

interface RankingSnapshotTweetsResult {
  transparent?: string;
  accountable?: string;
}

export async function generateRankingSnapshotTweets(
  options: RankingSnapshotTweetOptions = {},
): Promise<RankingSnapshotTweetsResult> {
  const requestedLimit = Math.trunc(Number(options.listLimit));
  const listLimit =
    Number.isFinite(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, DEFAULT_RANKING_LIST_LIMIT)
      : DEFAULT_RANKING_LIST_LIMIT;

  const [transparentProjects, accountableProjects] = await Promise.all([
    fetchFilteredTransparentProjects(listLimit),
    fetchFilteredAccountableProjects(listLimit),
  ]);

  const transparentNames = transparentProjects
    .map(extractProjectName)
    .map((name) => truncateWithEllipsis(name, RANKING_NAME_MAX_LENGTH));
  const accountableNames = accountableProjects
    .map(extractProjectName)
    .map((name) => truncateWithEllipsis(name, RANKING_NAME_MAX_LENGTH));

  const hasTransparent = transparentNames.length > 0;
  const hasAccountable = accountableNames.length > 0;

  if (!hasTransparent && !hasAccountable) {
    throw new Error('No eligible projects found for ranking snapshot tweet');
  }

  return buildRankingSnapshotTweetContents({
    snapshotDate: options.snapshotDate,
    transparentNames,
    accountableNames,
    listLimit,
  });
}

export async function sendRankingSnapshotTweet(
  options: RankingSnapshotTweetOptions = {},
): Promise<boolean> {
  try {
    const tweetContents = await generateRankingSnapshotTweets(options);

    const client = await getTwitterClient();
    let hasPosted = false;

    if (tweetContents.transparent) {
      await client.v2.tweet({
        text: tweetContents.transparent,
      });
      hasPosted = true;
    }

    if (tweetContents.accountable) {
      await client.v2.tweet({
        text: tweetContents.accountable,
      });
      hasPosted = true;
    }

    if (!hasPosted) {
      throw new Error('No tweet generated for ranking snapshot');
    }

    return true;
  } catch (error) {
    console.error('Failed to send ranking snapshot tweet:', error);
    if (error && typeof error === 'object') {
      console.error('Error object:', JSON.stringify(error, null, 2));
    }
    return false;
  }
}
