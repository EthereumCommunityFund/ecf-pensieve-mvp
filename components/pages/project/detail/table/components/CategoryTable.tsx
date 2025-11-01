'use client';

import { cn, ScrollShadow } from '@heroui/react';
import { flexRender, Table } from '@tanstack/react-table';
import React, { FC } from 'react';

import {
  ExpandableRow,
  GroupHeader,
  groupTableRows,
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
  pendingFilter?: boolean;
  emptyFilter?: boolean;
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
  pendingFilter = false,
  emptyFilter = false,
}) => {
  const showSkeleton = isLoading || !project;
  const noDataForThisTable = table.options.data.length === 0;
  const isFilterActive = pendingFilter || emptyFilter;

  // Create stable pinned column styles and position calculations
  // Use useMemo to stabilize columnPinningState, avoiding re-fetching on every render
  const leftColumns = JSON.stringify(table.getState().columnPinning.left || []);
  const rightColumns = JSON.stringify(
    table.getState().columnPinning.right || [],
  );
  const columnPinningState = React.useMemo(() => {
    const state = table.getState().columnPinning;
    return {
      left: state.left || [],
      right: state.right || [],
    };
  }, [
    // Use serialized values as dependencies to avoid re-renders caused by object reference changes
    leftColumns,
    rightColumns,
  ]);

  // Pre-calculate all column positions using more stable calculation methods
  const pinnedPositionsMap = React.useMemo(() => {
    const positions = new Map();

    const leftColumns = columnPinningState.left || [];
    const rightColumns = columnPinningState.right || [];
    const allColumns = table.getAllColumns();

    // 🔑 Key optimization: Use more stable column lookup and size retrieval methods
    const getColumnSize = (columnId: string) => {
      const column = allColumns.find((col: any) => col.id === columnId);
      return column ? column.getSize() : 0;
    };

    // Calculate cumulative positions for left-pinned columns
    let leftOffset = 0;
    leftColumns.forEach((columnId) => {
      positions.set(`${columnId}-left`, leftOffset);
      leftOffset += getColumnSize(columnId);
    });

    // Calculate cumulative positions for right-pinned columns (from right to left)
    let rightOffset = 0;
    [...rightColumns].reverse().forEach((columnId) => {
      positions.set(`${columnId}-right`, rightOffset);
      rightOffset += getColumnSize(columnId);
    });

    return positions;
  }, [columnPinningState.left, columnPinningState.right, table]);

  // Check if column is pinned, completely avoiding TanStack's getIsPinned method
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

  // Get stable position values, completely avoiding TanStack's internal methods
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

  // Create completely stable pinned style calculation function
  const getPinnedStyles = React.useCallback(
    (
      columnId: string,
      isLastLeftPinned: boolean,
      isFirstRightPinned: boolean,
    ) => {
      const pinStatus = getColumnPinStatus(columnId);
      if (!pinStatus) return {};

      const position = getPinnedPosition(columnId);

      // Use fixed style objects to avoid dynamic creation
      const baseStyles = {
        position: 'sticky' as const,
        zIndex: 15,
        backgroundColor: '#F5F5F5',
        // Ensure borders render correctly
        boxSizing: 'border-box' as const,
        // 🔑 Fix: Don't set width, let each column maintain its original width
        // width, minWidth, maxWidth should be controlled by settings in column definition
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
            minWidth: `${column.getSize()}px`,
            maxWidth: `${column.getSize()}px`,
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
            const columnPinning = columnPinningState;
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

  if (showSkeleton && !isFilterActive) {
    // Show loading skeleton only when actually loading and no filters active
    return (
      <ScrollShadow
        className="rounded-b-[10px] border-x border-black/10 bg-white"
        orientation="horizontal"
      >
        <table
          className="box-border w-full border-separate border-spacing-0"
          style={{ minWidth: 'max-content' }}
        >
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
                  const columnPinning = columnPinningState;
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
      </ScrollShadow>
    );
  }

  // Handle filtered empty state
  if (noDataForThisTable && isFilterActive && !showSkeleton) {
    return (
      <ScrollShadow
        className="rounded-b-[10px] border-x border-black/10 bg-white"
        orientation="horizontal"
      >
        <table
          className="box-border w-full border-separate border-spacing-0"
          style={{ minWidth: 'max-content' }}
        >
          {colGroupDefinition}
          {tableHeaders}
          <tbody>
            <tr>
              <td
                colSpan={table.getAllColumns().length}
                className="border-b border-black/10 px-[20px] py-[60px] text-center text-[14px] text-black/50"
              >
                {emptyFilter
                  ? 'No empty items found in this category'
                  : pendingFilter
                    ? 'No pending items found in this category'
                    : 'No items found'}
              </td>
            </tr>
          </tbody>
        </table>
      </ScrollShadow>
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
    <ScrollShadow
      className={cn(
        'mt-px rounded-b-[10px] border-x border-b border-black/10 bg-white',
      )}
      orientation="horizontal"
    >
      <table
        className="box-border w-full border-separate border-spacing-0"
        style={{ minWidth: 'max-content' }}
      >
        {colGroupDefinition}
        {tableHeaders}
        <tbody>
          {/* Render grouped non-empty data rows */}
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
                  className={cn(
                    row.original.isPendingValidation && 'bg-[#7EA9FF]/10',
                    // expandedRows[row.original.key] ? 'bg-[#EBEBEB]' : '',
                  )}
                >
                  {row.getVisibleCells().map((cell: any, cellIndex: number) => {
                    const isPinned = getColumnPinStatus(cell.column.id);

                    // Check if this is the last left-pinned column or first right-pinned column
                    const columnPinning = columnPinningState;
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

          {/* Render empty data group header row */}
          {subCategoryKey && (
            <EmptyItemsGroup
              subCategoryKey={subCategoryKey}
              emptyItemsCount={emptyItemsCount}
              isExpanded={isExpanded}
              onToggle={onToggleEmptyItems}
              table={table}
            />
          )}

          {/* Render empty data rows */}
          {emptyRows.length > 0 &&
            isExpanded &&
            emptyRows.map((row: any, rowIndex: number) => (
              <React.Fragment key={`empty-${rowIndex}`}>
                <TableRow isLastRow={rowIndex === emptyRows.length - 1}>
                  {row.getVisibleCells().map((cell: any, cellIndex: number) => {
                    const isPinned = getColumnPinStatus(cell.column.id);

                    // Check if this is the last left-pinned column or first right-pinned column
                    const columnPinning = columnPinningState;
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
    </ScrollShadow>
  );
};
