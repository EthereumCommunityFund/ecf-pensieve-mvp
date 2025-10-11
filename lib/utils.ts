import { isAddress } from 'viem';

import dayjs from '@/lib/dayjs';
import { formatNumber as formatNumberUtil } from '@/utils/formatters';

const IS_PROD = process.env.NODE_ENV === 'production';

let hostUrl: string | undefined;

export const getHost = (): string => {
  if (typeof window === 'undefined') {
    return IS_PROD ? 'https://pensieve.ecf.network' : 'http://localhost:3000';
  }

  if (hostUrl) {
    return hostUrl;
  }

  const { protocol, host } = window.location;
  hostUrl = `${protocol}//${host}`;
  return hostUrl;
};

/**
 * @deprecated Use the formatNumber function from @/utils/formatters instead
 */
export function formatNumber(num: number): string {
  return formatNumberUtil(num);
}

export function formatTimeAgo(
  input: number | string | Date,
  options?: { fallback?: string },
): string {
  const fallback = options?.fallback ?? '0h ago';

  const timestamp =
    input instanceof Date
      ? input.getTime()
      : typeof input === 'string'
        ? new Date(input).getTime()
        : input;

  if (!Number.isFinite(timestamp)) {
    return fallback;
  }

  const targetTime = dayjs(timestamp);

  if (!targetTime.isValid()) {
    return fallback;
  }

  const now = dayjs();

  if (targetTime.isAfter(now)) {
    return fallback;
  }

  const diffInMinutes = now.diff(targetTime, 'minute');

  if (diffInMinutes < 60) {
    if (diffInMinutes <= 0) {
      return 'Just now';
    }
    return `${diffInMinutes}min ago`;
  }

  const diffInHours = now.diff(targetTime, 'hour');

  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = now.diff(targetTime, 'day');

  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  }

  const diffInMonths = now.diff(targetTime, 'month');
  if (diffInMonths < 12) {
    return `${diffInMonths}m ago`;
  }

  const diffInYears = now.diff(targetTime, 'year');
  return `${diffInYears}y ago`;
}

export function getShortenAddress(address: string): string {
  if (!address) return '';
  if (!isAddress(address)) return '';

  const start = address.slice(0, 6);
  const end = address.slice(-4);

  return `${start}..${end}`;
}
