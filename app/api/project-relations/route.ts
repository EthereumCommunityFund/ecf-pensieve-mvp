import { randomUUID } from 'crypto';

import { asc, desc, eq, sql } from 'drizzle-orm';
import { LRUCache } from 'lru-cache';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { projectSnaps } from '@/lib/db/schema';
import type { ProjectSnap } from '@/lib/db/schema/projectSnaps';
import { IProposalItem } from '@/types/item';

export const runtime = 'nodejs';

const requestCounts = new LRUCache<
  string,
  { count: number; resetTime: number }
>({
  max: 10000,
  ttl: 90 * 1000,
  updateAgeOnGet: false,
  updateAgeOnHas: false,
});

const RATE_LIMIT = 500;
const RATE_WINDOW = 60 * 1000;

const ECOSYSTEM_ITEM_KEYS = [
  'affiliated_projects',
  'stack_integrations',
  'contributing_teams',
  'funding_received_grants',
] as const;
const SNAPSHOT_EXCLUDED_KEYS = new Set<string>([
  'name',
  'categories',
  'tags',
  ...ECOSYSTEM_ITEM_KEYS,
]);

type SectionProjectFieldConfig = {
  sourceKey: string;
  targetKey?: string;
};

const SECTION_PROJECT_FIELDS: Partial<
  Record<EcosystemItemKey, SectionProjectFieldConfig[]>
> = {
  affiliated_projects: [{ sourceKey: 'project', targetKey: 'project_name' }],
  stack_integrations: [{ sourceKey: 'project', targetKey: 'project_name' }],
  contributing_teams: [{ sourceKey: 'project', targetKey: 'project_name' }],
  funding_received_grants: [
    { sourceKey: 'organization', targetKey: 'organization_name' },
    { sourceKey: 'projectDonator', targetKey: 'projectDonator_name' },
  ],
};

type ProjectNameCache = Map<string, string | null>;
const NUMERIC_PROJECT_ID_REGEX = /^\d+$/;

type EcosystemItemKey = (typeof ECOSYSTEM_ITEM_KEYS)[number];
type EcosystemRow = Record<string, any>;

function validateApiKey(request: NextRequest): boolean {
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  const apiKey = request.headers.get('x-api-key');
  const validApiKey = process.env.API_KEY;

  return apiKey === validApiKey;
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = requestCounts.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    if (userLimit) {
      requestCounts.delete(ip);
    }
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }

  userLimit.count++;
  return true;
}

const getClientIp = (request: NextRequest): string => {
  return (
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
};

const isPlainObject = (value: unknown): value is Record<string, any> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

function normalizeTableRows(value: unknown): EcosystemRow[] {
  if (value == null) {
    return [];
  }

  let processed = value;
  if (typeof processed === 'string') {
    try {
      processed = JSON.parse(processed);
    } catch {
      return [];
    }
  }

  const rows = Array.isArray(processed)
    ? processed
    : isPlainObject(processed)
      ? [processed]
      : [];

  return rows.filter(isPlainObject).map((row) => ({
    ...row,
    _id:
      typeof row._id === 'string' && row._id.trim().length > 0
        ? row._id
        : randomUUID(),
  }));
}

const getProjectIdKey = (value: unknown): string | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? value.toString() : null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return NUMERIC_PROJECT_ID_REGEX.test(trimmed) ? trimmed : null;
  }

  return null;
};

const extractProjectIdsFromValue = (value: unknown): string[] => {
  if (value == null) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) => getProjectIdKey(entry))
      .filter((id): id is string => Boolean(id));
  }

  const id = getProjectIdKey(value);
  return id ? [id] : [];
};

const collectProjectIdsFromSections = (
  sections: Record<EcosystemItemKey, EcosystemRow[]>,
): string[] => {
  const ids = new Set<string>();

  (Object.keys(SECTION_PROJECT_FIELDS) as EcosystemItemKey[]).forEach((key) => {
    const fieldConfigs = SECTION_PROJECT_FIELDS[key];
    if (!fieldConfigs?.length) {
      return;
    }

    const rows = sections[key] ?? [];
    rows.forEach((row) => {
      fieldConfigs.forEach(({ sourceKey }) => {
        extractProjectIdsFromValue(row[sourceKey]).forEach((id) => ids.add(id));
      });
    });
  });

  return Array.from(ids);
};

const addProjectNamesForFields = (
  row: EcosystemRow,
  fieldConfigs: SectionProjectFieldConfig[],
  projectNameCache: ProjectNameCache,
): EcosystemRow => {
  let updatedRow = row;

  fieldConfigs.forEach(({ sourceKey, targetKey }) => {
    const projectValue = row[sourceKey];
    if (projectValue == null) {
      return;
    }

    const resolvedTargetKey = targetKey ?? `${sourceKey}_name`;

    if (Array.isArray(projectValue)) {
      const projectNames = projectValue.map((value) => {
        const key = getProjectIdKey(value);
        if (!key) return null;
        return projectNameCache.get(key) ?? null;
      });

      if (projectNames.some((name) => name != null)) {
        if (updatedRow === row) {
          updatedRow = { ...row };
        }

        updatedRow[resolvedTargetKey] = projectNames;
      }

      return;
    }

    const key = getProjectIdKey(projectValue);
    if (!key) {
      return;
    }

    const projectName = projectNameCache.get(key);
    if (projectName == null) {
      return;
    }

    if (updatedRow === row) {
      updatedRow = { ...row };
    }

    updatedRow[resolvedTargetKey] = projectName;
  });

  return updatedRow;
};

const enrichSectionsWithProjectNames = async (
  sections: Record<EcosystemItemKey, EcosystemRow[]>,
  projectNameCache: ProjectNameCache,
) => {
  const ids = collectProjectIdsFromSections(sections);
  const idsToFetch = ids.filter((id) => !projectNameCache.has(id));

  if (idsToFetch.length) {
    const numericIds = idsToFetch
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id) && id > 0);

    if (numericIds.length) {
      const snapshots = await Promise.all(
        numericIds.map((projectId) =>
          db.query.projectSnaps.findFirst({
            where: eq(projectSnaps.projectId, projectId),
            columns: {
              projectId: true,
              name: true,
            },
            orderBy: desc(projectSnaps.createdAt),
          }),
        ),
      );

      snapshots.forEach((snapshot) => {
        if (snapshot) {
          projectNameCache.set(
            String(snapshot.projectId),
            snapshot.name ?? null,
          );
        }
      });
    }

    idsToFetch.forEach((id) => {
      if (!projectNameCache.has(id)) {
        projectNameCache.set(id, null);
      }
    });
  }

  const updatedSections = { ...sections };

  (Object.keys(SECTION_PROJECT_FIELDS) as EcosystemItemKey[]).forEach((key) => {
    const fieldConfigs = SECTION_PROJECT_FIELDS[key];
    if (!fieldConfigs?.length) {
      return;
    }

    const rows = sections[key];
    if (!rows || rows.length === 0) {
      return;
    }

    updatedSections[key] = rows.map((row) =>
      addProjectNamesForFields(row, fieldConfigs, projectNameCache),
    );
  });

  return updatedSections;
};

const getItemValue = (items: IProposalItem[], key: EcosystemItemKey) => {
  const match = items.find((item) => item.key === key);
  return match?.value ?? null;
};

const normalizeStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === 'string' ? entry.trim() : null))
      .filter((entry): entry is string => Boolean(entry));
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
};

const createResponseHeaders = () => {
  const headers = new Headers();
  headers.set('Cache-Control', 'public, max-age=60, s-maxage=120');
  headers.set('Access-Control-Allow-Origin', '*');
  return headers;
};

const buildSectionsFromItems = (
  items: IProposalItem[] | null | undefined,
): {
  sections: Record<EcosystemItemKey, EcosystemRow[]>;
  counts: Record<EcosystemItemKey, number>;
} => {
  const typedItems = Array.isArray(items) ? items : [];

  const sections = ECOSYSTEM_ITEM_KEYS.reduce(
    (acc, key) => {
      acc[key] = normalizeTableRows(getItemValue(typedItems, key));
      return acc;
    },
    {} as Record<EcosystemItemKey, EcosystemRow[]>,
  );

  const counts = ECOSYSTEM_ITEM_KEYS.reduce(
    (acc, key) => {
      acc[key] = sections[key].length;
      return acc;
    },
    {} as Record<EcosystemItemKey, number>,
  );

  return { sections, counts };
};

const formatProjectPayload = async (
  snapshot: ProjectSnap,
  projectNameCache: ProjectNameCache,
  includeSnapshot: boolean,
) => {
  const typedItems = Array.isArray(snapshot.items)
    ? (snapshot.items as IProposalItem[])
    : [];
  const { sections, counts } = buildSectionsFromItems(typedItems);

  const sectionsWithNames = await enrichSectionsWithProjectNames(
    sections,
    projectNameCache,
  );

  const tags = normalizeStringArray(
    typedItems.find((item) => item.key === 'tags')?.value,
  );

  const snapshotItems =
    includeSnapshot && typedItems.length
      ? typedItems.reduce<Record<string, unknown>>((acc, item) => {
          if (item?.key && !SNAPSHOT_EXCLUDED_KEYS.has(item.key)) {
            acc[item.key] = item.value ?? null;
          }
          return acc;
        }, {})
      : undefined;

  return {
    id: snapshot.projectId,
    name: snapshot.name ?? '',
    categories: snapshot.categories ?? [],
    tags,
    snapshot: {
      id: snapshot.id,
      createdAt: snapshot.createdAt?.toISOString?.() ?? null,
    },
    affiliation: sectionsWithNames.affiliated_projects,
    stack_and_integrations: sectionsWithNames.stack_integrations,
    contributing_teams: sectionsWithNames.contributing_teams,
    funding_received_grants: sectionsWithNames.funding_received_grants,
    ecosystem_counts: counts,
    ...(snapshotItems && Object.keys(snapshotItems).length
      ? snapshotItems
      : {}),
  };
};

export async function GET(request: NextRequest) {
  try {
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { error: 'Invalid or missing API key' },
        { status: 401 },
      );
    }

    const ip = getClientIp(request);
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: { 'Retry-After': '60' },
        },
      );
    }

    const { searchParams } = new URL(request.url);
    const projectNameCache: ProjectNameCache = new Map();
    const projectIdParam = searchParams.get('projectId');
    const includeSnapshotParam = searchParams.get('includeSnapshot');
    const includeSnapshot =
      includeSnapshotParam === null
        ? true
        : includeSnapshotParam.toLowerCase() !== 'false';

    if (projectIdParam) {
      const projectId = Number(projectIdParam);
      if (!Number.isInteger(projectId) || projectId <= 0) {
        return NextResponse.json(
          { error: 'projectId must be a positive integer' },
          { status: 400 },
        );
      }

      const snapshot = await db.query.projectSnaps.findFirst({
        where: eq(projectSnaps.projectId, projectId),
        orderBy: desc(projectSnaps.createdAt),
      });

      if (!snapshot) {
        return NextResponse.json(
          { error: 'Project snapshot not found' },
          { status: 404 },
        );
      }

      const projectPayload = await formatProjectPayload(
        snapshot,
        projectNameCache,
        includeSnapshot,
      );

      return NextResponse.json(
        {
          data: {
            project: projectPayload,
          },
          metadata: {
            source: 'project_snaps',
            snapshot_id: snapshot.id,
            last_updated: projectPayload.snapshot.createdAt,
            counts: projectPayload.ecosystem_counts,
            include_snapshot_items: includeSnapshot,
          },
        },
        { headers: createResponseHeaders() },
      );
    }

    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const maxLimit = includeSnapshot ? 50 : 300;

    const limit = Math.min(
      Math.max(1, parseInt(limitParam ?? '20', 10) || 20),
      maxLimit,
    );
    const offset = Math.max(0, parseInt(offsetParam ?? '0', 10) || 0);

    const [snapshots, countResult] = await Promise.all([
      db.query.projectSnaps.findMany({
        orderBy: [asc(projectSnaps.projectId), desc(projectSnaps.createdAt)],
        limit,
        offset,
      }),
      db.select({ count: sql<number>`count(*)::int` }).from(projectSnaps),
    ]);

    const projects = await Promise.all(
      snapshots.map((snapshot) =>
        formatProjectPayload(snapshot, projectNameCache, includeSnapshot),
      ),
    );
    const total = countResult[0]?.count ?? 0;

    return NextResponse.json(
      {
        data: {
          projects,
        },
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + projects.length < total,
        },
        metadata: {
          source: 'project_snaps',
          keys: ECOSYSTEM_ITEM_KEYS,
          include_snapshot_items: includeSnapshot,
          max_limit: maxLimit,
        },
      },
      { headers: createResponseHeaders() },
    );
  } catch (error) {
    console.error('Error generating open API payload:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
    },
  });
}
