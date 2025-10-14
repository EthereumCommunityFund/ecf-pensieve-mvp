import { NextRequest, NextResponse } from 'next/server';

import {
  checkBalance,
  getLatestBackupInfo,
  performBackup,
} from '@/lib/services/backupService';

export async function POST(request: NextRequest) {
  try {
    // Check for authorization
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.BACKUP_API_TOKEN;

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const result = await performBackup();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.autoFunded
          ? 'Backup completed successfully (auto-funded account)'
          : 'Backup completed successfully',
        data: {
          id: result.id,
          url: result.url,
          filename: result.filename,
          manifestId: result.manifestId,
          folderUrl: result.folderUrl,
          autoFunded: result.autoFunded,
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
  } catch (error) {
    console.error('Backup API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.BACKUP_API_TOKEN;

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const [balance, latestBackup] = await Promise.all([
      checkBalance(),
      getLatestBackupInfo(),
    ]);

    return NextResponse.json({
      success: true,
      balance,
      latestBackup,
    });
  } catch (error) {
    console.error('Balance check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 },
    );
  }
}
