import { desc, eq, sql } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';

import { db } from '@/lib/db';
import {
  profiles,
  projectSnaps,
  projects,
  ranks,
  voteRecords,
} from '@/lib/db/schema';

type SnapshotItem = {
  key?: string | null;
  value?: unknown;
};

function normalizeString(value: unknown): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      const normalized = normalizeString(entry);
      if (normalized) {
        return normalized;
      }
    }
    return undefined;
  }

  if (typeof value === 'object') {
    const candidateKeys = ['value', 'label', 'name', 'title'];
    for (const key of candidateKeys) {
      const candidate = (value as Record<string, unknown>)[key];
      const normalized = normalizeString(candidate);
      if (normalized) {
        return normalized;
      }
    }
  }

  return undefined;
}

function normalizeStringArray(value: unknown): string[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    const normalized = value
      .map((entry) => normalizeString(entry))
      .filter((entry): entry is string => Boolean(entry));
    return Array.from(new Set(normalized));
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return normalizeStringArray(parsed);
      }
    } catch (error) {
      // JSON parse failed; fallback to comma-separated handling
    }

    const parts = value
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part.length > 0);

    if (parts.length > 0) {
      return Array.from(new Set(parts));
    }

    const normalized = normalizeString(value);
    return normalized ? [normalized] : [];
  }

  return [];
}

type SnapshotMap = Record<string, unknown>;

const MAX_PROPERTY_VALUE_LENGTH = 400;
const FIRST_MATCH_KEYS = ['value', 'label', 'name', 'title', 'url', 'address'];

type ProjectSelect = typeof projects.$inferSelect;
type ProjectSnapSelect = typeof projectSnaps.$inferSelect;

type ProjectRecordForStructured = Pick<
  ProjectSelect,
  | 'id'
  | 'name'
  | 'tagline'
  | 'mainDescription'
  | 'logoUrl'
  | 'tags'
  | 'categories'
  | 'appUrl'
  | 'dateFounded'
  | 'dateLaunch'
  | 'devStatus'
  | 'fundingStatus'
  | 'openSource'
  | 'codeRepo'
  | 'tokenContract'
  | 'orgStructure'
  | 'publicGoods'
  | 'founders'
  | 'websites'
  | 'whitePaper'
  | 'dappSmartContracts'
>;

type ProjectSnapRecordForStructured = Pick<
  ProjectSnapSelect,
  'id' | 'projectId' | 'name' | 'categories' | 'items' | 'createdAt'
>;

function normalizeBoolean(value: unknown): boolean | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
    return undefined;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (!normalized) {
      return undefined;
    }
    if (['true', 'yes', 'y', '1'].includes(normalized)) {
      return true;
    }
    if (['false', 'no', 'n', '0'].includes(normalized)) {
      return false;
    }
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      const normalized = normalizeBoolean(entry);
      if (normalized !== undefined) {
        return normalized;
      }
    }
  }

  if (typeof value === 'object') {
    for (const key of FIRST_MATCH_KEYS) {
      if (key in (value as Record<string, unknown>)) {
        const normalized = normalizeBoolean(
          (value as Record<string, unknown>)[key],
        );
        if (normalized !== undefined) {
          return normalized;
        }
      }
    }
  }

  return undefined;
}

function normalizeDate(value: unknown): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value.toISOString();
  }

  if (typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }

    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }

    return trimmed;
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      const normalized = normalizeDate(entry);
      if (normalized) {
        return normalized;
      }
    }
  }

  if (typeof value === 'object') {
    for (const key of FIRST_MATCH_KEYS) {
      if (key in (value as Record<string, unknown>)) {
        const normalized = normalizeDate(
          (value as Record<string, unknown>)[key],
        );
        if (normalized) {
          return normalized;
        }
      }
    }
  }

  return undefined;
}

function ensureArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (value === null || value === undefined) {
    return [];
  }

  return [value as T];
}

function pickFirstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    const normalized = normalizeString(value);
    if (normalized) {
      return normalized;
    }
  }
  return undefined;
}

function collectUniqueStrings(...values: unknown[]): string[] {
  const collected = new Set<string>();

  for (const value of values) {
    const normalized = normalizeStringArray(value);
    for (const entry of normalized) {
      collected.add(entry);
    }
  }

  return Array.from(collected);
}

function pickBoolean(...values: unknown[]): boolean | undefined {
  for (const value of values) {
    const normalized = normalizeBoolean(value);
    if (normalized !== undefined) {
      return normalized;
    }
  }
  return undefined;
}

function pickDate(...values: unknown[]): string | undefined {
  for (const value of values) {
    const normalized = normalizeDate(value);
    if (normalized) {
      return normalized;
    }
  }
  return undefined;
}

function normalizeUrl(value: unknown): string | undefined {
  const normalized = normalizeString(value);
  if (!normalized) {
    return undefined;
  }
  return normalized;
}

function normalizeWebsites(...values: unknown[]): Array<{
  title?: string;
  url: string;
}> {
  const result = new Map<string, { title?: string; url: string }>();

  for (const value of values) {
    for (const entry of ensureArray<unknown>(value)) {
      if (!entry) {
        continue;
      }

      if (typeof entry === 'string') {
        const url = normalizeUrl(entry);
        if (url) {
          result.set(url, { url });
        }
        continue;
      }

      if (typeof entry === 'object') {
        const record = entry as Record<string, unknown>;
        const url =
          normalizeUrl(record.url) ??
          normalizeUrl(record.link) ??
          normalizeUrl(record.value);
        if (!url) {
          continue;
        }

        const title =
          normalizeString(record.title) ??
          normalizeString(record.name) ??
          normalizeString(record.label) ??
          normalizeString(record.platform);

        result.set(url, title ? { title, url } : { url });
      }
    }
  }

  return Array.from(result.values());
}

function normalizeSocialLinks(...values: unknown[]): string[] {
  const links = new Set<string>();

  for (const value of values) {
    for (const entry of ensureArray<unknown>(value)) {
      if (!entry) {
        continue;
      }

      if (typeof entry === 'string') {
        const url = normalizeUrl(entry);
        if (url) {
          links.add(url);
        }
        continue;
      }

      if (typeof entry === 'object') {
        const record = entry as Record<string, unknown>;
        const url =
          normalizeUrl(record.url) ??
          normalizeUrl(record.link) ??
          normalizeUrl(record.value);
        if (url) {
          links.add(url);
        }
      }
    }
  }

  return Array.from(links);
}

function normalizeFounders(...values: unknown[]): Array<{
  name: string;
  title?: string;
}> {
  const map = new Map<string, { name: string; title?: string }>();

  for (const value of values) {
    for (const entry of ensureArray<unknown>(value)) {
      if (!entry) {
        continue;
      }

      if (typeof entry === 'string') {
        const name = normalizeString(entry);
        if (name) {
          map.set(name.toLowerCase(), { name });
        }
        continue;
      }

      if (typeof entry === 'object') {
        const record = entry as Record<string, unknown>;
        const name =
          normalizeString(record.name) ??
          normalizeString(record.title) ??
          normalizeString(record.label);

        if (!name) {
          continue;
        }

        const title =
          normalizeString(record.title) ??
          normalizeString(record.role) ??
          normalizeString(record.position);

        map.set(name.toLowerCase(), title ? { name, title } : { name });
      }
    }
  }

  return Array.from(map.values());
}

function normalizeSmartContracts(...values: unknown[]): Array<{
  id?: string;
  chain?: string;
  addresses?: string;
}> {
  const result = new Map<
    string,
    { id?: string; chain?: string; addresses?: string }
  >();

  for (const value of values) {
    for (const entry of ensureArray<unknown>(value)) {
      if (!entry) {
        continue;
      }

      if (typeof entry === 'string') {
        const addresses = normalizeString(entry);
        if (addresses) {
          result.set(addresses, { addresses });
        }
        continue;
      }

      if (typeof entry === 'object') {
        const record = entry as Record<string, unknown>;
        const addresses = normalizeString(record.addresses);
        const chain = normalizeString(record.chain);
        const id = normalizeString(record.id);

        const key =
          addresses ??
          chain ??
          id ??
          JSON.stringify(record, (_, v) =>
            typeof v === 'undefined' ? null : v,
          );

        if (!key) {
          continue;
        }

        result.set(key, {
          ...(id ? { id } : {}),
          ...(chain ? { chain } : {}),
          ...(addresses ? { addresses } : {}),
        });
      }
    }
  }

  return Array.from(result.values());
}

function truncateValue(value: string): string {
  return value.length > MAX_PROPERTY_VALUE_LENGTH
    ? `${value.slice(0, MAX_PROPERTY_VALUE_LENGTH - 1)}…`
    : value;
}

function stringifyValue(value: unknown): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value.toISOString();
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? truncateValue(trimmed) : undefined;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    const parts = value
      .map((entry) => stringifyValue(entry))
      .filter((entry): entry is string => Boolean(entry));
    if (parts.length === 0) {
      return undefined;
    }
    return truncateValue(Array.from(new Set(parts)).join(', '));
  }

  if (typeof value === 'object') {
    for (const key of FIRST_MATCH_KEYS) {
      if (key in (value as Record<string, unknown>)) {
        const normalized = stringifyValue(
          (value as Record<string, unknown>)[key],
        );
        if (normalized) {
          return truncateValue(normalized);
        }
      }
    }

    const json = JSON.stringify(value);
    if (!json) {
      return undefined;
    }
    return truncateValue(json);
  }

  return undefined;
}

function toSnapshotItems(snap: { items?: unknown } | null): SnapshotItem[] {
  if (!snap || !Array.isArray(snap.items)) {
    return [];
  }

  return (snap.items as SnapshotItem[]).filter((item): item is SnapshotItem =>
    Boolean(item && typeof item === 'object' && typeof item.key === 'string'),
  );
}

function toSnapshotMap(items: SnapshotItem[]): SnapshotMap {
  const map: SnapshotMap = {};
  for (const item of items) {
    if (!item || typeof item.key !== 'string') {
      continue;
    }
    map[item.key] = item.value;
  }
  return map;
}

type ProjectSource = {
  project: ProjectRecordForStructured | null;
  snap: ProjectSnapRecordForStructured | null;
};

async function fetchProjectSource(id: number): Promise<ProjectSource> {
  const [snap, project] = await Promise.all([
    db.query.projectSnaps.findFirst({
      where: eq(projectSnaps.projectId, id),
      columns: {
        id: true,
        projectId: true,
        name: true,
        categories: true,
        items: true,
        createdAt: true,
      },
      orderBy: (table) => [desc(table.createdAt)],
    }),
    db.query.projects.findFirst({
      where: eq(projects.id, id),
      columns: {
        id: true,
        name: true,
        tagline: true,
        mainDescription: true,
        logoUrl: true,
        tags: true,
        categories: true,
        appUrl: true,
        dateFounded: true,
        dateLaunch: true,
        devStatus: true,
        fundingStatus: true,
        openSource: true,
        codeRepo: true,
        tokenContract: true,
        orgStructure: true,
        publicGoods: true,
        founders: true,
        websites: true,
        whitePaper: true,
        dappSmartContracts: true,
      },
    }),
  ]);

  return {
    project: project ?? null,
    snap: snap ?? null,
  };
}

function buildAdditionalProperties(items: SnapshotItem[]): Array<{
  name: string;
  value: string;
}> {
  const map = new Map<string, string>();
  for (const item of items) {
    if (!item || typeof item.key !== 'string') {
      continue;
    }
    const value = stringifyValue(item.value);
    if (!value) {
      continue;
    }
    if (!map.has(item.key)) {
      map.set(item.key, value);
    }
  }
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

export interface ProjectStructuredData {
  id: number;
  name?: string;
  tagline?: string;
  mainDescription?: string;
  logoUrl?: string;
  tags: string[];
  categories: string[];
  appUrl?: string;
  websites: Array<{ title?: string; url: string }>;
  socialLinks: string[];
  founders: Array<{ name: string; title?: string }>;
  orgStructure?: string;
  publicGoods?: boolean;
  fundingStatus?: string;
  devStatus?: string;
  openSource?: boolean;
  codeRepo?: string;
  whitePaper?: string;
  tokenContract?: string;
  dappSmartContracts: Array<{
    id?: string;
    chain?: string;
    addresses?: string;
  }>;
  dateFounded?: string;
  dateLaunch?: string;
  additionalProperties: Array<{ name: string; value: string }>;
  snapshotItems: SnapshotItem[];
}

function deriveStructuredData(
  source: ProjectSource,
  resolvedId: number,
): ProjectStructuredData {
  const { project, snap } = source;
  const snapshotItems = toSnapshotItems(snap);
  const snapshotMap = toSnapshotMap(snapshotItems);

  const name = pickFirstString(snap?.name, snapshotMap.name, project?.name);

  const tagline = pickFirstString(snapshotMap.tagline, project?.tagline, name);
  const mainDescription = pickFirstString(
    snapshotMap.mainDescription,
    project?.mainDescription,
    tagline,
  );
  const logoUrl = pickFirstString(snapshotMap.logoUrl, project?.logoUrl);

  const tags = collectUniqueStrings(
    snapshotMap.tags,
    snapshotMap.categories,
    snap?.categories,
    project?.tags,
  );

  const categories = collectUniqueStrings(
    snapshotMap.categories,
    snap?.categories,
    project?.categories,
  );

  const appUrl = pickFirstString(snapshotMap.appUrl, project?.appUrl);
  const websites = normalizeWebsites(snapshotMap.websites, project?.websites);
  const socialLinks = normalizeSocialLinks(snapshotMap.social_links);
  const founders = normalizeFounders(snapshotMap.founders, project?.founders);

  const orgStructure = pickFirstString(
    snapshotMap.orgStructure,
    project?.orgStructure,
  );
  const publicGoods = pickBoolean(
    snapshotMap.publicGoods,
    project?.publicGoods,
  );
  const fundingStatus = pickFirstString(
    snapshotMap.fundingStatus,
    project?.fundingStatus,
  );
  const devStatus = pickFirstString(snapshotMap.devStatus, project?.devStatus);
  const openSource = pickBoolean(snapshotMap.openSource, project?.openSource);
  const codeRepo = pickFirstString(snapshotMap.codeRepo, project?.codeRepo);
  const whitePaper = pickFirstString(
    snapshotMap.whitePaper,
    project?.whitePaper,
  );
  const tokenContract = pickFirstString(
    snapshotMap.tokenContract,
    project?.tokenContract,
  );
  const dappSmartContracts = normalizeSmartContracts(
    snapshotMap.dappSmartContracts,
    project?.dappSmartContracts,
  );

  const dateFounded = pickDate(snapshotMap.dateFounded, project?.dateFounded);
  const dateLaunch = pickDate(snapshotMap.dateLaunch, project?.dateLaunch);

  const additionalProperties = buildAdditionalProperties(snapshotItems);

  return {
    id: resolvedId,
    name,
    tagline,
    mainDescription,
    logoUrl,
    tags,
    categories,
    appUrl,
    websites,
    socialLinks,
    founders,
    orgStructure,
    publicGoods,
    fundingStatus,
    devStatus,
    openSource,
    codeRepo,
    whitePaper,
    tokenContract,
    dappSmartContracts,
    dateFounded,
    dateLaunch,
    additionalProperties,
    snapshotItems,
  };
}

export async function getProjectStructuredData(
  id: number,
): Promise<ProjectStructuredData | null> {
  try {
    const source = await fetchProjectSource(id);
    const resolvedId = source.project?.id ?? source.snap?.projectId;

    if (!resolvedId) {
      return null;
    }

    return deriveStructuredData(source, resolvedId);
  } catch (error) {
    console.error('Failed to fetch project structured data:', error);
    return null;
  }
}

export const getProjectForMeta = unstable_cache(
  async (id: number) => {
    try {
      const structured = await getProjectStructuredData(id);

      if (!structured) {
        return null;
      }

      const tags =
        structured.tags.length > 0 ? structured.tags : structured.categories;

      return {
        id: structured.id,
        name: structured.name ?? '',
        tagline: structured.tagline ?? structured.name ?? '',
        mainDescription: structured.mainDescription ?? structured.tagline ?? '',
        logoUrl: structured.logoUrl ?? '',
        tags,
      };
    } catch (error) {
      console.error('Failed to fetch project for meta:', error);

      return null;
    }
  },
  ['project-meta'],
  {
    revalidate: 3600,
    tags: ['project-detail'],
  },
);

export const getProjectPublicationStatus = unstable_cache(
  async (id: number) => {
    try {
      const project = await db.query.projects.findFirst({
        where: eq(projects.id, id),
        columns: {
          id: true,
          isPublished: true,
        },
      });

      return project ?? null;
    } catch (error) {
      console.error('Failed to fetch project publication status:', error);
      return null;
    }
  },
  ['project-publication-status'],
  {
    revalidate: 300,
    tags: ['project-detail'],
  },
);

export async function getTopAccountableProjects(
  limit = 3,
): Promise<ProjectStructuredData[]> {
  try {
    const genesisSupportScore = sql<number>`
      (${ranks.publishedGenesisWeight}) * sqrt(GREATEST(${projects.support}, 0))
    `;

    const rows = await db
      .select({ projectId: projects.id })
      .from(ranks)
      .innerJoin(projects, eq(ranks.projectId, projects.id))
      .where(eq(projects.isPublished, true))
      .orderBy(desc(genesisSupportScore), desc(ranks.id))
      .limit(limit * 2);

    const projectIds = rows
      .map((row) => row.projectId)
      .filter((value): value is number => typeof value === 'number');

    if (projectIds.length === 0) {
      return [];
    }

    const uniqueIds = Array.from(new Set(projectIds)).slice(0, limit);

    const structuredData: Array<ProjectStructuredData | null> = [];
    for (const projectId of uniqueIds) {
      try {
        const data = await getProjectStructuredData(projectId);
        structuredData.push(data);
      } catch (error) {
        console.error(
          `Failed to resolve structured data for project ${projectId}:`,
          error,
        );
        structuredData.push(null);
      }
    }

    return structuredData.filter((item): item is ProjectStructuredData =>
      Boolean(item),
    );
  } catch (error) {
    console.error('Failed to fetch top accountable projects:', error);
    return [];
  }
}

export async function getTopTransparentProjects(
  limit = 3,
): Promise<ProjectStructuredData[]> {
  try {
    const rows = await db
      .select({ projectId: projects.id })
      .from(ranks)
      .innerJoin(projects, eq(ranks.projectId, projects.id))
      .where(eq(projects.isPublished, true))
      .orderBy(desc(ranks.publishedGenesisWeight), desc(ranks.id))
      .limit(limit * 2);

    const projectIds = rows
      .map((row) => row.projectId)
      .filter((value): value is number => typeof value === 'number');

    if (projectIds.length === 0) {
      return [];
    }

    const uniqueIds = Array.from(new Set(projectIds)).slice(0, limit);

    const structuredData: Array<ProjectStructuredData | null> = [];
    for (const projectId of uniqueIds) {
      try {
        const data = await getProjectStructuredData(projectId);
        structuredData.push(data);
      } catch (error) {
        console.error(
          `Failed to resolve structured data for project ${projectId}:`,
          error,
        );
        structuredData.push(null);
      }
    }

    return structuredData.filter((item): item is ProjectStructuredData =>
      Boolean(item),
    );
  } catch (error) {
    console.error('Failed to fetch top transparent projects:', error);
    return [];
  }
}

export interface HomePageStats {
  verifiedProjects: number;
  expertContributors: number;
  governanceVotes: number;
  pendingProjects: number;
}

async function fetchHomePageStatsFromDB(): Promise<HomePageStats | null> {
  try {
    const [
      verifiedProjectsResult,
      expertContributorsResult,
      governanceVotesResult,
      pendingProjectsResult,
    ] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(projects)
        .where(eq(projects.isPublished, true)),

      db
        .select({ count: sql<number>`count(*)` })
        .from(profiles)
        .where(
          sql`${profiles.address} IS NOT NULL 
              AND ${profiles.address} != '' 
              AND ${profiles.address} != '0x0000000000000000000000000000000000000000'
              AND length(${profiles.address}) = 42`,
        ),

      db.select({ count: sql<number>`count(*)` }).from(voteRecords),

      db
        .select({ count: sql<number>`count(*)` })
        .from(projects)
        .where(eq(projects.isPublished, false)),
    ]);

    return {
      verifiedProjects: verifiedProjectsResult[0]?.count ?? 0,
      expertContributors: expertContributorsResult[0]?.count ?? 0,
      governanceVotes: governanceVotesResult[0]?.count ?? 0,
      pendingProjects: pendingProjectsResult[0]?.count ?? 0,
    };
  } catch (error) {
    console.error('Failed to fetch homepage stats:', error);

    return null;
  }
}

export const getHomePageStats = unstable_cache(
  fetchHomePageStatsFromDB,
  ['homepage-stats-daily'],
  {
    revalidate: 86400,
    tags: ['homepage-stats'],
  },
);
