import { createWalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { VALUATION_TAX_ENABLED_SLOT_ABI } from '@/constants/harbergerFactory';
import {
  createMonitorClientFromEnv,
  monitorValuationTaxEnabledSlots,
  type SlotAlert,
} from '@/lib/services/valuationTaxEnabledMonitor';

export type SlotPokeResult = {
  slotAddress: `0x${string}`;
  status: 'success' | 'failed';
  txHash?: `0x${string}`;
  error?: string;
};

export interface RunHarbergerSlotPokeParams {
  privateKey: string;
  slotAllowList?: `0x${string}`[];
}

export interface HarbergerSlotPokeSummary {
  success: true;
  checkedAt: string;
  totalSlotsChecked: number;
  expiredSlots: number;
  pokedSlots: number;
  results: SlotPokeResult[];
  alertsConsidered: number;
}

export function normalizePrivateKey(value: string): `0x${string}` {
  const trimmed = value.trim();
  return (trimmed.startsWith('0x') ? trimmed : `0x${trimmed}`) as `0x${string}`;
}

function filterAlerts(alerts: SlotAlert[], slotAllowList?: `0x${string}`[]) {
  if (!slotAllowList || slotAllowList.length === 0) {
    return alerts;
  }

  const allowSet = new Set(
    slotAllowList.map((address) => address.toLowerCase()),
  );
  return alerts.filter((alert) => allowSet.has(alert.address.toLowerCase()));
}

export async function runHarbergerSlotPoke({
  privateKey,
  slotAllowList,
}: RunHarbergerSlotPokeParams): Promise<HarbergerSlotPokeSummary> {
  if (!privateKey) {
    throw new Error('privateKey is required');
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

  const alerts = filterAlerts(monitorResult.alerts, slotAllowList);

  const expiredSlots = alerts.filter(
    (alert) => alert.secondsUntilExpiry === 0n,
  );

  const results: SlotPokeResult[] = [];
  let pokedSlots = 0;

  for (const slot of expiredSlots) {
    try {
      const { request } = await publicClient.simulateContract({
        account,
        address: slot.address,
        abi: VALUATION_TAX_ENABLED_SLOT_ABI,
        functionName: 'poke',
      });

      const txHash = await walletClient.writeContract(request);
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

  return {
    success: true,
    checkedAt: monitorResult.checkedAt.toString(),
    totalSlotsChecked: monitorResult.totalSlots,
    expiredSlots: expiredSlots.length,
    pokedSlots,
    results,
    alertsConsidered: alerts.length,
  };
}
