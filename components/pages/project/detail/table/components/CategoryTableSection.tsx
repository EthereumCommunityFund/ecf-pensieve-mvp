'use client';

import { Table } from '@tanstack/react-table';
import { FC } from 'react';

import CategoryHeader from '@/components/pages/project/proposal/detail/table/CategoryHeader';
import { IItemSubCategoryEnum } from '@/types/item';

import { IKeyItemDataForTable } from '../ProjectDetailTableColumns';

import { CategoryTable } from './CategoryTable';

interface CategoryTableSectionProps {
  subCategory: {
    key: IItemSubCategoryEnum;
    title: string;
    description?: string;
  };
  table: Table<IKeyItemDataForTable>;
  isLoading: boolean;
  expanded: Record<IItemSubCategoryEnum, boolean>;
  expandedRows: Record<string, boolean>;
  emptyItemsExpanded: Record<IItemSubCategoryEnum, boolean>;
  groupExpanded: Record<string, boolean>;
  emptyItemsCount: number;
  project?: any;
  categoryRef: (el: HTMLDivElement | null) => void;
  onToggleCategory: (category: IItemSubCategoryEnum) => void;
  onToggleEmptyItems: (category: IItemSubCategoryEnum) => void;
  onToggleGroupExpanded: (groupKey: string) => void;
  metricsVisible?: boolean;
  onToggleMetrics?: () => void;
}

/**
 * Component for rendering a complete category table section
 * Includes category header and table with all functionality
 */
export const CategoryTableSection: FC<CategoryTableSectionProps> = ({
  subCategory,
  table,
  isLoading,
  expanded,
  expandedRows,
  emptyItemsExpanded,
  groupExpanded,
  emptyItemsCount,
  project,
  categoryRef,
  onToggleCategory,
  onToggleEmptyItems,
  onToggleGroupExpanded,
  metricsVisible,
  onToggleMetrics,
}) => {
  // 动画样式
  const getAnimationStyle = (isExpanded: boolean) => ({
    height: isExpanded ? 'auto' : '0',
    opacity: isExpanded ? 1 : 0,
    overflow: 'hidden',
    transition: 'opacity 0.2s ease',
    transform: isExpanded ? 'translateY(0)' : 'translateY(-10px)',
    transformOrigin: 'top',
    transitionProperty: 'opacity, transform',
    transitionDuration: '0.2s',
  });

  return (
    <div key={subCategory.key} ref={categoryRef}>
      <CategoryHeader
        title={subCategory.title}
        description={subCategory.description || ''}
        category={subCategory.key}
        isExpanded={expanded[subCategory.key]}
        onToggle={() => onToggleCategory(subCategory.key)}
        metricsVisible={metricsVisible}
        onToggleMetrics={onToggleMetrics}
      />
      <div style={getAnimationStyle(expanded[subCategory.key])}>
        <CategoryTable
          table={table}
          isLoading={isLoading}
          subCategoryKey={subCategory.key}
          expandedRows={expandedRows}
          emptyItemsExpanded={emptyItemsExpanded}
          groupExpanded={groupExpanded}
          emptyItemsCount={emptyItemsCount}
          project={project}
          onToggleEmptyItems={onToggleEmptyItems}
          onToggleGroupExpanded={onToggleGroupExpanded}
        />
      </div>
    </div>
  );
};
