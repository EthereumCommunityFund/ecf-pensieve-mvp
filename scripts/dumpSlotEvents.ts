import 'dotenv/config';

import type { Abi } from 'viem';
import { createPublicClient, decodeEventLog, http } from 'viem';
import { mainnet, sepolia } from 'viem/chains';

import {
  HARBERGER_FACTORY_ABI,
  HARBERGER_FACTORY_ADDRESS,
} from '@/constants/harbergerFactory';

import enabledArtifact from '../smart-contracts/artifacts/contracts/ValuationTaxEnabledSlot.sol/ValuationTaxEnabledSlot.json';

type ChainName = 'mainnet' | 'sepolia';

const ENABLED_EVENTS = [
  'SlotClaimed',
  'SlotTakenOver',
  'SlotRenewed',
  'SlotForfeited',
  'SlotExpired',
  'AdCreativeUpdated',
  'SlotReset',
  'SlotPoked',
] as const;

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

function formatWei(value: bigint): string {
  const ether = Number(value) / 1e18;
  return `${value.toString()} (~${ether.toFixed(6)} ETH)`;
}

async function main() {
  const chain = resolveChain();
  const rpcUrl = resolveRpcUrl(chain);
  if (!rpcUrl) {
    console.error('[dumpSlotEvents] Missing RPC URL');
    process.exit(1);
  }

  const slotAddress =
    (process.env.SLOT_ADDRESS as `0x${string}` | undefined) ??
    (process.argv[2] as `0x${string}` | undefined);
  if (!slotAddress) {
    console.error(
      '[dumpSlotEvents] Provide SLOT_ADDRESS env or pass as first argument.',
    );
    process.exit(1);
  }

  const fromBlock =
    (process.env.FROM_BLOCK ? BigInt(process.env.FROM_BLOCK) : 0n) ?? 0n;

  const client = createPublicClient({
    chain: chain === 'mainnet' ? mainnet : sepolia,
    transport: http(rpcUrl, { timeout: 30_000 }),
  });

  const slotType = (await client.readContract({
    address: HARBERGER_FACTORY_ADDRESS,
    abi: HARBERGER_FACTORY_ABI,
    functionName: 'slotTypeByAddress',
    args: [slotAddress],
  })) as 0 | 1 | 2;

  if (slotType !== 1) {
    console.error('[dumpSlotEvents] Slot type is not enabled (type=1).');
    process.exit(1);
  }

  const abi = (enabledArtifact as { abi: Abi }).abi;
  const eventNames = ENABLED_EVENTS;

  console.info('[dumpSlotEvents] Chain:', client.chain?.name);
  console.info('[dumpSlotEvents] Slot:', slotAddress);
  console.info(
    '[dumpSlotEvents] Fetching events from block',
    fromBlock.toString(),
    'to latest...',
  );

  const logs = await client.getLogs({
    address: slotAddress,
    fromBlock,
    toBlock: 'latest',
  });

  if (logs.length === 0) {
    console.info('[dumpSlotEvents] No logs found.');
    return;
  }

  logs.forEach((log) => {
    try {
      const decoded = decodeEventLog({
        abi,
        data: log.data,
        topics: log.topics,
      }) as { eventName: string; args?: Record<string, unknown> };

      const eventName = decoded.eventName as (typeof eventNames)[number];
      if (!eventNames.includes(eventName)) {
        return;
      }

      console.info(
        '------------------------------------------------------------',
      );
      console.info(
        `[${eventName}] block=${log.blockNumber?.toString() ?? 'unknown'} tx=${log.transactionHash}`,
      );
      Object.entries(decoded.args ?? {}).forEach(([key, value]) => {
        if (typeof value === 'bigint') {
          if (
            key.toLowerCase().includes('wei') ||
            key.toLowerCase().includes('valuation')
          ) {
            console.info(`  ${key}: ${formatWei(value)}`);
          } else {
            console.info(`  ${key}: ${value.toString()}`);
          }
        } else {
          console.info(`  ${key}: ${value}`);
        }
      });
    } catch (error) {
      console.error('[dumpSlotEvents] Failed to decode log', log, error);
    }
  });
}

main().catch((error) => {
  console.error('[dumpSlotEvents] Failed:', error);
  process.exit(1);
});
