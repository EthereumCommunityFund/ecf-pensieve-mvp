'use client';

import { ColumnPinningState } from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';

import { IItemSubCategoryEnum } from '@/types/item';

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
 * Centralizes state management for expandable rows, categories, groups, etc.
 */
export const useTableStates = () => {
  // Row expansion state
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Filter states
  const [pendingFilter, setPendingFilter] = useState(false);
  const [emptyFilter, setEmptyFilter] = useState(false);

  // Category expansion state management
  const [expanded, setExpanded] = useState(DefaultExpandedSubCat);

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

  // Toggle filter states
  const togglePendingFilter = useCallback(() => {
    setPendingFilter((prev) => {
      const newValue = !prev;
      // If enabling pending filter, disable empty filter (mutual exclusion)
      if (newValue) {
        setEmptyFilter(false);
      }
      return newValue;
    });
  }, []);

  const toggleEmptyFilter = useCallback(() => {
    setEmptyFilter((prev) => {
      const newValue = !prev;
      // If enabling empty filter, disable pending filter (mutual exclusion)
      if (newValue) {
        setPendingFilter(false);
        // Auto-expand all empty items sections
        const allCategories = Object.keys(
          emptyItemsExpanded,
        ) as IItemSubCategoryEnum[];
        const newEmptyItemsExpanded = allCategories.reduce(
          (acc, cat) => ({ ...acc, [cat]: true }),
          {} as Record<IItemSubCategoryEnum, boolean>,
        );
        setEmptyItemsExpanded(newEmptyItemsExpanded);
      }
      return newValue;
    });
  }, []);

  // Toggle all categories expanded/collapsed
  const toggleAllExpanded = useCallback(
    (allRowKeys?: string[]) => {
      const allCategories = Object.keys(expanded) as IItemSubCategoryEnum[];

      // Check both category and row expansion states to determine the action
      const anyCategoryCollapsed = allCategories.some((cat) => !expanded[cat]);
      const anyRowCollapsed =
        allRowKeys && allRowKeys.length > 0
          ? allRowKeys.some((key) => !expandedRows[key])
          : false;

      // If anything is collapsed (either category or rows), expand all
      // This ensures the first click always expands everything
      const shouldExpandAll = anyCategoryCollapsed || anyRowCollapsed;

      if (shouldExpandAll) {
        // Expand all categories
        const newExpanded = allCategories.reduce(
          (acc, cat) => ({ ...acc, [cat]: true }),
          {} as Record<IItemSubCategoryEnum, boolean>,
        );
        setExpanded(newExpanded);

        // Also expand all empty items
        setEmptyItemsExpanded(newExpanded);

        // Expand all rows if keys are provided
        if (allRowKeys && allRowKeys.length > 0) {
          setExpandedRows((prev) => {
            const newExpandedRows = { ...prev };
            allRowKeys.forEach((key) => {
              newExpandedRows[key] = true;
            });
            return newExpandedRows;
          });
        }
      } else {
        // Everything is expanded, so collapse all
        const newExpanded = allCategories.reduce(
          (acc, cat) => ({ ...acc, [cat]: false }),
          {} as Record<IItemSubCategoryEnum, boolean>,
        );
        setExpanded(newExpanded);

        // Also collapse all empty items
        setEmptyItemsExpanded(newExpanded);

        // Collapse all rows if keys are provided
        if (allRowKeys && allRowKeys.length > 0) {
          setExpandedRows((prev) => {
            const newExpandedRows = { ...prev };
            allRowKeys.forEach((key) => {
              newExpandedRows[key] = false;
            });
            return newExpandedRows;
          });
        }
      }
    },
    [expanded, expandedRows],
  );

  // Toggle all metrics visibility
  const toggleAllMetrics = useCallback(() => {
    const allCategories = Object.keys(metricsVisible) as IItemSubCategoryEnum[];
    const anyHidden = allCategories.some((cat) => !metricsVisible[cat]);

    const newVisibility = allCategories.reduce(
      (acc, cat) => ({ ...acc, [cat]: anyHidden }),
      {} as Record<IItemSubCategoryEnum, boolean>,
    );

    setMetricsVisible(newVisibility);
  }, [metricsVisible]);

  // Check if all categories are expanded
  const isAllExpanded = useMemo(() => {
    const allCategories = Object.keys(expanded) as IItemSubCategoryEnum[];
    // Only check category expansion state for now
    // Row expansion state will be checked dynamically when needed
    return allCategories.every((cat) => expanded[cat]);
  }, [expanded]);

  // Check if all metrics are visible
  const isAllMetricsVisible = useMemo(() => {
    const allCategories = Object.keys(metricsVisible) as IItemSubCategoryEnum[];
    return allCategories.every((cat) => metricsVisible[cat]);
  }, [metricsVisible]);

  return {
    // States
    expandedRows,
    expanded,
    emptyItemsExpanded,
    groupExpanded,
    metricsVisible,
    columnPinning,
    pendingFilter,
    emptyFilter,
    isAllExpanded,
    isAllMetricsVisible,

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
    toggleAllExpanded,
    toggleAllMetrics,
  };
};
