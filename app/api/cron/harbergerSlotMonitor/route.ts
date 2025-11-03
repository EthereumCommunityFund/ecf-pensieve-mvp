import { eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getHarbergerSlotMetadataEntry } from '@/constants/harbergerSlotsMetadata';
import { db } from '@/lib/db';
import { addNotificationToQueue } from '@/lib/services/notification';
import {
  createMonitorClientFromEnv,
  monitorValuationTaxEnabledSlots,
} from '@/lib/services/valuationTaxEnabledMonitor';
import type { NotificationMetadata } from '@/types/notification';

export const maxDuration = 300;

async function dispatchNotifications(
  chainId: number,
  alerts: Awaited<ReturnType<typeof monitorValuationTaxEnabledSlots>>['alerts'],
): Promise<number> {
  let count = 0;
  const notifiedSlots = new Set<string>();

  for (const alert of alerts) {
    const normalizedAddress = alert.currentOwner.toLowerCase();
    if (
      notifiedSlots.has(`${normalizedAddress}:${alert.address.toLowerCase()}`)
    ) {
      continue;
    }

    const profile = await db.query.profiles.findFirst({
      where: eq(sql`lower(profiles.address)`, normalizedAddress),
    });

    if (!profile) {
      continue;
    }

    const slotMetadata = getHarbergerSlotMetadataEntry(chainId, alert.address);
    const slotName = slotMetadata?.slotDisplayName ?? alert.address;
    const page = slotMetadata?.page;
    const position = slotMetadata?.position;

    const metadata: NotificationMetadata = {
      extra: {
        slotAddress: alert.address,
        slotDisplayName: slotName,
        secondsUntilExpiry: alert.secondsUntilExpiry.toString(),
        taxPaidUntil: alert.taxPaidUntil.toString(),
        lockedValuationWei: alert.lockedValuation.toString(),
        periodsProcessed: alert.periodsProcessed,
        page,
        position,
      },
    };

    await addNotificationToQueue({
      userId: profile.userId,
      type: 'harbergerSlotExpiring',
      metadata,
    });

    notifiedSlots.add(`${normalizedAddress}:${alert.address.toLowerCase()}`);
    count += 1;
  }

  return count;
}

async function runSlotMonitor(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', {
        status: 401,
      });
    }
  }
  const { publicClient, chainId } = createMonitorClientFromEnv();

  const result = await monitorValuationTaxEnabledSlots({
    publicClient,
  });

  let notificationsEnqueued = 0;
  if (result.alerts.length > 0) {
    notificationsEnqueued = await dispatchNotifications(chainId, result.alerts);
  }

  return NextResponse.json({
    success: true,
    notificationsEnqueued,
  });
}

export async function GET(request: Request) {
  try {
    return await runSlotMonitor(request);
  } catch (error) {
    console.error('Error during harberger slot monitor cron:', error);
    if ((error as Error).message === 'Unauthorized') {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    return NextResponse.json(
      { success: false, error: 'Failed to run harberger slot monitor' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    return await runSlotMonitor(request);
  } catch (error) {
    console.error('Error during harberger slot monitor cron:', error);
    if ((error as Error).message === 'Unauthorized') {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    return NextResponse.json(
      { success: false, error: 'Failed to run harberger slot monitor' },
      { status: 500 },
    );
  }
}
