import { COUNTRIES } from '@/constants/countries';

export interface IRegionData {
  value: string;
  label: string;
}

/**
 * Validates if the region data is available and properly formatted
 */
export const isRegionDataValid = (): boolean => {
  return (
    Array.isArray(COUNTRIES) &&
    COUNTRIES.length > 0 &&
    COUNTRIES.every(
      (country) =>
        country &&
        typeof country.value === 'string' &&
        typeof country.label === 'string',
    )
  );
};

/**
 * Gets the region label from a region code with proper error handling
 * @param regionCode - The region code to convert to label
 * @returns The region label or fallback value
 */
export const getRegionLabel = (regionCode?: string): string => {
  // Handle null, undefined, or empty string
  if (!regionCode || regionCode.trim() === '') {
    return 'Unknown';
  }

  // Validate region data is available
  if (!isRegionDataValid()) {
    console.warn('Region data is not available or invalid');
    return regionCode.trim();
  }

  // Normalize the region code
  const normalizedRegionCode = regionCode.trim();

  // First try to find by value (country code) - this is the primary format
  let country = COUNTRIES.find((c) => c.value === normalizedRegionCode);

  // If not found, try to find by label (for backward compatibility with old data)
  if (!country) {
    country = COUNTRIES.find((c) => c.label === normalizedRegionCode);
  }

  // If still not found, check if it's a valid country code format
  if (!country) {
    // Log warning for debugging purposes (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Unknown region code: ${normalizedRegionCode}`);
    }

    // Return the original value as fallback for unknown regions
    return normalizedRegionCode;
  }

  return country.label;
};

/**
 * Gets available region options with error handling
 * @returns Array of region options or empty array if data is invalid
 */
export const getRegionOptions = (): IRegionData[] => {
  if (!isRegionDataValid()) {
    console.warn('Region data is not available or invalid');
    return [];
  }

  return COUNTRIES;
};

/**
 * Validates if a given region code is valid
 * @param regionCode - The region code to validate
 * @returns True if the region code is valid, false otherwise
 */
export const isValidRegionCode = (regionCode?: string): boolean => {
  if (!regionCode || regionCode.trim() === '') {
    return true; // Empty region is valid (optional field)
  }

  if (!isRegionDataValid()) {
    return false;
  }

  const normalizedRegionCode = regionCode.trim();
  return COUNTRIES.some(
    (country) =>
      country.value === normalizedRegionCode ||
      country.label === normalizedRegionCode,
  );
};
