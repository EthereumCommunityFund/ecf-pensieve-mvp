'use client';

import { ColumnPinningState } from '@tanstack/react-table';
import { useCallback, useState } from 'react';

import { IItemSubCategoryEnum } from '@/types/item';

const DefaultExpandedSubCat: Record<IItemSubCategoryEnum, boolean> = {
  [IItemSubCategoryEnum.Organization]: true,
  [IItemSubCategoryEnum.Team]: true,
  [IItemSubCategoryEnum.BasicProfile]: true,
  [IItemSubCategoryEnum.Development]: true,
  [IItemSubCategoryEnum.Finances]: true,
  [IItemSubCategoryEnum.Token]: true,
  [IItemSubCategoryEnum.Governance]: true, // 保留以防将来启用
};

// Default column pinning configuration - no columns pinned by default
const DefaultColumnPinning: Record<IItemSubCategoryEnum, ColumnPinningState> = {
  [IItemSubCategoryEnum.Organization]: { left: [], right: [] },
  [IItemSubCategoryEnum.Team]: { left: [], right: [] },
  [IItemSubCategoryEnum.BasicProfile]: { left: [], right: [] },
  [IItemSubCategoryEnum.Development]: { left: [], right: [] },
  [IItemSubCategoryEnum.Finances]: { left: [], right: [] },
  [IItemSubCategoryEnum.Token]: { left: [], right: [] },
  [IItemSubCategoryEnum.Governance]: { left: [], right: [] },
};

// Original column order for maintaining sequence during pinning operations
const OriginalColumnOrder = [
  'property',
  'input',
  'reference',
  'submitter',
  'accountability', // metrics column
  'legitimacy', // metrics column
  'actions',
];

/**
 * Hook for managing all table-related states
 * Centralizes state management for expandable rows, categories, groups, etc.
 */
export const useTableStates = () => {
  // 行展开状态
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // 分类展开状态管理
  const [expanded, setExpanded] = useState(DefaultExpandedSubCat);

  // 空数据分组展开状态管理
  const [emptyItemsExpanded, setEmptyItemsExpanded] = useState<
    Record<IItemSubCategoryEnum, boolean>
  >({
    [IItemSubCategoryEnum.Organization]: false,
    [IItemSubCategoryEnum.Team]: false,
    [IItemSubCategoryEnum.BasicProfile]: false,
    [IItemSubCategoryEnum.Development]: false,
    [IItemSubCategoryEnum.Finances]: false,
    [IItemSubCategoryEnum.Token]: false,
    [IItemSubCategoryEnum.Governance]: false, // 保留以防将来启用
  });

  // 分组展开状态管理 (默认所有分组都展开)
  const [groupExpanded, setGroupExpanded] = useState<Record<string, boolean>>(
    {},
  );

  // Metrics 列显示状态管理 (默认隐藏) - 按子分类独立管理
  const [metricsVisible, setMetricsVisible] = useState<
    Record<IItemSubCategoryEnum, boolean>
  >({
    [IItemSubCategoryEnum.Organization]: false,
    [IItemSubCategoryEnum.Team]: false,
    [IItemSubCategoryEnum.BasicProfile]: false,
    [IItemSubCategoryEnum.Development]: false,
    [IItemSubCategoryEnum.Finances]: false,
    [IItemSubCategoryEnum.Token]: false,
    [IItemSubCategoryEnum.Governance]: false,
  });

  // 列固定状态管理 - 按子分类独立管理，使用默认配置
  const [columnPinning, setColumnPinning] =
    useState<Record<IItemSubCategoryEnum, ColumnPinningState>>(
      DefaultColumnPinning,
    );

  // 切换行展开状态
  const toggleRowExpanded = useCallback((key: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  // 切换分类展开状态
  const toggleCategory = useCallback((category: IItemSubCategoryEnum) => {
    setExpanded((prev) => {
      const newExpanded = { ...prev };
      newExpanded[category] = !newExpanded[category];
      return newExpanded;
    });
  }, []);

  // 切换空数据分组展开状态
  const toggleEmptyItems = useCallback((category: IItemSubCategoryEnum) => {
    setEmptyItemsExpanded((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  }, []);

  // 切换分组展开状态
  const toggleGroupExpanded = useCallback((groupKey: string) => {
    setGroupExpanded((prev) => ({
      ...prev,
      [groupKey]: prev[groupKey] === false ? true : false, // 默认展开，点击后折叠
    }));
  }, []);

  // 切换特定子分类的 Metrics 列显示状态
  const toggleMetricsVisible = useCallback((category: IItemSubCategoryEnum) => {
    setMetricsVisible((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  }, []);

  // Helper function to maintain column order based on original sequence
  const maintainColumnOrder = useCallback((columnIds: string[]): string[] => {
    return OriginalColumnOrder.filter((id) => columnIds.includes(id));
  }, []);

  // 切换列固定状态
  const toggleColumnPinning = useCallback(
    (
      category: IItemSubCategoryEnum,
      columnId: string,
      position?: 'left' | 'right',
    ) => {
      setColumnPinning((prev) => {
        const currentPinning = prev[category];
        const newPinning = { ...currentPinning };

        // 检查列是否已经固定
        const isLeftPinned = currentPinning.left?.includes(columnId);
        const isRightPinned = currentPinning.right?.includes(columnId);

        if (isLeftPinned || isRightPinned) {
          // 如果已固定，则取消固定
          newPinning.left =
            currentPinning.left?.filter((id) => id !== columnId) || [];
          newPinning.right =
            currentPinning.right?.filter((id) => id !== columnId) || [];
        } else {
          // 如果未固定，则固定到指定位置（默认左侧）
          const targetPosition = position || 'left';
          if (targetPosition === 'left') {
            const newLeftColumns = [...(currentPinning.left || []), columnId];
            // Maintain original column order for left-pinned columns
            newPinning.left = maintainColumnOrder(newLeftColumns);
          } else {
            const newRightColumns = [...(currentPinning.right || []), columnId];
            // Maintain original column order for right-pinned columns
            newPinning.right = maintainColumnOrder(newRightColumns);
          }
        }

        return {
          ...prev,
          [category]: newPinning,
        };
      });
    },
    [maintainColumnOrder],
  );

  // 获取列是否已固定
  const isColumnPinned = useCallback(
    (
      category: IItemSubCategoryEnum,
      columnId: string,
    ): 'left' | 'right' | false => {
      const pinning = columnPinning[category];
      if (pinning.left?.includes(columnId)) return 'left';
      if (pinning.right?.includes(columnId)) return 'right';
      return false;
    },
    [columnPinning],
  );

  // 批量切换某个分类下所有行的展开状态
  const toggleAllRowsInCategory = useCallback((categoryRows: string[]) => {
    setExpandedRows((prev) => {
      // 检查该分类下是否有任何行已展开
      const hasExpandedRows = categoryRows.some((rowKey) => prev[rowKey]);

      // 如果有展开的行，则全部收起；如果都收起，则全部展开
      const newExpandedState = !hasExpandedRows;

      const newExpandedRows = { ...prev };
      categoryRows.forEach((rowKey) => {
        newExpandedRows[rowKey] = newExpandedState;
      });

      return newExpandedRows;
    });
  }, []);

  // 清理无效的列固定状态（当列不存在时）
  const cleanupInvalidPinnedColumns = useCallback(
    (category: IItemSubCategoryEnum, availableColumnIds: string[]) => {
      setColumnPinning((prev) => {
        const currentPinning = prev[category];
        if (!currentPinning) return prev;

        const validLeftColumns = (currentPinning.left || []).filter(
          (columnId) => availableColumnIds.includes(columnId),
        );
        const validRightColumns = (currentPinning.right || []).filter(
          (columnId) => availableColumnIds.includes(columnId),
        );

        // 使用maintainColumnOrder确保正确的顺序
        const orderedLeftColumns = maintainColumnOrder(validLeftColumns);
        const orderedRightColumns = maintainColumnOrder(validRightColumns);

        // 如果没有变化，不更新状态
        const leftChanged =
          orderedLeftColumns.length !== (currentPinning.left || []).length ||
          !orderedLeftColumns.every(
            (id, index) => id === (currentPinning.left || [])[index],
          );
        const rightChanged =
          orderedRightColumns.length !== (currentPinning.right || []).length ||
          !orderedRightColumns.every(
            (id, index) => id === (currentPinning.right || [])[index],
          );

        if (!leftChanged && !rightChanged) {
          return prev;
        }

        return {
          ...prev,
          [category]: {
            left: orderedLeftColumns,
            right: orderedRightColumns,
          },
        };
      });
    },
    [maintainColumnOrder],
  );

  // 重置特定类别的列固定状态
  const resetColumnPinning = useCallback((category: IItemSubCategoryEnum) => {
    setColumnPinning((prev) => ({
      ...prev,
      [category]: { left: [], right: [] },
    }));
  }, []);

  return {
    // States
    expandedRows,
    expanded,
    emptyItemsExpanded,
    groupExpanded,
    metricsVisible,
    columnPinning,

    // Actions
    toggleRowExpanded,
    toggleCategory,
    toggleEmptyItems,
    toggleGroupExpanded,
    toggleMetricsVisible,
    toggleAllRowsInCategory,
    toggleColumnPinning,
    isColumnPinned,
    cleanupInvalidPinnedColumns,
    resetColumnPinning,
  };
};
