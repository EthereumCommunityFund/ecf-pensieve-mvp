'use client';

import { Card, CardBody } from '@heroui/react';
import Image from 'next/image';

import { Button } from '@/components/base/button';
import { CoinVerticalIcon, InfoIcon } from '@/components/icons';

interface InfoStatProps {
  label: string;
  helperText?: string;
  value: string;
}

function InfoStat({ label, helperText, value }: InfoStatProps) {
  return (
    <div className="flex flex-col gap-[6px]">
      <div className="flex items-center justify-between gap-[12px]">
        <div className="flex items-center gap-[6px]">
          <span className="text-[13px] font-semibold text-black/70">
            {label}
          </span>
          <span className="flex items-center opacity-60">
            <InfoIcon size={20} />
          </span>
        </div>
        <span className="bg-[#F5F5F5] px-[6px] py-[2px] text-[13px] font-semibold text-black">
          {value}
        </span>
      </div>
      {helperText ? (
        <span className="text-[12px] leading-[18px] text-black/45">
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
      <CardBody className="flex h-full flex-col gap-[16px] p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-[6px]">
            <span className="text-[13px] font-semibold text-black/50">
              Slot:
            </span>
            <span className="text-[13px] font-semibold text-black">
              {slotName}
            </span>
          </div>

          <span className="rounded-[6px] border border-black/10 bg-[#F7F7F7] px-[8px] py-[2px] text-[12px] font-semibold uppercase tracking-[0.04em] text-black/70">
            {statusLabel}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center gap-[10px] rounded-[12px] border border-dashed border-black/15 bg-black/[0.02] px-[16px] py-[36px] text-center">
          <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-black/30">
            Vacant Slot
          </span>
          <span className="text-[12px] text-black/45">
            Waiting for a new placement
          </span>
        </div>

        <div className="flex flex-col gap-[14px]">
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
          {actionLabel}
        </Button>
      </CardBody>
    </Card>
  );
}

interface StatBlock {
  id: string;
  label: string;
  value: string;
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
}: ActiveSlotCardProps) {
  return (
    <Card
      shadow="none"
      className="flex h-full flex-col justify-between rounded-[10px] border border-black/10 bg-white"
    >
      <CardBody className="flex h-full flex-col gap-[16px] p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-[6px]">
            <div className="flex flex-wrap items-center gap-[6px]">
              <span className="text-[13px] font-semibold text-black/50">
                Slot:
              </span>
              <span className="text-[13px] font-semibold text-black">
                {slotName}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-[6px] text-[13px] text-black/60">
              <span className="font-semibold">{ownerLabel}:</span>
              <span className="font-semibold text-black/80">{owner}</span>
            </div>
          </div>

          <span className="rounded-[6px] border border-black/10 bg-[#F0F1F4] px-[8px] py-[2px] text-[12px] font-semibold uppercase tracking-[0.04em] text-black/70">
            {statusLabel}
          </span>
        </div>

        <div className="relative aspect-[360/179] overflow-hidden rounded-[10px] border border-black/10">
          {mediaUrl ? (
            <Image
              src={mediaUrl}
              alt={mediaAlt ?? slotName}
              fill
              sizes="(min-width: 1280px) 360px, (min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          ) : null}
        </div>

        <div className="flex flex-col gap-[12px]">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="flex items-center justify-between gap-[12px]"
            >
              <span className="text-[14px] font-medium text-black/70">
                {stat.label}
              </span>
              <span className="rounded-[6px] border border-black/10 bg-white px-[6px] py-[2px] text-[14px] font-semibold text-black">
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        <Button
          color="primary"
          radius="md"
          size="md"
          className="mt-[4px] h-[36px] w-full rounded-[6px] text-[14px] font-semibold"
          startContent={<CoinVerticalIcon className="size-[20px]" />}
          onPress={onTakeover}
        >
          {takeoverCta}
        </Button>
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
    },
    {
      id: 'bond',
      label: 'Locked Bond',
      value: lockedBond,
    },
    {
      id: 'units',
      label: 'Remaining Units',
      value: remainingUnits,
    },
    {
      id: 'takeover',
      label: 'Min Takeover Bid',
      value: minTakeoverBid,
    },
  ];
}
