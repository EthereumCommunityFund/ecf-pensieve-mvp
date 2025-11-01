import { NextResponse } from 'next/server';

import {
  generateRankingSnapshotTweets,
  sendRankingSnapshotTweet,
} from '@/lib/services/twitter';

export const maxDuration = 300;

async function handleCronJob(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    const authHeader = request.headers.get('authorization');

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', {
        status: 401,
      });
    }
  }

  try {
    const url = new URL(request.url);
    const dryRun = url.searchParams.get('dryRun') === 'true';
    const listLimitParam = url.searchParams.get('limit');
    const snapshotDateParam = url.searchParams.get('snapshotDate') ?? undefined;

    const listLimit = listLimitParam ? Number(listLimitParam) : undefined;
    const options = {
      ...(listLimit !== undefined && Number.isFinite(listLimit)
        ? { listLimit }
        : {}),
      ...(snapshotDateParam ? { snapshotDate: snapshotDateParam } : {}),
    };

    if (dryRun) {
      const tweets = await generateRankingSnapshotTweets(options);
      return NextResponse.json({ success: true, dryRun: true, tweets });
    }

    const success = await sendRankingSnapshotTweet(options);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send ranking snapshot tweet',
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending ranking snapshot tweet:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send ranking snapshot tweet' },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  return handleCronJob(request);
}

export async function POST(request: Request) {
  return handleCronJob(request);
}
