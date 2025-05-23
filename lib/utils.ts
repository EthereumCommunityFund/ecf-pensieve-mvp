import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { isAddress } from 'viem';

import dayjs from '@/lib/dayjs';
import { formatNumber as formatNumberUtil } from '@/utils/formatters';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * @deprecated Use the formatNumber function from @/utils/formatters instead
 */
export function formatNumber(num: number): string {
  return formatNumberUtil(num);
}

export function formatTimeAgo(timestamp: number): string {
  const now = dayjs();
  const inputTime = dayjs(timestamp);
  const diffInDays = now.diff(inputTime, 'day');

  if (now.diff(inputTime, 'hour') < 24) {
    return 'today';
  } else if (diffInDays < 7) {
    return `${diffInDays}d`;
  } else if (diffInDays < 30) {
    return `${Math.floor(diffInDays / 7)}W`;
  } else if (now.diff(inputTime, 'month') < 12) {
    return `${now.diff(inputTime, 'month')}M`;
  } else {
    return `${now.diff(inputTime, 'year')}Y`;
  }
}

export function getShortenAddress(address: string): string {
  if (!address) return '';
  if (!isAddress(address)) return '';

  const start = address.slice(0, 6);
  const end = address.slice(-4);

  return `${start}..${end}`;
}
