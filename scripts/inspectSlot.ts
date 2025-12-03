import 'dotenv/config';

import { createPublicClient, http } from 'viem';
import { mainnet, sepolia } from 'viem/chains';

import {
  HARBERGER_FACTORY_ABI,
  HARBERGER_FACTORY_ADDRESS,
  VALUATION_TAX_ENABLED_SLOT_ABI,
  VALUATION_TAX_SHIELDED_SLOT_ABI,
} from '@/constants/harbergerFactory';

type ChainName = 'mainnet' | 'sepolia';
type SlotType = 0 | 1 | 2;

function resolveChain(): ChainName {
  const value =
    process.env.METADATA_CHAIN ??
    process.env.NEXT_PUBLIC_ENV ??
    process.env.VERCEL_ENV ??
    process.env.NODE_ENV;
  const normalized = (value ?? '').toLowerCase();
  if (['prod', 'production', 'mainnet', 'main'].includes(normalized)) {
    return 'mainnet';
  }
  if (
    ['sepolia', 'test', 'staging', 'dev', 'development'].includes(normalized)
  ) {
    return 'sepolia';
  }

  return 'mainnet';
}

function resolveRpcUrl(chain: ChainName): string | undefined {
  if (chain === 'mainnet') {
    return (
      process.env.RPC_URL ??
      process.env.MAINNET_RPC_URL ??
      process.env.NEXT_PUBLIC_RPC_URL ??
      process.env.INFURA_MAINNET_URL ??
      mainnet.rpcUrls.default.http[0]
    );
  }
  return (
    process.env.SEPOLIA_RPC_URL ??
    process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ??
    process.env.RPC_URL ??
    sepolia.rpcUrls.default.http[0]
  );
}

const RATE_DENOMINATOR = 10_000n;
const SECONDS_PER_YEAR = 31_536_000n;

function formatWei(value: bigint): string {
  const ether = Number(value) / 1e18;
  return `${value.toString()} wei (~${ether.toFixed(6)} ETH)`;
}

function formatSeconds(value: bigint): string {
  if (value <= 0) {
    return `${value.toString()} s`;
  }
  const seconds = Number(value);
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (!parts.length) {
    parts.push(`${seconds}s`);
  }
  return `${value.toString()} s (${parts.join(' ')})`;
}

function formatPercent(value: bigint): string {
  return `${Number(value) / 100}%`;
}

function logDivider() {
  console.info('------------------------------------------------------------');
}

function nowSeconds(): bigint {
  return BigInt(Math.floor(Date.now() / 1000));
}

function getTaxPerPeriod(
  valuation: bigint,
  annualTaxRate: bigint,
  taxPeriodInSeconds: bigint,
): bigint {
  if (annualTaxRate === 0n || taxPeriodInSeconds === 0n) {
    return 0n;
  }
  return (
    (valuation * annualTaxRate * taxPeriodInSeconds) /
    (RATE_DENOMINATOR * SECONDS_PER_YEAR)
  );
}

async function main() {
  const chainName = resolveChain();
  const rpcUrl = resolveRpcUrl(chainName);
  if (!rpcUrl) {
    console.error(`[inspectSlot] Missing RPC url for ${chainName}`);
    process.exit(1);
  }

  const slotArg =
    (process.env.SLOT_ADDRESS as `0x${string}` | undefined) ??
    (process.argv[2] as `0x${string}` | undefined);

  if (!slotArg) {
    console.error(
      '[inspectSlot] Provide SLOT_ADDRESS env or pass address as the first argument.',
    );
    process.exit(1);
  }

  const client = createPublicClient({
    chain: chainName === 'mainnet' ? mainnet : sepolia,
    transport: http(rpcUrl, { timeout: 30_000 }),
  });

  console.info('[inspectSlot] Chain:', client.chain?.name);
  console.info('[inspectSlot] RPC:', rpcUrl);

  if (!HARBERGER_FACTORY_ADDRESS) {
    console.error(
      '[inspectSlot] NEXT_PUBLIC_HARBERGER_FACTORY_ADDRESS is undefined.',
    );
    process.exit(1);
  }

  const slotType = (await client.readContract({
    address: HARBERGER_FACTORY_ADDRESS,
    abi: HARBERGER_FACTORY_ABI,
    functionName: 'slotTypeByAddress',
    args: [slotArg],
  })) as SlotType;

  let abi;
  if (slotType === 1) {
    abi = VALUATION_TAX_ENABLED_SLOT_ABI;
  } else if (slotType === 2) {
    abi = VALUATION_TAX_SHIELDED_SLOT_ABI;
  } else {
    console.error(
      '[inspectSlot] Slot type is unknown. Only deployed slots are supported.',
    );
    process.exit(1);
  }

  const details = (await client.readContract({
    address: slotArg,
    abi,
    functionName: 'getSlotDetails',
  })) as Record<string, bigint | string | boolean>;

  console.info('[inspectSlot] Slot address:', slotArg);
  console.info(
    '[inspectSlot] Slot type:',
    slotType === 1 ? 'enabled' : 'shielded',
  );
  logDivider();

  Object.entries(details).forEach(([key, value]) => {
    if (typeof value === 'bigint') {
      if (
        key.toLowerCase().includes('wei') ||
        key.toLowerCase().includes('valuation') ||
        key.toLowerCase().includes('bond')
      ) {
        console.info(`  ${key}: ${formatWei(value)}`);
      } else if (
        key.toLowerCase().includes('seconds') ||
        key.toLowerCase().includes('time') ||
        key.toLowerCase().includes('period')
      ) {
        console.info(`  ${key}: ${formatSeconds(value)}`);
      } else if (
        key.toLowerCase().includes('rate') ||
        key.toLowerCase().includes('bps')
      ) {
        console.info(
          `  ${key}: ${formatPercent(value)} (${value.toString()} bps)`,
        );
      } else {
        console.info(`  ${key}: ${value.toString()}`);
      }
    } else {
      console.info(`  ${key}: ${value}`);
    }
  });

  if (slotType === 1) {
    const enabledDetails = details as unknown as {
      valuation: bigint;
      lockedValuation: bigint;
      prepaidTaxBalance: bigint;
      taxPaidUntil: bigint;
      taxPeriodInSeconds: bigint;
      annualTaxRate: bigint;
      bondRate: bigint;
      baseValuation: bigint;
      dustRate: bigint;
    };

    logDivider();
    console.info('[inspectSlot] Derived state (valuation tax enabled)');
    const now = nowSeconds();
    const coverageLeft =
      enabledDetails.taxPaidUntil > now
        ? enabledDetails.taxPaidUntil - now
        : 0n;
    const overdueSeconds =
      enabledDetails.taxPaidUntil > now
        ? 0n
        : now - enabledDetails.taxPaidUntil;

    console.info('  coverageRemaining:', formatSeconds(coverageLeft));
    console.info('  overdueSeconds:', formatSeconds(overdueSeconds));

    const dustThreshold =
      (enabledDetails.baseValuation * enabledDetails.dustRate) /
      RATE_DENOMINATOR;
    console.info(
      '  dustThreshold:',
      formatWei(dustThreshold),
      `(base ${formatWei(enabledDetails.baseValuation)} × ${formatPercent(
        enabledDetails.dustRate,
      )})`,
    );

    const taxPerPeriod = getTaxPerPeriod(
      enabledDetails.valuation,
      enabledDetails.annualTaxRate,
      enabledDetails.taxPeriodInSeconds,
    );
    console.info(
      '  taxPerPeriod:',
      formatWei(taxPerPeriod),
      `per ${formatSeconds(enabledDetails.taxPeriodInSeconds)}`,
    );

    const prepaidPeriods =
      taxPerPeriod === 0n
        ? 'n/a'
        : (
            Number(enabledDetails.prepaidTaxBalance) / Number(taxPerPeriod)
          ).toFixed(2);
    console.info(
      '  prepaidCoveragePeriods:',
      prepaidPeriods,
      `(prepaidTaxBalance ${formatWei(enabledDetails.prepaidTaxBalance)})`,
    );

    const bondCoverage =
      taxPerPeriod === 0n
        ? 'n/a'
        : (
            Number(enabledDetails.lockedValuation) / Number(taxPerPeriod)
          ).toFixed(4);
    console.info(
      '  lockedValuationCoverage:',
      bondCoverage,
      'periods (locks',
      formatWei(enabledDetails.lockedValuation),
      ')',
    );

    const valuationRatio =
      enabledDetails.baseValuation === 0n
        ? 0
        : Number(enabledDetails.valuation) /
          Number(enabledDetails.baseValuation);
    console.info(
      '  valuationDropFromBase:',
      enabledDetails.baseValuation === 0n
        ? 'n/a'
        : `${(valuationRatio * 100).toFixed(2)}% of base`,
    );
  }
}

main().catch((error) => {
  console.error('[inspectSlot] Failed:', error);
  process.exit(1);
});
