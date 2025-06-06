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

  return {
    expandedRows,
    metricsVisibleSubCat,
    toggleRowExpanded,
    toggleMetricsVisible,
    setExpandedRows,
  };
};
