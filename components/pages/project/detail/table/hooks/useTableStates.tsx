'use client';

import { ColumnPinningState } from '@tanstack/react-table';
import { useCallback, useEffect, useState } from 'react';

import { AllItemConfig } from '@/constants/itemConfig';
import { IItemSubCategoryEnum, IPocItemKey } from '@/types/item';

import { useTableFilterParams } from './useTableFilterParams';

const DefaultExpandedSubCat: Record<IItemSubCategoryEnum, boolean> = {
  [IItemSubCategoryEnum.Organization]: true,
  [IItemSubCategoryEnum.Team]: true,
  [IItemSubCategoryEnum.BasicProfile]: true,
  [IItemSubCategoryEnum.Development]: true,
  [IItemSubCategoryEnum.Finances]: true,
  [IItemSubCategoryEnum.Token]: true,
  [IItemSubCategoryEnum.Governance]: true, // Reserved for future enablement
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
 * Centralizes state management for expandable rows, categories, groups, filters, etc.
 */
export const useTableStates = () => {
  // URL params management
  const { filterParams, setFilterParams, clearFilterParams } =
    useTableFilterParams();

  // Row expansion state
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Category expansion state management
  const [expanded, setExpanded] = useState(DefaultExpandedSubCat);

  // Filter states - initialized from URL params
  const [showPendingOnly, setShowPendingOnly] = useState(
    filterParams.showPendingOnly,
  );
  const [showEmptyOnly, setShowEmptyOnly] = useState(
    filterParams.showEmptyOnly,
  );

  // Global control states - initialized from URL params
  const [globalMetricsVisible, setGlobalMetricsVisible] = useState(
    filterParams.showMetrics,
  );
  const [globalCollapseState, setGlobalCollapseState] = useState<
    'expanded' | 'collapsed' | 'mixed'
  >(filterParams.collapsed ? 'collapsed' : 'expanded');

  // Sync URL params when filter states change
  useEffect(() => {
    setFilterParams({
      showPendingOnly,
      showEmptyOnly,
      showMetrics: globalMetricsVisible,
      collapsed: globalCollapseState === 'collapsed',
    });
  }, [
    showPendingOnly,
    showEmptyOnly,
    globalMetricsVisible,
    globalCollapseState,
    setFilterParams,
  ]);

  // Empty data group expansion state management
  const [emptyItemsExpanded, setEmptyItemsExpanded] = useState<
    Record<IItemSubCategoryEnum, boolean>
  >({
    [IItemSubCategoryEnum.Organization]: true,
    [IItemSubCategoryEnum.Team]: true,
    [IItemSubCategoryEnum.BasicProfile]: true,
    [IItemSubCategoryEnum.Development]: true,
    [IItemSubCategoryEnum.Finances]: true,
    [IItemSubCategoryEnum.Token]: true,
    [IItemSubCategoryEnum.Governance]: true, // Reserved for future enablement
  });

  // Group expansion state management (all groups expanded by default)
  const [groupExpanded, setGroupExpanded] = useState<Record<string, boolean>>(
    {},
  );

  // Metrics column display state management (hidden by default) - independent management by subcategory
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

  // Column pinning state management - independent management by subcategory, using default configuration
  const [columnPinning, setColumnPinning] =
    useState<Record<IItemSubCategoryEnum, ColumnPinningState>>(
      DefaultColumnPinning,
    );

  // Toggle row expansion state
  const toggleRowExpanded = useCallback((key: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  // Toggle category expansion state
  const toggleCategory = useCallback((category: IItemSubCategoryEnum) => {
    setExpanded((prev) => {
      const newExpanded = { ...prev };
      newExpanded[category] = !newExpanded[category];
      return newExpanded;
    });
  }, []);

  // Toggle empty data group expansion state
  const toggleEmptyItems = useCallback((category: IItemSubCategoryEnum) => {
    setEmptyItemsExpanded((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  }, []);

  // Toggle group expansion state
  const toggleGroupExpanded = useCallback((groupKey: string) => {
    setGroupExpanded((prev) => ({
      ...prev,
      [groupKey]: prev[groupKey] === false ? true : false, // Default expanded, collapse after clicking
    }));
  }, []);

  // Toggle Metrics column display state for specific subcategory
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

  // Toggle column pinning state
  const toggleColumnPinning = useCallback(
    (
      category: IItemSubCategoryEnum,
      columnId: string,
      position?: 'left' | 'right',
    ) => {
      setColumnPinning((prev) => {
        const currentPinning = prev[category];
        const newPinning = { ...currentPinning };

        // Check if column is already pinned
        const isLeftPinned = currentPinning.left?.includes(columnId);
        const isRightPinned = currentPinning.right?.includes(columnId);

        if (isLeftPinned || isRightPinned) {
          // If already pinned, unpin it
          newPinning.left =
            currentPinning.left?.filter((id) => id !== columnId) || [];
          newPinning.right =
            currentPinning.right?.filter((id) => id !== columnId) || [];
        } else {
          // If not pinned, pin to specified position (default left)
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

  // Get whether column is pinned
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

  // Batch toggle expansion state of all rows in a category
  const toggleAllRowsInCategory = useCallback((categoryRows: string[]) => {
    setExpandedRows((prev) => {
      // Check if any rows in this category are expanded
      const hasExpandedRows = categoryRows.some((rowKey) => prev[rowKey]);

      // If there are expanded rows, collapse all; if all collapsed, expand all
      const newExpandedState = !hasExpandedRows;

      const newExpandedRows = { ...prev };
      categoryRows.forEach((rowKey) => {
        newExpandedRows[rowKey] = newExpandedState;
      });

      return newExpandedRows;
    });
  }, []);

  // Clean up invalid column pinning state (when columns don't exist)
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

        // Use maintainColumnOrder to ensure correct order
        const orderedLeftColumns = maintainColumnOrder(validLeftColumns);
        const orderedRightColumns = maintainColumnOrder(validRightColumns);

        // If no changes, don't update state
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

  // Reset column pinning state for specific category
  const resetColumnPinning = useCallback((category: IItemSubCategoryEnum) => {
    setColumnPinning((prev) => ({
      ...prev,
      [category]: { left: [], right: [] },
    }));
  }, []);

  // Toggle pending items filter
  const togglePendingFilter = useCallback(() => {
    setShowPendingOnly((prev) => !prev);
    // If enabling pending filter, disable empty filter (mutually exclusive)
    if (!showPendingOnly) {
      setShowEmptyOnly(false);
    }
  }, [showPendingOnly]);

  // Toggle empty items filter
  const toggleEmptyFilter = useCallback(() => {
    setShowEmptyOnly((prev) => !prev);
    // If enabling empty filter, disable pending filter (mutually exclusive)
    if (!showEmptyOnly) {
      setShowPendingOnly(false);
    }
  }, [showEmptyOnly]);

  // Toggle global metrics visibility
  const toggleGlobalMetrics = useCallback(() => {
    const newState = !globalMetricsVisible;
    setGlobalMetricsVisible(newState);

    // Apply to all categories
    setMetricsVisible({
      [IItemSubCategoryEnum.Organization]: newState,
      [IItemSubCategoryEnum.Team]: newState,
      [IItemSubCategoryEnum.BasicProfile]: newState,
      [IItemSubCategoryEnum.Development]: newState,
      [IItemSubCategoryEnum.Finances]: newState,
      [IItemSubCategoryEnum.Token]: newState,
      [IItemSubCategoryEnum.Governance]: newState,
    });
  }, [globalMetricsVisible]);

  // Toggle global collapse/expand state
  const toggleGlobalCollapse = useCallback(
    (tableData?: Record<IItemSubCategoryEnum, any[]>) => {
      const shouldCollapse = globalCollapseState !== 'collapsed';

      if (shouldCollapse) {
        // Collapse all
        setExpandedRows({});
        setExpanded({
          [IItemSubCategoryEnum.Organization]: false,
          [IItemSubCategoryEnum.Team]: false,
          [IItemSubCategoryEnum.BasicProfile]: false,
          [IItemSubCategoryEnum.Development]: false,
          [IItemSubCategoryEnum.Finances]: false,
          [IItemSubCategoryEnum.Token]: false,
          [IItemSubCategoryEnum.Governance]: false,
        });
        setEmptyItemsExpanded({
          [IItemSubCategoryEnum.Organization]: false,
          [IItemSubCategoryEnum.Team]: false,
          [IItemSubCategoryEnum.BasicProfile]: false,
          [IItemSubCategoryEnum.Development]: false,
          [IItemSubCategoryEnum.Finances]: false,
          [IItemSubCategoryEnum.Token]: false,
          [IItemSubCategoryEnum.Governance]: false,
        });
        setGroupExpanded({});
        setGlobalCollapseState('collapsed');
      } else {
        // Expand all

        // Expand all rows that are expandable
        if (tableData) {
          const allExpandableRows: Record<string, boolean> = {};
          const allGroups: Record<string, boolean> = {};

          // Collect all expandable row keys and groups from all categories
          Object.values(tableData).forEach((categoryItems) => {
            categoryItems.forEach((item: any) => {
              // Check if item has expandable content based on AllItemConfig
              const itemConfig = AllItemConfig[item.key as IPocItemKey];
              if (itemConfig?.showExpand) {
                allExpandableRows[item.key] = true;
              }

              // Collect groups
              if (item.group) {
                allGroups[item.group] = true; // true means expanded
              }
            });
          });

          setExpandedRows(allExpandableRows);
          setGroupExpanded(allGroups);
        }

        // Expand all categories
        setExpanded(DefaultExpandedSubCat);

        // Expand all empty items groups
        setEmptyItemsExpanded({
          [IItemSubCategoryEnum.Organization]: true,
          [IItemSubCategoryEnum.Team]: true,
          [IItemSubCategoryEnum.BasicProfile]: true,
          [IItemSubCategoryEnum.Development]: true,
          [IItemSubCategoryEnum.Finances]: true,
          [IItemSubCategoryEnum.Token]: true,
          [IItemSubCategoryEnum.Governance]: true,
        });

        setGlobalCollapseState('expanded');
      }
    },
    [globalCollapseState],
  );

  // Reset all filters
  const resetFilters = useCallback(() => {
    setShowPendingOnly(false);
    setShowEmptyOnly(false);
    clearFilterParams();
  }, [clearFilterParams]);

  // Update global collapse state based on current expansion states
  const updateGlobalCollapseState = useCallback(() => {
    const allCategories = Object.values(IItemSubCategoryEnum);
    const expandedCount = allCategories.filter((cat) => expanded[cat]).length;

    if (expandedCount === 0) {
      setGlobalCollapseState('collapsed');
    } else if (expandedCount === allCategories.length) {
      setGlobalCollapseState('expanded');
    } else {
      setGlobalCollapseState('mixed');
    }
  }, [expanded]);

  return {
    // States
    expandedRows,
    expanded,
    emptyItemsExpanded,
    groupExpanded,
    metricsVisible,
    columnPinning,
    showPendingOnly,
    showEmptyOnly,
    globalMetricsVisible,
    globalCollapseState,

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
    togglePendingFilter,
    toggleEmptyFilter,
    toggleGlobalMetrics,
    toggleGlobalCollapse,
    resetFilters,
    updateGlobalCollapseState,
  };
};
