'use client';

import { Card, CardBody, cn } from '@heroui/react';
import { Notebook, NotePencil } from '@phosphor-icons/react';
import Image from 'next/image';
import { useMemo } from 'react';

import { Button } from '@/components/base/button';
import { ClockClockwiseIcon, CoinVerticalIcon } from '@/components/icons';
import { extractCreativeAssets } from '@/utils/creative';

import { DESKTOP_CREATIVE_CONFIG } from './creativeConstants';
import ValueLabel from './ValueLabel';

export type SlotStatus = 'owned' | 'overdue' | 'vacant' | 'closed';

export interface SlotAction {
  id: string;
  label: string;
  variant?: 'primary' | 'secondary';
  isDisabled?: boolean;
  isLoading?: boolean;
  onPress?: () => void;
}

export interface YourSlotCardProps {
  id: string;
  title: string;
  location?: string;
  valuation: string;
  taxDue: string;
  periodEnding: string;
  minTakeoverBid: string;
  contentSummary?: string;
  status: SlotStatus;
  slotLabel?: string;
  slotValueLabel?: string;
  currentAdBadge?: string;
  currentAdBadgeTone?: 'default' | 'danger';
  taxOwed?: string;
  taxDueCountdown?: string;
  takeoverBid?: string;
  contentUpdates?: {
    used: number;
    total: number;
  };
  adImageUrl?: string;
  creativeUri?: string;
  primaryAction?: SlotAction;
  secondaryAction?: SlotAction;
  tertiaryAction?: SlotAction;
  avatarUrl?: string;
}

export default function YourSlotsCard({
  title,
  valuation,
  taxDue,
  periodEnding,
  minTakeoverBid,
  status,
  location,
  contentSummary,
  primaryAction,
  secondaryAction,
  tertiaryAction,
  slotLabel,
  slotValueLabel,
  currentAdBadge,
  currentAdBadgeTone,
  taxOwed,
  taxDueCountdown,
  takeoverBid,
  contentUpdates,
  adImageUrl,
  creativeUri,
  avatarUrl,
}: YourSlotCardProps) {
  const creativeAssets = useMemo(
    () => extractCreativeAssets(creativeUri),
    [creativeUri],
  );

  const slotName = slotLabel ?? title;
  const slotValue = slotValueLabel ?? valuation;
  const currentAdNotice = currentAdBadge ?? periodEnding;
  const currentAdTone: 'default' | 'danger' =
    currentAdBadgeTone ?? (status === 'overdue' ? 'danger' : 'default');
  const taxOwedValue = taxOwed ?? taxDue;
  const taxDueValue = taxDueCountdown ?? taxDue;
  const takeoverValue = takeoverBid ?? minTakeoverBid;
  const isCritical = currentAdTone === 'danger';
  const creativeUpdatesUsed =
    contentUpdates && typeof contentUpdates.used === 'number'
      ? `${contentUpdates.used} / ${contentUpdates.total}`
      : '—';
  const mediaPreview =
    creativeAssets.primaryImageUrl ?? adImageUrl ?? avatarUrl ?? null;
  const isPrimarySecondary = primaryAction?.variant === 'secondary';

  const isSlotClosed = status === 'closed';
  const isSlotOverdue = status === 'overdue';
  const cardVisualClass = isSlotOverdue
    ? 'opacity-60'
    : isSlotClosed
      ? 'opacity-70 grayscale-[35%]'
      : '';

  return (
    <Card
      shadow="none"
      className={cn(
        'rounded-[10px] border border-black/10 bg-white transition-[transform,opacity]',
        'flex h-full flex-col justify-between',
        cardVisualClass,
      )}
    >
      <CardBody className="flex h-full flex-col gap-[20px] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-[6px]">
              <span className="text-[13px] font-semibold text-black/50">
                Slot:
              </span>
              <span className="text-[13px] font-semibold text-black">
                {slotName}
              </span>
            </div>
          </div>

          <ValueLabel>{slotValue}</ValueLabel>
        </div>

        <div className="flex flex-col gap-[10px]">
          <div className="flex flex-wrap items-center justify-between gap-[10px]">
            <span className="text-[13px] font-semibold text-black/45">
              Current Ad:
            </span>
            <ValueLabel
              className={cn(
                'inline-flex items-center  text-[13px]',
                currentAdTone === 'danger'
                  ? ' bg-[#FEE4E2] text-[#C71818]'
                  : ' bg-black/[0.04] text-black/70',
              )}
            >
              {currentAdNotice}
            </ValueLabel>
          </div>

          <div
            className={cn(
              'relative overflow-hidden rounded-[10px] border border-black/10 bg-black/5',
              DESKTOP_CREATIVE_CONFIG.previewAspectClass,
            )}
          >
            {mediaPreview ? (
              <Image
                src={mediaPreview}
                alt={title}
                fill
                sizes="(min-width: 1280px) 360px, (min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-[12px] text-black/40">
                No creative uploaded
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-[8px]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[14px] font-medium text-black/70">
              Tax Owed:
            </span>
            <ValueLabel valueLabelType="bordered">{taxOwedValue}</ValueLabel>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[14px] font-medium text-black/70">
              Tax Due:
            </span>
            <div
              className={cn(
                'inline-flex items-center gap-[6px] rounded-[6px] px-[6px] py-[2px] text-[14px] font-semibold',
                isCritical
                  ? ' bg-[#FEE4E2] text-[#C71818]'
                  : ' bg-[#F5F5F5] text-black',
              )}
            >
              <ClockClockwiseIcon
                size={18}
                className={isCritical ? 'text-[#C71818]' : 'text-black/50'}
              />
              {taxDueValue}
            </div>
          </div>

          {primaryAction ? (
            <Button
              key={primaryAction.id}
              color={isPrimarySecondary ? 'secondary' : 'primary'}
              radius="md"
              size="md"
              className={cn(
                'w-full h-[32px] rounded-[6px] text-[14px] font-semibold',
                isPrimarySecondary
                  ? 'border border-black/15 bg-white text-black hover:bg-black/[0.05]'
                  : 'bg-black text-white hover:bg-black/90',
              )}
              isDisabled={primaryAction.isDisabled}
              isLoading={primaryAction.isLoading}
              onPress={primaryAction.onPress}
            >
              {!isPrimarySecondary ? (
                <CoinVerticalIcon className="size-[20px]" />
              ) : null}
              {primaryAction.label}
            </Button>
          ) : null}
        </div>

        <div>
          <div className="flex flex-wrap gap-3 border-t border-black/10 pt-[10px]">
            {secondaryAction ? (
              <Button
                key={secondaryAction.id}
                color="secondary"
                size="sm"
                className="min-w-[140px] flex-1 rounded-[6px] border border-black/15 bg-white text-[14px] font-semibold text-black hover:bg-black/[0.05]"
                isDisabled={secondaryAction.isDisabled}
                isLoading={secondaryAction.isLoading}
                onPress={secondaryAction.onPress}
                startContent={
                  // <PencilSimpleIcon size={20} className="text-black/70" />
                  <NotePencil size={20} className="opacity-50" />
                }
              >
                {secondaryAction.label}
              </Button>
            ) : null}

            {tertiaryAction ? (
              <Button
                key={tertiaryAction.id}
                color="secondary"
                size="sm"
                className="min-w-[140px] flex-1 rounded-[6px] border border-black/15 bg-white text-[14px] font-semibold text-black hover:bg-black/[0.05]"
                isDisabled={tertiaryAction.isDisabled}
                isLoading={tertiaryAction.isLoading}
                onPress={tertiaryAction.onPress}
                startContent={<Notebook size={20} className="text-black/50" />}
              >
                {tertiaryAction.label}
              </Button>
            ) : null}
          </div>

          <div className="mt-[5px] flex flex-wrap items-center justify-between gap-[6px] text-[13px] text-black/50">
            <span>Content Updates Used:</span>
            <span className="font-semibold text-black/70">
              {creativeUpdatesUsed}
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
