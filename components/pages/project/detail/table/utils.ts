'use client';

import { AllItemConfig } from '@/constants/itemConfig';
import { ProjectTableFieldCategory } from '@/constants/tableConfig';
import { IProject } from '@/types';
import { IItemSubCategoryEnum, IPocItemKey } from '@/types/item';
import { devLog } from '@/utils/devLog';

import { IKeyItemDataForTable } from './ProjectDetailTableColumns';

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
      const { items, itemsNotEssential = [], groups = [] } = subCategoryConfig;

      // Process items in correct order: items > itemsNotEssential > groups(extra items)

      // Create a map to find which group each item belongs to
      const itemToGroupMap = new Map<string, { key: string; title: string }>();
      groups.forEach((group) => {
        group.items.forEach((itemKey) => {
          itemToGroupMap.set(itemKey, { key: group.key, title: group.title });
        });
      });

      // Process items in order: items > itemsNotEssential
      const itemsToShow = [...items, ...itemsNotEssential];
      itemsToShow.forEach((itemKey) => {
        const itemConfig = AllItemConfig[itemKey as IPocItemKey];

        // Use data from displayProposalDataListOfProject if available, otherwise create default entry
        const existingData = displayItemMap[itemKey as IPocItemKey];

        // Check if this item belongs to a group
        const groupInfo = itemToGroupMap.get(itemKey);

        const tableRowItem: IKeyItemDataForTable = existingData
          ? {
              ...existingData,
              accountability: itemConfig?.accountability || [],
              legitimacy: itemConfig?.legitimacy || [],
              // Add group information if item belongs to a group
              ...(groupInfo && {
                group: groupInfo.key,
                groupTitle: groupInfo.title,
              }),
            }
          : {
              key: itemKey,
              property: itemConfig?.label || itemKey,
              input: '',
              reference: null,
              submitter: {
                userId: 'default',
                name: 'Creator',
                avatarUrl: null,
                address: '',
                weight: null,
                invitationCodeId: null,
                createdAt: project?.createdAt
                  ? new Date(project.createdAt)
                  : new Date(),
                updatedAt: project?.createdAt
                  ? new Date(project.createdAt)
                  : new Date(),
              },
              createdAt: project?.createdAt
                ? new Date(project.createdAt)
                : new Date(),
              projectId: project?.id || 0,
              proposalId: 0,
              itemTopWeight: 0,
              accountability: itemConfig?.accountability || [],
              legitimacy: itemConfig?.legitimacy || [],
              // Add group information if item belongs to a group
              ...(groupInfo && {
                group: groupInfo.key,
                groupTitle: groupInfo.title,
              }),
            };

        result[subCategoryConfig.key].push(tableRowItem);
      });
    });
  });

  devLog('prepareProjectTableData', result);
  return result;
};
