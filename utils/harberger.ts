'use client';

import { formatEther } from 'viem';

export const ZERO_BIGINT = BigInt(0);
export const ONE_BIGINT = BigInt(1);
export const RATE_DENOMINATOR = BigInt(10_000);
export const SECONDS_PER_YEAR = BigInt(365 * 24 * 60 * 60);
export const WEEKS_PER_YEAR = 52;

export interface FormatEthOptions {
  maximumFractionDigits?: number;
  withUnit?: boolean;
}

export function formatEth(
  value: bigint,
  { maximumFractionDigits = 6, withUnit = true }: FormatEthOptions = {},
): string {
  if (value === ZERO_BIGINT) {
    return withUnit ? '0 ETH' : '0';
  }

  const numeric = Number(formatEther(value));
  if (!Number.isFinite(numeric)) {
    const fallback = formatEther(value);
    return withUnit ? `${fallback} ETH` : fallback;
  }

  const formatted = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(numeric);
  return withUnit ? `${formatted} ETH` : formatted;
}

export function formatBps(
  value: bigint | number,
  maximumFractionDigits: number = 2,
): string {
  const numeric = typeof value === 'bigint' ? Number(value) : value;
  const percentValue = numeric / 100;
  return `${percentValue.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  })}%`;
}

export function formatWeeklyRateFromAnnualBps(
  value: bigint | number,
  maximumFractionDigits: number = 2,
): string {
  const numeric = typeof value === 'bigint' ? Number(value) : value;
  const weeklyBps = numeric / WEEKS_PER_YEAR;

  if (!Number.isFinite(weeklyBps) || weeklyBps <= 0) {
    return formatBps(0, maximumFractionDigits);
  }

  return formatBps(weeklyBps, maximumFractionDigits);
}

export function calculateBond(
  valuationWei: bigint,
  bondRateBps: bigint,
): bigint {
  if (
    valuationWei <= ZERO_BIGINT ||
    bondRateBps <= ZERO_BIGINT ||
    bondRateBps > RATE_DENOMINATOR
  ) {
    return ZERO_BIGINT;
  }
  return (valuationWei * bondRateBps) / RATE_DENOMINATOR;
}

export function calculateTaxForPeriods(
  valuationWei: bigint,
  annualTaxRateBps: bigint,
  taxPeriodInSeconds: bigint,
  periods: bigint = ONE_BIGINT,
): bigint {
  if (
    valuationWei <= ZERO_BIGINT ||
    annualTaxRateBps <= ZERO_BIGINT ||
    taxPeriodInSeconds <= ZERO_BIGINT ||
    periods <= ZERO_BIGINT
  ) {
    return ZERO_BIGINT;
  }

  return (
    (valuationWei * annualTaxRateBps * taxPeriodInSeconds * periods) /
    (RATE_DENOMINATOR * SECONDS_PER_YEAR)
  );
}

export function formatDuration(
  secondsInput: bigint | number,
  {
    fallback = '0s',
    maxParts = 2,
  }: { fallback?: string; maxParts?: number } = {},
): string {
  const totalSeconds =
    typeof secondsInput === 'bigint'
      ? Number(secondsInput)
      : (secondsInput ?? 0);

  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return fallback;
  }

  const units: Array<{ label: string; value: number }> = [
    { label: 'd', value: 86_400 },
    { label: 'h', value: 3_600 },
    { label: 'm', value: 60 },
  ];

  const parts: string[] = [];
  let remaining = totalSeconds;

  for (const unit of units) {
    if (remaining >= unit.value) {
      const qty = Math.floor(remaining / unit.value);
      parts.push(`${qty}${unit.label}`);
      remaining %= unit.value;
    }
    if (parts.length >= maxParts) {
      break;
    }
  }

  if (parts.length === 0) {
    return `${remaining}s`;
  }

  return parts.join(' ');
}

export function formatNumberInputFromWei(
  value: bigint,
  fractionDigits: number = 2,
): string {
  if (value === ZERO_BIGINT) {
    return '0';
  }

  const numeric = Number(formatEther(value));
  if (!Number.isFinite(numeric)) {
    return formatEther(value);
  }

  return numeric.toFixed(fractionDigits);
}

export function sumBigints(values: Array<bigint | null | undefined>): bigint {
  return values.reduce<bigint>((accumulator, current) => {
    if (current === null || current === undefined) {
      return accumulator;
    }
    return accumulator + current;
  }, ZERO_BIGINT);
}
