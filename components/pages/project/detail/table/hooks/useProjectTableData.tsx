'use client';

import { useCallback, useMemo, useRef } from 'react';

import { AiSystemUserId } from '@/constants/env';
import { AllItemConfig } from '@/constants/itemConfig';
import { ProjectTableFieldCategory } from '@/constants/tableConfig';
import {
  GetItemDataType,
  IItemSubCategoryEnum,
  IPocItemKey,
} from '@/types/item';
import { calculateItemStatusFields, isInputValueEmpty } from '@/utils/item';

import { useProjectDetailContext } from '../../../context/projectDetailContext';
import { IProposalCreator } from '../../types';
import { IKeyItemDataForTable } from '../ProjectDetailTableColumns';

interface UseProjectTableDataOptions {
  pendingFilter?: boolean;
  emptyFilter?: boolean;
}

export const useProjectTableData = (
  options: UseProjectTableDataOptions = {},
) => {
  const { pendingFilter = false, emptyFilter = false } = options;

  const {
    project,
    displayProposalDataListOfProject,
    isProjectFetched,
    isLeadingProposalsFetched,
  } = useProjectDetailContext();

  const { hasProposalKeys = [] } = project || {};

  // Use ref to track previous data for deep comparison
  const prevDataRef = useRef<{
    projectId?: number;
    displayDataLength?: number;
    hasProposalKeysLength?: number;
  }>({});

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
    // Check if data actually changed to avoid unnecessary recalculation
    const currentData = {
      projectId: project?.id,
      displayDataLength: displayProposalDataListOfProject?.length || 0,
      hasProposalKeysLength: hasProposalKeys.length,
    };

    const result = generateEmptyTableData();
    const emptyCounts = generateEmptyItemsCounts();

    if (
      !project ||
      !displayProposalDataListOfProject ||
      displayProposalDataListOfProject.length === 0
    ) {
      prevDataRef.current = currentData;
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
          const isAiCreator = item.submitter?.userId === AiSystemUserId;
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
              isAiCreator,
              ...statusFields,
            };

            // Apply filters
            const shouldInclude = (() => {
              const isEmpty = isInputValueEmpty(item.input);
              const isPending = statusFields.isPendingValidation;

              // If empty filter is on, only show empty items
              if (emptyFilter && !isEmpty) return false;

              // If pending filter is on, only show pending items
              if (pendingFilter && !isPending) return false;

              // If no filters are active, show all items
              if (!pendingFilter && !emptyFilter) return true;

              // If filters are active, item must match at least one filter
              return (emptyFilter && isEmpty) || (pendingFilter && isPending);
            })();

            if (shouldInclude) {
              result[subCategoryConfig.key].push(enhancedItem);
            }
          }
        });

        itemsNotEssential.forEach((itemKey) => {
          const existingItem = displayItemMap[itemKey as IPocItemKey];
          const groupInfo = itemToGroupMap.get(itemKey);
          const itemConfig = AllItemConfig[itemKey as IPocItemKey];
          const hasProposal = hasProposalKeys.includes(itemKey as IPocItemKey);
          const isAiCreator =
            existingItem?.submitter?.userId === AiSystemUserId;

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
              isAiCreator,
              ...statusFields,
            };
            // Apply filters
            const shouldInclude = (() => {
              const isEmpty = isInputValueEmpty(existingItem.input);
              const isPending = statusFields.isPendingValidation;

              // If empty filter is on, only show empty items
              if (emptyFilter && !isEmpty) return false;

              // If pending filter is on, only show pending items
              if (pendingFilter && !isPending) return false;

              // If no filters are active, show all items that have proposals or content
              if (!pendingFilter && !emptyFilter) {
                return hasProposal || !isEmpty;
              }

              // If filters are active, item must match at least one filter
              return (emptyFilter && isEmpty) || (pendingFilter && isPending);
            })();

            if (shouldInclude) {
              result[subCategoryConfig.key].push(enhancedItem);
            } else if (!pendingFilter && !emptyFilter) {
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
                isAiCreator: false,
                ...statusFields,
              };
              // Apply filters
              const shouldInclude = (() => {
                const isPending = statusFields.isPendingValidation;

                // If empty filter is on, only show empty items (no proposal)
                if (emptyFilter && hasProposal) return false;

                // If pending filter is on, only show pending items
                if (pendingFilter && !isPending) return false;

                // If no filters are active, show all items
                if (!pendingFilter && !emptyFilter) return true;

                // If filters are active, item must match at least one filter
                // For default items: they are empty if they don't have proposals
                return (
                  (emptyFilter && !hasProposal) || (pendingFilter && isPending)
                );
              })();

              if (hasProposal && shouldInclude) {
                result[subCategoryConfig.key].push({
                  ...defaultItem,
                  isEmptyItem: false,
                });
              } else if (!hasProposal && shouldInclude) {
                currentCategoryEmptyItems.push(defaultItem);
              }
            }
          }
        });
        result[subCategoryConfig.key].push(...currentCategoryEmptyItems);
        emptyCounts[subCategoryConfig.key] = currentCategoryEmptyItems.length;
      });
    });

    // Update ref with current data
    prevDataRef.current = currentData;

    return { tableData: result, emptyItemsCounts: emptyCounts };
  }, [
    project, // Track project changes
    displayProposalDataListOfProject,
    hasProposalKeys,
    generateEmptyTableData,
    generateEmptyItemsCounts,
    pendingFilter,
    emptyFilter,
  ]);

  const getItemRowData = useCallback(
    <K extends IPocItemKey>(key: K): GetItemDataType<K> => {
      const itemConfig = AllItemConfig[key];
      const { subCategory } = itemConfig!;
      if (!tableData) return [] as unknown as GetItemDataType<K>;
      if (!tableData[subCategory]) return [] as unknown as GetItemDataType<K>;
      const matchRow = tableData[subCategory].find((item) => item.key === key);
      if (!matchRow) return [] as unknown as GetItemDataType<K>;
      return (matchRow.input || []) as unknown as GetItemDataType<K>;
    },
    [tableData],
  );

  return {
    isProjectFetched,
    isDataFetched: isProjectFetched && isLeadingProposalsFetched,
    tableData,
    emptyItemsCounts,
    getItemRowData,
  };
};
