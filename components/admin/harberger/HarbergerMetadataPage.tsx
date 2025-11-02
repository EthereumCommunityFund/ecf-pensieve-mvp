'use client';

import { ArrowLeft } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Address } from 'viem';
import { usePublicClient } from 'wagmi';

import { Button } from '@/components/base/button';
import { addToast } from '@/components/base/toast';
import Copy from '@/components/biz/common/Copy';
import { isProduction } from '@/constants/env';
import {
  VALUATION_TAX_ENABLED_SLOT_ABI,
  VALUATION_TAX_SHIELDED_SLOT_ABI,
  type SlotTypeKey,
} from '@/constants/harbergerFactory';
import {
  getHarbergerSlotMetadataMap,
  listHarbergerSlotMetadata,
} from '@/constants/harbergerSlotsMetadata';
import { useHarbergerFactoryState } from '@/hooks/useHarbergerFactoryState';
import type {
  HarbergerSlotContractMeta,
  HarbergerSlotMetadata,
} from '@/types/harbergerSlotMetadata';
import { formatBps, formatEth } from '@/utils/harberger';
import { formatViemError } from '@/utils/viem';

type SlotContractMetaRecord = Record<string, HarbergerSlotContractMeta>;

type SlotInfo = {
  address: Address;
  slotType: SlotTypeKey;
  metadata?: HarbergerSlotMetadata;
  contractMeta?: HarbergerSlotContractMeta;
};

const CHAIN_ID = isProduction ? 1 : 11155111;
const CHAIN_NAME = isProduction ? 'Mainnet' : 'Sepolia';

function createMetadataTemplate(
  chainId: number,
  address: Address,
  contractMeta?: HarbergerSlotContractMeta,
): HarbergerSlotMetadata {
  return {
    chainId,
    slotAddress: address,
    slotDisplayName: '',
    page: '',
    position: '',
    imageSize: '',
    extra: {},
    isActive: false,
    contractMeta,
  };
}

function isContractMetaEqual(
  a?: HarbergerSlotContractMeta,
  b?: HarbergerSlotContractMeta,
): boolean {
  if (!a || !b) return false;
  if (a.slotType !== b.slotType) return false;
  const fields: Array<keyof HarbergerSlotContractMeta> = [
    'bondRateBps',
    'annualTaxRateBps',
    'minBidIncrementBps',
    'taxPeriodSeconds',
    'minValuationWei',
    'contentUpdateLimit',
    'dustRateBps',
  ];
  return fields.every((key) => {
    const aValue = a[key];
    const bValue = b[key];
    return (aValue ?? '') === (bValue ?? '');
  });
}

function isMetadataComplete(metadata?: HarbergerSlotMetadata): boolean {
  if (!metadata) return false;
  return Boolean(
    metadata.slotDisplayName &&
      metadata.page &&
      metadata.position &&
      metadata.imageSize,
  );
}

type ViemPublicClient = NonNullable<ReturnType<typeof usePublicClient>>;

function formatPercentLabel(value?: string | null): string {
  if (!value) return '—';
  try {
    return formatBps(BigInt(value));
  } catch {
    return '—';
  }
}

function formatDaysLabel(value?: string | null): string {
  if (!value) return '—';
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '—';
  }
  const days = seconds / 86_400;
  const formatter = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: days < 1 ? 2 : 0,
    maximumFractionDigits: 2,
  });
  const label = formatter.format(days);
  return `${label} ${days === 1 ? 'day' : 'days'}`;
}

async function fetchEnabledMeta(
  publicClient: ViemPublicClient,
  address: Address,
): Promise<HarbergerSlotContractMeta> {
  const details = (await publicClient.readContract({
    address,
    abi: VALUATION_TAX_ENABLED_SLOT_ABI,
    functionName: 'getSlotDetails',
  })) as {
    bondRate: bigint;
    annualTaxRate: bigint;
    minBidIncrementRate: bigint;
    taxPeriodInSeconds: bigint;
    minValuation: bigint;
    contentUpdateLimit: bigint;
    dustRate: bigint;
  };

  return {
    slotType: 'enabled',
    bondRateBps: details.bondRate.toString(),
    annualTaxRateBps: details.annualTaxRate.toString(),
    minBidIncrementBps: details.minBidIncrementRate.toString(),
    taxPeriodSeconds: details.taxPeriodInSeconds.toString(),
    minValuationWei: details.minValuation.toString(),
    contentUpdateLimit: details.contentUpdateLimit.toString(),
    dustRateBps: details.dustRate.toString(),
  } satisfies HarbergerSlotContractMeta;
}

async function fetchShieldedMeta(
  publicClient: ViemPublicClient,
  address: Address,
): Promise<HarbergerSlotContractMeta> {
  const details = (await publicClient.readContract({
    address,
    abi: VALUATION_TAX_SHIELDED_SLOT_ABI,
    functionName: 'getSlotDetails',
  })) as {
    bondRate: bigint;
    annualTaxRate: bigint;
    minBidIncrementRate: bigint;
    taxPeriodInSeconds: bigint;
    minValuation: bigint;
    contentUpdateLimit: bigint;
  };

  return {
    slotType: 'shielded',
    bondRateBps: details.bondRate.toString(),
    annualTaxRateBps: details.annualTaxRate.toString(),
    minBidIncrementBps: details.minBidIncrementRate.toString(),
    taxPeriodSeconds: details.taxPeriodInSeconds.toString(),
    minValuationWei: details.minValuation.toString(),
    contentUpdateLimit: details.contentUpdateLimit.toString(),
  } satisfies HarbergerSlotContractMeta;
}

export const HarbergerMetadataPage = () => {
  const router = useRouter();
  const publicClient = usePublicClient();
  const { data, isLoading, error, refresh } = useHarbergerFactoryState();

  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [contractMetaMap, setContractMetaMap] =
    useState<SlotContractMetaRecord>({});

  const metadataList = useMemo(() => listHarbergerSlotMetadata(CHAIN_ID), []);

  const metadataMap = useMemo(() => {
    return getHarbergerSlotMetadataMap(CHAIN_ID);
  }, []);

  const reloadContractMeta = useCallback(async () => {
    if (!publicClient || !data) {
      return;
    }

    setIsFetchingMeta(true);
    setMetaError(null);

    try {
      const nextMap: SlotContractMetaRecord = {};

      const enabledFetch = data.enabledSlots.map(async (slot) => {
        const meta = await fetchEnabledMeta(publicClient, slot);
        nextMap[slot.toLowerCase()] = meta;
      });

      const shieldedFetch = data.shieldedSlots.map(async (slot) => {
        const meta = await fetchShieldedMeta(publicClient, slot);
        nextMap[slot.toLowerCase()] = meta;
      });

      await Promise.all([...enabledFetch, ...shieldedFetch]);

      setContractMetaMap(nextMap);
    } catch (err) {
      setMetaError(formatViemError(err));
    } finally {
      setIsFetchingMeta(false);
    }
  }, [publicClient, data]);

  useEffect(() => {
    void reloadContractMeta();
  }, [reloadContractMeta]);

  const onChainSlotInfos: SlotInfo[] = useMemo(() => {
    const entries: SlotInfo[] = [];
    if (!data) {
      return entries;
    }

    data.enabledSlots.forEach((slot) => {
      const key = slot.toLowerCase();
      entries.push({
        address: slot,
        slotType: 'enabled',
        metadata: metadataMap[key],
        contractMeta: contractMetaMap[key],
      });
    });

    data.shieldedSlots.forEach((slot) => {
      const key = slot.toLowerCase();
      entries.push({
        address: slot,
        slotType: 'shielded',
        metadata: metadataMap[key],
        contractMeta: contractMetaMap[key],
      });
    });

    entries.sort((a, b) => a.address.localeCompare(b.address));
    return entries;
  }, [contractMetaMap, data, metadataMap]);

  const onChainSet = useMemo(() => {
    return new Set(onChainSlotInfos.map((info) => info.address.toLowerCase()));
  }, [onChainSlotInfos]);

  const missingMetadata = useMemo(() => {
    return onChainSlotInfos.filter((info) => !info.metadata);
  }, [onChainSlotInfos]);

  const outdatedMetadata = useMemo(() => {
    return onChainSlotInfos.filter((info) =>
      info.metadata && info.contractMeta
        ? !isContractMetaEqual(info.metadata.contractMeta, info.contractMeta)
        : false,
    );
  }, [onChainSlotInfos]);

  const incompleteMetadata = useMemo(() => {
    return metadataList.filter((entry) => !isMetadataComplete(entry));
  }, [metadataList]);

  const orphanedMetadata = useMemo(() => {
    return metadataList.filter(
      (entry) => !onChainSet.has(entry.slotAddress.toLowerCase()),
    );
  }, [metadataList, onChainSet]);

  const handleCopyTemplate = (info: SlotInfo) => {
    const template = createMetadataTemplate(
      CHAIN_ID,
      info.address,
      info.contractMeta,
    );
    return JSON.stringify(template, null, 2);
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 py-4">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Button
            color="secondary"
            startContent={<ArrowLeft size={18} />}
            onPress={() => router.push('/admin/harberger')}
          >
            Back
          </Button>
          <h1 className="text-2xl font-bold text-black">
            Harberger Slot Metadata
          </h1>
        </div>
        <p className="text-sm leading-5 text-black/60">
          Visualize on-chain slots and local metadata ({CHAIN_NAME}) to keep
          JSON entries synchronized.
        </p>
      </header>

      <section className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5">
          <div>
            <h2 className="text-xl font-semibold text-black">Summary</h2>
            <p className="text-sm text-black/60">
              On-chain slots vs. local metadata JSON.
            </p>
          </div>
          <Button color="secondary" onPress={() => void refresh()}>
            Refresh factory state
          </Button>
          <Button
            color="secondary"
            onPress={() => {
              if (!publicClient) {
                addToast({
                  title: 'Public client unavailable',
                  color: 'danger',
                });
                return;
              }
              void reloadContractMeta();
            }}
            isDisabled={isFetchingMeta}
            isLoading={isFetchingMeta}
          >
            Reload contract meta
          </Button>
        </div>

        <div className="mt-3 flex gap-[10px]">
          <div className="rounded-lg border border-black/10 bg-black/5 p-3">
            <p className="text-xs uppercase tracking-wide text-black/60">
              Enabled slots
            </p>
            <p className="mt-2 text-2xl font-semibold text-black">
              {data?.enabledSlots.length ?? 0}
            </p>
          </div>

          <div className="rounded-lg border border-black/10 bg-black/5 p-3">
            <p className="text-xs uppercase tracking-wide text-black/60">
              Shielded slots
            </p>
            <p className="mt-2 text-2xl font-semibold text-black">
              {data?.shieldedSlots.length ?? 0}
            </p>
          </div>

          <div className="rounded-lg border border-black/10 bg-black/5 p-3">
            <p className="text-xs uppercase tracking-wide text-black/60">
              Metadata entries
            </p>
            <p className="mt-2 text-2xl font-semibold text-black">
              {metadataList.length}
            </p>
          </div>

          <div className="rounded-lg border border-black/10 bg-black/5 p-3">
            <p className="text-xs uppercase tracking-wide text-black/60">
              Missing metadata
            </p>
            <p className="mt-2 text-2xl font-semibold text-black">
              {missingMetadata.length}
            </p>
          </div>
        </div>

        {error ? (
          <p className="mt-3 text-sm text-red-600">{error.message}</p>
        ) : null}

        {metaError ? (
          <p className="mt-2 text-sm text-red-600">{metaError}</p>
        ) : null}

        {isLoading ? (
          <p className="mt-3 text-sm text-black/60">Loading factory state…</p>
        ) : null}
      </section>

      <section className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
        <h2 className="text-xl font-semibold text-black">New slots</h2>
        <p className="text-sm text-black/60">
          Addresses that exist on-chain but do not yet appear in
          harbergerSlotsMetadata JSON.
        </p>

        {missingMetadata.length === 0 ? (
          <p className="mt-3 text-sm text-black/60">
            All on-chain slots have metadata entries.
          </p>
        ) : (
          <div className="mt-3 space-y-2.5">
            {missingMetadata.map((info) => (
              <div
                key={info.address}
                className="rounded-lg border border-amber-200 bg-amber-50 p-3"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-amber-200 px-2 py-1 text-xs font-semibold uppercase text-amber-900">
                      {info.slotType}
                    </span>
                    <span className="break-all text-sm font-semibold text-black">
                      {info.address}
                    </span>
                  </div>
                  <p className="text-xs text-black/60">
                    Add this entry to {CHAIN_NAME} metadata JSON and fill
                    display fields before enabling.
                  </p>
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <Copy
                    text={handleCopyTemplate(info)}
                    message="Metadata template copied"
                  >
                    Copy template
                  </Copy>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
        <h2 className="text-xl font-semibold text-black">Metadata health</h2>
        <p className="text-sm text-black/60">
          Track incomplete or outdated metadata entries to keep the catalog
          aligned with on-chain parameters.
        </p>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-black/10 bg-black/5 p-3">
            <h3 className="font-semibold text-black">Outdated contract meta</h3>
            {outdatedMetadata.length === 0 ? (
              <p className="mt-1 text-sm text-black/60">
                All entries are up to date.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {outdatedMetadata.map((info) => (
                  <li
                    key={info.address}
                    className="break-all text-sm text-black"
                  >
                    {info.address}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-lg border border-black/10 bg-black/5 p-3">
            <h3 className="font-semibold text-black">Incomplete entries</h3>
            {incompleteMetadata.length === 0 ? (
              <p className="mt-1 text-sm text-black/60">
                All entries contain required fields.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {incompleteMetadata.map((entry) => (
                  <li
                    key={entry.slotAddress}
                    className="break-all text-sm text-black"
                  >
                    {entry.slotAddress}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-black/10 bg-black/5 p-3">
          <h3 className="font-semibold text-black">Orphaned metadata</h3>
          {orphanedMetadata.length === 0 ? (
            <p className="mt-1 text-sm text-black/60">
              No metadata entries reference non-existent slots.
            </p>
          ) : (
            <ul className="mt-2 space-y-2">
              {orphanedMetadata.map((entry) => (
                <li
                  key={entry.slotAddress}
                  className="break-all text-sm text-black"
                >
                  {entry.slotAddress}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
        <h2 className="text-xl font-semibold text-black">On-chain slots</h2>
        <p className="text-sm text-black/60">
          Complete view of every slot with metadata status and contract
          parameters.
        </p>

        <div className="mt-3 overflow-x-auto rounded-lg border border-black/10">
          <table className="min-w-[1200px] divide-y divide-black/10">
            <thead className="bg-black/5">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black/60">
                  Slot type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black/60">
                  Address
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black/60">
                  Active
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black/60">
                  Display name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black/60">
                  Page
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black/60">
                  Position
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black/60">
                  Image size
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black/60">
                  Metadata status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black/60">
                  Contract meta status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black/60">
                  Bond rate (%)
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black/60">
                  Annual tax (%)
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black/60">
                  Min bid increment (%)
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black/60">
                  Tax period (days)
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black/60">
                  Min valuation (wei)
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black/60">
                  Content limit
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black/60">
                  Dust rate (%)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 bg-white">
              {onChainSlotInfos.map((info) => {
                const metadataStatus = info.metadata
                  ? isMetadataComplete(info.metadata)
                    ? 'Complete'
                    : 'Incomplete'
                  : 'Missing';
                const contractStatus = info.contractMeta
                  ? info.metadata?.contractMeta &&
                    isContractMetaEqual(
                      info.metadata.contractMeta,
                      info.contractMeta,
                    )
                    ? 'Matched'
                    : 'Needs update'
                  : 'Loading…';
                const metadata = info.metadata;
                const contractMeta = info.contractMeta;
                const imageSizeParts = metadata?.imageSize
                  ? metadata.imageSize
                      .split('_')
                      .map((value) => value.trim())
                      .slice(0, 2)
                  : [];
                const desktopSize =
                  imageSizeParts[0] || metadata?.imageSize || null;
                const mobileSize = imageSizeParts[1] || null;
                const minValuationWei = contractMeta?.minValuationWei || null;
                let minValuationEth: string | null = null;
                if (minValuationWei) {
                  try {
                    minValuationEth = formatEth(BigInt(minValuationWei));
                  } catch (conversionError) {
                    minValuationEth = null;
                  }
                }
                const bondRateLabel = contractMeta
                  ? formatPercentLabel(contractMeta.bondRateBps)
                  : 'Loading…';
                const annualTaxLabel = contractMeta
                  ? formatPercentLabel(contractMeta.annualTaxRateBps)
                  : 'Loading…';
                const minBidIncrementLabel = contractMeta
                  ? formatPercentLabel(contractMeta.minBidIncrementBps)
                  : 'Loading…';
                const taxPeriodLabel = contractMeta
                  ? formatDaysLabel(contractMeta.taxPeriodSeconds)
                  : 'Loading…';
                return (
                  <tr key={info.address} className="align-top">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold capitalize text-black">
                      {info.slotType}
                    </td>
                    <td className="px-4 py-3 text-sm text-black">
                      <div className="break-all">{info.address}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-black">
                      {metadata ? (
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            metadata.isActive
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-black/10 text-black/60'
                          }`}
                        >
                          {metadata.isActive ? 'Active' : 'Disabled'}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-black">
                      {metadata?.slotDisplayName || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-black">
                      {metadata?.page || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-black">
                      {metadata?.position || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-black">
                      {desktopSize ? (
                        <div className="flex flex-col gap-1 text-xs">
                          <span className="font-medium text-black/80">
                            Desktop: {desktopSize}
                          </span>
                          {mobileSize ? (
                            <span className="font-medium text-black/60">
                              Mobile: {mobileSize}
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-black">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          metadataStatus === 'Complete'
                            ? 'bg-emerald-100 text-emerald-700'
                            : metadataStatus === 'Incomplete'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-black/10 text-black/60'
                        }`}
                      >
                        {metadataStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-black">
                      {contractStatus}
                    </td>
                    <td className="px-4 py-3 text-sm text-black">
                      {bondRateLabel}
                    </td>
                    <td className="px-4 py-3 text-sm text-black">
                      {annualTaxLabel}
                    </td>
                    <td className="px-4 py-3 text-sm text-black">
                      {minBidIncrementLabel}
                    </td>
                    <td className="px-4 py-3 text-sm text-black">
                      {taxPeriodLabel}
                    </td>
                    <td className="px-4 py-3 text-sm text-black">
                      {minValuationWei ? (
                        <div className="flex flex-col gap-1 text-xs">
                          {minValuationEth ? (
                            <span className="font-medium text-black/60">
                              {minValuationEth}
                            </span>
                          ) : null}
                          <span className="font-medium text-black/80">
                            Wei: {minValuationWei}
                          </span>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-black">
                      {contractMeta?.contentUpdateLimit ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-black">
                      {info.slotType === 'shielded'
                        ? '—'
                        : contractMeta
                          ? formatPercentLabel(contractMeta.dustRateBps)
                          : 'Loading…'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
