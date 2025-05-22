'use client';

import { formatDate } from '@/utils/formatters';

/**
 * Format project values for table display based on field type and value
 *
 * @param key - The field key to determine formatting rules
 * @param value - The raw value to be formatted
 * @returns Formatted value suitable for table display
 *
 * @example
 * ```typescript
 * // Format date fields
 * formatProjectValue('dateFounded', new Date('2023-01-01')) // Returns formatted date string
 *
 * // Format array fields
 * formatProjectValue('categories', ['DeFi', 'NFT']) // Returns 'DeFi, NFT'
 *
 * // Format boolean fields
 * formatProjectValue('openSource', true) // Returns 'Yes'
 *
 * // Format founder objects
 * formatProjectValue('founders', [{ name: 'John', title: 'CEO' }]) // Returns 'John-CEO'
 * ```
 */
export const formatProjectValue = (key: string, value: any): any => {
  if (value === null || value === undefined) {
    return '';
  }

  // Handle specific field types
  switch (key) {
    case 'dateFounded':
    case 'dateLaunch':
      return value instanceof Date
        ? formatDate(value)
        : formatDate(new Date(value));
    case 'categories':
    case 'tags':
      return Array.isArray(value) ? value.join(', ') : value;
    case 'founders':
      if (Array.isArray(value)) {
        return value
          .map(
            (founder: any) =>
              `${founder.name || founder.fullName}-${founder.title || founder.titleRole}`,
          )
          .join(', ');
      }
      return value;
    case 'openSource':
    case 'publicGoods':
      return typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;
    default:
      if (Array.isArray(value)) {
        return value.join(', ');
      } else if (typeof value === 'object') {
        return JSON.stringify(value);
      } else if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
      }
      return value;
  }
};
