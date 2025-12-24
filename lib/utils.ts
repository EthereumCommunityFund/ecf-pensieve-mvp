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

export function normalizeString(value: unknown): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      const normalized = normalizeString(entry);
      if (normalized) {
        return normalized;
      }
    }
    return undefined;
  }

  if (typeof value === 'object') {
    const candidateKeys = ['value', 'label', 'name', 'title'];
    for (const key of candidateKeys) {
      const candidate = (value as Record<string, unknown>)[key];
      const normalized = normalizeString(candidate);
      if (normalized) {
        return normalized;
      }
    }
  }

  return undefined;
}

export function normalizeStringArray(value: unknown): string[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    const normalized = value
      .map((entry) => normalizeString(entry))
      .filter((entry): entry is string => Boolean(entry));
    return Array.from(new Set(normalized));
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return normalizeStringArray(parsed);
      }
    } catch (error) {
      // JSON parse failed; fallback to comma-separated handling
    }

    const parts = value
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part.length > 0);

    if (parts.length > 0) {
      return Array.from(new Set(parts));
    }

    const normalized = normalizeString(value);
    return normalized ? [normalized] : [];
  }

  return [];
}
