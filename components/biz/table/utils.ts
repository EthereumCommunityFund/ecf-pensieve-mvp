'use client';

import { formatDate } from '@/utils/formatters';

/**
 * Group table rows by their group information
 *
 * Takes an array of table rows and groups them by their group property,
 * maintaining the original order while inserting group headers where needed.
 *
 * @param rows - Array of table row data with optional group information
 * @param groupExpandedState - Object tracking which groups are expanded
 * @returns Array of rows with group headers inserted and collapsed groups filtered
 */
export function groupTableRows<
  T extends { group?: string; groupTitle?: string },
>(
  rows: T[],
  groupExpandedState?: Record<string, boolean>,
): (
  | T
  | {
      isGroupHeader: true;
      group: string;
      groupTitle: string;
      isExpanded: boolean;
    }
)[] {
  if (!rows.length) return [];

  const result: (
    | T
    | {
        isGroupHeader: true;
        group: string;
        groupTitle: string;
        isExpanded: boolean;
      }
  )[] = [];
  let currentGroup: string | undefined = undefined;

  for (const row of rows) {
    // If this row belongs to a different group than the current one
    if (row.group && row.group !== currentGroup) {
      const isExpanded = groupExpandedState
        ? groupExpandedState[row.group] !== false
        : true;

      // Add group header
      result.push({
        isGroupHeader: true,
        group: row.group,
        groupTitle: row.groupTitle || row.group,
        isExpanded,
      });
      currentGroup = row.group;
    }
    // If this row doesn't belong to any group but we were in a group
    else if (!row.group && currentGroup) {
      currentGroup = undefined;
    }

    // Add the actual row only if:
    // 1. It doesn't belong to any group, OR
    // 2. It belongs to a group that is expanded
    const shouldShowRow =
      !row.group ||
      !groupExpandedState ||
      groupExpandedState[row.group] !== false;

    if (shouldShowRow) {
      result.push(row);
    }
  }

  return result;
}

/**
 * Get all unique groups from table rows
 *
 * @param rows - Array of table row data with optional group information
 * @returns Array of unique group identifiers
 */
export function getTableGroups<T extends { group?: string }>(
  rows: T[],
): string[] {
  const groups = new Set<string>();

  for (const row of rows) {
    if (row.group) {
      groups.add(row.group);
    }
  }

  return Array.from(groups);
}

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
        ? formatDate(value, 'MM/DD/YYYY', '', true)
        : formatDate(new Date(value), 'MM/DD/YYYY', '', true);
    case 'categories':
    case 'tags':
      return Array.isArray(value) ? value.join(', ') : value;
    case 'founders':
      if (Array.isArray(value)) {
        return value
          .map((founder: any) => `${founder.name}-${founder.title}`)
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
