import { isAddress } from 'viem';

import dayjs from '@/lib/dayjs';
import { formatNumber as formatNumberUtil } from '@/utils/formatters';

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
  const diffInHours = now.diff(inputTime, 'hour');

  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else if (diffInDays < 30) {
    return `${Math.floor(diffInDays / 7)}w ago`;
  } else if (now.diff(inputTime, 'month') < 12) {
    return `${now.diff(inputTime, 'month')}m ago`;
  } else {
    return `${now.diff(inputTime, 'year')}y ago`;
  }
}

export function getShortenAddress(address: string): string {
  if (!address) return '';
  if (!isAddress(address)) return '';

  const start = address.slice(0, 6);
  const end = address.slice(-4);

  return `${start}..${end}`;
}
