import 'dotenv/config';

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { PublicClient } from 'viem';
import { createPublicClient, http } from 'viem';
import { mainnet, sepolia } from 'viem/chains';

import {
  HARBERGER_FACTORY_ABI,
  HARBERGER_FACTORY_ADDRESS,
  VALUATION_TAX_ENABLED_SLOT_ABI,
  VALUATION_TAX_SHIELDED_SLOT_ABI,
} from '@/constants/harbergerFactory';
import type {
  HarbergerSlotContractMeta,
  HarbergerSlotMetadata,
} from '@/types/harbergerSlotMetadata';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CHAIN_CONFIG = {
  main: {
    chainId: 1,
    viemChain: mainnet,
    metadataFile: resolve(
      __dirname,
      '../constants/harbergerSlotsMetadata/mainnet.json',
    ),
  },
  sepolia: {
    chainId: 11155111,
    viemChain: sepolia,
    metadataFile: resolve(
      __dirname,
      '../constants/harbergerSlotsMetadata/sepolia.json',
    ),
  },
} as const;

type ChainName = keyof typeof CHAIN_CONFIG;

type SlotInfo = {
  address: `0x${string}`;
  slotType: 'enabled' | 'shielded';
  contractMeta: HarbergerSlotContractMeta;
};

function resolveChainName(): ChainName {
  const explicit =
    process.env.METADATA_CHAIN ?? process.env.NEXT_PUBLIC_AD_SLOT_CHAIN;
  if (explicit) {
    const normalized = explicit.toLowerCase();
    if (['main', 'mainnet', 'prod', 'production'].includes(normalized)) {
      return 'main';
    }
    if (['sepolia', 'test', 'staging'].includes(normalized)) {
      return 'sepolia';
    }
  }

  if (process.env.METADATA_CHAIN_ID) {
    const numeric = Number(process.env.METADATA_CHAIN_ID);
    if (numeric === 1) {
      return 'main';
    }
  }

  const envName = process.env.NEXT_PUBLIC_ENV;
  if (envName && envName.toLowerCase() === 'production') {
    return 'main';
  }

  return 'sepolia';
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function loadMetadata(filePath: string): HarbergerSlotMetadata[] {
  if (!existsSync(filePath)) {
    return [];
  }

  const raw = readFileSync(filePath, 'utf8');
  if (!raw.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as HarbergerSlotMetadata[];
    if (!Array.isArray(parsed)) {
      throw new Error('Metadata file is not an array.');
    }
    return parsed;
  } catch (error) {
    throw new Error(
      `Failed to parse metadata file ${filePath}: ${(error as Error).message}`,
    );
  }
}

function saveMetadata(filePath: string, entries: HarbergerSlotMetadata[]) {
  writeFileSync(filePath, `${JSON.stringify(entries, null, 2)}\n`);
  console.info(`Metadata saved to ${filePath}`);
}

async function fetchSlotInfos(
  rpcUrl: string,
  chainName: ChainName,
): Promise<SlotInfo[]> {
  const { viemChain } = CHAIN_CONFIG[chainName];

  const publicClient = createPublicClient({
    chain: viemChain,
    transport: http(rpcUrl),
  });

  const [enabledSlots, shieldedSlots] = await Promise.all([
    publicClient.readContract({
      address: HARBERGER_FACTORY_ADDRESS,
      abi: HARBERGER_FACTORY_ABI,
      functionName: 'getValuationTaxEnabledSlots',
    }) as Promise<`0x${string}`[]>,
    publicClient.readContract({
      address: HARBERGER_FACTORY_ADDRESS,
      abi: HARBERGER_FACTORY_ABI,
      functionName: 'getValuationTaxShieldedSlots',
    }) as Promise<`0x${string}`[]>,
  ]);

  const enabledMetas = await Promise.all(
    enabledSlots.map((address) => fetchEnabledSlotMeta(publicClient, address)),
  );

  const shieldedMetas = await Promise.all(
    shieldedSlots.map((address) =>
      fetchShieldedSlotMeta(publicClient, address),
    ),
  );

  const enabledInfos: SlotInfo[] = enabledSlots.map((address, index) => ({
    address,
    slotType: 'enabled',
    contractMeta: enabledMetas[index],
  }));

  const shieldedInfos: SlotInfo[] = shieldedSlots.map((address, index) => ({
    address,
    slotType: 'shielded',
    contractMeta: shieldedMetas[index],
  }));

  return [...enabledInfos, ...shieldedInfos];
}

type ViemPublicClient = PublicClient;

type EnabledSlotDetails = {
  bondRate: bigint;
  annualTaxRate: bigint;
  minBidIncrementRate: bigint;
  taxPeriodInSeconds: bigint;
  minValuation: bigint;
  contentUpdateLimit: bigint;
  dustRate: bigint;
};

type ShieldedSlotDetails = {
  bondRate: bigint;
  annualTaxRate: bigint;
  minBidIncrementRate: bigint;
  taxPeriodInSeconds: bigint;
  minValuation: bigint;
  contentUpdateLimit: bigint;
};

async function fetchEnabledSlotMeta(
  publicClient: ViemPublicClient,
  slotAddress: `0x${string}`,
): Promise<HarbergerSlotContractMeta> {
  const details = (await publicClient.readContract({
    address: slotAddress,
    abi: VALUATION_TAX_ENABLED_SLOT_ABI,
    functionName: 'getSlotDetails',
  })) as EnabledSlotDetails;

  return {
    slotType: 'enabled',
    bondRateBps: details.bondRate.toString(),
    annualTaxRateBps: details.annualTaxRate.toString(),
    minBidIncrementBps: details.minBidIncrementRate.toString(),
    taxPeriodSeconds: details.taxPeriodInSeconds.toString(),
    minValuationWei: details.minValuation.toString(),
    contentUpdateLimit: details.contentUpdateLimit.toString(),
    dustRateBps: details.dustRate.toString(),
  };
}

async function fetchShieldedSlotMeta(
  publicClient: ViemPublicClient,
  slotAddress: `0x${string}`,
): Promise<HarbergerSlotContractMeta> {
  const details = (await publicClient.readContract({
    address: slotAddress,
    abi: VALUATION_TAX_SHIELDED_SLOT_ABI,
    functionName: 'getSlotDetails',
  })) as ShieldedSlotDetails;

  return {
    slotType: 'shielded',
    bondRateBps: details.bondRate.toString(),
    annualTaxRateBps: details.annualTaxRate.toString(),
    minBidIncrementBps: details.minBidIncrementRate.toString(),
    taxPeriodSeconds: details.taxPeriodInSeconds.toString(),
    minValuationWei: details.minValuation.toString(),
    contentUpdateLimit: details.contentUpdateLimit.toString(),
  };
}

function createEmptyMetadata(
  chainId: number,
  slotInfo: SlotInfo,
): HarbergerSlotMetadata {
  return {
    chainId,
    slotAddress: slotInfo.address,
    slotDisplayName: '',
    page: '',
    position: '',
    imageSize: '',
    extra: {},
    isActive: false,
    contractMeta: { ...slotInfo.contractMeta },
  };
}

async function main() {
  const chainName = resolveChainName();
  const { chainId, metadataFile } = CHAIN_CONFIG[chainName];
  const rpcUrl = requireEnv('RPC_URL');

  console.info(`Syncing metadata for chain ${chainName} (id: ${chainId}).`);

  const slotInfos = await fetchSlotInfos(rpcUrl, chainName);
  if (slotInfos.length === 0) {
    console.warn('Factory returned no slot addresses. Metadata unchanged.');
    return;
  }

  const existingEntries = loadMetadata(metadataFile);
  const infoByAddress = new Map(
    slotInfos.map((info) => [info.address.toLowerCase(), info] as const),
  );
  const seen = new Set<string>();

  const updatedEntries = existingEntries.map((entry) => {
    const match = infoByAddress.get(entry.slotAddress.toLowerCase());

    if (!match) {
      console.warn(
        `Slot ${entry.slotAddress} not found on chain ${chainId}; keeping entry as-is.`,
      );
      return entry;
    }

    seen.add(match.address.toLowerCase());

    const shouldDisable = !entry.page || !entry.position || !entry.imageSize;

    return {
      ...entry,
      chainId,
      slotAddress: match.address,
      contractMeta: { ...match.contractMeta },
      isActive: shouldDisable ? false : (entry.isActive ?? false),
    } satisfies HarbergerSlotMetadata;
  });

  const newInfos = slotInfos.filter(
    (info) => !seen.has(info.address.toLowerCase()),
  );

  newInfos.forEach((info) => {
    console.info(`Adding new slot entry for ${info.address}`);
    updatedEntries.push(createEmptyMetadata(chainId, info));
  });

  saveMetadata(metadataFile, updatedEntries);

  console.info('Tracked slot addresses:');
  slotInfos.forEach((info) =>
    console.info(`  · ${info.address} (${info.slotType})`),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
