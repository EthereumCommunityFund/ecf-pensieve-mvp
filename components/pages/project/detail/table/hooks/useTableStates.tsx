'use client';

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

  // Metrics 列显示状态管理 (默认隐藏)
  const [metricsVisible, setMetricsVisible] = useState<boolean>(false);

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

  // 切换 Metrics 列显示状态
  const toggleMetricsVisible = useCallback(() => {
    setMetricsVisible((prev) => !prev);
  }, []);

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

  return {
    // States
    expandedRows,
    expanded,
    emptyItemsExpanded,
    groupExpanded,
    metricsVisible,

    // Actions
    toggleRowExpanded,
    toggleCategory,
    toggleEmptyItems,
    toggleGroupExpanded,
    toggleMetricsVisible,
    toggleAllRowsInCategory,
  };
};
