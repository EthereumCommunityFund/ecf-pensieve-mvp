import React from 'react';

import { Button } from '@/components/base/button';
import type { NotificationItemData } from '@/components/notification/NotificationItem';
import type { HarbergerTaxNotificationExtra } from '@/lib/notifications/harbergerTax';
import { formatNumberInputFromWei } from '@/utils/harberger';

const formatEthFixed = (value: bigint): string => {
  const formatted = formatNumberInputFromWei(value, 2);
  return `${formatted} ETH`;
};

const toTitleCase = (value: string | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }

  return value
    .split(/[_\-\s]+/)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');
};

const STATUS_CONFIG: Record<
  HarbergerTaxNotificationExtra['status'],
  {
    title: string;
    accentClass: string;
    badgeClass: string;
    iconLabel: string;
    iconClass: string;
    titleClass: string;
    description: string;
  }
> = {
  dueSoon: {
    title: 'Tax Due Soon',
    accentClass: 'border-[#FFD4B8] bg-[#FFF5EF]',
    badgeClass: 'bg-[#FFE2C7] text-[#9B5A00]',
    iconLabel: '!',
    iconClass:
      'bg-[#FF995D]/20 border border-[#FF995D] text-[#FF995D] text-[16px]',
    titleClass: 'text-[#C15F1D]',
    description:
      'Keep your slot active by settling the upcoming tax before the deadline.',
  },
  dueImminent: {
    title: 'Tax Due Soon',
    accentClass: 'border-[#FFB5B5] bg-[#FFF2F2]',
    badgeClass: 'bg-[#FFD7D7] text-[#A12A2A]',
    iconLabel: '!',
    iconClass:
      'bg-[#FF5D5D]/20 border border-[#FF5D5D] text-[#FF5D5D] text-[16px]',
    titleClass: 'text-[#B22626]',
    description:
      'Your grace window is approaching. Complete the payment to avoid suspension.',
  },
  overdue: {
    title: 'Tax Overdue',
    accentClass: 'border-[#FF9B9B] bg-[#FFECEC]',
    badgeClass: 'bg-[#FFD2D2] text-[#9F1F1F]',
    iconLabel: '!',
    iconClass:
      'bg-[#E04343]/20 border border-[#E04343] text-[#E04343] text-[16px]',
    titleClass: 'text-[#B21C1C]',
    description:
      'The slot is in its grace period. Settle the outstanding tax immediately.',
  },
};

interface HarbergerTaxNotificationCardProps {
  itemData: NotificationItemData;
  onPrimaryAction?: (itemData: NotificationItemData) => void;
  onSecondaryAction?: (itemData: NotificationItemData) => void;
  onNotificationClick?: (itemData: NotificationItemData) => void;
}

const buildSlotContextLabel = (
  page?: string,
  position?: string,
): string | undefined => {
  const formattedPage = toTitleCase(page);
  const formattedPosition = toTitleCase(position);

  if (formattedPage && formattedPosition) {
    return `${formattedPage} ${formattedPosition}`;
  }

  return formattedPage ?? formattedPosition ?? undefined;
};

const HarbergerTaxNotificationCard: React.FC<
  HarbergerTaxNotificationCardProps
> = ({ itemData, onPrimaryAction, onSecondaryAction, onNotificationClick }) => {
  const tax = itemData.harbergerTax;

  if (!tax) {
    return null;
  }

  const statusConfig = STATUS_CONFIG[tax.status];
  const stateRingClass = itemData.isRead
    ? ''
    : 'ring-1 ring-[rgba(104,198,172,0.35)]';

  const handlePrimary = (event: React.MouseEvent) => {
    event.stopPropagation();
    onPrimaryAction?.(itemData);
  };

  const handleSecondary = (event: React.MouseEvent) => {
    event.stopPropagation();
    onSecondaryAction?.(itemData);
  };

  const handleCardClick = () => {
    onNotificationClick?.(itemData);
  };

  const slotContextLabel = buildSlotContextLabel(tax.page, tax.position);

  const dueValue =
    tax.secondsUntilDue <= 0 ? 'Due Now' : tax.formattedDueCountdown;

  return (
    <div
      className={`flex flex-col gap-4 rounded-[12px] border p-4 transition-colors ${statusConfig.accentClass} ${stateRingClass}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === ' ') {
          event.preventDefault();
        }
      }}
      onKeyUp={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          onNotificationClick?.(itemData);
        }
      }}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div
              className={`flex size-8 items-center justify-center rounded-full font-semibold ${statusConfig.iconClass}`}
            >
              {statusConfig.iconLabel}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-[15px] font-semibold ${statusConfig.titleClass}`}
              >
                {statusConfig.title}
              </span>
              <span className="rounded-full bg-black/5 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-black/60">
                Slot
              </span>
              <span className="rounded-full bg-black/5 px-2 py-0.5 text-[11px] font-medium text-black/70">
                {tax.slotDisplayName}
              </span>
              {slotContextLabel && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusConfig.badgeClass}`}
                >
                  for {slotContextLabel}
                </span>
              )}
            </div>
          </div>
          <span className="text-[12px] font-medium text-black/40">
            {itemData.timeAgo}
          </span>
        </div>
        <p className="text-[13px] leading-[18px] text-black/70">
          {statusConfig.description}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="min-w-[140px] rounded-[10px] border border-black/10 bg-white px-3 py-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-black/45">
            Tax Owed
          </p>
          <p className="text-[18px] font-semibold text-black">
            {formatEthFixed(tax.taxOwedWei)}
          </p>
        </div>
        <div className="min-w-[140px] rounded-[10px] border border-black/10 bg-white px-3 py-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-black/45">
            Tax Due
          </p>
          <p className="text-[15px] font-semibold text-black">{dueValue}</p>
        </div>
        {tax.status === 'overdue' && (
          <div className="min-w-[160px] rounded-[10px] border border-black/10 bg-white px-3 py-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-black/45">
              Grace Period Remaining
            </p>
            <p className="text-[15px] font-semibold text-black">
              {tax.formattedGraceCountdown}
            </p>
          </div>
        )}
      </div>

      <div
        className="flex flex-wrap gap-2"
        onClick={(event) => event.stopPropagation()}
      >
        <Button
          size="sm"
          className="h-[32px] rounded-lg bg-black text-white hover:bg-black/80"
          onPress={handlePrimary}
        >
          Pay Now
        </Button>
        <Button
          size="sm"
          className="h-[32px] rounded-lg border border-black/15 bg-white text-black hover:bg-black/5"
          onPress={handleSecondary}
        >
          View Slot
        </Button>
      </div>
    </div>
  );
};

export default HarbergerTaxNotificationCard;
