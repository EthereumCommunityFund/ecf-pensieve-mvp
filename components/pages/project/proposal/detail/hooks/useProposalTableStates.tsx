import { useCallback, useRef, useState } from 'react';

import { IItemSubCategoryEnum, IPocItemKey } from '@/types/item';
import { devLog } from '@/utils/devLog';

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

  const metricsVisibleSubCatRef = useRef(DefaultMetricsVisibleSubCat);

  const toggleRowExpanded = useCallback((key: IPocItemKey) => {
    setExpandedRows((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const toggleMetricsVisible = useCallback((subCat: IItemSubCategoryEnum) => {
    devLog('toggleMetricsVisible', subCat, metricsVisibleSubCatRef.current);
    const res = {
      ...metricsVisibleSubCatRef.current,
      [subCat]: !metricsVisibleSubCatRef.current[subCat],
    };
    metricsVisibleSubCatRef.current = res;
  }, []);

  return {
    expandedRows,
    metricsVisibleSubCat: metricsVisibleSubCatRef.current,
    toggleRowExpanded,
    toggleMetricsVisible,
    setExpandedRows,
  };
};
