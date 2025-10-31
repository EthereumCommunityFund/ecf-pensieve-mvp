'use client';

import { Card, CardBody, cn, Skeleton, Tooltip } from '@heroui/react';
import { CoinVertical } from '@phosphor-icons/react';
import Image from 'next/image';
import { useMemo } from 'react';

import { Button } from '@/components/base/button';
import { CoinVerticalIcon, InfoIcon } from '@/components/icons';
import { extractCreativeAssets } from '@/utils/creative';

import { DESKTOP_CREATIVE_CONFIG } from './creativeConstants';
import ValueLabel, { IValueLabelType } from './ValueLabel';

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
        <ValueLabel>{value}</ValueLabel>
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
  slotDisplayName: string;
  page: string;
  position: string;
  imageSize: string;
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
  slotDisplayName,
  page,
  position,
  imageSize,
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
              {slotDisplayName}
            </span>
          </div>

          <ValueLabel className="text-[12px] text-black/70">
            {statusLabel}
          </ValueLabel>
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
  valueLabelType: IValueLabelType;
  withBorderTop?: boolean;
}

export interface ActiveSlotCardProps {
  slotName: string;
  slotDisplayName: string;
  page: string;
  position: string;
  imageSize: string;
  statusLabel?: string;
  owner: string;
  ownerLabel?: string;
  creativeUri?: string;
  mediaAlt?: string;
  stats: StatBlock[];
  takeoverCta: string;
  onTakeover?: () => void;
  ctaDisabled?: boolean;
  ctaLoading?: boolean;
}

export function ActiveSlotCard({
  slotName,
  slotDisplayName,
  page,
  position,
  imageSize,
  statusLabel = 'Owned',
  owner,
  ownerLabel = 'Owner',
  creativeUri,
  mediaAlt,
  stats,
  takeoverCta,
  onTakeover,
  ctaDisabled,
  ctaLoading,
}: ActiveSlotCardProps) {
  const creativeAssets = useMemo(
    () => extractCreativeAssets(creativeUri),
    [creativeUri],
  );
  const primaryImageUrl = creativeAssets.primaryImageUrl;

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
              {slotDisplayName}
            </span>
          </div>
          <ValueLabel className="text-[12px]">{statusLabel}</ValueLabel>
        </div>

        <div className="flex w-full flex-wrap items-center justify-between gap-[6px] text-[13px] text-black/60">
          <span className="font-semibold">{ownerLabel}:</span>
          <ValueLabel className="text-[12px]">{owner}</ValueLabel>
        </div>

        <div
          className={cn(
            'relative overflow-hidden rounded-[10px] border border-black/10 bg-black/5',
            DESKTOP_CREATIVE_CONFIG.previewAspectClass,
          )}
        >
          {primaryImageUrl ? (
            <Image
              src={primaryImageUrl}
              alt={mediaAlt ?? slotDisplayName}
              fill
              sizes="(min-width: 1280px) 240px, (min-width: 768px) 40vw, 100vw"
              className="object-cover"
              priority={false}
            />
          ) : (
            <div className="flex size-full items-center justify-center text-[12px] text-black/40">
              No creative uploaded
            </div>
          )}
        </div>

        <div className="flex flex-col gap-[8px]">
          {stats.map((stat) => {
            const { id, label, value, valueLabelType, withBorderTop } = stat;
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
                <ValueLabel valueLabelType={valueLabelType}>{value}</ValueLabel>
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
      <CardBody className="mobile:p-[10px] flex h-full flex-col gap-[20px] p-[20px]">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-[18px] w-[120px] rounded-[5px]" />
          <Skeleton className="h-[20px] w-[70px] rounded-[5px]" />
        </div>

        <Skeleton className="h-[98px] w-full rounded-[12px]" />

        <div className="flex flex-col gap-[8px]">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-[6px]">
              <div className="flex items-center justify-between gap-[12px]">
                <Skeleton className="h-[16px] w-[150px] rounded-[4px]" />
                <Skeleton className="h-[24px] w-[80px] rounded-[5px]" />
              </div>
              <Skeleton className="h-[12px] w-[190px] rounded-[4px]" />
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
      <CardBody className="flex h-full flex-col gap-[20px] p-5">
        <div className="flex justify-between gap-[6px]">
          <Skeleton className="h-[18px] w-[160px] rounded-[5px]" />
          <Skeleton className="h-[20px] w-[80px] rounded-[5px]" />
        </div>

        <div className="flex w-full items-center justify-between gap-[6px]">
          <Skeleton className="h-[16px] w-[80px] rounded-[4px]" />
          <Skeleton className="h-[20px] w-[120px] rounded-[5px]" />
        </div>

        <Skeleton
          className={cn(
            'w-full rounded-[10px]',
            DESKTOP_CREATIVE_CONFIG.previewAspectClass,
          )}
        />

        <div className="flex flex-col gap-[10px]">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'flex items-center justify-between gap-[12px]',
                index === 3 && 'border-t border-black/10 pt-[8px]',
              )}
            >
              <Skeleton className="h-[16px] w-[150px] rounded-[4px]" />
              <Skeleton className="h-[22px] w-[100px] rounded-[5px]" />
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
