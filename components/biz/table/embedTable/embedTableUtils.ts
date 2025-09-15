import {
  DYNAMIC_FIELD_EMBED_TABLE_TYPES,
  EMBED_TABLE_FORM_TYPES,
  EMBED_TABLE_WITH_PROJECT_SELECTOR_TYPES,
} from '@/constants/embedTable';
import { IFormDisplayType } from '@/types/item';

export const isEmbedTableFormType = (formDisplayType: IFormDisplayType) => {
  return formDisplayType && EMBED_TABLE_FORM_TYPES.includes(formDisplayType);
};

export const isEmbedTableFormWithProjectSelector = (
  formDisplayType?: IFormDisplayType,
) => {
  return (
    formDisplayType &&
    EMBED_TABLE_WITH_PROJECT_SELECTOR_TYPES.includes(formDisplayType)
  );
};

export const getDefaultEmbedTableFormItemValue = (
  formDisplayType: IFormDisplayType,
) => {
  switch (formDisplayType) {
    case 'founderList':
      return [{ name: '', title: '', region: '', _id: crypto.randomUUID() }];
    case 'fundingReceivedGrants':
      return {
        date: null,
        organization: '',
        amount: '',
        expenseSheetUrl: '',
        reference: '',
        _id: crypto.randomUUID(),
      };
    case 'websites':
      return { url: '', title: '', _id: crypto.randomUUID() };
    case 'social_links':
      return { platform: '', url: '', _id: crypto.randomUUID() };
    case 'tablePhysicalEntity':
      return { legalName: '', country: '', _id: crypto.randomUUID() };
    case 'affiliated_projects':
      return {
        project: '',
        affiliationType: '',
        description: '',
        reference: '',
        _id: crypto.randomUUID(),
      };
    case 'contributing_teams':
      return {
        project: '',
        type: '',
        description: '',
        reference: '',
        _id: crypto.randomUUID(),
      };
    case 'stack_integrations':
      return {
        project: '',
        type: '',
        description: '',
        reference: '',
        repository: '',
        _id: crypto.randomUUID(),
      };
    case 'multiContracts':
      return {
        id: crypto.randomUUID(),
        chain: '',
        addresses: '',
      };
    default:
      return '';
  }
};

export const getDefaultValueByFormType = (
  formDisplayType: IFormDisplayType,
): any => {
  if (!isEmbedTableFormType(formDisplayType)) {
    return '';
  }
  return [getDefaultEmbedTableFormItemValue(formDisplayType)];
};

/**
 * Normalize embed table value for prefill
 * @param formDisplayType - The form display type
 * @param raw - Raw value from leading data
 * @returns Normalized array of rows with unique IDs
 */
export const normalizeEmbedTableValue = (
  formDisplayType: IFormDisplayType,
  raw: any,
): any[] => {
  let value = raw;

  if (typeof value === 'string' && value.trim()) {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }

  const rows = Array.isArray(value)
    ? value
    : value && typeof value === 'object'
      ? [value]
      : [];

  return rows.map((row: any) => {
    if (formDisplayType === 'multiContracts') {
      return {
        id: row?.id || crypto.randomUUID(),
        chain: row?.chain ?? '',
        addresses: row?.addresses ?? '',
      };
    }

    return {
      _id: row?._id || crypto.randomUUID(),
      ...row,
    };
  });
};

export const isDynamicFieldType = (formDisplayType: IFormDisplayType) => {
  return (
    formDisplayType && DYNAMIC_FIELD_EMBED_TABLE_TYPES.includes(formDisplayType)
  );
};
