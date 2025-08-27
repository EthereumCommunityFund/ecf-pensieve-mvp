import { AllItemConfig } from '@/constants/itemConfig';
import { IFormDisplayType, IPocItemKey } from '@/types/item';

export const getItemConfig = (key: IPocItemKey) => {
  return AllItemConfig[key];
};

export const transformFormValue = (
  key: IPocItemKey,
  value: any,
  fieldApplicability: Partial<Record<IPocItemKey, boolean>>,
) => {
  const itemConfig = getItemConfig(key);
  const isFieldApplicable = !!itemConfig?.showApplicable;
  const isKeySetToNA = isFieldApplicable && !fieldApplicability[key];
  return isKeySetToNA ? '' : value;
};
export const isInputValueEmpty = (value: any) => {
  if (value === null || value === undefined || value === '') return true;

  let actualValue = value;
  if (typeof value === 'string' && value.trim()) {
    try {
      actualValue = JSON.parse(value);
    } catch {
      actualValue = value;
    }
  }

  if (!actualValue) {
    return true;
  }

  if (Array.isArray(actualValue) && actualValue.length === 0) {
    return true;
  }

  return false;
};

export const isInputValueNA = (value: any) => {
  return typeof value === 'string' && value?.trim()?.toLowerCase() === 'n/a';
};

export const parseMultipleValue = (value: any): string[] => {
  const parsedValue = parseValue(value);

  if (Array.isArray(parsedValue)) {
    return parsedValue;
  }

  if (typeof parsedValue === 'string' && parsedValue.trim()) {
    return parsedValue.split(',').map((item: string) => item.trim());
  }

  return [parsedValue];
};

export const parseValue = (value: any) => {
  if (typeof value === 'object' && value !== null) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  return value;
};

/**
 * Calculate status fields for project data
 * @param itemKey - Key of the project field
 * @param hasProposal - Whether this field already has a proposal
 * @param existingItem - Existing project data (optional)
 * @returns Object containing three status fields
 */
export const calculateItemStatusFields = (
  itemKey: string,
  hasProposal: boolean,
  existingItem?: { input: any; isNotLeading?: boolean },
) => {
  const hasValidatedLeadingProposal =
    existingItem && !isInputValueEmpty(existingItem.input);
  const isNotLeading = existingItem?.isNotLeading === true;
  const isNotEssential = !AllItemConfig[itemKey as IPocItemKey]?.isEssential;

  return {
    // Non-essential field and currently has no proposal
    canBePropose: isNotEssential && !hasProposal,

    // Has validated leading proposal but is not leading (insufficient weight)
    isConsensusInProgress: Boolean(hasValidatedLeadingProposal && isNotLeading),

    // Has proposal but no validated leading proposal yet
    isPendingValidation: Boolean(
      isNotEssential && hasProposal && !hasValidatedLeadingProposal,
    ),
  };
};

export const isEmbedTableFormType = (formDisplayType: IFormDisplayType) => {
  return (
    formDisplayType &&
    (formDisplayType === 'founderList' ||
      formDisplayType === 'websites' ||
      formDisplayType === 'social_links' ||
      formDisplayType === 'affiliated_projects' ||
      formDisplayType === 'contributing_teams' ||
      formDisplayType === 'stack_integrations' ||
      formDisplayType === 'tablePhysicalEntity' ||
      formDisplayType === 'multiContracts' ||
      formDisplayType === 'fundingReceivedGrants')
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
