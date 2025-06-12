'use client';

import { cn } from '@heroui/react';
import { flexRender, Table } from '@tanstack/react-table';
import React, { FC } from 'react';

import {
  ExpandableRow,
  GroupHeader,
  groupTableRows,
  PageTableContainer,
  TableCellSkeleton,
  TableFooter,
  TableHeader,
  TableRow,
  TableRowSkeleton,
} from '@/components/biz/table';
import OptimizedTableCell from '@/components/biz/table/OptimizedTableCell';
import { AllItemConfig } from '@/constants/itemConfig';
import { IEssentialItemKey, IItemSubCategoryEnum } from '@/types/item';

import { IKeyItemDataForTable } from '../ProjectDetailTableColumns';

import { EmptyItemsGroup } from './EmptyItemsGroup';

interface CategoryTableProps {
  table: Table<IKeyItemDataForTable>;
  isLoading?: boolean;
  subCategoryKey?: IItemSubCategoryEnum;
  expandedRows: Record<string, boolean>;
  emptyItemsExpanded: Record<IItemSubCategoryEnum, boolean>;
  groupExpanded: Record<string, boolean>;
  emptyItemsCount: number;
  project?: any;
  onToggleEmptyItems: (category: IItemSubCategoryEnum) => void;
  onToggleGroupExpanded: (groupKey: string) => void;
}

/**
 * Pure UI component for rendering a single category table
 * Handles table structure, grouping, expandable rows, and empty items
 */
export const CategoryTable: FC<CategoryTableProps> = ({
  table,
  isLoading = false,
  subCategoryKey,
  expandedRows,
  emptyItemsExpanded,
  groupExpanded,
  emptyItemsCount,
  project,
  onToggleEmptyItems,
  onToggleGroupExpanded,
}) => {
  const showSkeleton = isLoading || !project;
  const noDataForThisTable = table.options.data.length === 0;

  // 创建稳定的pinned列样式和位置计算
  const columnPinningState = table.getState().columnPinning;

  // 预计算所有列的位置，使用更稳定的计算方法
  const pinnedPositionsMap = React.useMemo(() => {
    const positions = new Map();

    const leftColumns = columnPinningState.left || [];
    const rightColumns = columnPinningState.right || [];
    const allColumns = table.getAllColumns();

    // 🔑 关键优化：使用更稳定的列查找和大小获取方法
    const getColumnSize = (columnId: string) => {
      const column = allColumns.find((col: any) => col.id === columnId);
      return column ? column.getSize() : 0;
    };

    // 为左侧固定列计算累积位置
    let leftOffset = 0;
    leftColumns.forEach((columnId) => {
      positions.set(`${columnId}-left`, leftOffset);
      leftOffset += getColumnSize(columnId);
    });

    // 为右侧固定列计算累积位置（从右向左）
    let rightOffset = 0;
    [...rightColumns].reverse().forEach((columnId) => {
      positions.set(`${columnId}-right`, rightOffset);
      rightOffset += getColumnSize(columnId);
    });

    return positions;
  }, [
    // 更精确的依赖项：只依赖必要的状态变化
    JSON.stringify(columnPinningState.left || []),
    JSON.stringify(columnPinningState.right || []),
    // 使用稳定的列大小字符串
    table
      .getAllColumns()
      .filter((c) =>
        [
          ...(columnPinningState.left || []),
          ...(columnPinningState.right || []),
        ].includes(c.id),
      )
      .map((c) => `${c.id}:${c.getSize()}`)
      .join(','),
  ]);

  // 检查列是否被固定，完全避免使用TanStack的getIsPinned方法
  const getColumnPinStatus = React.useCallback(
    (columnId: string) => {
      const leftColumns = columnPinningState.left || [];
      const rightColumns = columnPinningState.right || [];

      if (leftColumns.includes(columnId)) return 'left';
      if (rightColumns.includes(columnId)) return 'right';
      return false;
    },
    [columnPinningState],
  );

  // 获取稳定的位置值，完全避免TanStack的内部方法
  const getPinnedPosition = React.useCallback(
    (columnId: string) => {
      const pinStatus = getColumnPinStatus(columnId);
      if (!pinStatus) return 0;

      const key = `${columnId}-${pinStatus}`;
      const position = pinnedPositionsMap.get(key);
      const finalPosition = position !== undefined ? position : 0;

      return finalPosition;
    },
    [pinnedPositionsMap, getColumnPinStatus],
  );

  // 创建完全稳定的pinned样式计算函数
  const getPinnedStyles = React.useCallback(
    (
      columnId: string,
      isLastLeftPinned: boolean,
      isFirstRightPinned: boolean,
    ) => {
      const pinStatus = getColumnPinStatus(columnId);
      if (!pinStatus) return {};

      const position = getPinnedPosition(columnId);

      // 使用固定的样式对象，避免动态创建
      const baseStyles = {
        position: 'sticky' as const,
        zIndex: 15,
        backgroundColor: '#F5F5F5',
        // 确保边框正确渲染
        boxSizing: 'border-box' as const,
        // 🔑 修复：不设置宽度，让每列保持自己的原始宽度
        // width、minWidth、maxWidth 应该由 column definition 中的设置来控制
      };

      const positionStyle = {
        [pinStatus]: `${position}px`,
      };

      const borderStyle = {
        ...(pinStatus === 'left' &&
          isLastLeftPinned && {
            borderRight: '1px solid rgba(0, 0, 0, 0.1)',
          }),
        ...(pinStatus === 'right' &&
          isFirstRightPinned && {
            borderLeft: '1px solid rgba(0, 0, 0, 0.1)',
          }),
      };

      return {
        ...baseStyles,
        ...positionStyle,
        ...borderStyle,
      };
    },
    [getColumnPinStatus, getPinnedPosition],
  );

  const colGroupDefinition = (
    <colgroup>
      {table.getAllColumns().map((column: any) => (
        <col
          key={column.id}
          style={{
            width: `${column.getSize()}px`,
          }}
        />
      ))}
    </colgroup>
  );

  const tableHeaders = (
    <thead>
      <tr className="bg-[#F5F5F5]">
        {table.getHeaderGroups().map((headerGroup: any) =>
          headerGroup.headers.map((header: any, index: number) => {
            const isPinned = getColumnPinStatus(header.column.id);

            // Check if this is the last left-pinned column or first right-pinned column
            const columnPinning = table.getState().columnPinning;
            const leftPinnedColumns = columnPinning.left || [];
            const rightPinnedColumns = columnPinning.right || [];
            const isLastLeftPinned =
              isPinned === 'left' &&
              leftPinnedColumns[leftPinnedColumns.length - 1] ===
                header.column.id;
            const isFirstRightPinned =
              isPinned === 'right' &&
              rightPinnedColumns[0] === header.column.id;

            return (
              <TableHeader
                key={header.id}
                width={header.getSize()}
                isLast={index === headerGroup.headers.length - 1}
                isContainerBordered={true}
                className={cn(
                  'border-b border-t border-black/10',
                  // Remove right border only for left-pinned columns that are NOT the last one
                  isPinned === 'left' && !isLastLeftPinned && 'border-r-0',
                )}
                style={getPinnedStyles(
                  header.column.id,
                  isLastLeftPinned,
                  isFirstRightPinned,
                )}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </TableHeader>
            );
          }),
        )}
      </tr>
    </thead>
  );

  if (showSkeleton || noDataForThisTable) {
    return (
      <PageTableContainer className="overflow-x-auto rounded-b-[10px] border-x border-black/10 bg-white">
        <table className="box-border w-full table-fixed border-separate border-spacing-0">
          {colGroupDefinition}
          {tableHeaders}
          <tbody>
            {Array.from({ length: 10 }).map((_, rowIndex) => (
              <TableRowSkeleton
                key={`skeleton-row-${rowIndex}`}
                isLastRow={rowIndex === 2}
              >
                {table.getAllColumns().map((column: any, cellIndex: number) => {
                  const isPinned = getColumnPinStatus(column.id);

                  // Check if this is the last left-pinned column or first right-pinned column
                  const columnPinning = table.getState().columnPinning;
                  const leftPinnedColumns = columnPinning.left || [];
                  const rightPinnedColumns = columnPinning.right || [];
                  const isLastLeftPinned =
                    isPinned === 'left' &&
                    leftPinnedColumns[leftPinnedColumns.length - 1] ===
                      column.id;
                  const isFirstRightPinned =
                    isPinned === 'right' && rightPinnedColumns[0] === column.id;

                  return (
                    <TableCellSkeleton
                      key={`skeleton-cell-${column.id}-${rowIndex}`}
                      width={column.getSize()}
                      isLast={cellIndex === table.getAllColumns().length - 1}
                      isLastRow={rowIndex === 2}
                      isContainerBordered={true}
                      minHeight={60}
                      skeletonHeight={20}
                      className={cn(
                        isPinned && 'sticky z-10 bg-white',
                        isPinned === 'left' &&
                          'shadow-[2px_0_4px_rgba(0,0,0,0.1)]',
                        isPinned === 'right' &&
                          'shadow-[-2px_0_4px_rgba(0,0,0,0.1)]',
                        // Remove right border only for left-pinned columns that are NOT the last one
                        isPinned === 'left' &&
                          !isLastLeftPinned &&
                          'border-r-0',
                      )}
                      style={getPinnedStyles(
                        column.id,
                        isLastLeftPinned,
                        isFirstRightPinned,
                      )}
                    />
                  );
                })}
              </TableRowSkeleton>
            ))}
            <TableFooter colSpan={table.getAllColumns().length}>
              Loading...
            </TableFooter>
          </tbody>
        </table>
      </PageTableContainer>
    );
  }

  const rows = table.getRowModel().rows;
  const nonEmptyRows = rows.filter(
    (row: any) => !(row.original as any).isEmptyItem,
  );
  const emptyRows = rows.filter(
    (row: any) => (row.original as any).isEmptyItem,
  );
  const isExpanded = subCategoryKey
    ? emptyItemsExpanded[subCategoryKey]
    : false;

  // Apply grouping to non-empty rows
  const groupedNonEmptyRows = groupTableRows(
    nonEmptyRows.map((row: any) => ({
      ...row,
      group: row.original.group,
      groupTitle: row.original.groupTitle,
    })),
    groupExpanded,
  );

  return (
    <PageTableContainer
      className="mt-px rounded-b-[10px] border-x border-b border-black/10 bg-white"
      style={{
        overflowX: 'auto',
        // 确保 sticky 定位正常工作的容器设置
        position: 'relative',
        isolation: 'isolate',
      }}
    >
      <table className="box-border w-full table-fixed border-separate border-spacing-0">
        {colGroupDefinition}
        {tableHeaders}
        <tbody>
          {/* 渲染分组的非空数据行 */}
          {groupedNonEmptyRows.map((item: any, itemIndex: number) => {
            // Check if this is a group header
            if ('isGroupHeader' in item) {
              return (
                <GroupHeader
                  key={`group-${item.group}-${itemIndex}`}
                  title={item.groupTitle}
                  colSpan={table.getAllColumns().length}
                  isExpanded={item.isExpanded}
                  onToggle={() => onToggleGroupExpanded(item.group)}
                  isClickable={true}
                />
              );
            }

            // This is a regular row
            const row = item;
            const rowIndex = nonEmptyRows.findIndex(
              (r: any) => r.id === row.id,
            );

            return (
              <React.Fragment key={rowIndex}>
                <TableRow
                  isLastRow={
                    rowIndex === nonEmptyRows.length - 1 &&
                    emptyRows.length === 0 &&
                    !AllItemConfig[row.original.key as IEssentialItemKey]
                      ?.showExpand
                  }
                  className={
                    cn()
                    // expandedRows[row.original.key] ? 'bg-[#EBEBEB]' : '',
                  }
                >
                  {row.getVisibleCells().map((cell: any, cellIndex: number) => {
                    const isPinned = getColumnPinStatus(cell.column.id);

                    // Check if this is the last left-pinned column or first right-pinned column
                    const columnPinning = table.getState().columnPinning;
                    const leftPinnedColumns = columnPinning.left || [];
                    const rightPinnedColumns = columnPinning.right || [];
                    const isLastLeftPinned =
                      isPinned === 'left' &&
                      leftPinnedColumns[leftPinnedColumns.length - 1] ===
                        cell.column.id;
                    const isFirstRightPinned =
                      isPinned === 'right' &&
                      rightPinnedColumns[0] === cell.column.id;

                    return (
                      <OptimizedTableCell
                        key={cell.id}
                        cell={cell}
                        cellIndex={cellIndex}
                        width={cell.column.getSize()}
                        isLast={cellIndex === row.getVisibleCells().length - 1}
                        isLastRow={
                          rowIndex === nonEmptyRows.length - 1 &&
                          emptyRows.length === 0 &&
                          !AllItemConfig[row.original.key as IEssentialItemKey]
                            ?.showExpand
                        }
                        isContainerBordered={true}
                        minHeight={60}
                        className={cn(
                          // Remove right border only for left-pinned columns that are NOT the last one
                          isPinned === 'left' &&
                            !isLastLeftPinned &&
                            'border-r-0',
                        )}
                        style={getPinnedStyles(
                          cell.column.id,
                          isLastLeftPinned,
                          isFirstRightPinned,
                        )}
                      />
                    );
                  })}
                </TableRow>

                <ExpandableRow
                  rowId={row.id}
                  itemKey={row.original.key}
                  inputValue={row.original.input}
                  isExpanded={expandedRows[row.original.key] || false}
                  colSpan={row.getVisibleCells().length}
                  isLastRow={
                    rowIndex === nonEmptyRows.length - 1 &&
                    emptyRows.length === 0
                  }
                />
              </React.Fragment>
            );
          })}

          {/* 渲染空数据分组标题行 */}
          {subCategoryKey && (
            <EmptyItemsGroup
              subCategoryKey={subCategoryKey}
              emptyItemsCount={emptyItemsCount}
              isExpanded={isExpanded}
              onToggle={onToggleEmptyItems}
              table={table}
            />
          )}

          {/* 渲染空数据行 */}
          {emptyRows.length > 0 &&
            isExpanded &&
            emptyRows.map((row: any, rowIndex: number) => (
              <React.Fragment key={`empty-${rowIndex}`}>
                <TableRow isLastRow={rowIndex === emptyRows.length - 1}>
                  {row.getVisibleCells().map((cell: any, cellIndex: number) => {
                    const isPinned = getColumnPinStatus(cell.column.id);

                    // Check if this is the last left-pinned column or first right-pinned column
                    const columnPinning = table.getState().columnPinning;
                    const leftPinnedColumns = columnPinning.left || [];
                    const rightPinnedColumns = columnPinning.right || [];
                    const isLastLeftPinned =
                      isPinned === 'left' &&
                      leftPinnedColumns[leftPinnedColumns.length - 1] ===
                        cell.column.id;
                    const isFirstRightPinned =
                      isPinned === 'right' &&
                      rightPinnedColumns[0] === cell.column.id;

                    return (
                      <OptimizedTableCell
                        key={cell.id}
                        cell={cell}
                        cellIndex={cellIndex}
                        width={cell.column.getSize()}
                        isLast={cellIndex === row.getVisibleCells().length - 1}
                        isLastRow={rowIndex === emptyRows.length - 1}
                        isContainerBordered={true}
                        minHeight={60}
                        className={cn(
                          // Remove right border only for left-pinned columns that are NOT the last one
                          isPinned === 'left' &&
                            !isLastLeftPinned &&
                            'border-r-0',
                        )}
                        style={getPinnedStyles(
                          cell.column.id,
                          isLastLeftPinned,
                          isFirstRightPinned,
                        )}
                      />
                    );
                  })}
                </TableRow>

                <ExpandableRow
                  rowId={`empty-${row.id}`}
                  itemKey={row.original.key}
                  inputValue={row.original.input}
                  isExpanded={expandedRows[row.original.key] || false}
                  colSpan={row.getVisibleCells().length}
                  isLastRow={rowIndex === emptyRows.length - 1}
                />
              </React.Fragment>
            ))}
        </tbody>
      </table>
    </PageTableContainer>
  );
};
