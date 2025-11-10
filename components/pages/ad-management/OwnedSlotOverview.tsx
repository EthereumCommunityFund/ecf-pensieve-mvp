'use client';

import { cn, Tooltip } from '@heroui/react';
import { Clock } from '@phosphor-icons/react';
import { ReactNode, useMemo, type CSSProperties } from 'react';

import { InfoIcon } from '@/components/icons';
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

interface DetailItem {
  label: string;
  value: ReactNode;
  type?: 'content' | 'divider';
  valueLabelType?: IValueLabelType;
  icon?: ReactNode;
  helper?: string;
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
  const { desktop: desktopCreativeConfig, mobile: mobileCreativeConfig } =
    slot.creativeConfig;

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
    {
      label: 'Minimum Valuation',
      value: formatEth(slot.minValuationWei),
      helper: 'Lowest valuation allowed when placing bids on this slot.',
    },
    {
      label: 'Locked Bond',
      value: slot.lockedBond,
      helper: 'Collateral held in escrow; covers overdue tax before refunding.',
    },
    {
      label: 'Prepaid Tax',
      value: formatEth(slot.prepaidTaxBalanceWei),
      helper: 'Remaining prepaid tax balance available for future coverage.',
    },
    {
      label: 'Tax Due',
      value: taxDueCountdown,
      icon: <Clock size={14} weight="fill" className="opacity-50" />,
      valueLabelType: slot.isOverdue ? 'danger' : undefined,
      helper:
        'Time until current coverage ends; shows overdue duration after expiry.',
    },
    // {
    //   label: 'Remaining Units:',
    //   value: slot.remainingUnits,
    //   valueLabelType: slot.isOverdue ? 'danger' : undefined,
    // },
    { label: 'Tax Owed', value: taxOwedDisplay },
    { label: 'divider-001', value: '', type: 'divider' },
    {
      label: 'Min Takeover Bid',
      value: slot.minTakeoverBid,
      valueLabelType: 'dark',
      helper:
        'Minimum offer required for takeover, including mandated increment.',
    },
    { label: 'divider-002', value: '', type: 'divider' },
    {
      label: 'Owner',
      value: slot.owner,
      helper: 'Current wallet address that controls this slot.',
    },
    {
      label: 'Tax Rate (Weekly)',
      value: slot.taxRate,
      helper: 'Weekly tax percentage applied to the declared valuation.',
    },
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
            aspectStyle={desktopCreativeConfig.style}
            helper={desktopCreativeConfig.label}
            classnames={{
              container: 'w-[419px] mobile:w-[80vw]',
            }}
          />
          <CreativePreview
            label="Mobile"
            imageUrl={mobilePreview}
            aspectStyle={mobileCreativeConfig.style}
            helper={mobileCreativeConfig.label}
            classnames={{
              container: 'w-[317px] mobile:w-[60vw]',
            }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-[8px]">
        {detailItems.map((item, idx) =>
          item.type === 'divider' ? (
            <div key={item.label} className="h-px w-full bg-black/10"></div>
          ) : (
            <div key={item.label} className="flex justify-between gap-[4px]">
              <div className="flex items-center gap-[6px]">
                <span className="font-sans text-[14px] text-black/80">
                  {item.label}:
                </span>
                {item.helper ? (
                  <Tooltip content={item.helper}>
                    <span className="flex items-center opacity-50">
                      <InfoIcon size={18} />
                    </span>
                  </Tooltip>
                ) : null}
              </div>
              <ValueLabel valueLabelType={item.valueLabelType} icon={item.icon}>
                {item.value}
              </ValueLabel>
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
  aspectStyle,
  helper,
  classnames = {},
}: {
  label: string;
  imageUrl: string | null;
  aspectStyle: CSSProperties;
  helper?: string;
  classnames?: Partial<Record<'container' | 'imageWrapper' | 'image', string>>;
}) {
  return (
    <div className={cn('flex flex-col gap-[8px]', classnames?.container)}>
      <div className="flex flex-wrap items-center gap-[6px]">
        <span className="text-[14px] text-black/70">{label}</span>
        {/* {helper ? (
          <span className="text-[11px] text-black/40">{helper}</span>
        ) : null} */}
      </div>
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-[10px] border border-black/10 bg-[#F5F5F5]',
          classnames?.imageWrapper,
        )}
        style={aspectStyle}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${label} creative`}
            className={cn('size-full object-cover', classnames?.image)}
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
