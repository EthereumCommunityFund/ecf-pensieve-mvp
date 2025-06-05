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

export const useProposalTableStates = () => {
  const [expandedRows, setExpandedRows] = useState<
    Partial<Record<IPocItemKey, boolean>>
  >({});

  const [metricsVisibleSubCat, setMetricsVisibleSubCat] = useState(
    DefaultMetricsVisibleSubCat,
  );

  // Column pinning state management - independent for each subcategory
  const [columnPinning, setColumnPinning] = useState<
    Record<IItemSubCategoryEnum, ColumnPinningState>
  >({
    [IItemSubCategoryEnum.Organization]: {
      left: ['property'],
      right: ['support'],
    },
    [IItemSubCategoryEnum.Team]: { left: ['property'], right: ['support'] },
    [IItemSubCategoryEnum.BasicProfile]: {
      left: ['property'],
      right: ['support'],
    },
    [IItemSubCategoryEnum.Development]: {
      left: ['property'],
      right: ['support'],
    },
    [IItemSubCategoryEnum.Finances]: { left: ['property'], right: ['support'] },
    [IItemSubCategoryEnum.Token]: { left: ['property'], right: ['support'] },
    [IItemSubCategoryEnum.Governance]: {
      left: ['property'],
      right: ['support'],
    },
  });

  const toggleRowExpanded = useCallback((key: IPocItemKey) => {
    setExpandedRows((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const toggleMetricsVisible = useCallback(
    (subCat: IItemSubCategoryEnum) => {
      setMetricsVisibleSubCat((prev) => ({
        ...prev,
        [subCat]: !prev[subCat],
      }));
    },
    [metricsVisibleSubCat],
  );

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
            newPinning.left = [...(currentPinning.left || []), columnId];
          } else {
            newPinning.right = [...(currentPinning.right || []), columnId];
          }
        }

        return {
          ...prev,
          [category]: newPinning,
        };
      });
    },
    [],
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
