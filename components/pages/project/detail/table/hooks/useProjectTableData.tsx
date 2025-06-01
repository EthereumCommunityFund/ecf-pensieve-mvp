'use client';

import { useMemo } from 'react';

import { AllItemConfig } from '@/constants/itemConfig';
import { ProjectTableFieldCategory } from '@/constants/tableConfig';
import { IItemSubCategoryEnum, IPocItemKey } from '@/types/item';
import { calculateItemStatusFields, isInputValueEmpty } from '@/utils/item';

import { useProjectDetailContext } from '../../../context/projectDetailContext';
import { IKeyItemDataForTable } from '../ProjectDetailTableColumns';
import { prepareProjectTableData } from '../utils';

/**
 * Hook for processing and organizing project table data
 * Handles data transformation, grouping, and empty items separation
 */
export const useProjectTableData = () => {
  const { project, displayProposalDataListOfProject } =
    useProjectDetailContext();

  const { hasProposalKeys = [] } = project || {};

  // 创建分类表格数据（包含空数据项目）
  const { tableData, emptyItemsCounts } = useMemo(() => {
    if (!displayProposalDataListOfProject) {
      // 如果没有 displayProposalData，使用 prepareProjectTableData 创建默认数据
      const defaultData = prepareProjectTableData({
        project,
        displayProposalDataListOfProject: undefined,
      });
      return {
        tableData: defaultData,
        emptyItemsCounts: {} as Record<IItemSubCategoryEnum, number>,
      };
    }

    // 如果有 displayProposalData，按分类组织数据
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

    // 空数据项目计数
    const emptyCounts: Record<IItemSubCategoryEnum, number> =
      ProjectTableFieldCategory.reduce(
        (acc, catConfig) => {
          catConfig.subCategories.forEach((subCatConfig) => {
            acc[subCatConfig.key] = 0;
          });
          return acc;
        },
        {} as Record<IItemSubCategoryEnum, number>,
      );

    // 创建 displayProposalDataListOfProject 的映射以便快速查找
    const displayItemMap = displayProposalDataListOfProject.reduce(
      (acc, curr) => {
        acc[curr.key as IPocItemKey] = curr;
        return acc;
      },
      {} as Record<IPocItemKey, IKeyItemDataForTable>,
    );

    // 按照配置的顺序组织数据
    ProjectTableFieldCategory.forEach((categoryConfig) => {
      categoryConfig.subCategories.forEach((subCategoryConfig) => {
        const {
          items,
          itemsNotEssential = [],
          groups = [],
        } = subCategoryConfig;
        const emptyItems: IKeyItemDataForTable[] = [];

        // Create a map to find which group each item belongs to
        const itemToGroupMap = new Map<
          string,
          { key: string; title: string }
        >();
        groups.forEach((group) => {
          group.items.forEach((itemKey) => {
            itemToGroupMap.set(itemKey, { key: group.key, title: group.title });
          });
        });

        // 先添加 essential items (with group information)
        items.forEach((itemKey) => {
          const item = displayItemMap[itemKey as IPocItemKey];
          if (item) {
            // Check if this item belongs to a group
            const groupInfo = itemToGroupMap.get(itemKey);
            const itemConfig = AllItemConfig[itemKey as IPocItemKey];

            // 计算状态字段
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
              accountability: itemConfig?.accountability || [],
              legitimacy: itemConfig?.legitimacy || [],
              ...statusFields,
            };

            result[subCategoryConfig.key].push(enhancedItem);
          }
        });

        // 处理 itemsNotEssential
        itemsNotEssential.forEach((itemKey) => {
          const existingItem = displayItemMap[itemKey as IPocItemKey];
          const groupInfo = itemToGroupMap.get(itemKey);
          const itemConfig = AllItemConfig[itemKey as IPocItemKey];

          if (existingItem) {
            // 计算状态字段
            const hasProposal = hasProposalKeys.includes(
              itemKey as IPocItemKey,
            );
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
              accountability: itemConfig?.accountability || [],
              legitimacy: itemConfig?.legitimacy || [],
              ...statusFields,
            };

            // 如果有数据且不为空，添加到主表格
            if (!isInputValueEmpty(existingItem.input)) {
              result[subCategoryConfig.key].push(enhancedItem);
            } else {
              // 如果有数据但为空，添加到空数据列表
              emptyItems.push({ ...enhancedItem, isEmptyItem: true } as any);
            }
          } else {
            // 为没有 proposal 数据的 itemsNotEssential 创建默认条目并添加到空数据列表
            if (itemConfig) {
              // 计算状态字段
              const hasProposal = hasProposalKeys.includes(
                itemKey as IPocItemKey,
              );
              const statusFields = calculateItemStatusFields(
                itemKey,
                hasProposal,
                undefined,
              );

              const defaultItem: IKeyItemDataForTable = {
                key: itemKey,
                property: itemConfig.label || itemKey,
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
                isEmptyItem: true,
                accountability: itemConfig?.accountability || [],
                legitimacy: itemConfig?.legitimacy || [],
                // Add group information if item belongs to a group
                ...(groupInfo && {
                  group: groupInfo.key,
                  groupTitle: groupInfo.title,
                }),
                ...statusFields,
              } as any;
              emptyItems.push(defaultItem);
            }
          }
        });

        // 将空数据项目添加到主表格数据的末尾
        result[subCategoryConfig.key].push(...emptyItems);
        emptyCounts[subCategoryConfig.key] = emptyItems.length;
      });
    });

    console.log('useProjectTableData result', result);

    return { tableData: result, emptyItemsCounts: emptyCounts };
  }, [project, displayProposalDataListOfProject, hasProposalKeys]);

  return {
    tableData,
    emptyItemsCounts,
  };
};
