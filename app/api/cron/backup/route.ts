import { NextResponse } from 'next/server';

import { performBackup } from '@/lib/services/backupService';

export const maxDuration = 300;

async function handleCronJob(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401,
    });
  }
  const result = await performBackup();

  if (result.success) {
    return NextResponse.json({
      success: true,
      message: 'Scheduled backup completed successfully',
      data: {
        id: result.id,
        url: result.url,
        filename: result.filename,
        manifestId: result.manifestId,
        folderUrl: result.folderUrl,
        metadata: result.metadata,
      },
    });
  } else {
    return NextResponse.json(
      {
        success: false,
        error: result.error,
      },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    return await handleCronJob(request);
  } catch (error) {
    console.error('Error in scheduled backup:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform scheduled backup' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    return await handleCronJob(request);
  } catch (error) {
    console.error('Error in scheduled backup:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform scheduled backup' },
      { status: 500 },
    );
  }
}
