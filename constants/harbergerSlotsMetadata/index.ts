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

type ParsedImageDimensions = {
  width: number;
  height: number;
};

type CreativeDimensions = {
  desktop: ParsedImageDimensions | null;
  mobile: ParsedImageDimensions | null;
  raw: string;
};

const DEFAULT_DESKTOP_DIMENSIONS: ParsedImageDimensions = {
  width: 900,
  height: 225,
};

const DEFAULT_MOBILE_DIMENSIONS: ParsedImageDimensions = {
  width: 900,
  height: 225,
};

const MULTIPLIER_TOKENS = ['x', '×', '*', 'X'];

function parseDimensionToken(token: string): ParsedImageDimensions | null {
  const normalizedToken = token.trim();
  if (!normalizedToken) {
    return null;
  }

  for (const symbol of MULTIPLIER_TOKENS) {
    if (normalizedToken.includes(symbol)) {
      const [widthToken, heightToken] = normalizedToken
        .split(symbol)
        .map((value) => value.trim());

      const width = Number.parseInt(widthToken, 10);
      const height = Number.parseInt(heightToken, 10);

      if (
        Number.isFinite(width) &&
        Number.isFinite(height) &&
        width > 0 &&
        height > 0
      ) {
        return { width, height };
      }
      return null;
    }
  }

  const numeric = Number.parseInt(normalizedToken, 10);
  if (Number.isFinite(numeric) && numeric > 0) {
    return { width: numeric, height: numeric };
  }

  return null;
}

function parseImageSize(raw: string | undefined): CreativeDimensions {
  if (!raw || typeof raw !== 'string') {
    return {
      desktop: { ...DEFAULT_DESKTOP_DIMENSIONS },
      mobile: { ...DEFAULT_MOBILE_DIMENSIONS },
      raw: '',
    };
  }

  const safeRaw = raw.trim();
  if (!safeRaw) {
    return {
      desktop: { ...DEFAULT_DESKTOP_DIMENSIONS },
      mobile: { ...DEFAULT_MOBILE_DIMENSIONS },
      raw: '',
    };
  }

  const [desktopToken, mobileToken] = safeRaw
    .split('_')
    .map((value) => value.trim());

  const desktop = parseDimensionToken(desktopToken ?? '') ?? {
    ...DEFAULT_DESKTOP_DIMENSIONS,
  };
  const mobile =
    parseDimensionToken(mobileToken ?? '') ??
    (desktopToken ? { ...desktop } : { ...DEFAULT_MOBILE_DIMENSIONS });

  return {
    desktop,
    mobile,
    raw: safeRaw,
  };
}

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
      creativeDimensions: parseImageSize(entry.imageSize),
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
    creativeDimensions: parseImageSize(entry.imageSize),
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
