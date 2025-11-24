import { sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';

const FORBIDDEN_KEYWORDS = [
  'insert',
  'update',
  'delete',
  'drop',
  'alter',
  'create',
  'grant',
  'revoke',
  'truncate',
  'comment',
  'merge',
  'call',
  'do',
  'prepare',
  'execute',
  'replace',
  'rename',
  'vacuum',
  'analyze',
];

function validateApiKey(request: NextRequest): boolean {
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  const authorization = request.headers.get('authorization');
  const bearerToken = authorization?.match(/^Bearer\\s+(.+)$/i)?.[1]?.trim();
  const validApiKey = process.env.AI_BOT_SECRET?.trim();

  if (!bearerToken || !validApiKey) {
    return false;
  }

  return bearerToken === validApiKey;
}

function sanitizeSql(query: string): string {
  return query.trim().replace(/;+\s*$/, '');
}

function hasForbiddenKeywords(normalizedQuery: string): boolean {
  return FORBIDDEN_KEYWORDS.some((keyword) =>
    new RegExp(`\\b${keyword}\\b`, 'i').test(normalizedQuery),
  );
}

function validateSelectOnly(
  query: string,
): { ok: true; sql: string } | { ok: false; reason: string } {
  const sanitized = sanitizeSql(query);

  if (!sanitized) {
    return { ok: false, reason: 'SQL is required' };
  }

  if (/;/.test(sanitized)) {
    return { ok: false, reason: 'Multiple statements are not allowed' };
  }

  const normalized = sanitized.toLowerCase();

  if (!normalized.startsWith('select') && !normalized.startsWith('with')) {
    return { ok: false, reason: 'Only SELECT queries are allowed' };
  }

  if (/--|\/\*/.test(normalized)) {
    return { ok: false, reason: 'SQL comments are not allowed' };
  }

  if (!normalized.includes('select')) {
    return { ok: false, reason: 'SELECT clause is required' };
  }

  if (hasForbiddenKeywords(normalized)) {
    return { ok: false, reason: 'Write operations are not allowed' };
  }

  return { ok: true, sql: sanitized };
}

function serializeValue(value: unknown): unknown {
  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeValue(item));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, val]) => [
        key,
        serializeValue(val),
      ]),
    );
  }

  return value;
}

export async function POST(request: NextRequest) {
  try {
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { error: 'Invalid or missing API key' },
        { status: 401 },
      );
    }

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const body = (payload ?? {}) as Record<string, unknown>;
    const inputSql = typeof body.sql === 'string' ? body.sql : null;
    const userId = typeof body.user_id === 'string' ? body.user_id.trim() : '';

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 },
      );
    }

    if (!inputSql) {
      return NextResponse.json(
        { error: 'sql must be a string' },
        { status: 400 },
      );
    }

    const validation = validateSelectOnly(inputSql);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.reason }, { status: 400 });
    }

    const result = await db.execute(sql.raw(validation.sql));
    console.info('SQL query executed for dify', {
      userId,
      sql: validation.sql,
      result,
    });
    return NextResponse.json({
      data: result,
    });
  } catch (error) {
    console.error('Error executing SQL query:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
