import { AllItemConfig } from '@/constants/itemConfig';
import { IPocItemKey } from '@/types/item';

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
 * 计算项目数据的状态字段
 * @param itemKey - 项目字段的 key
 * @param hasProposal - 该字段是否已有 proposal
 * @param existingItem - 现有项目数据（可选）
 * @returns 包含三个状态字段的对象
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
    // 非核心字段且目前没有 proposal
    canBePropose: isNotEssential && !hasProposal,

    // 有 validated leading proposal 但不是 leading（权重不够高）
    isConsensusInProgress: Boolean(hasValidatedLeadingProposal && isNotLeading),

    // 有 proposal 但还没有 validated leading proposal
    isPendingValidation: Boolean(
      isNotEssential && hasProposal && !hasValidatedLeadingProposal,
    ),
  };
};
