import { NextResponse } from 'next/server';
import { createWalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { VALUATION_TAX_ENABLED_SLOT_ABI } from '@/constants/harbergerFactory';
import {
  createMonitorClientFromEnv,
  monitorValuationTaxEnabledSlots,
} from '@/lib/services/valuationTaxEnabledMonitor';

export const maxDuration = 300;

type SlotPokeResult = {
  slotAddress: `0x${string}`;
  status: 'success' | 'failed';
  txHash?: `0x${string}`;
  error?: string;
};

function normalizePrivateKey(value: string): `0x${string}` {
  const trimmed = value.trim();
  return (trimmed.startsWith('0x') ? trimmed : `0x${trimmed}`) as `0x${string}`;
}

async function runHarbergerSlotPoke(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', {
        status: 401,
      });
    }
  }

  const privateKey = process.env.ADMIN_WALLET;
  if (!privateKey) {
    throw new Error('ADMIN_WALLET is not configured');
  }

  const { publicClient, chain, transport } = createMonitorClientFromEnv();

  const account = privateKeyToAccount(normalizePrivateKey(privateKey));

  const walletClient = createWalletClient({
    account,
    chain,
    transport,
  });

  const monitorResult = await monitorValuationTaxEnabledSlots({
    publicClient,
  });

  const expiredSlots = monitorResult.alerts.filter(
    (alert) => alert.secondsUntilExpiry === 0n,
  );

  const results: SlotPokeResult[] = [];
  let pokedSlots = 0;

  for (const slot of expiredSlots) {
    try {
      const { request: txRequest } = await publicClient.simulateContract({
        account,
        address: slot.address,
        abi: VALUATION_TAX_ENABLED_SLOT_ABI,
        functionName: 'poke',
      });

      const txHash = await walletClient.writeContract(txRequest);
      await publicClient.waitForTransactionReceipt({ hash: txHash });

      results.push({
        slotAddress: slot.address,
        status: 'success',
        txHash,
      });
      pokedSlots += 1;
    } catch (error) {
      console.error('Failed to poke slot', slot.address, error);
      results.push({
        slotAddress: slot.address,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return NextResponse.json({
    success: true,
    checkedAt: monitorResult.checkedAt.toString(),
    totalSlotsChecked: monitorResult.totalSlots,
    expiredSlots: expiredSlots.length,
    pokedSlots,
    results,
  });
}

export async function GET(request: Request) {
  try {
    return await runHarbergerSlotPoke(request);
  } catch (error) {
    console.error('Error during harberger slot poke cron:', error);
    if ((error as Error).message === 'Unauthorized') {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    return NextResponse.json(
      { success: false, error: 'Failed to run harberger slot poke' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    return await runHarbergerSlotPoke(request);
  } catch (error) {
    console.error('Error during harberger slot poke cron:', error);
    if ((error as Error).message === 'Unauthorized') {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    return NextResponse.json(
      { success: false, error: 'Failed to run harberger slot poke' },
      { status: 500 },
    );
  }
}
