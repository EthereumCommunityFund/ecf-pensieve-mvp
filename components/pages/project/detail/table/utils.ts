'use client';

import { AllItemConfig } from '@/constants/itemConfig';
import { ProjectTableFieldCategory } from '@/constants/tableConfig';
import { IProject } from '@/types';
import { IItemSubCategoryEnum, IPocItemKey, IProposalItem } from '@/types/item';
import { formatDate } from '@/utils/formatters';

import { IProjectDataItem } from './Column';

export const prepareProjectTableData = (project: IProject | undefined) => {
  const result: Record<IItemSubCategoryEnum, IProjectDataItem[]> =
    ProjectTableFieldCategory.reduce(
      (acc, catConfig) => {
        catConfig.subCategories.forEach((subCatConfig) => {
          acc[subCatConfig.key] = [];
        });
        return acc;
      },
      {} as Record<IItemSubCategoryEnum, IProjectDataItem[]>,
    );

  // TODO 用每个project里的 leading item proposal 的 items 来填充
  const proposalItemMap = {} as Record<string, IProposalItem>;

  // Helper function to get reference value
  const getReference = (key: string): string => {
    if (!project?.refs || !Array.isArray(project.refs)) return '';
    const ref = project.refs.find(
      (r) => typeof r === 'object' && r !== null && 'key' in r && r.key === key,
    ) as { key: string; value: string } | undefined;
    return ref?.value || '';
  };

  ProjectTableFieldCategory.forEach((categoryConfig) => {
    categoryConfig.subCategories.forEach((subCategoryConfig) => {
      // TODO groups 待处理
      const { items, itemsNotEssential = [], groups } = subCategoryConfig;
      const itemsToShow = [...items, ...itemsNotEssential];
      itemsToShow.forEach((itemKey) => {
        const proposalItem = proposalItemMap[itemKey];
        const itemConfig = AllItemConfig[itemKey as IPocItemKey];

        const tableRowItem: IProjectDataItem = {
          key: itemKey,
          property: itemConfig?.label || itemKey,
          input: proposalItem?.value ?? '',
          reference: getReference(itemKey),
          submitter: {
            name: 'Project Creator', // Could be enhanced to show actual creator info
            date: formatDate(project?.createdAt || ''),
          },
        };
        result[subCategoryConfig.key].push(tableRowItem);
      });
    });
  });

  return result;
};
