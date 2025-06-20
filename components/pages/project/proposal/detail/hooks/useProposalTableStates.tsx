import { ColumnPinningState } from '@tanstack/react-table';
import { useCallback, useState } from 'react';

import { IItemSubCategoryEnum, IPocItemKey } from '@/types/item';

const DefaultMetricsVisibleSubCat: Record<IItemSubCategoryEnum, boolean> = {
  [IItemSubCategoryEnum.Organization]: false,
  [IItemSubCategoryEnum.Team]: false,
  [IItemSubCategoryEnum.BasicProfile]: false,
  [IItemSubCategoryEnum.Development]: false,
  [IItemSubCategoryEnum.Finances]: false,
  [IItemSubCategoryEnum.Token]: false,
  [IItemSubCategoryEnum.Governance]: false,
};

// Original column order for maintaining sequence during pinning operations
const OriginalColumnOrder = [
  'property',
  'input',
  'reference',
  'accountability', // metrics column
  'legitimacy', // metrics column
  'support',
];

export const useProposalTableStates = () => {
  const [expandedRows, setExpandedRows] = useState<
    Partial<Record<IPocItemKey, boolean>>
  >({});

  const [metricsVisibleSubCat, setMetricsVisibleSubCat] = useState(
    DefaultMetricsVisibleSubCat,
  );

  // Column pinning state management - independent for each subcategory
  // Default state: no columns pinned initially
  const [columnPinning, setColumnPinning] = useState<
    Record<IItemSubCategoryEnum, ColumnPinningState>
  >({
    [IItemSubCategoryEnum.Organization]: {
      left: [],
      right: [],
    },
    [IItemSubCategoryEnum.Team]: { left: [], right: [] },
    [IItemSubCategoryEnum.BasicProfile]: {
      left: [],
      right: [],
    },
    [IItemSubCategoryEnum.Development]: {
      left: [],
      right: [],
    },
    [IItemSubCategoryEnum.Finances]: { left: [], right: [] },
    [IItemSubCategoryEnum.Token]: { left: [], right: [] },
    [IItemSubCategoryEnum.Governance]: {
      left: [],
      right: [],
    },
  });

  const toggleRowExpanded = useCallback((key: IPocItemKey) => {
    setExpandedRows((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const toggleMetricsVisible = useCallback((subCat: IItemSubCategoryEnum) => {
    setMetricsVisibleSubCat((prev) => ({
      ...prev,
      [subCat]: !prev[subCat],
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

  return {
    expandedRows,
    metricsVisibleSubCat,
    columnPinning,
    toggleRowExpanded,
    toggleMetricsVisible,
    toggleColumnPinning,
    isColumnPinned,
    setExpandedRows,
  };
};
