'use client';

import { Card, CardBody, cn, Skeleton, Tooltip } from '@heroui/react';
import Image from 'next/image';
import { CoinVertical } from '@phosphor-icons/react';

import { Button } from '@/components/base/button';
import { CoinVerticalIcon, InfoIcon } from '@/components/icons';

interface InfoStatProps {
  label: string;
  helperText?: string;
  value: string;
}

function InfoStat({ label, helperText, value }: InfoStatProps) {
  return (
    <div className="flex flex-col gap-[8px]">
      <div className="flex items-center justify-between gap-[12px]">
        <div className="flex items-center gap-[6px]">
          <span className="text-[14px] text-black/80">{label}</span>
          <Tooltip content={helperText}>
            <span className="flex items-center opacity-60">
              <InfoIcon size={20} />
            </span>
          </Tooltip>
        </div>
        <span className="rounded-[5px] bg-[#F5F5F5] px-[6px] py-[2px] text-[14px] font-semibold text-black/80">
          {value}
        </span>
      </div>
      {helperText ? (
        <span className="text-[12px] leading-[18px] text-black/50">
          {helperText}
        </span>
      ) : null}
    </div>
  );
}

export interface VacantSlotCardProps {
  slotName: string;
  statusLabel?: string;
  valuation: string;
  valuationHelper: string;
  bondRate: string;
  bondRateHelper: string;
  taxRate: string;
  taxRateHelper: string;
  actionLabel: string;
  onClaim?: () => void;
}

export function VacantSlotCard({
  slotName,
  statusLabel = 'Open',
  valuation,
  valuationHelper,
  bondRate,
  bondRateHelper,
  taxRate,
  taxRateHelper,
  actionLabel,
  onClaim,
}: VacantSlotCardProps) {
  return (
    <Card
      shadow="none"
      className="flex h-full flex-col justify-between rounded-[10px] border border-black/10 bg-white"
    >
      <CardBody className="mobile:p-[10px] flex h-full flex-col gap-[20px] p-[20px]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-[6px]">
            <span className="text-[13px] font-semibold text-black/50">
              Slot:
            </span>
            <span className="text-[13px] font-semibold text-black">
              {slotName}
            </span>
          </div>

          <span className="rounded-[5px] bg-[#F7F7F7] px-[6px] py-[2px] text-[12px] font-semibold tracking-[0.04em] text-black/70">
            {statusLabel}
          </span>
        </div>

        <div className="flex h-[98px] flex-col items-center justify-center gap-[10px] rounded-[12px] border-2 border-dashed border-black/10 bg-black/[0.02] px-[16px] py-[36px] text-center">
          <span className="text-[13px] font-semibold tracking-[0.12em] text-black/50">
            Vacant Slot
          </span>
        </div>

        <div className="flex flex-col gap-[8px]">
          <InfoStat
            label="Minimum Valuation"
            helperText={valuationHelper}
            value={valuation}
          />
          <InfoStat
            label="Bond Rate"
            helperText={bondRateHelper}
            value={bondRate}
          />
          <InfoStat
            label="Tax Rate (Annually)"
            helperText={taxRateHelper}
            value={taxRate}
          />
        </div>

        <Button
          color="primary"
          radius="md"
          size="md"
          className="mt-[8px] h-[36px] w-full rounded-[6px] text-[14px] font-semibold"
          onPress={onClaim}
        >
          <CoinVertical size={20} />
          <span className="text-[14px] font-semibold text-white/80">
            {actionLabel}
          </span>
        </Button>
      </CardBody>
    </Card>
  );
}

interface StatBlock {
  id: string;
  label: string;
  value: string;
  valueLabelType: 'light' | 'bordered' | 'dark';
  withBorderTop?: boolean;
}

export interface ActiveSlotCardProps {
  slotName: string;
  statusLabel?: string;
  owner: string;
  ownerLabel?: string;
  mediaUrl?: string;
  mediaAlt?: string;
  stats: StatBlock[];
  takeoverCta: string;
  onTakeover?: () => void;
  ctaDisabled?: boolean;
  ctaLoading?: boolean;
}

export function ActiveSlotCard({
  slotName,
  statusLabel = 'Owned',
  owner,
  ownerLabel = 'Owner',
  mediaUrl,
  mediaAlt,
  stats,
  takeoverCta,
  onTakeover,
  ctaDisabled,
  ctaLoading,
}: ActiveSlotCardProps) {
  return (
    <Card
      shadow="none"
      className="flex h-full flex-col justify-between rounded-[10px] border border-black/10 bg-white"
    >
      <CardBody className="flex h-full flex-col gap-[20px] p-5">
        <div className="flex justify-between gap-[6px]">
          <div className="flex flex-wrap items-center gap-[6px]">
            <span className="text-[13px] font-semibold text-black/50">
              Slot:
            </span>
            <span className="text-[13px] font-semibold text-black">
              {slotName}
            </span>
          </div>
          <span className="rounded-[5px] bg-[#F5F5F5] px-[6px] py-[2px] text-[12px] font-semibold tracking-[0.04em] text-black/80">
            {statusLabel}
          </span>
        </div>

        <div className="flex w-full flex-wrap items-center justify-between gap-[6px] text-[13px] text-black/60">
          <span className="font-semibold">{ownerLabel}:</span>
          <span className="rounded-[5px] bg-[#F5F5F5] px-[6px] py-[2px] text-[12px] font-semibold tracking-[0.04em] text-black/80">
            {owner}
          </span>
        </div>

        <div className="relative overflow-hidden">
          {mediaUrl ? (
            <Image
              src={mediaUrl}
              alt={mediaAlt ?? slotName}
              width={196}
              height={97}
              className="h-[97px] w-auto rounded-[5px] object-cover"
            />
          ) : null}
        </div>

        <div className="flex flex-col gap-[8px]">
          {stats.map((stat) => {
            const { id, label, value, valueLabelType, withBorderTop } = stat;
            const valueLabelClassNames = cn(
              'rounded-[5px] px-[6px] py-[2px] text-[14px] font-semibold text-black/80',
              valueLabelType === 'light' && 'bg-[#F5F5F5]',
              valueLabelType === 'bordered' &&
                'bg-[#F5F5F5] border border-black/10 bg-transparent',
              valueLabelType === 'dark' && 'bg-black text-white/80',
            );
            return (
              <div
                key={id}
                className={cn(
                  'flex items-center justify-between gap-[12px]',
                  withBorderTop && 'border-t border-black/10 pt-[8px]',
                )}
              >
                <span className="text-[14px] font-medium text-black/80">
                  {label}
                </span>
                <span className={valueLabelClassNames}>{value}</span>
              </div>
            );
          })}
        </div>

        <Button
          color="primary"
          radius="md"
          size="md"
          className="mt-[4px] h-[36px] w-full rounded-[6px] text-[14px] font-semibold"
          startContent={<CoinVerticalIcon className="size-[20px]" />}
          onPress={onTakeover}
          isDisabled={ctaDisabled}
          isLoading={ctaLoading}
        >
          <CoinVertical size={20} />
          <span className="text-[14px] font-semibold text-white/80">
            {takeoverCta}
          </span>
        </Button>
      </CardBody>
    </Card>
  );
}

export function VacantSlotCardSkeleton() {
  return (
    <Card
      shadow="none"
      className="flex h-full flex-col justify-between rounded-[10px] border border-black/10 bg-white"
    >
      <CardBody className="flex h-full flex-col gap-[16px] p-5">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-[18px] w-[120px] rounded-[4px]" />
          <Skeleton className="h-[20px] w-[80px] rounded-[6px]" />
        </div>

        <Skeleton className="h-[140px] w-full rounded-[12px]" />

        <div className="flex flex-col gap-[14px]">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-[8px]">
              <div className="flex items-center justify-between gap-[12px]">
                <Skeleton className="h-[16px] w-[140px] rounded-[4px]" />
                <Skeleton className="h-[22px] w-[70px] rounded-[6px]" />
              </div>
              <Skeleton className="h-[14px] w-[180px] rounded-[4px]" />
            </div>
          ))}
        </div>

        <Skeleton className="mt-[8px] h-[36px] w-full rounded-[6px]" />
      </CardBody>
    </Card>
  );
}

export function ActiveSlotCardSkeleton() {
  return (
    <Card
      shadow="none"
      className="flex h-full flex-col justify-between rounded-[10px] border border-black/10 bg-white"
    >
      <CardBody className="flex h-full flex-col gap-[16px] p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-[6px]">
            <Skeleton className="h-[18px] w-[140px] rounded-[4px]" />
            <Skeleton className="h-[16px] w-[160px] rounded-[4px]" />
          </div>
          <Skeleton className="h-[20px] w-[80px] rounded-[6px]" />
        </div>

        <Skeleton className="h-[180px] w-full rounded-[10px]" />

        <div className="flex flex-col gap-[12px]">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-[12px]"
            >
              <Skeleton className="h-[16px] w-[150px] rounded-[4px]" />
              <Skeleton className="h-[18px] w-[100px] rounded-[4px]" />
            </div>
          ))}
        </div>

        <Skeleton className="h-[36px] w-full rounded-[6px]" />
      </CardBody>
    </Card>
  );
}

export function buildActiveStats(
  valuation: string,
  lockedBond: string,
  remainingUnits: string,
  minTakeoverBid: string,
): StatBlock[] {
  return [
    {
      id: 'valuation',
      label: 'Current Valuation',
      value: valuation,
      valueLabelType: 'light',
    },
    {
      id: 'bond',
      label: 'Locked Bond',
      value: lockedBond,
      valueLabelType: 'bordered',
    },
    {
      id: 'units',
      label: 'Remaining Units',
      value: remainingUnits,
      valueLabelType: 'light',
    },
    {
      id: 'takeover',
      label: 'Min Takeover Bid',
      value: minTakeoverBid,
      valueLabelType: 'dark',
      withBorderTop: true,
    },
  ];
}
