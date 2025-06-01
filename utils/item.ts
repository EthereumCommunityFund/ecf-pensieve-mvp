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
