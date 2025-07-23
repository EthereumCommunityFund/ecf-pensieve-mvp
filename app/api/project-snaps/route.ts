import { and, desc, eq, sql } from 'drizzle-orm';
import { LRUCache } from 'lru-cache';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { projectSnaps } from '@/lib/db/schema';

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

export async function GET(request: NextRequest) {
  try {
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { error: 'Invalid or missing API key' },
        { status: 401 },
      );
    }

    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

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
    const category = searchParams.get('category');
    const projectId = searchParams.get('projectId');
    const limit = Math.min(
      Math.max(1, parseInt(searchParams.get('limit') || '20')),
      200,
    );
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'));

    const conditions = [];

    if (projectId) {
      const projId = parseInt(projectId);
      if (!isNaN(projId) && projId > 0) {
        conditions.push(eq(projectSnaps.projectId, projId));
      }
    }

    if (category) {
      if (/^[a-zA-Z0-9-]+$/.test(category)) {
        conditions.push(sql`${category} = ANY(${projectSnaps.categories})`);
      }
    }

    const whereCondition =
      conditions.length > 0 ? and(...conditions) : undefined;

    const [results, countResult] = await Promise.all([
      db
        .select({
          id: projectSnaps.id,
          createdAt: projectSnaps.createdAt,
          projectId: projectSnaps.projectId,
          items: projectSnaps.items,
          name: projectSnaps.name,
          categories: projectSnaps.categories,
        })
        .from(projectSnaps)
        .where(whereCondition)
        .orderBy(desc(projectSnaps.createdAt))
        .limit(limit)
        .offset(offset),

      db
        .select({ count: sql<number>`count(*)::int` })
        .from(projectSnaps)
        .where(whereCondition),
    ]);

    const total = countResult[0]?.count ?? 0;

    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=15, s-maxage=15');

    return NextResponse.json(
      {
        data: results,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + results.length < total,
        },
      },
      { headers },
    );
  } catch (error) {
    console.error('Error fetching project snaps:', error);
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
