import { formatDuration } from '@/utils/harberger';

const SECONDS_IN_HOUR = 60 * 60;
const SECONDS_IN_DAY = 24 * SECONDS_IN_HOUR;

export const HARBERGER_TAX_DUE_SOON_THRESHOLD_SECONDS = 3 * SECONDS_IN_DAY;
export const HARBERGER_TAX_DUE_IMMINENT_THRESHOLD_SECONDS = 6 * SECONDS_IN_HOUR;
export const HARBERGER_TAX_GRACE_PERIOD_SECONDS = 2 * SECONDS_IN_DAY;

export type HarbergerTaxStatus = 'dueSoon' | 'dueImminent' | 'overdue';

interface ParsedBigIntResult {
  value: bigint;
  isValid: boolean;
}

const ZERO_BIGINT = BigInt(0);

const parseBigIntValue = (input: unknown): ParsedBigIntResult => {
  if (typeof input === 'bigint') {
    return { value: input, isValid: true };
  }

  if (typeof input === 'number' && Number.isFinite(input)) {
    return { value: BigInt(Math.floor(input)), isValid: true };
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) {
      return { value: ZERO_BIGINT, isValid: false };
    }

    try {
      return { value: BigInt(trimmed), isValid: true };
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Failed to parse bigint value from string', {
          input,
          error,
        });
      }
    }
  }

  return { value: ZERO_BIGINT, isValid: false };
};

const parseNumberValue = (input: unknown): number | undefined => {
  if (typeof input === 'number' && Number.isFinite(input)) {
    return input;
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) {
      return undefined;
    }

    const asNumber = Number.parseInt(trimmed, 10);
    if (Number.isFinite(asNumber)) {
      return asNumber;
    }
  }

  return undefined;
};

export interface HarbergerTaxNotificationExtra {
  slotAddress: `0x${string}`;
  slotDisplayName: string;
  secondsUntilExpiry: number;
  taxPaidUntil: number;
  taxOwedWei: bigint;
  lockedValuationWei: bigint;
  ownerRefundWei: bigint;
  periodsProcessed: number;
  calculatedAt?: number;
  chainId?: number;
  factoryAddress?: `0x${string}`;
  page?: string;
  position?: string;
  gracePeriodRemainingSeconds: number;
  secondsUntilDue: number;
  status: HarbergerTaxStatus;
  formattedDueCountdown: string;
  formattedGraceCountdown: string;
}

const sanitizeSlotAddress = (address: unknown): `0x${string}` | undefined => {
  if (typeof address !== 'string') {
    return undefined;
  }

  const trimmed = address.trim();
  if (!trimmed) {
    return undefined;
  }

  if (!trimmed.startsWith('0x')) {
    return undefined;
  }

  return trimmed as `0x${string}`;
};

const sanitizeDisplayName = (
  displayName: unknown,
  fallback: string,
): string => {
  if (typeof displayName !== 'string') {
    return fallback;
  }

  const trimmed = displayName.trim();
  return trimmed || fallback;
};

const ensureRecord = (
  candidate: unknown,
): Record<string, unknown> | undefined => {
  if (candidate && typeof candidate === 'object') {
    return candidate as Record<string, unknown>;
  }
  return undefined;
};

export const parseHarbergerTaxNotificationExtra = (
  metadataExtra: Record<string, unknown> | undefined,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): HarbergerTaxNotificationExtra | undefined => {
  const extra = ensureRecord(metadataExtra);
  if (!extra) {
    return undefined;
  }

  const slotAddress = sanitizeSlotAddress(extra.slotAddress);
  if (!slotAddress) {
    return undefined;
  }

  const displayName = sanitizeDisplayName(extra.slotDisplayName, slotAddress);

  const secondsUntilExpiry = parseNumberValue(extra.secondsUntilExpiry) ?? 0;

  const parsedTaxPaidUntil = parseBigIntValue(extra.taxPaidUntil);
  const taxPaidUntilSeconds = parsedTaxPaidUntil.isValid
    ? Number(parsedTaxPaidUntil.value)
    : nowSeconds + secondsUntilExpiry;

  const secondsUntilDue = taxPaidUntilSeconds - nowSeconds;

  const overdueSeconds = secondsUntilDue < 0 ? -secondsUntilDue : 0;

  const gracePeriodRemainingSeconds = Math.max(
    HARBERGER_TAX_GRACE_PERIOD_SECONDS - overdueSeconds,
    0,
  );

  const { value: taxAccruedWei, isValid: hasTaxAccrued } = parseBigIntValue(
    extra.taxAccruedWei,
  );
  const { value: lockedValuationWei } = parseBigIntValue(
    extra.lockedValuationWei,
  );
  const { value: ownerRefundWei } = parseBigIntValue(extra.ownerRefundWei);

  const taxOwedWei = hasTaxAccrued ? taxAccruedWei : lockedValuationWei;

  let status: HarbergerTaxStatus = 'dueSoon';
  if (secondsUntilDue <= 0) {
    status = 'overdue';
  } else if (secondsUntilDue <= HARBERGER_TAX_DUE_IMMINENT_THRESHOLD_SECONDS) {
    status = 'dueImminent';
  }

  const calculatedAtSeconds = (() => {
    const parsed = parseBigIntValue(extra.calculatedAt);
    return parsed.isValid ? Number(parsed.value) : undefined;
  })();

  const formattedDueCountdown =
    secondsUntilDue > 0
      ? formatDuration(secondsUntilDue, { fallback: '0s', maxParts: 3 })
      : formatDuration(0, { fallback: '0s' });

  const formattedGraceCountdown =
    gracePeriodRemainingSeconds > 0
      ? formatDuration(gracePeriodRemainingSeconds, {
          fallback: '0s',
          maxParts: 3,
        })
      : '0s';

  return {
    slotAddress,
    slotDisplayName: displayName,
    secondsUntilExpiry,
    taxPaidUntil: taxPaidUntilSeconds,
    taxOwedWei,
    lockedValuationWei,
    ownerRefundWei,
    periodsProcessed: parseNumberValue(extra.periodsProcessed) ?? 0,
    calculatedAt: calculatedAtSeconds,
    chainId: parseNumberValue(extra.chainId),
    factoryAddress: sanitizeSlotAddress(extra.factoryAddress),
    page: typeof extra.page === 'string' ? extra.page : undefined,
    position: typeof extra.position === 'string' ? extra.position : undefined,
    gracePeriodRemainingSeconds,
    secondsUntilDue,
    status,
    formattedDueCountdown,
    formattedGraceCountdown,
  };
};
