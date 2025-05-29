'use client';

import { useMemo } from 'react';

import { AllItemConfig } from '@/constants/itemConfig';
import { ProjectTableFieldCategory } from '@/constants/tableConfig';
import { IItemSubCategoryEnum, IPocItemKey } from '@/types/item';

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

    // 检查输入值是否为空的辅助函数
    const isInputEmpty = (input: any): boolean => {
      if (input === null || input === undefined || input === '') return true;
      if (Array.isArray(input) && input.length === 0) return true;
      if (typeof input === 'string' && input.trim() === '') return true;
      return false;
    };

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

            // Add group information if item belongs to a group
            const enhancedItem = groupInfo
              ? {
                  ...item,
                  group: groupInfo.key,
                  groupTitle: groupInfo.title,
                }
              : item;

            result[subCategoryConfig.key].push(enhancedItem);
          }
        });

        // 处理 itemsNotEssential
        itemsNotEssential.forEach((itemKey) => {
          const existingItem = displayItemMap[itemKey as IPocItemKey];
          const groupInfo = itemToGroupMap.get(itemKey);

          if (existingItem) {
            // Add group information to existing item
            const enhancedItem = groupInfo
              ? {
                  ...existingItem,
                  group: groupInfo.key,
                  groupTitle: groupInfo.title,
                }
              : existingItem;

            // 如果有数据且不为空，添加到主表格
            if (!isInputEmpty(existingItem.input)) {
              result[subCategoryConfig.key].push(enhancedItem);
            } else {
              // 如果有数据但为空，添加到空数据列表
              emptyItems.push({ ...enhancedItem, isEmptyItem: true } as any);
            }
          } else {
            // 为没有 proposal 数据的 itemsNotEssential 创建默认条目并添加到空数据列表
            const itemConfig = AllItemConfig[itemKey as IPocItemKey];
            if (itemConfig) {
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
                // Add group information if item belongs to a group
                ...(groupInfo && {
                  group: groupInfo.key,
                  groupTitle: groupInfo.title,
                }),
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

    return { tableData: result, emptyItemsCounts: emptyCounts };
  }, [project, displayProposalDataListOfProject]);

  return {
    tableData,
    emptyItemsCounts,
  };
};
