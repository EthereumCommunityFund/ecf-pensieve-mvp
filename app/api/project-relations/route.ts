import { randomUUID } from 'crypto';

import { desc, eq, sql } from 'drizzle-orm';
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
] as const;

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

const getItemValue = (items: IProposalItem[], key: EcosystemItemKey) => {
  const match = items.find((item) => item.key === key);
  return match?.value ?? null;
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

const formatProjectPayload = (snapshot: ProjectSnap) => {
  const { sections, counts } = buildSectionsFromItems(
    snapshot.items as IProposalItem[] | null | undefined,
  );

  return {
    id: snapshot.projectId,
    name: snapshot.name ?? '',
    categories: snapshot.categories ?? [],
    snapshot: {
      id: snapshot.id,
      createdAt: snapshot.createdAt?.toISOString?.() ?? null,
    },
    affiliation: sections.affiliated_projects,
    stack_and_integrations: sections.stack_integrations,
    contributing_teams: sections.contributing_teams,
    ecosystem_counts: counts,
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
    const projectIdParam = searchParams.get('projectId');

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

      const projectPayload = formatProjectPayload(snapshot);

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
          },
        },
        { headers: createResponseHeaders() },
      );
    }

    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    const limit = Math.min(
      Math.max(1, parseInt(limitParam ?? '20', 10) || 20),
      300,
    );
    const offset = Math.max(0, parseInt(offsetParam ?? '0', 10) || 0);

    const [snapshots, countResult] = await Promise.all([
      db.query.projectSnaps.findMany({
        orderBy: desc(projectSnaps.createdAt),
        limit,
        offset,
      }),
      db.select({ count: sql<number>`count(*)::int` }).from(projectSnaps),
    ]);

    const projects = snapshots.map(formatProjectPayload);
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
