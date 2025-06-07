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
            const isPinned = header.column.getIsPinned();
            const pinnedPosition =
              isPinned === 'left'
                ? header.column.getStart('left')
                : isPinned === 'right'
                  ? header.column.getAfter('right')
                  : undefined;

            return (
              <TableHeader
                key={header.id}
                width={header.getSize()}
                isLast={index === headerGroup.headers.length - 1}
                isContainerBordered={true}
                className={cn(
                  isPinned && 'sticky z-10',
                  isPinned === 'left' && 'shadow-[2px_0_4px_rgba(0,0,0,0.1)]',
                  isPinned === 'right' && 'shadow-[-2px_0_4px_rgba(0,0,0,0.1)]',
                  'border-b border-t',
                )}
                style={{
                  ...(isPinned === 'left' && { left: pinnedPosition }),
                  ...(isPinned === 'right' && { right: pinnedPosition }),
                  ...(isPinned && {
                    backgroundColor: 'rgba(245, 245, 245, 0.8)',
                    backdropFilter: 'blur(24px)',
                    borderRight:
                      isPinned === 'left'
                        ? '1px solid rgba(0, 0, 0, 0.1)'
                        : undefined,
                    borderLeft:
                      isPinned === 'right'
                        ? '1px solid rgba(0, 0, 0, 0.1)'
                        : undefined,
                  }),
                }}
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
                  const isPinned = column.getIsPinned();
                  const pinnedPosition =
                    isPinned === 'left'
                      ? column.getStart('left')
                      : isPinned === 'right'
                        ? column.getAfter('right')
                        : undefined;

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
                      )}
                      style={{
                        ...(isPinned === 'left' && { left: pinnedPosition }),
                        ...(isPinned === 'right' && { right: pinnedPosition }),
                      }}
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
    <PageTableContainer className="mt-px overflow-x-auto rounded-b-[10px] border-x border-b border-black/10 bg-white">
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
                    const isPinned = cell.column.getIsPinned();
                    const pinnedPosition =
                      isPinned === 'left'
                        ? cell.column.getStart('left')
                        : isPinned === 'right'
                          ? cell.column.getAfter('right')
                          : undefined;

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
                          isPinned && 'sticky z-10',
                          isPinned === 'left' &&
                            'shadow-[2px_0_4px_rgba(0,0,0,0.1)]',
                          isPinned === 'right' &&
                            'shadow-[-2px_0_4px_rgba(0,0,0,0.1)]',
                        )}
                        style={{
                          ...(isPinned === 'left' && { left: pinnedPosition }),
                          ...(isPinned === 'right' && {
                            right: pinnedPosition,
                          }),
                          ...(isPinned && {
                            backgroundColor: '#F5F5F5',
                            borderRight:
                              isPinned === 'left'
                                ? '1px solid rgba(0, 0, 0, 0.1)'
                                : undefined,
                            borderLeft:
                              isPinned === 'right'
                                ? '1px solid rgba(0, 0, 0, 0.1)'
                                : undefined,
                          }),
                        }}
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
                    const isPinned = cell.column.getIsPinned();
                    const pinnedPosition =
                      isPinned === 'left'
                        ? cell.column.getStart('left')
                        : isPinned === 'right'
                          ? cell.column.getAfter('right')
                          : undefined;

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
                          isPinned && 'sticky z-10',
                          isPinned === 'left' &&
                            'shadow-[2px_0_4px_rgba(0,0,0,0.1)]',
                          isPinned === 'right' &&
                            'shadow-[-2px_0_4px_rgba(0,0,0,0.1)]',
                        )}
                        style={{
                          ...(isPinned === 'left' && { left: pinnedPosition }),
                          ...(isPinned === 'right' && {
                            right: pinnedPosition,
                          }),
                          ...(isPinned && {
                            backgroundColor: '#F5F5F5',
                            borderRight:
                              isPinned === 'left'
                                ? '2px solid rgba(0, 0, 0, 0.1)'
                                : undefined,
                            borderLeft:
                              isPinned === 'right'
                                ? '2px solid rgba(0, 0, 0, 0.1)'
                                : undefined,
                          }),
                        }}
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
