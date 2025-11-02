import { createPublicClient, http, type PublicClient } from 'viem';
import { mainnet, sepolia } from 'viem/chains';

import {
  HARBERGER_FACTORY_ABI,
  HARBERGER_FACTORY_ADDRESS,
  VALUATION_TAX_ENABLED_SLOT_ABI,
} from '@/constants/harbergerFactory';
import {
  simulateValuationTaxEnabledSettlement,
  type SettlementResult,
  type ValuationTaxEnabledState,
} from '@/lib/services/valuationTaxEnabledSettlement';

export const DEFAULT_HORIZON_SECONDS = 3n * 24n * 60n * 60n;

type ViemPublicClient = PublicClient;

type EnabledSlotDetails = {
  currentOwner: `0x${string}`;
  valuation: bigint;
  lockedValuation: bigint;
  prepaidTaxBalance: bigint;
  taxPaidUntil: bigint;
  timeRemainingInSeconds: bigint;
  contentUpdateCount: bigint;
  contentUpdateLimit: bigint;
  taxPeriodInSeconds: bigint;
  annualTaxRate: bigint;
  minBidIncrementRate: bigint;
  bondRate: bigint;
  minValuation: bigint;
  baseValuation: bigint;
  dustRate: bigint;
  currentAdURI: string;
  treasury: `0x${string}`;
  governance: `0x${string}`;
  isOccupied: boolean;
};

export type SlotAlert = {
  address: `0x${string}`;
  currentOwner: `0x${string}`;
  secondsUntilExpiry: bigint;
  taxPaidUntil: bigint;
  lockedValuation: bigint;
  periodsProcessed: number;
  taxAccruedWei: bigint;
  ownerRefundWei: bigint;
};

export interface SlotMonitorParams {
  publicClient: ViemPublicClient;
}

export interface SlotMonitorResult {
  alerts: SlotAlert[];
  totalSlots: number;
  checkedAt: bigint;
}

export interface MonitorEnvConfig {
  chainName?: string;
  rpcUrl?: string;
}

function mapDetailsToState(
  details: EnabledSlotDetails,
): ValuationTaxEnabledState {
  return {
    currentOwner: details.currentOwner,
    valuation: details.valuation,
    lockedValuation: details.lockedValuation,
    baseValuation: details.baseValuation,
    prepaidTaxBalance: details.prepaidTaxBalance,
    taxPaidUntil: details.taxPaidUntil,
    taxPeriodInSeconds: details.taxPeriodInSeconds,
    annualTaxRate: details.annualTaxRate,
    dustRate: details.dustRate,
  };
}

async function fetchEnabledSlotAddresses(publicClient: ViemPublicClient) {
  const addresses = await publicClient.readContract({
    address: HARBERGER_FACTORY_ADDRESS,
    abi: HARBERGER_FACTORY_ABI,
    functionName: 'getValuationTaxEnabledSlots',
  });

  return addresses as `0x${string}`[];
}

async function fetchSlotDetails(
  publicClient: ViemPublicClient,
  address: `0x${string}`,
) {
  const details = await publicClient.readContract({
    address,
    abi: VALUATION_TAX_ENABLED_SLOT_ABI,
    functionName: 'getSlotDetails',
  });

  return details as EnabledSlotDetails;
}

export async function monitorValuationTaxEnabledSlots(
  params: SlotMonitorParams,
): Promise<SlotMonitorResult> {
  const horizon = DEFAULT_HORIZON_SECONDS;
  const now = BigInt(Math.floor(Date.now() / 1000));

  const addresses = await fetchEnabledSlotAddresses(params.publicClient);
  if (addresses.length === 0) {
    return { alerts: [], totalSlots: 0, checkedAt: now };
  }

  const alerts: SlotAlert[] = [];

  for (const address of addresses) {
    const details = await fetchSlotDetails(params.publicClient, address);
    if (!details.isOccupied) {
      continue;
    }

    const secondsUntilExpiry =
      details.taxPaidUntil > now ? details.taxPaidUntil - now : 0n;

    if (secondsUntilExpiry > horizon) {
      continue;
    }

    const state = mapDetailsToState(details);
    const settlement: SettlementResult = simulateValuationTaxEnabledSettlement(
      state,
      details.taxPaidUntil,
    );

    if (settlement.state.lockedValuation !== 0n) {
      continue;
    }

    alerts.push({
      address,
      currentOwner: details.currentOwner,
      secondsUntilExpiry,
      taxPaidUntil: details.taxPaidUntil,
      lockedValuation: details.lockedValuation,
      periodsProcessed: settlement.periodsProcessed,
      taxAccruedWei: settlement.taxAccrued,
      ownerRefundWei: settlement.ownerRefund,
    });
  }

  alerts.sort((a, b) => {
    if (a.secondsUntilExpiry === b.secondsUntilExpiry) return 0;
    return a.secondsUntilExpiry < b.secondsUntilExpiry ? -1 : 1;
  });

  return { alerts, totalSlots: addresses.length, checkedAt: now };
}

export function createMonitorClientFromEnv() {
  const chain = process.env.NODE_ENV === 'production' ? mainnet : sepolia;

  const rpcUrl = process.env.RPC_URL;

  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });

  return { publicClient, chainName: chain.name, chainId: chain.id };
}
