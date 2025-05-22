'use client';

import { IProject } from '@/types';
import { IItemCategoryEnum } from '@/types/item';
import { formatDate } from '@/utils/formatters';
import { formatProjectValue } from '@/components/biz/table';
import {
  FIELD_LABELS,
  TableFieldCategory,
} from '@/components/pages/project/proposal/detail/constants';

import { IProjectDataItem } from './Column';

export type CategoryKey = IItemCategoryEnum;

/**
 * Prepare project data for categorized table display
 * Similar to prepareTableData but for project data instead of proposal data
 */
export const prepareProjectTableData = (project: IProject | undefined) => {
  if (!project) {
    return {
      [IItemCategoryEnum.Basics]: [],
      [IItemCategoryEnum.Technicals]: [],
      [IItemCategoryEnum.Organization]: [],
      [IItemCategoryEnum.Financial]: [],
    };
  }

  const result: Record<CategoryKey, IProjectDataItem[]> = {
    [IItemCategoryEnum.Basics]: [],
    [IItemCategoryEnum.Technicals]: [],
    [IItemCategoryEnum.Organization]: [],
    [IItemCategoryEnum.Financial]: [],
  };

  // Helper function to get reference value
  const getReference = (key: string): string => {
    if (!project.refs || !Array.isArray(project.refs)) return '';
    const ref = project.refs.find(
      (r) => typeof r === 'object' && r !== null && 'key' in r && r.key === key,
    ) as { key: string; value: string } | undefined;
    return ref?.value || '';
  };

  // Process each category
  for (const catKey of Object.values(IItemCategoryEnum)) {
    const category = catKey as CategoryKey;
    const categoryItems = TableFieldCategory[category]?.items || [];

    categoryItems.forEach((itemKey: string) => {
      // Get the value from project data
      const value = project[itemKey as keyof IProject];
      const formattedValue = formatProjectValue(itemKey, value);

      result[category].push({
        key: itemKey,
        property: FIELD_LABELS[itemKey] || itemKey,
        input: formattedValue,
        reference: getReference(itemKey),
        submitter: {
          name: 'Project Creator', // Could be enhanced to show actual creator info
          date: formatDate(project.createdAt),
        },
      });
    });
  }

  return result;
};
