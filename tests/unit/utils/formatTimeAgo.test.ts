import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import dayjs from '@/lib/dayjs';
import { formatTimeAgo } from '@/lib/utils';

describe('formatTimeAgo', () => {
  const fixedNow = new Date('2024-01-01T12:00:00Z');

  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedNow);
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('returns minutes for sub-hour differences', () => {
    const thirtyMinutesAgo = dayjs(fixedNow).subtract(30, 'minute').toDate();
    expect(formatTimeAgo(thirtyMinutesAgo)).toBe('30min ago');
  });

  it('returns hours when within the same day', () => {
    const fiveHoursAgo = dayjs(fixedNow).subtract(5, 'hour').toDate();
    expect(formatTimeAgo(fiveHoursAgo)).toBe('5h ago');
  });

  it('returns days within the first week', () => {
    const threeDaysAgo = dayjs(fixedNow).subtract(3, 'day').toDate();
    expect(formatTimeAgo(threeDaysAgo)).toBe('3d ago');
  });

  it('returns weeks for multi-day differences', () => {
    const tenDaysAgo = dayjs(fixedNow).subtract(10, 'day').toDate();
    expect(formatTimeAgo(tenDaysAgo)).toBe('1w ago');
  });

  it('uses fallback for future timestamps', () => {
    const oneHourLater = dayjs(fixedNow).add(1, 'hour').toDate();
    expect(formatTimeAgo(oneHourLater)).toBe('0h ago');
  });
});
