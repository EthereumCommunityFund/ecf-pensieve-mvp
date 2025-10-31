import type {
  HarbergerSlotContractMeta,
  HarbergerSlotMetadata,
  HarbergerSlotMetadataMap,
} from '@/types/harbergerSlotMetadata';

import mainnetMetadata from './mainnet.json';
import sepoliaMetadata from './sepolia.json';


type ChainMetadataTable = Record<number, HarbergerSlotMetadata[]>;

const CHAIN_METADATA: ChainMetadataTable = {
  1: mainnetMetadata as HarbergerSlotMetadata[],
  11155111: sepoliaMetadata as HarbergerSlotMetadata[],
};

function normalizeEntries(
  chainId: number,
  entries: HarbergerSlotMetadata[],
): HarbergerSlotMetadataMap {
  const map: HarbergerSlotMetadataMap = {};

  entries.forEach((entry) => {
    if (!entry.slotAddress) {
      return;
    }

    const normalized: HarbergerSlotMetadata = {
      ...entry,
      chainId,
      slotAddress: entry.slotAddress as `0x${string}`,
      extra: entry.extra ?? {},
      isActive: entry.isActive ?? false,
      contractMeta: normalizeContractMeta(entry.contractMeta),
    };

    map[normalized.slotAddress.toLowerCase()] = normalized;
  });

  return map;
}

export function getHarbergerSlotMetadataMap(
  chainId: number,
): HarbergerSlotMetadataMap {
  const entries = CHAIN_METADATA[chainId] ?? [];
  return normalizeEntries(chainId, entries);
}

export function getHarbergerSlotMetadataEntry(
  chainId: number,
  slotAddress: `0x${string}`,
): HarbergerSlotMetadata | undefined {
  const map = getHarbergerSlotMetadataMap(chainId);
  return map[slotAddress.toLowerCase()];
}

export function listHarbergerSlotMetadata(
  chainId: number,
): HarbergerSlotMetadata[] {
  const entries = CHAIN_METADATA[chainId] ?? [];
  return entries.map((entry) => ({
    ...entry,
    chainId,
    slotAddress: entry.slotAddress as `0x${string}`,
    extra: entry.extra ?? {},
    isActive: entry.isActive ?? false,
    contractMeta: normalizeContractMeta(entry.contractMeta),
  }));
}

function normalizeContractMeta(
  contractMeta?: Partial<HarbergerSlotContractMeta>,
): HarbergerSlotContractMeta | undefined {
  if (!contractMeta) {
    return undefined;
  }

  if (!contractMeta.slotType) {
    return undefined;
  }

  return {
    slotType: contractMeta.slotType,
    bondRateBps: contractMeta.bondRateBps ?? '',
    annualTaxRateBps: contractMeta.annualTaxRateBps ?? '',
    minBidIncrementBps: contractMeta.minBidIncrementBps ?? '',
    taxPeriodSeconds: contractMeta.taxPeriodSeconds ?? '',
    minValuationWei: contractMeta.minValuationWei ?? '',
    contentUpdateLimit: contractMeta.contentUpdateLimit ?? '',
    dustRateBps: contractMeta.dustRateBps,
  };
}
