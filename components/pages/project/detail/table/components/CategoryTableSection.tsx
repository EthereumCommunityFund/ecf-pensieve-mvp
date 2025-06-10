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
  onToggleAllRowsInCategory: (categoryRows: string[]) => void;
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
  onToggleAllRowsInCategory,
  metricsVisible,
  onToggleMetrics,
}) => {
  // 获取当前分类下所有行的 key
  const getCategoryRowKeys = () => {
    return table.getRowModel().rows.map((row) => row.original.key);
  };

  // 检查当前分类下是否有任何行已展开
  const hasExpandedRows = () => {
    const rowKeys = getCategoryRowKeys();
    return rowKeys.some((rowKey) => expandedRows[rowKey]);
  };

  return (
    <div key={subCategory.key} ref={categoryRef} className="scroll-mt-[140px]">
      <CategoryHeader
        title={subCategory.title}
        description={subCategory.description || ''}
        category={subCategory.key}
        isExpanded={hasExpandedRows()}
        onToggle={() => onToggleAllRowsInCategory(getCategoryRowKeys())}
        metricsVisible={metricsVisible}
        onToggleMetrics={onToggleMetrics}
      />
      <div>
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
