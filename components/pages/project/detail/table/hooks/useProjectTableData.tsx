'use client';

import { useCallback, useMemo } from 'react';

import { AllItemConfig } from '@/constants/itemConfig';
import { ProjectTableFieldCategory } from '@/constants/tableConfig';
import { IItemSubCategoryEnum, IPocItemKey } from '@/types/item';
import { devLog } from '@/utils/devLog';
import { calculateItemStatusFields, isInputValueEmpty } from '@/utils/item';

import { useProjectDetailContext } from '../../../context/projectDetailContext';
import { IProposalCreator } from '../../types';
import { IKeyItemDataForTable } from '../ProjectDetailTableColumns';

export const useProjectTableData = () => {
  const {
    project,
    displayProposalDataListOfProject,
    isProjectFetched,
    isLeadingProposalsFetched,
  } = useProjectDetailContext();

  const { hasProposalKeys = [] } = project || {};

  const generateEmptyTableData = useCallback(() => {
    return ProjectTableFieldCategory.reduce(
      (acc, catConfig) => {
        catConfig.subCategories.forEach((subCatConfig) => {
          acc[subCatConfig.key] = [];
        });
        return acc;
      },
      {} as Record<IItemSubCategoryEnum, IKeyItemDataForTable[]>,
    );
  }, []);

  const generateEmptyItemsCounts = useCallback(() => {
    return ProjectTableFieldCategory.reduce(
      (acc, catConfig) => {
        catConfig.subCategories.forEach((subCatConfig) => {
          acc[subCatConfig.key] = 0;
        });
        return acc;
      },
      {} as Record<IItemSubCategoryEnum, number>,
    );
  }, []);

  const { tableData, emptyItemsCounts } = useMemo(() => {
    const result = generateEmptyTableData();
    const emptyCounts = generateEmptyItemsCounts();

    if (
      !project ||
      !displayProposalDataListOfProject ||
      displayProposalDataListOfProject.length === 0
    ) {
      return {
        tableData: result,
        emptyItemsCounts: emptyCounts,
      };
    }

    const displayItemMap = displayProposalDataListOfProject.reduce(
      (acc, curr) => {
        acc[curr.key as IPocItemKey] = curr;
        return acc;
      },
      {} as Record<IPocItemKey, IKeyItemDataForTable>,
    );

    ProjectTableFieldCategory.forEach((categoryConfig) => {
      categoryConfig.subCategories.forEach((subCategoryConfig) => {
        const {
          items,
          itemsNotEssential = [],
          groups = [],
        } = subCategoryConfig;
        const currentCategoryEmptyItems: IKeyItemDataForTable[] = [];

        const itemToGroupMap = new Map<
          string,
          { key: string; title: string }
        >();
        groups.forEach((group) => {
          group.items.forEach((itemKey) => {
            itemToGroupMap.set(itemKey, { key: group.key, title: group.title });
          });
        });

        items.forEach((itemKey) => {
          const item = displayItemMap[itemKey as IPocItemKey];
          if (item) {
            const groupInfo = itemToGroupMap.get(itemKey);
            const itemConfig = AllItemConfig[itemKey as IPocItemKey];
            const hasProposal = hasProposalKeys.includes(
              itemKey as IPocItemKey,
            );
            const statusFields = calculateItemStatusFields(
              itemKey,
              hasProposal,
              item,
            );
            const enhancedItem = {
              ...item,
              ...(groupInfo && {
                group: groupInfo.key,
                groupTitle: groupInfo.title,
              }),
              property: itemConfig?.label || itemKey,
              accountability: itemConfig?.accountability || [],
              legitimacy: itemConfig?.legitimacy || [],
              accountabilityMetrics: itemConfig?.accountability || [],
              legitimacyMetrics: itemConfig?.legitimacy || [],
              ...statusFields,
            };
            result[subCategoryConfig.key].push(enhancedItem);
          }
        });

        itemsNotEssential.forEach((itemKey) => {
          const existingItem = displayItemMap[itemKey as IPocItemKey];
          const groupInfo = itemToGroupMap.get(itemKey);
          const itemConfig = AllItemConfig[itemKey as IPocItemKey];
          const hasProposal = hasProposalKeys.includes(itemKey as IPocItemKey);

          if (existingItem) {
            const statusFields = calculateItemStatusFields(
              itemKey,
              hasProposal,
              existingItem,
            );
            const enhancedItem = {
              ...existingItem,
              ...(groupInfo && {
                group: groupInfo.key,
                groupTitle: groupInfo.title,
              }),
              property: itemConfig?.label || itemKey,
              accountability: itemConfig?.accountability || [],
              legitimacy: itemConfig?.legitimacy || [],
              accountabilityMetrics: itemConfig?.accountability || [],
              legitimacyMetrics: itemConfig?.legitimacy || [],
              ...statusFields,
            };
            if (hasProposal || !isInputValueEmpty(existingItem.input)) {
              result[subCategoryConfig.key].push(enhancedItem);
            } else {
              currentCategoryEmptyItems.push({
                ...enhancedItem,
                isEmptyItem: true,
              });
            }
          } else {
            if (itemConfig) {
              const statusFields = calculateItemStatusFields(
                itemKey,
                hasProposal,
                undefined,
              );
              const defaultSubmitter: IProposalCreator = {
                userId: 'default',
                name: 'Creator',
                avatarUrl: null,
                address: '',
              };
              const defaultItem: IKeyItemDataForTable = {
                key: itemKey,
                property: itemConfig.label || itemKey,
                input: '',
                reference: null,
                submitter: defaultSubmitter,
                createdAt: project.createdAt
                  ? new Date(project.createdAt)
                  : new Date(),
                projectId: project.id || 0,
                proposalId: 0,
                itemTopWeight: 0,
                isEmptyItem: true,
                accountability: itemConfig?.accountability || [],
                legitimacy: itemConfig?.legitimacy || [],
                accountabilityMetrics: itemConfig?.accountability || [],
                legitimacyMetrics: itemConfig?.legitimacy || [],
                ...(groupInfo && {
                  group: groupInfo.key,
                  groupTitle: groupInfo.title,
                }),
                ...statusFields,
              };
              if (hasProposal) {
                result[subCategoryConfig.key].push({
                  ...defaultItem,
                  isEmptyItem: false,
                });
              } else {
                currentCategoryEmptyItems.push(defaultItem);
              }
            }
          }
        });
        result[subCategoryConfig.key].push(...currentCategoryEmptyItems);
        emptyCounts[subCategoryConfig.key] = currentCategoryEmptyItems.length;
      });
    });

    devLog('useProjectTableData', result, emptyCounts);
    return { tableData: result, emptyItemsCounts: emptyCounts };
  }, [project, displayProposalDataListOfProject, hasProposalKeys]);

  return {
    tableData,
    emptyItemsCounts,
  };
};
