import { AllItemConfig } from '@/constants/itemConfig';
import { ALL_METRICS } from '@/constants/metrics';
import {
  ADVANCED_FILTER_QUERY_KEY,
  ADVANCED_FILTER_SERIALIZATION_VERSION,
} from '@/constants/projectFilters';
import { IProject } from '@/types';
import { IProposalItem } from '@/types/item';

import {
  type AdvancedFilterCard,
  type AdvancedFilterCondition,
  type AdvancedFilterOperator,
  type AdvancedFilterSummary,
  type AdvancedFilterSummaryItem,
  type AdvancedSpecialFieldKey,
  type SelectFieldDefinition,
  type SelectFieldOption,
  type SerializedAdvancedFilterPayload,
  type SpecialFieldDefinition,
} from './types';

const PRE_STAGE_VALUES = ['Pre-Seed'];

const SELECT_FIELD_DEFINITIONS: SelectFieldDefinition[] = Object.values(
  AllItemConfig,
)
  .filter(
    (config): config is NonNullable<typeof config> =>
      Boolean(config) && config.formDisplayType === 'select',
  )
  .map((config) => ({
    key: config.key,
    label: config.label,
    options: (config.options ?? []) as SelectFieldOption[],
  }))
  .filter((config) => config.options.length > 0)
  .sort((a, b) => a.label.localeCompare(b.label));

const SELECT_FIELD_DEFINITION_MAP = new Map(
  SELECT_FIELD_DEFINITIONS.map((item) => [item.key, item]),
);

const FINANCIAL_DISCLOSURE_KEYS: string[] = Object.values(AllItemConfig)
  .filter(
    (config): config is NonNullable<typeof config> =>
      Boolean(config?.extraTransparencyPoints?.length) &&
      config.extraTransparencyPoints?.includes(
        ALL_METRICS.FINANCIAL_DISCLOSURE,
      ),
  )
  .map((config) => config.key);

const OPERATOR_LABEL_MAP: Record<AdvancedFilterOperator, string> = {
  is: 'is',
  is_not: 'is not',
  is_empty: 'is empty',
  is_not_empty: 'is not empty',
  pre_stage: 'is in pre stage',
  financial_complete: 'has financial disclosure filled',
  has_contact: 'has valid contact',
};

const SPECIAL_FIELD_DEFINITIONS: SpecialFieldDefinition[] = [
  {
    key: 'tokenContract',
    label: 'Token-less (non-traded) projects',
    operators: [
      { value: 'is_empty', label: 'is empty' },
      { value: 'is_not_empty', label: 'is not empty' },
    ],
  },
  {
    key: 'preInvestmentStage',
    label: 'Pre-investment stage projects',
    operators: [{ value: 'pre_stage', label: 'is in pre stage' }],
  },
  {
    key: 'financialDisclosure',
    label: 'Financial disclosure item filled',
    operators: [
      {
        value: 'financial_complete',
        label: 'is fully filled',
      },
    ],
  },
  {
    key: 'contactPoint',
    label: 'Must have contact point in “Links & Contacts”',
    operators: [{ value: 'has_contact', label: 'has contact point' }],
  },
];

const SPECIAL_FIELD_MAP = new Map<
  AdvancedSpecialFieldKey,
  SpecialFieldDefinition
>(SPECIAL_FIELD_DEFINITIONS.map((item) => [item.key, item]));

const snakeToCamel = (value: string) =>
  value.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

const generateId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
};

export const generateFilterId = () => generateId('filter');

export const generateConditionId = () => generateId('condition');

export const getSelectFieldDefinitions = (): SelectFieldDefinition[] =>
  SELECT_FIELD_DEFINITIONS;

export const getSpecialFieldDefinitions = (): SpecialFieldDefinition[] =>
  SPECIAL_FIELD_DEFINITIONS;

export const getSelectFieldByKey = (
  key: string,
): SelectFieldDefinition | null => SELECT_FIELD_DEFINITION_MAP.get(key) ?? null;

export const getSpecialFieldByKey = (
  key: AdvancedSpecialFieldKey,
): SpecialFieldDefinition | null => SPECIAL_FIELD_MAP.get(key) ?? null;

export const getOperatorLabel = (operator: AdvancedFilterOperator): string =>
  OPERATOR_LABEL_MAP[operator] ?? operator;

export const createEmptyCondition = (
  connector?: AdvancedFilterCondition['connector'],
): AdvancedFilterCondition => ({
  id: generateConditionId(),
  connector,
});

export const createEmptyFilter = (): AdvancedFilterCard => ({
  id: generateFilterId(),
  conditions: [createEmptyCondition(undefined)],
});

export const cloneFilter = (
  filter: AdvancedFilterCard,
): AdvancedFilterCard => ({
  id: filter.id,
  conditions: filter.conditions.map((condition) => ({ ...condition })),
});

const ensureArray = <T>(value: T | T[] | null | undefined): T[] => {
  if (Array.isArray(value)) {
    return value;
  }

  if (value === null || value === undefined) {
    return [];
  }

  return [value];
};

const hasNonEmptyValue = (value: unknown): boolean => {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.some((item) => hasNonEmptyValue(item));
  }

  if (typeof value === 'object') {
    return Object.values(value).some((item) => hasNonEmptyValue(item));
  }

  return true;
};

const normalizeWebsites = (value: unknown): Array<Record<string, any>> => {
  if (Array.isArray(value)) {
    return value as Array<Record<string, any>>;
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed)
        ? (parsed as Array<Record<string, any>>)
        : [];
    } catch (error) {
      console.warn('Failed to parse websites string', error);
      return [];
    }
  }

  return [];
};

const getProjectValue = (project: IProject, key: string): unknown => {
  if (!project) {
    return undefined;
  }

  const direct = (project as Record<string, unknown>)[key];
  if (direct !== undefined && direct !== null) {
    return direct;
  }

  const camelKey = snakeToCamel(key);
  const camelValue = (project as Record<string, unknown>)[camelKey];
  if (camelValue !== undefined && camelValue !== null) {
    return camelValue;
  }

  const snapItems = project.projectSnap?.items;
  if (snapItems && snapItems.length > 0) {
    const matched = snapItems.find((item: IProposalItem) => item.key === key);
    if (matched) {
      return matched.value;
    }
  }

  return undefined;
};

const evaluateSelectCondition = (
  project: IProject,
  fieldKey: string,
  operator: AdvancedFilterOperator,
  expectedValue?: string,
): boolean => {
  const value = getProjectValue(project, fieldKey);
  const values = ensureArray(value).filter(
    (v) => v !== undefined && v !== null,
  );

  if (operator === 'is') {
    if (!expectedValue) {
      return false;
    }

    if (values.length === 0) {
      return false;
    }

    return values.some((item) => String(item) === expectedValue);
  }

  if (operator === 'is_not') {
    if (!expectedValue) {
      return true;
    }

    if (values.length === 0) {
      return true;
    }

    return values.every((item) => String(item) !== expectedValue);
  }

  return false;
};

const evaluateSpecialCondition = (
  project: IProject,
  key: AdvancedSpecialFieldKey,
  operator: AdvancedFilterOperator,
): boolean => {
  switch (key) {
    case 'tokenContract': {
      const value = getProjectValue(project, 'tokenContract');
      const hasValue = hasNonEmptyValue(value);
      if (operator === 'is_empty') {
        return !hasValue;
      }
      if (operator === 'is_not_empty') {
        return hasValue;
      }
      return false;
    }
    case 'preInvestmentStage': {
      const value = getProjectValue(project, 'investment_stage');
      if (!value || typeof value !== 'string') {
        return false;
      }
      if (operator !== 'pre_stage') {
        return false;
      }
      return PRE_STAGE_VALUES.some(
        (stage) => stage.toLowerCase() === value.toLowerCase(),
      );
    }
    case 'financialDisclosure': {
      if (operator !== 'financial_complete') {
        return false;
      }

      if (FINANCIAL_DISCLOSURE_KEYS.length === 0) {
        return false;
      }

      return FINANCIAL_DISCLOSURE_KEYS.every((itemKey) =>
        hasNonEmptyValue(getProjectValue(project, itemKey)),
      );
    }
    case 'contactPoint': {
      if (operator !== 'has_contact') {
        return false;
      }
      const websites = normalizeWebsites(getProjectValue(project, 'websites'));
      if (websites.length === 0) {
        return false;
      }
      return websites.some((entry) => {
        const url = typeof entry.url === 'string' ? entry.url.trim() : '';
        const title = typeof entry.title === 'string' ? entry.title.trim() : '';
        return url.length > 0 && title.length > 0;
      });
    }
    default:
      return false;
  }
};

const evaluateCondition = (
  project: IProject,
  condition: AdvancedFilterCondition,
): boolean => {
  if (!condition.fieldType || !condition.fieldKey || !condition.operator) {
    return false;
  }

  if (condition.fieldType === 'special') {
    return evaluateSpecialCondition(
      project,
      condition.fieldKey as AdvancedSpecialFieldKey,
      condition.operator,
    );
  }

  if (condition.fieldType === 'select') {
    return evaluateSelectCondition(
      project,
      condition.fieldKey,
      condition.operator,
      condition.value,
    );
  }

  return false;
};

const evaluateCard = (project: IProject, card: AdvancedFilterCard): boolean => {
  if (!card.conditions.length) {
    return true;
  }

  return card.conditions.reduce((acc, condition, index) => {
    const result = evaluateCondition(project, condition);

    if (index === 0) {
      return result;
    }

    return condition.connector === 'OR' ? acc || result : acc && result;
  }, true);
};

export const filterProjectsByAdvancedFilters = (
  projects: IProject[],
  filters: AdvancedFilterCard[],
): IProject[] => {
  if (!filters || filters.length === 0) {
    return projects;
  }

  return projects.filter((project) =>
    filters.every((card) => evaluateCard(project, card)),
  );
};

const sanitizeCondition = (
  condition: AdvancedFilterCondition,
): AdvancedFilterCondition | null => {
  if (!condition.fieldType || !condition.fieldKey || !condition.operator) {
    return null;
  }

  if (condition.fieldType === 'select' && !condition.value) {
    return null;
  }

  if (
    condition.fieldType === 'special' &&
    !SPECIAL_FIELD_MAP.has(condition.fieldKey as AdvancedSpecialFieldKey)
  ) {
    return null;
  }

  if (
    condition.fieldType === 'select' &&
    !SELECT_FIELD_DEFINITION_MAP.has(condition.fieldKey)
  ) {
    return null;
  }

  return {
    id: condition.id ?? generateConditionId(),
    connector: condition.connector,
    fieldType: condition.fieldType,
    fieldKey: condition.fieldKey,
    operator: condition.operator,
    value: condition.value,
  };
};

export const serializeAdvancedFilters = (
  filters: AdvancedFilterCard[],
): string | null => {
  if (!filters || filters.length === 0) {
    return null;
  }

  const sanitizedFilters = filters
    .map((filter) => {
      const sanitizedConditions = filter.conditions
        .map(sanitizeCondition)
        .filter((condition): condition is AdvancedFilterCondition =>
          Boolean(condition),
        );

      if (sanitizedConditions.length === 0) {
        return null;
      }

      return {
        id: filter.id,
        conditions: sanitizedConditions,
      };
    })
    .filter(
      (
        filter,
      ): filter is { id: string; conditions: AdvancedFilterCondition[] } =>
        Boolean(filter),
    );

  if (sanitizedFilters.length === 0) {
    return null;
  }

  const payload: SerializedAdvancedFilterPayload = {
    version: ADVANCED_FILTER_SERIALIZATION_VERSION,
    filters: sanitizedFilters.map((filter) => ({
      id: filter.id,
      conditions: filter.conditions.map((condition) => ({
        id: condition.id,
        connector: condition.connector,
        fieldType: condition.fieldType,
        fieldKey: condition.fieldKey,
        operator: condition.operator,
        value: condition.value,
      })),
    })),
  };

  try {
    return encodeURIComponent(JSON.stringify(payload));
  } catch (error) {
    console.error('Failed to serialize advanced filters', error);
    return null;
  }
};

export const parseAdvancedFilters = (
  encoded: string | null,
): AdvancedFilterCard[] => {
  if (!encoded) {
    return [];
  }

  try {
    const decoded = JSON.parse(decodeURIComponent(encoded)) as
      | SerializedAdvancedFilterPayload
      | undefined;

    if (!decoded || !Array.isArray(decoded.filters)) {
      return [];
    }

    return decoded.filters
      .map((filter) => {
        const normalizedConditions = (filter.conditions ?? [])
          .map((condition) =>
            sanitizeCondition({
              id: condition.id ?? generateConditionId(),
              connector: condition.connector,
              fieldType: condition.fieldType,
              fieldKey: condition.fieldKey,
              operator: condition.operator,
              value: condition.value,
            }),
          )
          .filter((condition): condition is AdvancedFilterCondition =>
            Boolean(condition),
          );

        return {
          id: filter.id ?? generateFilterId(),
          conditions: normalizedConditions,
        };
      })
      .filter((filter) => filter.conditions.length > 0);
  } catch (error) {
    console.warn('Failed to parse advanced filters', error);
    return [];
  }
};

export const getAdvancedFilterQueryKey = () => ADVANCED_FILTER_QUERY_KEY;

export const buildFilterSummary = (
  filter: AdvancedFilterCard,
): AdvancedFilterSummary => {
  const items: AdvancedFilterSummaryItem[] = filter.conditions.map(
    (condition) => {
      const connector = condition.connector;
      let label = '';
      let operatorLabel: string | undefined;
      let valueLabel: string | undefined;

      if (condition.fieldType === 'special') {
        const special = getSpecialFieldByKey(
          condition.fieldKey as AdvancedSpecialFieldKey,
        );
        operatorLabel = condition.operator
          ? getOperatorLabel(condition.operator)
          : undefined;
        label = `${special?.label ?? condition.fieldKey}`.trim();
      } else if (condition.fieldType === 'select') {
        const select = getSelectFieldByKey(condition.fieldKey ?? '');
        operatorLabel = condition.operator
          ? getOperatorLabel(condition.operator)
          : undefined;
        const optionLabel = select?.options.find(
          (option) => option.value === condition.value,
        )?.label;
        valueLabel = optionLabel ?? condition.value ?? undefined;
        label = `${select?.label ?? condition.fieldKey}`.trim();
      }

      return {
        id: condition.id,
        connector,
        label,
        operatorLabel,
        valueLabel,
      };
    },
  );

  return {
    id: filter.id,
    items,
  };
};
