'use client';

import { useCallback, useEffect, useMemo, type CSSProperties } from 'react';
import type { Address } from 'viem';
import { useReadContract, useReadContracts } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';

import { isProduction } from '@/constants/env';
import {
  HARBERGER_FACTORY_ABI,
  HARBERGER_FACTORY_ADDRESS,
  VALUATION_TAX_ENABLED_SLOT_ABI,
  VALUATION_TAX_SHIELDED_SLOT_ABI,
  ZERO_ADDRESS,
  type SlotTypeKey,
} from '@/constants/harbergerFactory';
import { getHarbergerSlotMetadataMap } from '@/constants/harbergerSlotsMetadata';
import { AddressValidator } from '@/lib/utils/addressValidation';
import type {
  HarbergerSlotContractMeta,
  HarbergerSlotMetadata,
} from '@/types/harbergerSlotMetadata';
import { devLog } from '@/utils/devLog';
import {
  ONE_BIGINT,
  RATE_DENOMINATOR,
  ZERO_BIGINT,
  calculateBond,
  calculateTaxForPeriods,
  formatBps,
  formatDuration,
  formatEth,
  formatNumberInputFromWei,
  sumBigints,
} from '@/utils/harberger';

const AD_SLOT_CHAIN = isProduction ? mainnet : sepolia;
const AD_SLOT_CHAIN_ID = AD_SLOT_CHAIN.id;

const SLOT_METADATA_MAP = getHarbergerSlotMetadataMap(AD_SLOT_CHAIN_ID);

const SLOT_TYPE_LABEL: Record<SlotTypeKey, string> = {
  enabled: 'Valuation Tax Enabled Slot',
  shielded: 'Valuation Tax Shielded Slot',
};

const SLOT_NAME_PREFIX: Record<SlotTypeKey, string> = {
  enabled: 'Enabled Slot',
  shielded: 'Shielded Slot',
};

function getSlotMetadata(address: Address): HarbergerSlotMetadata | undefined {
  const key = address.toLowerCase();
  return SLOT_METADATA_MAP[key];
}

function isSlotActive(metadata?: HarbergerSlotMetadata): boolean {
  if (!metadata) {
    return true;
  }
  return !!metadata.isActive;
}

interface EnabledSlotContractResult {
  currentOwner: Address;
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
  treasury: Address;
  governance: Address;
  isOccupied: boolean;
}

interface ShieldedSlotContractResult {
  currentOwner: Address;
  valuation: bigint;
  bondedAmount: bigint;
  prepaidTaxBalance: bigint;
  taxPaidUntil: bigint;
  timeRemainingInSeconds: bigint;
  isExpired: boolean;
  contentUpdateCount: bigint;
  contentUpdateLimit: bigint;
  taxPeriodInSeconds: bigint;
  annualTaxRate: bigint;
  minBidIncrementRate: bigint;
  bondRate: bigint;
  minValuation: bigint;
  currentAdURI: string;
  treasury: Address;
  governance: Address;
  isOccupied: boolean;
}

interface NormalizedSlot {
  slotAddress: Address;
  slotType: SlotTypeKey;
  slotTypeLabel: string;
  isOccupied: boolean;
  isExpired: boolean;
  ownerAddress: Address | null;
  valuationWei: bigint;
  lockedValueWei: bigint;
  minValuationWei: bigint;
  bondRateBps: bigint;
  annualTaxRateBps: bigint;
  minBidIncrementBps: bigint;
  taxPeriodInSeconds: bigint;
  timeRemainingInSeconds: bigint;
  prepaidTaxBalanceWei: bigint;
  taxPaidUntilTimestamp: bigint;
  currentAdURI: string;
  contentUpdateCount: bigint;
  contentUpdateLimit: bigint;
  baseValuationWei?: bigint;
  dustRateBps?: bigint;
  creativeDimensions?: HarbergerSlotMetadata['creativeDimensions'];
}

export interface VacantSlotData {
  id: string;
  slotAddress: Address;
  slotType: SlotTypeKey;
  chainId: number;
  slotName: string;
  slotDisplayName: string;
  page: string;
  position: string;
  imageSize: string;
  extra: Record<string, unknown>;
  contractMeta?: HarbergerSlotContractMeta;
  creativeConfig: CreativeConfig;
  statusLabel: string;
  valuation: string;
  valuationHelper: string;
  bondRate: string;
  bondRateHelper: string;
  taxRate: string;
  taxRateHelper: string;
  actionLabel: string;
  bondRateValue: string;
  taxCostValue: string;
  coverageDuration: string;
  totalCostValue: string;
  valuationDefault: string;
  valuationMinimum: string;
  coverageDescription: string;
  bondRateBps: bigint;
  annualTaxRateBps: bigint;
  minBidIncrementBps: bigint;
  taxPeriodInSeconds: bigint;
  minValuationWei: bigint;
}

export interface ActiveSlotData {
  id: string;
  slotAddress: Address;
  slotType: SlotTypeKey;
  slotTypeLabel: string;
  chainId: number;
  slotName: string;
  slotDisplayName: string;
  page: string;
  position: string;
  imageSize: string;
  extra: Record<string, unknown>;
  contractMeta?: HarbergerSlotContractMeta;
  statusLabel: string;
  owner: string;
  ownerAddress: Address | null;
  taxRate: string;
  taxRateBps: bigint;
  bondRate: string;
  bondRateBps: bigint;
  minBidIncrementBps: bigint;
  valuation: string;
  valuationWei: bigint;
  lockedBond: string;
  lockedBondWei: bigint;
  remainingUnits: string;
  timeRemainingInSeconds: bigint;
  taxPaidUntilTimestamp: bigint;
  minTakeoverBid: string;
  minTakeoverBidWei: bigint;
  takeoverCta: string;
  takeoverHelper: string;
  coverageLabel: string;
  coverageDescription: string;
  taxPeriodInSeconds: bigint;
  prepaidTaxBalanceWei: bigint;
  currentAdURI: string;
  contentUpdateCount: bigint;
  contentUpdateLimit: bigint;
  isExpired: boolean;
  isOverdue: boolean;
  minValuationWei: bigint;
  baseValuationWei?: bigint;
  dustRateBps?: bigint;
  creativeConfig: CreativeConfig;
  canForfeit: boolean;
}

type CreativePreviewConfig = {
  width: number;
  height: number;
  aspectRatio: number;
  label: string;
  helperText: string;
  ratioLabel: string;
  style: CSSProperties;
};

export interface CreativeConfig {
  desktop: CreativePreviewConfig;
  mobile: CreativePreviewConfig;
  raw: string;
}

const DEFAULT_DESKTOP_CONFIG: CreativePreviewConfig = {
  width: 900,
  height: 225,
  aspectRatio: 900 / 225,
  label: '900 × 225',
  helperText: 'Recommended dimensions 900 × 225',
  ratioLabel: '4:1',
  style: { aspectRatio: '900 / 225' },
};

const DEFAULT_MOBILE_CONFIG: CreativePreviewConfig = {
  width: 900,
  height: 225,
  aspectRatio: 900 / 225,
  label: '900 × 225',
  helperText: 'Recommended dimensions 900 × 225',
  ratioLabel: '4:1',
  style: { aspectRatio: '900 / 225' },
};

function formatRatioLabel(width: number, height: number) {
  const gcd = (a: number, b: number): number => {
    return b === 0 ? Math.abs(a) : gcd(b, a % b);
  };

  const divisor = gcd(width, height) || 1;
  const simplifiedWidth = Math.round(width / divisor);
  const simplifiedHeight = Math.round(height / divisor);
  return `${simplifiedWidth}:${simplifiedHeight}`;
}

function buildCreativeConfig(
  dimensions?: HarbergerSlotMetadata['creativeDimensions'],
): CreativeConfig {
  const fallbackDesktop = DEFAULT_DESKTOP_CONFIG;
  const fallbackMobile = DEFAULT_MOBILE_CONFIG;

  if (!dimensions) {
    return {
      desktop: fallbackDesktop,
      mobile: fallbackMobile,
      raw: '',
    };
  }

  const { desktop, mobile, raw } = dimensions;

  const resolveConfig = (
    source: typeof desktop,
    fallback: CreativePreviewConfig,
  ): CreativePreviewConfig => {
    if (
      !source ||
      !Number.isFinite(source.width) ||
      !Number.isFinite(source.height)
    ) {
      return fallback;
    }
    const safeWidth = Math.max(1, Math.round(source.width));
    const safeHeight = Math.max(1, Math.round(source.height));
    const aspectRatioValue = safeWidth / safeHeight;
    return {
      width: safeWidth,
      height: safeHeight,
      aspectRatio: aspectRatioValue,
      label: `${safeWidth} × ${safeHeight}`,
      helperText: `Recommended dimensions ${safeWidth} × ${safeHeight}`,
      ratioLabel: formatRatioLabel(safeWidth, safeHeight),
      style: { aspectRatio: `${safeWidth} / ${safeHeight}` },
    };
  };

  const desktopConfig = resolveConfig(desktop, fallbackDesktop);
  const mobileConfig = resolveConfig(
    mobile,
    desktop ? desktopConfig : fallbackMobile,
  );

  return {
    desktop: desktopConfig,
    mobile: mobileConfig,
    raw: raw ?? '',
  };
}

export interface SlotMetrics {
  activeCount: number;
  vacantCount: number;
  overdueCount: number;
}

export interface UseHarbergerSlotsResult {
  metrics: SlotMetrics;
  vacantSlots: VacantSlotData[];
  activeSlots: ActiveSlotData[];
  slotIdCounter: bigint;
  treasuryAddress: `0x${string}`;
  governanceAddress: `0x${string}`;
  isLoading: boolean;
  isRefetching: boolean;
  error?: Error;
  refetch: () => Promise<void>;
}

export function useHarbergerSlots(): UseHarbergerSlotsResult {
  useEffect(() => {
    devLog('HARBERGER_FACTORY_ADDRESS', HARBERGER_FACTORY_ADDRESS);
  }, []);

  const enabledAddressesQuery = useReadContract({
    address: HARBERGER_FACTORY_ADDRESS,
    abi: HARBERGER_FACTORY_ABI,
    functionName: 'getValuationTaxEnabledSlots',
    chainId: AD_SLOT_CHAIN.id,
    query: {
      staleTime: 30_000,
      refetchInterval: 30_000,
    },
  });

  const shieldedAddressesQuery = useReadContract({
    address: HARBERGER_FACTORY_ADDRESS,
    abi: HARBERGER_FACTORY_ABI,
    functionName: 'getValuationTaxShieldedSlots',
    chainId: AD_SLOT_CHAIN.id,
    query: {
      staleTime: 30_000,
      refetchInterval: 30_000,
    },
  });

  const slotIdCounterQuery = useReadContract({
    address: HARBERGER_FACTORY_ADDRESS,
    abi: HARBERGER_FACTORY_ABI,
    functionName: 'slotIdCounter',
    chainId: AD_SLOT_CHAIN.id,
    query: {
      staleTime: 30_000,
      refetchInterval: 30_000,
    },
  });

  const treasuryQuery = useReadContract({
    address: HARBERGER_FACTORY_ADDRESS,
    abi: HARBERGER_FACTORY_ABI,
    functionName: 'treasury',
    chainId: AD_SLOT_CHAIN.id,
    query: {
      staleTime: 30_000,
      refetchInterval: 30_000,
    },
  });

  const governanceQuery = useReadContract({
    address: HARBERGER_FACTORY_ADDRESS,
    abi: HARBERGER_FACTORY_ABI,
    functionName: 'governance',
    chainId: sepolia.id,
    query: {
      staleTime: 30_000,
      refetchInterval: 30_000,
    },
  });

  const enabledAddresses = useMemo<Address[]>(() => {
    const raw = enabledAddressesQuery.data ?? [];
    return Array.isArray(raw) ? (raw as Address[]) : [];
  }, [enabledAddressesQuery.data]);

  const shieldedAddresses = useMemo<Address[]>(() => {
    const raw = shieldedAddressesQuery.data ?? [];
    return Array.isArray(raw) ? (raw as Address[]) : [];
  }, [shieldedAddressesQuery.data]);

  const slotIdCounter =
    (slotIdCounterQuery.data as bigint | undefined) ?? ZERO_BIGINT;
  const treasuryAddress =
    (treasuryQuery.data as `0x${string}` | undefined) ??
    '0x0000000000000000000000000000000000000000';
  const governanceAddress =
    (governanceQuery.data as `0x${string}` | undefined) ??
    '0x0000000000000000000000000000000000000000';

  useEffect(() => {
    devLog('enabledAddresses', enabledAddresses);
    devLog('shieldedAddresses', shieldedAddresses);
    devLog('treasury', treasuryAddress);
    devLog('governance', governanceAddress);
    devLog('slotIdCounter', slotIdCounter);
  }, [
    enabledAddresses,
    shieldedAddresses,
    treasuryAddress,
    governanceAddress,
    slotIdCounter,
  ]);

  const enabledContracts = useMemo(
    () =>
      enabledAddresses.map((address) => ({
        address,
        abi: VALUATION_TAX_ENABLED_SLOT_ABI,
        functionName: 'getSlotDetails',
        chainId: sepolia.id,
      })),
    [enabledAddresses],
  );

  const shieldedContracts = useMemo(
    () =>
      shieldedAddresses.map((address) => ({
        address,
        abi: VALUATION_TAX_SHIELDED_SLOT_ABI,
        functionName: 'getSlotDetails',
        chainId: sepolia.id,
      })),
    [shieldedAddresses],
  );

  const enabledDetailsQuery = useReadContracts({
    contracts: enabledContracts,
    allowFailure: true,
    query: {
      enabled: enabledContracts.length > 0,
      staleTime: 30_000,
      refetchInterval: 30_000,
    },
  });

  const shieldedDetailsQuery = useReadContracts({
    contracts: shieldedContracts,
    allowFailure: true,
    query: {
      enabled: shieldedContracts.length > 0,
      staleTime: 30_000,
      refetchInterval: 30_000,
    },
  });

  const normalizedEnabledSlots = useMemo<NormalizedSlot[]>(() => {
    if (!enabledDetailsQuery.data) {
      return [];
    }

    return enabledDetailsQuery.data
      .map((entry, index) => {
        const result = (entry as { result?: EnabledSlotContractResult }).result;
        if (!result) {
          return null;
        }

        const slotAddress = enabledAddresses[index] ?? ZERO_ADDRESS;
        const owner =
          result.currentOwner && result.currentOwner !== ZERO_ADDRESS
            ? result.currentOwner
            : null;
        const slotMetadata = getSlotMetadata(slotAddress);

        return {
          slotAddress,
          slotType: 'enabled' as SlotTypeKey,
          slotTypeLabel: SLOT_TYPE_LABEL.enabled,
          isOccupied: result.isOccupied ?? false,
          isExpired: false,
          ownerAddress: owner,
          valuationWei: result.valuation ?? ZERO_BIGINT,
          lockedValueWei: result.lockedValuation ?? ZERO_BIGINT,
          minValuationWei: result.minValuation ?? ZERO_BIGINT,
          bondRateBps: result.bondRate ?? ZERO_BIGINT,
          annualTaxRateBps: result.annualTaxRate ?? ZERO_BIGINT,
          minBidIncrementBps: result.minBidIncrementRate ?? ZERO_BIGINT,
          taxPeriodInSeconds: result.taxPeriodInSeconds ?? ZERO_BIGINT,
          timeRemainingInSeconds: result.timeRemainingInSeconds ?? ZERO_BIGINT,
          prepaidTaxBalanceWei: result.prepaidTaxBalance ?? ZERO_BIGINT,
          taxPaidUntilTimestamp: result.taxPaidUntil ?? ZERO_BIGINT,
          currentAdURI: result.currentAdURI ?? '',
          contentUpdateCount: result.contentUpdateCount ?? ZERO_BIGINT,
          contentUpdateLimit: result.contentUpdateLimit ?? ZERO_BIGINT,
          baseValuationWei: result.baseValuation ?? ZERO_BIGINT,
          dustRateBps: result.dustRate ?? ZERO_BIGINT,
          creativeDimensions:
            slotMetadata && slotMetadata.isActive
              ? slotMetadata.creativeDimensions
              : undefined,
        } satisfies NormalizedSlot;
      })
      .filter(Boolean) as NormalizedSlot[];
  }, [enabledDetailsQuery.data, enabledAddresses]);

  const normalizedShieldedSlots = useMemo<NormalizedSlot[]>(() => {
    if (!shieldedDetailsQuery.data) {
      return [];
    }

    return shieldedDetailsQuery.data
      .map((entry, index) => {
        const result = (entry as { result?: ShieldedSlotContractResult })
          .result;
        if (!result) {
          return null;
        }

        const slotAddress = shieldedAddresses[index] ?? ZERO_ADDRESS;
        const owner =
          result.currentOwner && result.currentOwner !== ZERO_ADDRESS
            ? result.currentOwner
            : null;
        const slotMetadata = getSlotMetadata(slotAddress);

        return {
          slotAddress,
          slotType: 'shielded' as SlotTypeKey,
          slotTypeLabel: SLOT_TYPE_LABEL.shielded,
          isOccupied: result.isOccupied ?? false,
          isExpired: result.isExpired ?? false,
          ownerAddress: owner,
          valuationWei: result.valuation ?? ZERO_BIGINT,
          lockedValueWei: result.bondedAmount ?? ZERO_BIGINT,
          minValuationWei: result.minValuation ?? ZERO_BIGINT,
          bondRateBps: result.bondRate ?? ZERO_BIGINT,
          annualTaxRateBps: result.annualTaxRate ?? ZERO_BIGINT,
          minBidIncrementBps: result.minBidIncrementRate ?? ZERO_BIGINT,
          taxPeriodInSeconds: result.taxPeriodInSeconds ?? ZERO_BIGINT,
          timeRemainingInSeconds: result.timeRemainingInSeconds ?? ZERO_BIGINT,
          prepaidTaxBalanceWei: result.prepaidTaxBalance ?? ZERO_BIGINT,
          taxPaidUntilTimestamp: result.taxPaidUntil ?? ZERO_BIGINT,
          currentAdURI: result.currentAdURI ?? '',
          contentUpdateCount: result.contentUpdateCount ?? ZERO_BIGINT,
          contentUpdateLimit: result.contentUpdateLimit ?? ZERO_BIGINT,
          creativeDimensions:
            slotMetadata && slotMetadata.isActive
              ? slotMetadata.creativeDimensions
              : undefined,
        } satisfies NormalizedSlot;
      })
      .filter(Boolean) as NormalizedSlot[];
  }, [shieldedDetailsQuery.data, shieldedAddresses]);

  const vacantSlots = useMemo<VacantSlotData[]>(() => {
    const enabledVacant = normalizedEnabledSlots
      .filter((slot) => !slot.isOccupied)
      .map((slot, index) => {
        const metadata = getSlotMetadata(slot.slotAddress);
        if (!isSlotActive(metadata)) {
          return null;
        }
        return createVacantSlotViewModel(
          slot,
          index,
          SLOT_TYPE_LABEL.enabled,
          metadata,
        );
      })
      .filter(Boolean) as VacantSlotData[];
    const shieldedVacant = normalizedShieldedSlots
      .filter((slot) => !slot.isOccupied)
      .map((slot, index) => {
        const metadata = getSlotMetadata(slot.slotAddress);
        if (!isSlotActive(metadata)) {
          return null;
        }
        return createVacantSlotViewModel(
          slot,
          index,
          SLOT_TYPE_LABEL.shielded,
          metadata,
        );
      })
      .filter(Boolean) as VacantSlotData[];
    return [...enabledVacant, ...shieldedVacant];
  }, [normalizedEnabledSlots, normalizedShieldedSlots]);

  const activeSlots = useMemo<ActiveSlotData[]>(() => {
    const enabledActive = normalizedEnabledSlots
      .filter((slot) => slot.isOccupied)
      .map((slot, index) => {
        const metadata = getSlotMetadata(slot.slotAddress);
        if (!isSlotActive(metadata)) {
          return null;
        }
        return createActiveSlotViewModel(
          slot,
          index,
          SLOT_TYPE_LABEL.enabled,
          metadata,
        );
      })
      .filter(Boolean) as ActiveSlotData[];
    const shieldedActive = normalizedShieldedSlots
      .filter((slot) => slot.isOccupied)
      .map((slot, index) => {
        const metadata = getSlotMetadata(slot.slotAddress);
        if (!isSlotActive(metadata)) {
          return null;
        }
        return createActiveSlotViewModel(
          slot,
          index,
          SLOT_TYPE_LABEL.shielded,
          metadata,
        );
      })
      .filter(Boolean) as ActiveSlotData[];
    return [...enabledActive, ...shieldedActive];
  }, [normalizedEnabledSlots, normalizedShieldedSlots]);

  const metrics = useMemo<SlotMetrics>(() => {
    const overdueCount = activeSlots.filter(
      (slot) => slot.isOverdue || slot.isExpired,
    ).length;
    return {
      activeCount: activeSlots.length,
      vacantCount: vacantSlots.length,
      overdueCount,
    };
  }, [activeSlots, vacantSlots]);

  const error =
    (enabledAddressesQuery.error as Error | undefined) ??
    (shieldedAddressesQuery.error as Error | undefined) ??
    (slotIdCounterQuery.error as Error | undefined) ??
    (treasuryQuery.error as Error | undefined) ??
    (governanceQuery.error as Error | undefined) ??
    (enabledDetailsQuery.error as Error | undefined) ??
    (shieldedDetailsQuery.error as Error | undefined);

  const isLoading = Boolean(
    enabledAddressesQuery.isLoading ||
      shieldedAddressesQuery.isLoading ||
      slotIdCounterQuery.isLoading ||
      treasuryQuery.isLoading ||
      governanceQuery.isLoading ||
      enabledDetailsQuery.isLoading ||
      shieldedDetailsQuery.isLoading ||
      enabledAddressesQuery.isPending ||
      shieldedAddressesQuery.isPending ||
      slotIdCounterQuery.isPending ||
      treasuryQuery.isPending ||
      governanceQuery.isPending ||
      enabledDetailsQuery.isPending ||
      shieldedDetailsQuery.isPending,
  );

  const isRefetching = Boolean(
    enabledAddressesQuery.isRefetching ||
      shieldedAddressesQuery.isRefetching ||
      slotIdCounterQuery.isRefetching ||
      treasuryQuery.isRefetching ||
      governanceQuery.isRefetching ||
      enabledDetailsQuery.isRefetching ||
      shieldedDetailsQuery.isRefetching,
  );

  const refetch = useCallback(async () => {
    await Promise.all(
      [
        enabledAddressesQuery.refetch?.(),
        shieldedAddressesQuery.refetch?.(),
        slotIdCounterQuery.refetch?.(),
        treasuryQuery.refetch?.(),
        governanceQuery.refetch?.(),
        enabledDetailsQuery.refetch?.(),
        shieldedDetailsQuery.refetch?.(),
      ].filter(Boolean),
    );
  }, [
    enabledAddressesQuery.refetch,
    shieldedAddressesQuery.refetch,
    slotIdCounterQuery.refetch,
    treasuryQuery.refetch,
    governanceQuery.refetch,
    enabledDetailsQuery.refetch,
    shieldedDetailsQuery.refetch,
  ]);

  return {
    metrics,
    vacantSlots,
    activeSlots,
    slotIdCounter,
    treasuryAddress,
    governanceAddress,
    isLoading,
    isRefetching,
    error: error ?? undefined,
    refetch,
  };
}

function createVacantSlotViewModel(
  slot: NormalizedSlot,
  index: number,
  slotTypeLabel: string,
  metadata?: HarbergerSlotMetadata,
): VacantSlotData {
  const slotName = `${SLOT_NAME_PREFIX[slot.slotType]} #${index + 1}`;
  const slotDisplayName = metadata?.slotDisplayName ?? slotName;
  const page = metadata?.page ?? 'unknown';
  const position = metadata?.position ?? 'unknown';
  const imageSize = metadata?.imageSize ?? 'unknown';
  const extra = metadata?.extra ? { ...metadata.extra } : {};
  const contractMeta = metadata?.contractMeta;
  const creativeDimensions =
    metadata && metadata.isActive ? metadata.creativeDimensions : undefined;
  const creativeConfig = buildCreativeConfig(creativeDimensions);
  const coverageLabel = formatDuration(slot.taxPeriodInSeconds);
  const bondRequired = calculateBond(slot.minValuationWei, slot.bondRateBps);
  const taxRequired = calculateTaxForPeriods(
    slot.minValuationWei,
    slot.annualTaxRateBps,
    slot.taxPeriodInSeconds,
    ONE_BIGINT,
  );
  const totalCost = bondRequired + taxRequired;

  return {
    id: slot.slotAddress,
    slotAddress: slot.slotAddress,
    slotType: slot.slotType,
    chainId: AD_SLOT_CHAIN_ID,
    slotName,
    slotDisplayName,
    page,
    position,
    imageSize,
    extra,
    contractMeta,
    creativeConfig,
    statusLabel: 'Open',
    valuation: formatEth(slot.minValuationWei),
    valuationHelper: 'Minimum valuation required to claim this slot.',
    bondRate: formatBps(slot.bondRateBps),
    bondRateHelper: 'Bond locked against your stated valuation.',
    taxRate: formatBps(slot.annualTaxRateBps),
    taxRateHelper: 'Annual tax applied to your declared valuation.',
    actionLabel: 'Make Claim',
    bondRateValue: formatEth(bondRequired),
    taxCostValue: formatEth(taxRequired),
    coverageDuration: coverageLabel,
    totalCostValue: formatEth(totalCost),
    valuationDefault: formatNumberInputFromWei(slot.minValuationWei),
    valuationMinimum: formatEth(slot.minValuationWei),
    coverageDescription: `${slotTypeLabel} claims prepay one tax period (${coverageLabel}). Amounts above assume the minimum valuation.`,
    bondRateBps: slot.bondRateBps,
    annualTaxRateBps: slot.annualTaxRateBps,
    minBidIncrementBps: slot.minBidIncrementBps,
    taxPeriodInSeconds: slot.taxPeriodInSeconds,
    minValuationWei: slot.minValuationWei,
  };
}

function createActiveSlotViewModel(
  slot: NormalizedSlot,
  index: number,
  slotTypeLabel: string,
  metadata?: HarbergerSlotMetadata,
): ActiveSlotData {
  const nowSeconds = BigInt(Math.floor(Date.now() / 1000));
  const slotName = `${SLOT_NAME_PREFIX[slot.slotType]} #${index + 1}`;
  const slotDisplayName = metadata?.slotDisplayName ?? slotName;
  const page = metadata?.page ?? 'unknown';
  const position = metadata?.position ?? 'unknown';
  const imageSize = metadata?.imageSize ?? 'unknown';
  const extra = metadata?.extra ? { ...metadata.extra } : {};
  const contractMeta = metadata?.contractMeta;
  const owner =
    slot.ownerAddress !== null
      ? AddressValidator.shortenAddress(slot.ownerAddress)
      : '—';
  const isOverdue =
    slot.isOccupied &&
    !slot.isExpired &&
    slot.timeRemainingInSeconds === ZERO_BIGINT;

  const overdueSeconds =
    slot.taxPaidUntilTimestamp > ZERO_BIGINT &&
    nowSeconds > slot.taxPaidUntilTimestamp
      ? nowSeconds - slot.taxPaidUntilTimestamp
      : ZERO_BIGINT;

  const overdueDurationLabel =
    overdueSeconds > ZERO_BIGINT
      ? formatDuration(overdueSeconds, { fallback: '0s' })
      : '';

  const statusLabel = !slot.isOccupied
    ? 'Vacant'
    : slot.isExpired
      ? 'Expired'
      : 'Owned';

  const remainingUnits = !slot.isOccupied
    ? 'Vacant'
    : slot.isExpired
      ? 'Expired'
      : isOverdue
        ? 'Overdue'
        : formatDuration(slot.timeRemainingInSeconds, { fallback: '0s' });

  const minTakeoverBidWei =
    slot.valuationWei > ZERO_BIGINT
      ? slot.valuationWei +
        (slot.valuationWei * slot.minBidIncrementBps) / RATE_DENOMINATOR
      : slot.minValuationWei;

  const coverageLabel = formatDuration(slot.taxPeriodInSeconds);
  const creativeDimensions =
    metadata && metadata.isActive ? metadata.creativeDimensions : undefined;
  const creativeConfig = buildCreativeConfig(creativeDimensions);
  const coverageRemains = coverageExtendsBeyondNow(slot, nowSeconds);
  const canForfeit = isOverdue && !coverageRemains;

  return {
    id: slot.slotAddress,
    slotAddress: slot.slotAddress,
    slotType: slot.slotType,
    slotTypeLabel,
    chainId: AD_SLOT_CHAIN_ID,
    slotName,
    slotDisplayName,
    page,
    position,
    imageSize,
    extra,
    contractMeta,
    statusLabel,
    owner,
    ownerAddress: slot.ownerAddress,
    taxRate: formatBps(slot.annualTaxRateBps),
    taxRateBps: slot.annualTaxRateBps,
    bondRate: formatBps(slot.bondRateBps),
    bondRateBps: slot.bondRateBps,
    minBidIncrementBps: slot.minBidIncrementBps,
    valuation: formatEth(slot.valuationWei),
    valuationWei: slot.valuationWei,
    lockedBond: formatEth(slot.lockedValueWei),
    lockedBondWei: slot.lockedValueWei,
    remainingUnits,
    timeRemainingInSeconds: slot.timeRemainingInSeconds,
    taxPaidUntilTimestamp: slot.taxPaidUntilTimestamp,
    minTakeoverBid: `≥ ${formatEth(minTakeoverBidWei)}`,
    minTakeoverBidWei,
    takeoverCta: slot.isExpired ? 'Reclaim Slot' : 'Takeover Slot',
    takeoverHelper: `Requires at least ${formatBps(slot.minBidIncrementBps)} increase over current valuation.`,
    coverageLabel: `One period ≈ ${coverageLabel}`,
    coverageDescription: `Takeovers prepay one tax period (${coverageLabel}).`,
    taxPeriodInSeconds: slot.taxPeriodInSeconds,
    prepaidTaxBalanceWei: slot.prepaidTaxBalanceWei,
    currentAdURI: slot.currentAdURI,
    contentUpdateCount: slot.contentUpdateCount,
    contentUpdateLimit: slot.contentUpdateLimit,
    isExpired: slot.isExpired,
    isOverdue,
    minValuationWei: slot.minValuationWei,
    baseValuationWei: slot.baseValuationWei,
    dustRateBps: slot.dustRateBps,
    creativeConfig,
    canForfeit,
  };
}

export function aggregatePrepaidTax(slots: ActiveSlotData[]): string {
  const total = sumBigints(slots.map((slot) => slot.prepaidTaxBalanceWei));
  return formatEth(total);
}
const SECONDS_PER_YEAR = BigInt(60 * 60 * 24 * 365);
const TAX_BASE = RATE_DENOMINATOR * SECONDS_PER_YEAR;

function coverageExtendsBeyondNow(
  slot: NormalizedSlot,
  nowSeconds: bigint,
): boolean {
  if (!slot.isOccupied || slot.isExpired) {
    return false;
  }

  if (
    nowSeconds < slot.taxPaidUntilTimestamp ||
    slot.taxPeriodInSeconds <= ZERO_BIGINT
  ) {
    return true;
  }

  const taxFactor = slot.annualTaxRateBps * slot.taxPeriodInSeconds;
  if (taxFactor <= ZERO_BIGINT) {
    return false;
  }

  const taxDenominator = TAX_BASE + taxFactor;
  const overdueSeconds = nowSeconds - slot.taxPaidUntilTimestamp;
  if (overdueSeconds <= ZERO_BIGINT) {
    return false;
  }

  const periodsDue = overdueSeconds / slot.taxPeriodInSeconds + ONE_BIGINT;

  let valuation = slot.valuationWei;
  let locked = slot.lockedValueWei;
  let prepaid = slot.prepaidTaxBalanceWei;
  let taxPaidUntil = slot.taxPaidUntilTimestamp;

  const dustThreshold =
    slot.baseValuationWei &&
    slot.baseValuationWei > ZERO_BIGINT &&
    slot.dustRateBps &&
    slot.dustRateBps > ZERO_BIGINT
      ? (slot.baseValuationWei * slot.dustRateBps) / RATE_DENOMINATOR
      : ZERO_BIGINT;

  for (let i = ZERO_BIGINT; i < periodsDue; i += ONE_BIGINT) {
    if (valuation <= ZERO_BIGINT || locked <= ZERO_BIGINT) {
      return false;
    }

    const theoreticalValuation = (valuation * TAX_BASE) / taxDenominator;
    let taxRemaining = valuation - theoreticalValuation;
    if (taxRemaining < ZERO_BIGINT) {
      taxRemaining = ZERO_BIGINT;
    }

    if (prepaid > ZERO_BIGINT) {
      const taxFromPrepaid = prepaid >= taxRemaining ? taxRemaining : prepaid;
      prepaid -= taxFromPrepaid;
      taxRemaining -= taxFromPrepaid;
    }

    let taxFromLocked = ZERO_BIGINT;
    if (taxRemaining > ZERO_BIGINT) {
      if (taxRemaining >= locked) {
        taxFromLocked = locked;
        taxRemaining -= locked;
      } else {
        taxFromLocked = taxRemaining;
        taxRemaining = ZERO_BIGINT;
      }
    }

    if (taxFromLocked >= locked) {
      return false;
    }

    const remainingLocked = locked - taxFromLocked;
    const newValuation =
      taxRemaining === ZERO_BIGINT
        ? theoreticalValuation
        : valuation > taxFromLocked
          ? valuation - taxFromLocked
          : ZERO_BIGINT;

    valuation = newValuation;
    locked = remainingLocked;
    taxPaidUntil += slot.taxPeriodInSeconds;

    if (dustThreshold > ZERO_BIGINT && valuation <= dustThreshold) {
      return false;
    }

    if (taxPaidUntil > nowSeconds) {
      return true;
    }

    if (valuation === ZERO_BIGINT || locked === ZERO_BIGINT) {
      return false;
    }
  }

  return false;
}
