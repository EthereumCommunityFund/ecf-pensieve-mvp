import { AllItemConfig } from '@/constants/itemConfig';
import { isNAValue, NA_VALUE } from '@/constants/naSelection';
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
  return isKeySetToNA ? NA_VALUE : value;
};
export const isInputValueEmpty = (value: any) => {
  // Treat null/undefined/empty string as empty
  if (value === null || value === undefined || value === '') return true;

  // // Treat string 'N/A' (case-insensitive) as empty， why ????
  // if (typeof value === 'string' && value.trim() && isNAValue(value))
  //   return true;

  // Try to parse JSON strings to actual values
  let actualValue = value;
  if (typeof value === 'string' && value.trim()) {
    try {
      actualValue = JSON.parse(value);
    } catch {
      actualValue = value;
    }
  }

  // Falsy values
  if (!actualValue) {
    return true;
  }

  // Empty arrays or arrays containing only empty-like/N/A values are empty
  if (Array.isArray(actualValue)) {
    if (actualValue.length === 0) return true;
    const allEmptyLike = actualValue.every((v) => {
      if (v === null || v === undefined) return true;
      if (typeof v === 'string') {
        const t = v.trim();
        return t === '' || isNAValue(t);
      }
      return false;
    });
    if (allEmptyLike) return true;
  }

  return false;
};

export const isInputValueNA = (value: any) => {
  return typeof value === 'string' && isNAValue(value);
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
 * Check if a value is a valid project ID
 * @param value - The value to check
 * @returns Whether the value is a valid project ID
 */
export const isProjectId = (value: string | number): boolean => {
  // Accept numeric strings or positive finite numbers; exclude 'N/A'
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0;
  }
  return !isNAValue(value) && /^\d+$/.test(value) && Number(value) > 0;
};

/**
 * Get single value from a value that might be an array
 * @param value - The value to extract from
 * @returns The first value if array, otherwise the value itself
 */
export const getSingleSelectValue = (
  value: string | number | Array<string | number> | undefined,
): string | number | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

/**
 * Check if a value is a valid numeric project ID
 * @param val - The value to check
 * @returns Whether the value is a numeric project ID
 */
export const isNumericProjectId = (
  val: string | number | undefined,
): boolean => {
  return (
    val !== undefined &&
    !(typeof val === 'string' && isNAValue(val)) &&
    ((typeof val === 'string' && isProjectId(val)) ||
      (typeof val === 'number' && isProjectId(val)))
  );
};

/**
 * Check if a value is a legacy string value (non-numeric project name)
 * @param val - The value to check
 * @returns Whether the value is a legacy string value
 */
export const isLegacyStringValue = (
  val: string | number | undefined,
): boolean => {
  return (
    typeof val === 'string' &&
    val !== '' &&
    !isNAValue(val) &&
    !isProjectId(val)
  );
};

/**
 * Extract project IDs from a field value
 * @param fieldValue - The value to extract IDs from (can be string, number, array, or null)
 * @returns Array of valid project IDs
 */
export const extractProjectIds = (fieldValue: any): Array<string | number> => {
  if (!fieldValue) return [];

  if (Array.isArray(fieldValue)) {
    // Accept both numeric strings and numbers
    return fieldValue.filter(
      (v) =>
        (typeof v === 'string' && isProjectId(v)) ||
        (typeof v === 'number' && isProjectId(v)),
    );
  }

  if (
    (typeof fieldValue === 'string' || typeof fieldValue === 'number') &&
    isProjectId(fieldValue)
  ) {
    return [fieldValue];
  }

  return [];
};

/**
 * Extract project IDs from an array of objects by key name
 * @param data - Array of objects to search
 * @param keyNames - Key name(s) to extract values from
 * @returns Array of unique project ID strings
 */
export const extractProjectIdsByKeyName = (
  data: any[],
  keyNames: string | string[] = 'project',
): string[] => {
  if (!data || data.length === 0) return [];

  const keys = Array.isArray(keyNames) ? keyNames : [keyNames];

  const ids: Array<string | number> = [];

  data.forEach((item: any) => {
    keys.forEach((key) => {
      const value = item[key];
      const extractedIds = extractProjectIds(value);
      ids.push(...extractedIds);
    });
  });

  // Convert all IDs to strings and remove duplicates
  return [...new Set(ids.map((id) => String(id)))];
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
  const itemConfig = AllItemConfig[itemKey as IPocItemKey];
  const isFieldNAEligible = !!itemConfig?.showApplicable;
  const existingInput = existingItem?.input;
  const isInputMarkedNA =
    isInputValueNA(existingInput) ||
    (isFieldNAEligible && hasProposal && isInputValueEmpty(existingInput));
  const hasValidatedLeadingProposal = Boolean(
    existingItem && (!isInputValueEmpty(existingInput) || isInputMarkedNA),
  );
  const isNotLeading = existingItem?.isNotLeading === true;
  const isNotEssential = !itemConfig?.isEssential;

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
