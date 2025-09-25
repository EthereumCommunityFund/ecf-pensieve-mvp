import { AllItemKeysInPage } from '@/constants/tableConfig';
import { ALL_POC_ITEM_MAP, WEIGHT } from '@/lib/constants';

const TOTAL_GENESIS_WEIGHT_SUM = AllItemKeysInPage.reduce((sum, key) => {
  const item = ALL_POC_ITEM_MAP[key];
  if (!item) {
    return sum;
  }
  const genesisWeight = (item.accountability_metric || 0) * WEIGHT;
  return sum + genesisWeight;
}, 0);

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 1).trim()}...`;
}

export function formatInteger(value: number): string {
  if (!Number.isFinite(value)) {
    return '0';
  }
  return new Intl.NumberFormat('en-US').format(Math.round(value || 0));
}

export function formatReadableKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(.)/, (match) => match.toUpperCase());
}

export function valueToText(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    const parts = value
      .map((item) => valueToText(item))
      .filter((item) => item && item.length > 0);
    const unique = Array.from(new Set(parts));
    return unique.join(', ');
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const preferredKeys = ['value', 'label', 'name', 'title', 'url'];
    for (const key of preferredKeys) {
      if (key in record && record[key] != null) {
        const text = valueToText(record[key]);
        if (text) {
          return text;
        }
      }
    }
    return truncate(JSON.stringify(record), 120);
  }

  return '';
}

export function shortenAddress(
  address?: string | null,
  length: number = 4,
): string | undefined {
  if (!address || address.length < length * 2 + 2) {
    return address ?? undefined;
  }
  return `${address.slice(0, length + 2)}...${address.slice(-length)}`;
}

export function extractArray<T = string>(value: unknown): T[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value as T[];
}

export function normalizeItemsTopWeight(
  value: unknown,
): Partial<Record<string, number>> {
  if (!value || typeof value !== 'object') {
    return {};
  }

  return Object.entries(value as Record<string, unknown>).reduce<
    Record<string, number>
  >(
    (acc, [key, current]) => {
      const numeric = Number(current);
      if (!Number.isNaN(numeric)) {
        acc[key] = numeric;
      }
      return acc;
    },
    {} as Record<string, number>,
  );
}

export function calculateTransparencyScore(
  itemsTopWeight: Partial<Record<string, number>>,
): number {
  if (!TOTAL_GENESIS_WEIGHT_SUM) {
    return 0;
  }

  const leadingGenesisWeightSum = Object.keys(itemsTopWeight || {}).reduce(
    (sum, key) => {
      const typedKey = key as keyof typeof ALL_POC_ITEM_MAP;
      const item = ALL_POC_ITEM_MAP[typedKey];
      if (!item) {
        return sum;
      }
      const genesisWeight = (item.accountability_metric || 0) * WEIGHT;
      return sum + genesisWeight;
    },
    0,
  );

  return Math.round((leadingGenesisWeightSum / TOTAL_GENESIS_WEIGHT_SUM) * 100);
}

export function getItemValueFromSnap(
  items: Array<{ key: string; value: unknown }> | undefined,
  key: string,
): string {
  if (!items || items.length === 0) {
    return '';
  }
  const entry = items.find((item) => item.key === key);
  if (!entry) {
    return '';
  }
  return valueToText(entry.value);
}
