import { cn } from '@heroui/react';
import {
  ArrowSquareOut,
  Clock,
  CoinVertical,
  Notification,
  WarningCircle,
} from '@phosphor-icons/react';
import React, { JSX } from 'react';

import { Button } from '@/components/base/button';
import type { NotificationItemData } from '@/components/notification/NotificationItem';
import type { HarbergerTaxNotificationExtra } from '@/lib/notifications/harbergerTax';
import { formatNumberInputFromWei } from '@/utils/harberger';

const formatEthFixed = (value: bigint): string => {
  const formatted = formatNumberInputFromWei(value, 2);
  return `${formatted} ETH`;
};

const formatCountdown = (secondsInput: number): string => {
  const totalSeconds = Number.isFinite(secondsInput) ? secondsInput : 0;
  const clamped = Math.max(totalSeconds, 0);

  const days = Math.floor(clamped / 86_400);
  const hours = Math.floor((clamped % 86_400) / 3_600);
  const minutes = Math.floor((clamped % 3_600) / 60);

  return `${days}d ${hours}h ${minutes}m`;
};

const toTitleCase = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  return value
    .split(/[_\-\s]+/)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');
};

const buildSlotContextLabel = (
  page?: string,
  position?: string,
): string | undefined => {
  const normalizedPage = toTitleCase(page);
  const normalizedPosition = toTitleCase(position);

  if (normalizedPage && normalizedPosition) {
    return `${normalizedPage} ${normalizedPosition}`;
  }

  return normalizedPage ?? normalizedPosition ?? undefined;
};

type StatusKey = HarbergerTaxNotificationExtra['status'];

type StatusVisualConfig = {
  title: string;
  icon: JSX.Element;
  titleClass: string;
  contextPillClass: string;
  taxDuePillBg: string;
  taxDueTextClass: string;
  taxDueIconClass: string;
  gracePillBg?: string;
  graceTextClass?: string;
  graceIconColor?: string;
};

const STATUS_VISUALS: Record<StatusKey, StatusVisualConfig> = {
  dueSoon: {
    title: 'Tax Due Soon',
    icon: <Notification size={32} className="text-[#D88B3E]" />,
    titleClass: '',
    contextPillClass: '',
    taxDuePillBg: 'bg-[rgba(216,139,62,0.20)]',
    taxDueTextClass: 'text-[#D88B3E]',
    taxDueIconClass: 'text-[#D88B3E] opacity-50',
  },
  dueImminent: {
    title: 'Tax Due Soon',
    icon: <WarningCircle size={32} className="text-[#C71818] opacity-50" />,
    titleClass: '',
    contextPillClass: '',
    taxDuePillBg: 'bg-[rgba(199,24,24,0.20)]',
    taxDueTextClass: 'text-[#C71818]',
    taxDueIconClass: 'text-[#C71818] opacity-50',
  },
  overdue: {
    title: 'Tax Overdue',
    icon: <WarningCircle size={32} className="text-[#C71818] opacity-50" />,
    titleClass: '',
    contextPillClass: '',
    taxDuePillBg: 'bg-[#FFC7CE]',
    taxDueTextClass: 'text-[#B0162B]',
    taxDueIconClass: 'text-[#C71818] opacity-50',
    gracePillBg: 'bg-[#FFC7CE]',
    graceTextClass: 'text-[#B0162B]',
    graceIconColor: '#B0162B',
  },
};

interface HarbergerTaxNotificationCardProps {
  itemData: NotificationItemData;
  onPrimaryAction?: (itemData: NotificationItemData) => void;
  onSecondaryAction?: (itemData: NotificationItemData) => void;
}

const labelClass = 'text-[12px] leading-[18px] text-black/80';
const valuePillBaseClass =
  'inline-flex items-center gap-[5px] rounded-[5px] border px-[6px] h-[20px] text-[12px] font-semibold leading-[16px]';

const HarbergerTaxNotificationCard: React.FC<
  HarbergerTaxNotificationCardProps
> = ({ itemData, onPrimaryAction, onSecondaryAction }) => {
  const tax = itemData.harbergerTax;

  if (!tax) {
    return null;
  }

  const visuals = STATUS_VISUALS[tax.status];
  const slotContextLabel = buildSlotContextLabel(tax.page, tax.position);

  const taxDueLabel = formatCountdown(tax.secondsUntilDue);
  const graceLabel = formatCountdown(tax.gracePeriodRemainingSeconds);

  const handlePrimary = (event: React.MouseEvent) => {
    event.stopPropagation();
    onPrimaryAction?.(itemData);
  };

  const handleSecondary = (event: React.MouseEvent) => {
    event.stopPropagation();
    onSecondaryAction?.(itemData);
  };

  return (
    <div className="flex items-start gap-[10px]">
      <div className="size-[32px] shrink-0">{visuals.icon}</div>
      <div className="flex flex-col gap-[5px]">
        <div className="flex flex-wrap items-center gap-[5px] text-[14px] leading-[20px] text-black">
          <span className={`text-[14px] leading-[20px] ${visuals.titleClass}`}>
            {visuals.title}
          </span>
          <span className="rounded-[10px] border border-black/10 px-[8px] py-[2px] text-[13px] leading-[16px] text-black">
            Slot
          </span>
          <span className="rounded-[10px] border border-black/10 px-[8px] py-[2px] text-[13px] leading-[16px] text-black">
            {tax.slotDisplayName}
          </span>
          {slotContextLabel && (
            <>
              <span className="text-[14px] leading-[20px] text-black/50">
                for
              </span>
              <span
                className={cn(
                  'rounded-[10px] border border-black/10 px-[8px] py-[2px] text-[13px] leading-[16px] text-black',
                  visuals.contextPillClass,
                )}
              >
                {slotContextLabel}
              </span>
            </>
          )}
        </div>
        <div className="flex flex-col gap-[5px]">
          <div className="flex items-center justify-between gap-[10px]">
            <span className={labelClass}>Tax Owed:</span>
            <span
              className={`${valuePillBaseClass} border-[rgba(0,0,0,0.1)] bg-[#F5F5F5] text-black/80`}
            >
              {formatEthFixed(tax.taxOwedWei)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-[10px]">
            <span className={labelClass}>Tax Due:</span>
            <span
              className={`${valuePillBaseClass} ${visuals.taxDuePillBg} ${visuals.taxDueTextClass}`}
            >
              <Clock
                size={12}
                weight="fill"
                className={visuals.taxDueIconClass}
              />
              {taxDueLabel}
            </span>
          </div>
          {visuals.gracePillBg && visuals.graceTextClass && (
            <div className="flex items-center justify-between gap-[12px]">
              <span className={labelClass}>Grace Period Remaining:</span>
              <span
                className={`${valuePillBaseClass} ${visuals.gracePillBg} ${visuals.graceTextClass}`}
              >
                {graceLabel}
              </span>
            </div>
          )}
        </div>
        <div
          className="flex flex-wrap gap-[8px]"
          onClick={(event) => event.stopPropagation()}
        >
          <Button
            size="sm"
            radius="sm"
            className="h-[32px] flex-1 gap-[6px] rounded-[5px] border border-[rgba(0,0,0,0.1)] bg-[rgba(0,0,0,0.05)] px-[10px] text-[13px] font-normal text-black hover:bg-[rgba(0,0,0,0.12)]"
            onPress={handlePrimary}
          >
            <CoinVertical size={18} weight="fill" className="text-black/50" />
            Pay Now
          </Button>
          <Button
            size="sm"
            radius="sm"
            className="h-[32px] flex-1 gap-[6px] rounded-[5px] border border-[rgba(0,0,0,0.1)] bg-white px-[10px] text-[13px] font-normal text-black hover:bg-[rgba(0,0,0,0.04)]"
            onPress={handleSecondary}
          >
            <ArrowSquareOut size={18} className="text-black/50" />
            View Slot
          </Button>
        </div>
      </div>
    </div>
  );
};

const ClockBadge = ({ color }: { color: string }) => {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <circle cx="7" cy="7" r="7" fill={`${color}1A`} />
      <path
        d="M7 3.5V7L9 8"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default HarbergerTaxNotificationCard;
