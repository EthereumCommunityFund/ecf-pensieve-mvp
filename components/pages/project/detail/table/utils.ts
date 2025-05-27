'use client';

import { AllItemConfig } from '@/constants/itemConfig';
import { ProjectTableFieldCategory } from '@/constants/tableConfig';
import { IProject, IProposal } from '@/types';
import { IItemSubCategoryEnum, IPocItemKey, IProposalItem } from '@/types/item';
import { devLog } from '@/utils/devLog';
import { formatDate } from '@/utils/formatters';

import { IProjectDataItem } from './Column';

export interface IPrepareProjectTableDataParams {
  project?: IProject;
  displayProposalData?: IProposal;
}

export const prepareProjectTableData = ({
  project,
  displayProposalData,
}: IPrepareProjectTableDataParams) => {
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

  const displayItemMap = (
    (displayProposalData?.items as IProposalItem[]) || []
  ).reduce(
    (acc, curr) => {
      acc[curr.key as IPocItemKey] = curr.value;
      return acc;
    },
    {} as Record<IPocItemKey, IProposalItem>,
  );

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
        const itemConfig = AllItemConfig[itemKey as IPocItemKey];
        const tableRowItem: IProjectDataItem = {
          key: itemKey,
          property: itemConfig?.label || itemKey,
          input: displayItemMap[itemKey as IPocItemKey] ?? '',
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

  devLog('prepareProjectTableData', result);
  return result;
};
