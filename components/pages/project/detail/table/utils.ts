'use client';

import { AllItemConfig } from '@/constants/itemConfig';
import { ProjectTableFieldCategory } from '@/constants/tableConfig';
import { IProject } from '@/types';
import { IItemSubCategoryEnum, IPocItemKey } from '@/types/item';
import { devLog } from '@/utils/devLog';
import { formatDate } from '@/utils/formatters';

import { IKeyItemDataForTable } from './ProjectDetailTableColumn';

export interface IPrepareProjectTableDataParams {
  project?: IProject;
  displayProposalDataListOfProject?: IKeyItemDataForTable[];
}

export const prepareProjectTableData = ({
  project,
  displayProposalDataListOfProject,
}: IPrepareProjectTableDataParams) => {
  const result: Record<IItemSubCategoryEnum, IKeyItemDataForTable[]> =
    ProjectTableFieldCategory.reduce(
      (acc, catConfig) => {
        catConfig.subCategories.forEach((subCatConfig) => {
          acc[subCatConfig.key] = [];
        });
        return acc;
      },
      {} as Record<IItemSubCategoryEnum, IKeyItemDataForTable[]>,
    );

  // Create a map from displayProposalDataListOfProject for quick lookup
  const displayItemMap = (displayProposalDataListOfProject || []).reduce(
    (acc, curr) => {
      acc[curr.key as IPocItemKey] = curr;
      return acc;
    },
    {} as Record<IPocItemKey, IKeyItemDataForTable>,
  );

  ProjectTableFieldCategory.forEach((categoryConfig) => {
    categoryConfig.subCategories.forEach((subCategoryConfig) => {
      // TODO groups 待处理
      const { items, itemsNotEssential = [] } = subCategoryConfig;
      const itemsToShow = [...items, ...itemsNotEssential];
      itemsToShow.forEach((itemKey) => {
        const itemConfig = AllItemConfig[itemKey as IPocItemKey];

        // Use data from displayProposalDataListOfProject if available, otherwise create default entry
        const existingData = displayItemMap[itemKey as IPocItemKey];

        const tableRowItem: IKeyItemDataForTable = existingData || {
          key: itemKey,
          property: itemConfig?.label || itemKey,
          input: '',
          reference: null,
          submitter: {
            // TODO 用当前的 leading proposal 的 creator，不是project的creator, 需要从 proposal 中获取
            name: 'Creator',
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
