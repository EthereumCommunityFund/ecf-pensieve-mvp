import {
  ADVANCED_FILTER_URL_DECODER,
  ADVANCED_FILTER_URL_TOKENS,
} from '@/constants/advancedFilterTokens';
import { AllItemConfig } from '@/constants/itemConfig';
import { ALL_METRICS } from '@/constants/metrics';
import {
  ADVANCED_FILTER_QUERY_KEY,
  ADVANCED_FILTER_SERIALIZATION_VERSION,
} from '@/constants/projectFilters';
import { ProjectTableFieldCategory } from '@/constants/tableConfig';
import { IProject } from '@/types';
import { IProposalItem } from '@/types/item';

import {
  type AdvancedFilterCard,
  type AdvancedFilterCondition,
  type AdvancedFilterConnector,
  type AdvancedFilterFieldType,
  type AdvancedFilterOperator,
  type AdvancedFilterSummary,
  type AdvancedFilterSummaryItem,
  type AdvancedSpecialFieldKey,
  type SelectFieldDefinition,
  type SelectFieldOption,
  type SerializedAdvancedFilterCard,
  type SerializedAdvancedFilterCondition,
  type SerializedAdvancedFilterPayload,
  type SpecialFieldDefinition,
} from './types';

const PRE_STAGE_VALUES = ['No Investment'];

const FALLBACK_FIELD_TYPES: readonly AdvancedFilterFieldType[] = [
  'special',
  'select',
];
const FALLBACK_OPERATORS: readonly AdvancedFilterOperator[] = ['is', 'is_not'];
const FALLBACK_CONNECTORS: readonly AdvancedFilterConnector[] = ['AND', 'OR'];

const isFieldTypeToken = (
  value: unknown,
): value is keyof (typeof ADVANCED_FILTER_URL_DECODER)['fieldType'] =>
  typeof value === 'string' &&
  Object.prototype.hasOwnProperty.call(
    ADVANCED_FILTER_URL_DECODER.fieldType,
    value,
  );

const isOperatorToken = (
  value: unknown,
): value is keyof (typeof ADVANCED_FILTER_URL_DECODER)['operator'] =>
  typeof value === 'string' &&
  Object.prototype.hasOwnProperty.call(
    ADVANCED_FILTER_URL_DECODER.operator,
    value,
  );

const isConnectorToken = (
  value: unknown,
): value is keyof (typeof ADVANCED_FILTER_URL_DECODER)['connector'] =>
  typeof value === 'string' &&
  Object.prototype.hasOwnProperty.call(
    ADVANCED_FILTER_URL_DECODER.connector,
    value,
  );

const decodeFieldType = (
  token: unknown,
): AdvancedFilterFieldType | undefined => {
  if (isFieldTypeToken(token)) {
    return ADVANCED_FILTER_URL_DECODER.fieldType[token];
  }

  if (
    typeof token === 'string' &&
    FALLBACK_FIELD_TYPES.includes(token as AdvancedFilterFieldType)
  ) {
    return token as AdvancedFilterFieldType;
  }

  return undefined;
};

const decodeOperator = (token: unknown): AdvancedFilterOperator | undefined => {
  if (isOperatorToken(token)) {
    return ADVANCED_FILTER_URL_DECODER.operator[token];
  }

  if (
    typeof token === 'string' &&
    FALLBACK_OPERATORS.includes(token as AdvancedFilterOperator)
  ) {
    return token as AdvancedFilterOperator;
  }

  return undefined;
};

const decodeConnector = (
  token: unknown,
): AdvancedFilterConnector | undefined => {
  if (isConnectorToken(token)) {
    return ADVANCED_FILTER_URL_DECODER.connector[token];
  }

  if (
    typeof token === 'string' &&
    FALLBACK_CONNECTORS.includes(token as AdvancedFilterConnector)
  ) {
    return token as AdvancedFilterConnector;
  }

  return undefined;
};

const normalizeSelectComparableValue = (value: unknown): string | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'boolean') {
    return value ? 'yes' : 'no';
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return '';
    }

    const lower = trimmed.toLowerCase();
    if (lower === 'true') {
      return 'yes';
    }
    if (lower === 'false') {
      return 'no';
    }
    return lower;
  }

  return String(value).toLowerCase();
};

const getCanonicalSelectOptionValue = (
  fieldKey: string,
  rawValue: unknown,
): string | null => {
  const normalized = normalizeSelectComparableValue(rawValue);
  if (normalized === null) {
    return null;
  }

  const field = getSelectFieldByKey(fieldKey);
  if (!field) {
    return normalized;
  }

  const option = field.options.find((item) => {
    const optionNormalized = normalizeSelectComparableValue(item.value);
    return optionNormalized !== null && optionNormalized === normalized;
  });

  if (option) {
    return option.value;
  }

  return null;
};

type SpecialConditionBooleanValue = 'true' | 'false';

const SPECIAL_BOOLEAN_OPTIONS: SelectFieldOption[] = [
  {
    value: 'true',
    label: 'True',
  },
  {
    value: 'false',
    label: 'False',
  },
];
const HAVE_VALUE_OPTIONS: SelectFieldOption[] = [
  {
    value: 'true',
    label: 'Filled',
  },
  {
    value: 'false',
    label: 'N/A',
  },
];

const buildProjectTableFieldOrder = () => {
  const order: string[] = [];

  ProjectTableFieldCategory.forEach((category) => {
    category.subCategories.forEach((subCategory) => {
      if (Array.isArray(subCategory.items)) {
        order.push(...subCategory.items);
      }

      if (Array.isArray(subCategory.itemsNotEssential)) {
        order.push(...subCategory.itemsNotEssential);
      }

      if (Array.isArray(subCategory.groups)) {
        subCategory.groups.forEach((group) => {
          if (Array.isArray(group.items)) {
            order.push(...group.items);
          }
        });
      }
    });
  });

  return order;
};

const TABLE_FIELD_ORDER = buildProjectTableFieldOrder();
const TABLE_FIELD_ORDER_MAP = new Map<string, number>(
  TABLE_FIELD_ORDER.map((key, index) => [key, index]),
);

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
  .sort((a, b) => {
    const indexA = TABLE_FIELD_ORDER_MAP.get(a.key);
    const indexB = TABLE_FIELD_ORDER_MAP.get(b.key);

    const hasOrderA = indexA !== undefined;
    const hasOrderB = indexB !== undefined;

    if (hasOrderA && hasOrderB && indexA !== indexB) {
      return (indexA as number) - (indexB as number);
    }

    if (hasOrderA && !hasOrderB) {
      return -1;
    }

    if (!hasOrderA && hasOrderB) {
      return 1;
    }

    return a.label.localeCompare(b.label);
  });

const SELECT_FIELD_DEFINITION_MAP = new Map(
  SELECT_FIELD_DEFINITIONS.map((item) => [item.key, item]),
);

const FINANCIAL_DISCLOSURE_KEYS: string[] = Object.values(AllItemConfig)
  .filter((config): config is NonNullable<typeof config> => {
    if (!config) {
      return false;
    }

    const points = config.extraTransparencyPoints;
    return (
      Array.isArray(points) &&
      points.length > 0 &&
      points.includes(ALL_METRICS.FINANCIAL_DISCLOSURE)
    );
  })
  .map((config) => config.key);

const OPERATOR_LABEL_MAP: Record<AdvancedFilterOperator, string> = {
  is: 'is',
  is_not: 'is not',
};

const SPECIAL_FIELD_DEFINITIONS: SpecialFieldDefinition[] = [
  {
    key: 'hasToken',
    label: 'Token Contract',
    options: HAVE_VALUE_OPTIONS,
    defaultValue: 'true',
  },
  // {
  //   key: 'tokenLess',
  //   label: 'Token-less (non-traded)',
  //   options: SPECIAL_BOOLEAN_OPTIONS,
  //   defaultValue: 'true',
  // },
  // {
  //   key: 'preInvestmentStage',
  //   label: 'Pre-investment stage',
  //   options: SPECIAL_BOOLEAN_OPTIONS,
  //   defaultValue: 'true',
  // },
  // {
  //   key: 'financialDisclosureCompleted',
  //   label: 'Financial disclosure all item filled',
  //   options: SPECIAL_BOOLEAN_OPTIONS,
  //   defaultValue: 'true',
  // },
  // {
  //   key: 'hasContactPoint',
  //   label: 'Have contact point',
  //   options: SPECIAL_BOOLEAN_OPTIONS,
  //   defaultValue: 'true',
  // },
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

export const collectFilterFieldKeys = (
  filters: AdvancedFilterCard | AdvancedFilterCard[] | null | undefined,
): string => {
  if (!filters) {
    return '';
  }

  const filterArray = Array.isArray(filters) ? filters : [filters];
  const keys = new Set<string>();

  filterArray.forEach((filter) => {
    filter.conditions.forEach((condition) => {
      if (condition.fieldKey) {
        keys.add(condition.fieldKey);
      }
    });
  });

  return Array.from(keys)
    .filter((key) => key.trim().length > 0)
    .sort((a, b) => a.localeCompare(b))
    .join(',');
};

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

  const snapItems = project.projectSnap?.items;
  if (snapItems && snapItems.length > 0) {
    const matched = snapItems.find((item: IProposalItem) => item.key === key);
    if (matched && matched.value !== undefined && matched.value !== null) {
      return matched.value;
    }
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
    const canonicalExpected = getCanonicalSelectOptionValue(
      fieldKey,
      expectedValue,
    );
    if (canonicalExpected === null) {
      return false;
    }

    const canonicalValues = values.map((item) =>
      getCanonicalSelectOptionValue(fieldKey, item),
    );
    const matched = canonicalValues.some(
      (valueKey) => valueKey !== null && valueKey === canonicalExpected,
    );

    return matched;
  }

  if (operator === 'is_not') {
    if (!expectedValue) {
      return true;
    }

    if (values.length === 0) {
      return true;
    }
    const canonicalExpected = getCanonicalSelectOptionValue(
      fieldKey,
      expectedValue,
    );
    if (canonicalExpected === null) {
      return true;
    }

    const canonicalValues = values.map((item) =>
      getCanonicalSelectOptionValue(fieldKey, item),
    );
    const result = canonicalValues.every(
      (valueKey) => valueKey === null || valueKey !== canonicalExpected,
    );

    return result;
  }

  return false;
};

const parseSpecialBooleanValue = (
  value: string | undefined,
): SpecialConditionBooleanValue | null => {
  if (value === 'true' || value === 'false') {
    return value;
  }
  return null;
};

const evaluateSpecialCondition = (
  project: IProject,
  key: AdvancedSpecialFieldKey,
  operator: AdvancedFilterOperator,
  expectedValue?: string,
): boolean => {
  const expected = parseSpecialBooleanValue(expectedValue);
  if (!expected) {
    return false;
  }

  let matched = false;

  switch (key) {
    case 'tokenLess': {
      const value = getProjectValue(project, 'tokenContract');
      matched = !hasNonEmptyValue(value);
      break;
    }
    case 'hasToken': {
      const value = getProjectValue(project, 'tokenContract');
      matched = hasNonEmptyValue(value);
      break;
    }
    case 'preInvestmentStage': {
      const value = getProjectValue(project, 'investment_stage');
      if (value && typeof value === 'string') {
        matched = PRE_STAGE_VALUES.some(
          (stage) => stage.toLowerCase() === value.toLowerCase(),
        );
      }
      break;
    }
    case 'financialDisclosureCompleted': {
      if (FINANCIAL_DISCLOSURE_KEYS.length === 0) {
        matched = false;
      } else {
        matched = FINANCIAL_DISCLOSURE_KEYS.every((itemKey) =>
          hasNonEmptyValue(getProjectValue(project, itemKey)),
        );
      }
      break;
    }
    case 'hasContactPoint': {
      const websites = normalizeWebsites(getProjectValue(project, 'websites'));
      matched = websites.some((entry) => {
        const url = typeof entry.url === 'string' ? entry.url.trim() : '';
        const title = typeof entry.title === 'string' ? entry.title.trim() : '';
        return url.length > 0 && title.length > 0;
      });
      break;
    }
    default:
      matched = false;
      break;
  }

  const expectedBool = expected === 'true';

  if (operator === 'is') {
    return matched === expectedBool;
  }

  if (operator === 'is_not') {
    return matched !== expectedBool;
  }

  return false;
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
      condition.value,
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

type LegacyPresetConditionValue =
  | 'token_less'
  | 'pre_investment_stage'
  | 'financial_disclosure_filled'
  | 'contact_point_available';

const LEGACY_PRESET_TO_SPECIAL_KEY: Record<
  LegacyPresetConditionValue,
  AdvancedSpecialFieldKey
> = {
  token_less: 'tokenLess',
  pre_investment_stage: 'preInvestmentStage',
  financial_disclosure_filled: 'financialDisclosureCompleted',
  contact_point_available: 'hasContactPoint',
};

const migrateLegacySpecialCondition = (
  condition: AdvancedFilterCondition,
): AdvancedFilterCondition => {
  if (condition.fieldType !== 'special' || !condition.fieldKey) {
    return condition;
  }

  if (condition.fieldKey === 'presetCondition') {
    const nextKey = condition.value
      ? LEGACY_PRESET_TO_SPECIAL_KEY[
          condition.value as LegacyPresetConditionValue
        ]
      : undefined;

    if (!nextKey) {
      return condition;
    }

    return {
      ...condition,
      fieldKey: nextKey,
      value: 'true',
    };
  }

  if (condition.fieldKey === 'hotCondition') {
    return {
      ...condition,
      fieldKey: 'tokenLess',
      operator: 'is',
      value: 'true',
    };
  }

  const operator = condition.operator as string | undefined;

  switch (condition.fieldKey) {
    case 'tokenContract': {
      const isNotEmpty = operator === 'is_not_empty';
      return {
        ...condition,
        fieldKey: 'tokenLess',
        operator: 'is',
        value: isNotEmpty ? 'false' : 'true',
      };
    }
    case 'preInvestmentStage': {
      const booleanValue = parseSpecialBooleanValue(
        typeof condition.value === 'string' ? condition.value : undefined,
      );

      if (booleanValue) {
        return {
          ...condition,
          fieldKey: 'preInvestmentStage',
          operator: condition.operator ?? 'is',
          value: booleanValue,
        };
      }

      return {
        ...condition,
        fieldKey: 'preInvestmentStage',
        operator: 'is',
        value: 'true',
      };
    }
    case 'financialDisclosure': {
      const booleanValue = parseSpecialBooleanValue(
        typeof condition.value === 'string' ? condition.value : undefined,
      );

      if (booleanValue) {
        return {
          ...condition,
          fieldKey: 'financialDisclosureCompleted',
          operator: condition.operator ?? 'is',
          value: booleanValue,
        };
      }

      return {
        ...condition,
        fieldKey: 'financialDisclosureCompleted',
        operator: 'is',
        value: 'true',
      };
    }
    case 'contactPoint': {
      const booleanValue = parseSpecialBooleanValue(
        typeof condition.value === 'string' ? condition.value : undefined,
      );

      if (booleanValue) {
        return {
          ...condition,
          fieldKey: 'hasContactPoint',
          operator: condition.operator ?? 'is',
          value: booleanValue,
        };
      }

      return {
        ...condition,
        fieldKey: 'hasContactPoint',
        operator: 'is',
        value: 'true',
      };
    }
    default:
      return condition;
  }
};

const sanitizeCondition = (
  condition: AdvancedFilterCondition,
): SerializedAdvancedFilterCondition | null => {
  const normalized = migrateLegacySpecialCondition(condition);

  if (!normalized.fieldType || !normalized.fieldKey || !normalized.operator) {
    return null;
  }

  if (normalized.fieldType === 'special') {
    const specialField = SPECIAL_FIELD_MAP.get(
      normalized.fieldKey as AdvancedSpecialFieldKey,
    );
    if (!specialField || normalized.value === undefined) {
      return null;
    }
    const isValidValue = specialField.options.some(
      (option) => option.value === normalized.value,
    );
    if (!isValidValue) {
      return null;
    }
  }

  if (normalized.fieldType === 'select') {
    if (!normalized.value) {
      return null;
    }
    if (!SELECT_FIELD_DEFINITION_MAP.has(normalized.fieldKey)) {
      return null;
    }
  }

  const sanitized: SerializedAdvancedFilterCondition = {
    id: normalized.id ?? generateConditionId(),
    connector: normalized.connector,
    fieldType: normalized.fieldType,
    fieldKey: normalized.fieldKey,
    operator: normalized.operator,
    value: normalized.value,
  };

  return sanitized;
};

const encodePayloadToUrlTokens = (
  payload: SerializedAdvancedFilterPayload,
): Record<string, unknown> => {
  const payloadKeys = ADVANCED_FILTER_URL_TOKENS.keys.payload;
  const filterKeys = ADVANCED_FILTER_URL_TOKENS.keys.filter;
  const conditionKeys = ADVANCED_FILTER_URL_TOKENS.keys.condition;

  const encodedFilters = payload.filters.map((filter) => {
    const encodedConditions = filter.conditions.map((condition) => {
      const encodedCondition: Record<string, unknown> = {
        [conditionKeys.id]: condition.id,
        [conditionKeys.fieldType]:
          ADVANCED_FILTER_URL_TOKENS.enums.fieldType[
            condition.fieldType as keyof typeof ADVANCED_FILTER_URL_TOKENS.enums.fieldType
          ] ?? condition.fieldType,
        [conditionKeys.fieldKey]: condition.fieldKey,
        [conditionKeys.operator]:
          ADVANCED_FILTER_URL_TOKENS.enums.operator[
            condition.operator as keyof typeof ADVANCED_FILTER_URL_TOKENS.enums.operator
          ] ?? condition.operator,
      };

      if (condition.connector) {
        encodedCondition[conditionKeys.connector] =
          ADVANCED_FILTER_URL_TOKENS.enums.connector[
            condition.connector as keyof typeof ADVANCED_FILTER_URL_TOKENS.enums.connector
          ] ?? condition.connector;
      }

      if (condition.value !== undefined) {
        encodedCondition[conditionKeys.value] = condition.value;
      }

      return encodedCondition;
    });

    return {
      [filterKeys.id]: filter.id,
      [filterKeys.conditions]: encodedConditions,
    };
  });

  return {
    [ADVANCED_FILTER_URL_TOKENS.version]: payload.version,
    [payloadKeys.filters]: encodedFilters,
  };
};

const decodePayloadFromUrlTokens = (
  raw: unknown,
): SerializedAdvancedFilterPayload | null => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const versionKey = ADVANCED_FILTER_URL_TOKENS.version;
  const payloadKeys = ADVANCED_FILTER_URL_TOKENS.keys.payload;
  const filterKeys = ADVANCED_FILTER_URL_TOKENS.keys.filter;
  const conditionKeys = ADVANCED_FILTER_URL_TOKENS.keys.condition;

  const versionValue = record[versionKey];
  if (typeof versionValue !== 'number') {
    return null;
  }

  const filtersRaw = record[payloadKeys.filters];
  if (!Array.isArray(filtersRaw)) {
    return null;
  }

  const filters: SerializedAdvancedFilterCard[] = [];

  for (const filterRaw of filtersRaw) {
    if (!filterRaw || typeof filterRaw !== 'object') {
      continue;
    }

    const filterRecord = filterRaw as Record<string, unknown>;
    const idValue = filterRecord[filterKeys.id];
    const conditionsRaw = filterRecord[filterKeys.conditions];

    if (typeof idValue !== 'string' || !Array.isArray(conditionsRaw)) {
      continue;
    }

    const decodedConditions: SerializedAdvancedFilterCondition[] = [];

    for (const conditionRaw of conditionsRaw) {
      if (!conditionRaw || typeof conditionRaw !== 'object') {
        continue;
      }

      const conditionRecord = conditionRaw as Record<string, unknown>;

      const conditionId = conditionRecord[conditionKeys.id];
      const fieldKey = conditionRecord[conditionKeys.fieldKey];
      const fieldTypeToken = conditionRecord[conditionKeys.fieldType];
      const operatorToken = conditionRecord[conditionKeys.operator];
      const valueToken = conditionRecord[conditionKeys.value];
      const connectorToken = conditionRecord[conditionKeys.connector];

      if (typeof conditionId !== 'string' || typeof fieldKey !== 'string') {
        continue;
      }

      const fieldType = decodeFieldType(fieldTypeToken);
      const operator = decodeOperator(operatorToken);
      const connector = decodeConnector(connectorToken);

      if (!fieldType || !operator) {
        continue;
      }

      decodedConditions.push({
        id: conditionId,
        connector,
        fieldType,
        fieldKey,
        operator,
        value: typeof valueToken === 'string' ? valueToken : undefined,
      });
    }

    filters.push({
      id: idValue,
      conditions: decodedConditions,
    });
  }

  return {
    version: versionValue,
    filters,
  };
};

const decodeLegacyPayload = (
  raw: unknown,
): SerializedAdvancedFilterPayload | null => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const record = raw as Record<string, unknown>;
  if (typeof record.version !== 'number' || !Array.isArray(record.filters)) {
    return null;
  }

  const filters = (record.filters as unknown[]).flatMap((filterRaw) => {
    if (!filterRaw || typeof filterRaw !== 'object') {
      return [];
    }

    const filterRecord = filterRaw as Record<string, unknown>;
    if (
      typeof filterRecord.id !== 'string' ||
      !Array.isArray(filterRecord.conditions)
    ) {
      return [];
    }

    const conditions = (filterRecord.conditions as unknown[]).flatMap(
      (conditionRaw) => {
        if (!conditionRaw || typeof conditionRaw !== 'object') {
          return [];
        }

        const conditionRecord = conditionRaw as Record<string, unknown>;
        if (
          typeof conditionRecord.id !== 'string' ||
          typeof conditionRecord.fieldType !== 'string' ||
          typeof conditionRecord.fieldKey !== 'string' ||
          typeof conditionRecord.operator !== 'string'
        ) {
          return [];
        }

        return [
          {
            id: conditionRecord.id,
            connector:
              typeof conditionRecord.connector === 'string'
                ? (conditionRecord.connector as AdvancedFilterConnector)
                : undefined,
            fieldType: conditionRecord.fieldType as AdvancedFilterFieldType,
            fieldKey: conditionRecord.fieldKey,
            operator: conditionRecord.operator as AdvancedFilterOperator,
            value:
              typeof conditionRecord.value === 'string'
                ? conditionRecord.value
                : undefined,
          },
        ];
      },
    );

    return [
      {
        id: filterRecord.id,
        conditions,
      },
    ];
  });

  return {
    version: record.version as number,
    filters,
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
        .filter(
          (condition): condition is SerializedAdvancedFilterCondition =>
            condition !== null,
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
      ): filter is {
        id: string;
        conditions: SerializedAdvancedFilterCondition[];
      } => filter !== null,
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

  const encodedPayload = encodePayloadToUrlTokens(payload);

  try {
    return encodeURIComponent(JSON.stringify(encodedPayload));
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
    const decodedRaw = JSON.parse(decodeURIComponent(encoded));
    const payload =
      decodePayloadFromUrlTokens(decodedRaw) ?? decodeLegacyPayload(decodedRaw);

    if (!payload || !Array.isArray(payload.filters)) {
      return [];
    }

    return payload.filters
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
          .filter(
            (condition): condition is SerializedAdvancedFilterCondition =>
              condition !== null,
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
        const options = special?.options ?? [];
        const optionLabel = options.find(
          (option) => option.value === condition.value,
        )?.label;
        valueLabel = optionLabel ?? condition.value ?? undefined;
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
