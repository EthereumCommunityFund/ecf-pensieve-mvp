const invertObject = <T extends Record<string, string>>(source: T) =>
  Object.fromEntries(
    Object.entries(source).map(([label, token]) => [token, label]),
  ) as Record<T[keyof T], keyof T>;

export const ADVANCED_FILTER_URL_TOKENS = {
  version: 'v',
  keys: {
    payload: {
      filters: 'flt',
    },
    filter: {
      id: 'id',
      conditions: 'cond',
    },
    condition: {
      id: 'id',
      connector: 'join',
      fieldType: 'type',
      fieldKey: 'field',
      operator: 'op',
      value: 'val',
    },
  },
  enums: {
    connector: {
      AND: 'and',
      OR: 'or',
    },
    fieldType: {
      special: 'sp',
      select: 'sel',
    },
    operator: {
      is: 'eq',
      is_not: 'neq',
    },
  },
} as const;

export const ADVANCED_FILTER_URL_DECODER = {
  connector: invertObject(ADVANCED_FILTER_URL_TOKENS.enums.connector),
  fieldType: invertObject(ADVANCED_FILTER_URL_TOKENS.enums.fieldType),
  operator: invertObject(ADVANCED_FILTER_URL_TOKENS.enums.operator),
} as const;

export type AdvancedFilterConnectorToken =
  (typeof ADVANCED_FILTER_URL_TOKENS)['enums']['connector'][keyof (typeof ADVANCED_FILTER_URL_TOKENS)['enums']['connector']];

export type AdvancedFilterFieldTypeToken =
  (typeof ADVANCED_FILTER_URL_TOKENS)['enums']['fieldType'][keyof (typeof ADVANCED_FILTER_URL_TOKENS)['enums']['fieldType']];

export type AdvancedFilterOperatorToken =
  (typeof ADVANCED_FILTER_URL_TOKENS)['enums']['operator'][keyof (typeof ADVANCED_FILTER_URL_TOKENS)['enums']['operator']];
