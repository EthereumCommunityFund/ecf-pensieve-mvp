'use client';

import { cn } from '@heroui/react';
import { ReactNode, useMemo } from 'react';
import { Clock } from '@phosphor-icons/react';

import type { ActiveSlotData } from '@/hooks/useHarbergerSlots';
import { extractCreativeAssets } from '@/utils/creative';
import {
  calculateTaxForPeriods,
  formatDuration,
  formatEth,
  ONE_BIGINT,
  ZERO_BIGINT,
} from '@/utils/harberger';

import ValueLabel, { IValueLabelType } from './ValueLabel';
import {
  DESKTOP_CREATIVE_CONFIG,
  MOBILE_CREATIVE_CONFIG,
} from './creativeConstants';

interface DetailItem {
  label: string;
  value: ReactNode;
  type?: 'content' | 'divider';
  valueLabelType?: IValueLabelType;
  icon?: ReactNode;
}

export interface OwnedSlotOverviewProps {
  slot: ActiveSlotData;
  className?: string;
  tone?: 'default' | 'danger';
}

export default function OwnedSlotOverview({
  slot,
  className,
  tone = 'default',
}: OwnedSlotOverviewProps) {
  const creativeAssets = useMemo(
    () => extractCreativeAssets(slot.currentAdURI ?? ''),
    [slot.currentAdURI],
  );

  const valuationBasis =
    slot.valuationWei > ZERO_BIGINT ? slot.valuationWei : slot.minValuationWei;

  const taxPerPeriodWei = calculateTaxForPeriods(
    valuationBasis,
    slot.taxRateBps,
    slot.taxPeriodInSeconds,
    ONE_BIGINT,
  );

  const taxOwedWei = slot.isOverdue ? taxPerPeriodWei : ZERO_BIGINT;
  const taxOwedDisplay = formatEth(taxOwedWei);

  const nowSeconds = BigInt(Math.floor(Date.now() / 1000));
  const hasTimeRemaining = slot.timeRemainingInSeconds > ZERO_BIGINT;
  const remainingDuration = formatDuration(slot.timeRemainingInSeconds, {
    fallback: '0s',
  });

  const overdueSeconds =
    slot.taxPaidUntilTimestamp > ZERO_BIGINT &&
    nowSeconds > slot.taxPaidUntilTimestamp
      ? nowSeconds - slot.taxPaidUntilTimestamp
      : ZERO_BIGINT;
  const overdueDuration =
    overdueSeconds > ZERO_BIGINT
      ? formatDuration(overdueSeconds, { fallback: '0s' })
      : '';

  const taxDueCountdown = (() => {
    if (slot.isExpired) {
      return 'Closed';
    }

    if (hasTimeRemaining) {
      return remainingDuration ? `${remainingDuration} left` : '—';
    }

    if (overdueDuration) {
      return `Overdue ${overdueDuration}`;
    }

    if (slot.isOverdue) {
      return 'Overdue';
    }

    return '—';
  })();

  const detailItems: DetailItem[] = [
    { label: 'Minimum Valuation:', value: formatEth(slot.minValuationWei) },
    { label: 'Locked Bond:', value: slot.lockedBond },
    { label: 'Prepaid Tax:', value: formatEth(slot.prepaidTaxBalanceWei) },
    { label: 'Tax Due:', value: taxDueCountdown, icon: <Clock size={14} weight='fill'  className='opacity-50' /> },
    { label: 'Remaining Units:', value: slot.remainingUnits },
    { label: 'Tax Owed:', value: taxOwedDisplay },
    { label: '', value: '', type: 'divider' },
    { label: 'Min Takeover Bid:', value: slot.minTakeoverBid, valueLabelType: 'dark' },
    { label: '', value: '', type: 'divider' },
    { label: 'Owner:', value: slot.owner },
    { label: 'Tax Rate:', value: slot.taxRate },
  ];

  const statusLabelType = tone === 'danger' ? 'danger' : 'light';
  const desktopPreview =
    creativeAssets.desktopImageUrl ?? creativeAssets.primaryImageUrl;
  const mobilePreview =
    creativeAssets.mobileImageUrl ?? creativeAssets.primaryImageUrl;
  const targetLink = creativeAssets.targetUrl;

  return (
    <div className={cn('flex flex-col gap-[20px]', className)}>
      <div className="flex flex-col gap-[20px]">
        <div className="flex flex-wrap items-center justify-between gap-[10px]">
          <div className="flex items-center gap-[10px]">
            <span className="text-[13px] font-semibold text-black/50">
              Slot:
            </span>
            <span className="text-[15px] font-semibold text-black">
              {slot.slotDisplayName ?? slot.slotName}
            </span>
          </div>
        </div>

        <div className="grid gap-[12px] md:grid-cols-2">
          <CreativePreview
            label="Desktop"
            imageUrl={desktopPreview}
            aspectClass={DESKTOP_CREATIVE_CONFIG.previewAspectClass}
          />
          <CreativePreview
            label="Mobile"
            imageUrl={mobilePreview}
            aspectClass={MOBILE_CREATIVE_CONFIG.previewAspectClass}
          />
        </div>

      </div>

      <div className="flex flex-col gap-[8px]">
        {detailItems.map((item) =>
          item.type === 'divider' ? (
            <div className="h-px w-full bg-black/10"></div>
          ) : (
            <div key={item.label} className="flex justify-between gap-[4px]">
              <span className="font-sans text-[14px] text-black/80">
                {item.label}
              </span>
              <ValueLabel valueLabelType={item.valueLabelType} icon={item.icon}>{item.value}</ValueLabel>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function CreativePreview({
  label,
  imageUrl,
  aspectClass,
  helper,
}: {
  label: string;
  imageUrl: string | null;
  aspectClass: string;
  helper?: string;
}) {
  return (
    <div className="flex flex-col gap-[8px]">
      <div className="flex flex-wrap items-center gap-[6px]">
        <span className="text-[14px] text-black/70">{label}</span>
        {helper ? (
          <span className="text-[11px] text-black/40">{helper}</span>
        ) : null}
      </div>
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-[10px] border border-dashed border-black/20 bg-[#F5F5F5]',
          aspectClass,
        )}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${label} creative`}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center px-[12px] text-center text-[12px] text-black/40">
            No creative uploaded
          </div>
        )}
      </div>
    </div>
  );
}
