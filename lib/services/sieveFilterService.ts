import type {
  AdvancedFilterCard,
  AdvancedFilterCondition,
  AdvancedFilterConnector,
  AdvancedFilterFieldType,
  AdvancedFilterOperator,
  SerializedAdvancedFilterCard,
  SerializedAdvancedFilterCondition,
} from '@/components/pages/project/customFilters/types';
import {
  getAdvancedFilterQueryKey,
  parseAdvancedFilters,
  serializeAdvancedFilters,
} from '@/components/pages/project/customFilters/utils';
import { SORT_OPTIONS } from '@/components/pages/project/filterAndSort/types';
import type { StoredSieveFilterConditions } from '@/types/sieve';

const DEFAULT_BASE_PATH = '/projects';
const DEFAULT_VERSION = 1;
const ADVANCED_FILTER_KEY = getAdvancedFilterQueryKey();
const VALID_SORT_OPTIONS = new Set(
  SORT_OPTIONS.map((option) => option.value.trim()).filter(Boolean),
);

const normalizeIsoString = (input?: string | Date): string => {
  if (!input) {
    return new Date().toISOString();
  }

  if (input instanceof Date) {
    return input.toISOString();
  }

  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }

  return parsed.toISOString();
};

const normalizeSort = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (VALID_SORT_OPTIONS.has(trimmed)) {
    return trimmed;
  }

  return null;
};

const normalizeCategories = (values?: string | string[] | null): string[] => {
  if (!values) {
    return [];
  }

  const list = Array.isArray(values) ? values : values.split(',');
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const raw of list) {
    const trimmed = typeof raw === 'string' ? raw.trim() : '';
    if (!trimmed || seen.has(trimmed)) {
      continue;
    }
    seen.add(trimmed);
    normalized.push(trimmed);
  }

  return normalized;
};

const normalizeSearch = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const sanitizeSerializedCondition = (
  condition: SerializedAdvancedFilterCondition | AdvancedFilterCondition,
): SerializedAdvancedFilterCondition | null => {
  const { id, connector, fieldType, fieldKey, operator, value } =
    condition as SerializedAdvancedFilterCondition & {
      connector?: AdvancedFilterConnector;
      fieldType?: AdvancedFilterFieldType;
      fieldKey?: string;
      operator?: AdvancedFilterOperator;
      value?: string;
    };

  if (!id || !fieldType || !fieldKey || !operator) {
    return null;
  }

  return {
    id,
    connector,
    fieldType,
    fieldKey,
    operator,
    value,
  };
};

const toSerializedAdvancedFilters = (
  cards: AdvancedFilterCard[],
): SerializedAdvancedFilterCard[] => {
  return cards
    .map<SerializedAdvancedFilterCard | null>((card) => {
      const normalizedConditions = card.conditions
        .map((condition) => sanitizeSerializedCondition(condition))
        .filter(
          (condition): condition is SerializedAdvancedFilterCondition =>
            condition !== null,
        );

      if (!normalizedConditions.length) {
        return null;
      }

      return {
        id: card.id,
        conditions: normalizedConditions,
      };
    })
    .filter(
      (card): card is SerializedAdvancedFilterCard =>
        card !== null && card.conditions.length > 0,
    );
};

const toAdvancedFilterCards = (
  cards: SerializedAdvancedFilterCard[],
): AdvancedFilterCard[] => {
  return cards.map<AdvancedFilterCard>((card) => ({
    id: card.id,
    conditions: card.conditions.map((condition) => ({
      id: condition.id,
      connector: condition.connector,
      fieldType: condition.fieldType,
      fieldKey: condition.fieldKey,
      operator: condition.operator,
      value: condition.value,
    })),
  }));
};

const buildMetadata = (params?: {
  createdAt?: string | Date;
  updatedAt?: string | Date;
}) => {
  const createdAt = normalizeIsoString(params?.createdAt);
  const updatedAt = normalizeIsoString(params?.updatedAt ?? createdAt);
  return { createdAt, updatedAt };
};

const sanitizeStoredConditions = (
  input: StoredSieveFilterConditions,
): StoredSieveFilterConditions => {
  const basePath = input.basePath?.trim() || DEFAULT_BASE_PATH;
  const sort = normalizeSort(input.sort ?? null);
  const categories = normalizeCategories(input.categories);
  const search = normalizeSearch(input.search ?? null);
  const serializedFilters = Array.isArray(input.advancedFilters)
    ? input.advancedFilters
    : [];

  const advancedFilters = serializedFilters
    .map((card) => ({
      id: card.id,
      conditions: card.conditions
        .map((condition) => sanitizeSerializedCondition(condition))
        .filter(
          (condition): condition is SerializedAdvancedFilterCondition =>
            condition !== null,
        ),
    }))
    .filter(
      (card): card is SerializedAdvancedFilterCard =>
        card.conditions.length > 0,
    );

  return {
    version: input.version ?? DEFAULT_VERSION,
    basePath,
    sort,
    categories,
    search,
    advancedFilters,
    metadata: {
      createdAt: normalizeIsoString(input.metadata?.createdAt),
      updatedAt: normalizeIsoString(input.metadata?.updatedAt),
    },
  };
};

export const normalizeStoredConditions = (
  input: StoredSieveFilterConditions,
  metadata?: { createdAt?: string | Date; updatedAt?: string | Date },
): StoredSieveFilterConditions => {
  return sanitizeStoredConditions({
    ...input,
    metadata: {
      createdAt: normalizeIsoString(
        metadata?.createdAt ?? input.metadata?.createdAt,
      ),
      updatedAt: normalizeIsoString(
        metadata?.updatedAt ?? input.metadata?.updatedAt,
      ),
    },
  });
};

export const parseTargetPathToConditions = (
  targetPath: string | null | undefined,
  metadata?: { createdAt?: string | Date; updatedAt?: string | Date },
): StoredSieveFilterConditions => {
  const fallbackMetadata = buildMetadata(metadata);

  if (!targetPath || typeof targetPath !== 'string') {
    return sanitizeStoredConditions({
      version: DEFAULT_VERSION,
      basePath: DEFAULT_BASE_PATH,
      sort: null,
      categories: [],
      search: null,
      advancedFilters: [],
      metadata: fallbackMetadata,
    });
  }

  const [rawPath, rawSearch = ''] = targetPath.split('?');
  const basePath = rawPath?.trim() ? rawPath.trim() : DEFAULT_BASE_PATH;
  const searchParams = new URLSearchParams(rawSearch);

  const sort = normalizeSort(searchParams.get('sort'));
  const categories = normalizeCategories(searchParams.get('cats'));
  const search = normalizeSearch(searchParams.get('search'));
  const advancedEncoded = searchParams.get(ADVANCED_FILTER_KEY);
  const advancedCards = advancedEncoded
    ? parseAdvancedFilters(advancedEncoded)
    : [];
  const advancedFilters = toSerializedAdvancedFilters(advancedCards);

  return sanitizeStoredConditions({
    version: DEFAULT_VERSION,
    basePath,
    sort,
    categories,
    search,
    advancedFilters,
    metadata: fallbackMetadata,
  });
};

export const buildTargetPathFromConditions = (
  conditions: StoredSieveFilterConditions,
): string => {
  const sanitized = sanitizeStoredConditions(conditions);
  const params = new URLSearchParams();

  if (sanitized.sort) {
    params.set('sort', sanitized.sort);
  }

  if (sanitized.categories.length > 0) {
    params.set('cats', sanitized.categories.join(','));
  }

  if (sanitized.search) {
    params.set('search', sanitized.search);
  }

  if (sanitized.advancedFilters.length > 0) {
    const cards = toAdvancedFilterCards(sanitized.advancedFilters);
    const serialized = serializeAdvancedFilters(cards);
    if (serialized) {
      params.set(ADVANCED_FILTER_KEY, serialized);
    }
  }

  const queryString = params.toString();
  return `${sanitized.basePath}${
    queryString.length > 0 ? `?${queryString}` : ''
  }`;
};

export const resolveFilterState = (params: {
  targetPath?: string | null;
  stored?: StoredSieveFilterConditions | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}): {
  targetPath: string;
  conditions: StoredSieveFilterConditions;
} => {
  if (params.stored) {
    const sanitized = sanitizeStoredConditions({
      ...params.stored,
      metadata: buildMetadata({
        createdAt: params.stored.metadata?.createdAt ?? params.createdAt,
        updatedAt: params.updatedAt ?? params.stored.metadata?.updatedAt,
      }),
    });

    return {
      targetPath: buildTargetPathFromConditions(sanitized),
      conditions: sanitized,
    };
  }

  const parsed = parseTargetPathToConditions(params.targetPath, {
    createdAt: params.createdAt,
    updatedAt: params.updatedAt,
  });

  return {
    targetPath: buildTargetPathFromConditions(parsed),
    conditions: parsed,
  };
};

export const updateFilterConditions = (
  existing: StoredSieveFilterConditions | null | undefined,
  updates: Partial<StoredSieveFilterConditions>,
  metadata?: { updatedAt?: string | Date },
): StoredSieveFilterConditions => {
  const base =
    existing ??
    parseTargetPathToConditions(null, {
      createdAt: updates.metadata?.createdAt,
      updatedAt: updates.metadata?.updatedAt,
    });

  const merged: StoredSieveFilterConditions = {
    ...base,
    ...updates,
    categories:
      updates.categories !== undefined ? updates.categories : base.categories,
    advancedFilters:
      updates.advancedFilters !== undefined
        ? updates.advancedFilters
        : base.advancedFilters,
    metadata: {
      createdAt: base.metadata.createdAt,
      updatedAt: normalizeIsoString(
        metadata?.updatedAt ?? updates.metadata?.updatedAt,
      ),
    },
  };

  return sanitizeStoredConditions(merged);
};

export const getAdvancedFilterCardsFromConditions = (
  conditions: StoredSieveFilterConditions,
): AdvancedFilterCard[] => {
  return toAdvancedFilterCards(conditions.advancedFilters);
};
