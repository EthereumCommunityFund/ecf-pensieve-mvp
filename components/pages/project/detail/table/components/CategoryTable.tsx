'use client';

import { cn } from '@heroui/react';
import { flexRender, Table } from '@tanstack/react-table';
import React, { FC } from 'react';

import {
  ExpandableRow,
  GroupHeader,
  groupTableRows,
  TableCell,
  TableCellSkeleton,
  TableFooter,
  TableHeader,
  TableRow,
  TableRowSkeleton,
} from '@/components/biz/table';
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
          headerGroup.headers.map((header: any, index: number) => (
            <TableHeader
              key={header.id}
              width={header.getSize()}
              isLast={index === headerGroup.headers.length - 1}
            >
              {header.isPlaceholder
                ? null
                : flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
            </TableHeader>
          )),
        )}
      </tr>
    </thead>
  );

  if (showSkeleton || noDataForThisTable) {
    return (
      <div className="overflow-hidden overflow-x-auto">
        <table className="box-border w-full table-fixed border-separate border-spacing-0">
          {colGroupDefinition}
          {tableHeaders}
          <tbody>
            {Array.from({ length: 3 }).map((_, rowIndex) => (
              <TableRowSkeleton
                key={`skeleton-row-${rowIndex}`}
                isLastRow={rowIndex === 2}
              >
                {table.getAllColumns().map((column: any, cellIndex: number) => (
                  <TableCellSkeleton
                    key={`skeleton-cell-${column.id}-${rowIndex}`}
                    width={column.getSize()}
                    isLast={cellIndex === table.getAllColumns().length - 1}
                    isLastRow={rowIndex === 2}
                    minHeight={60}
                    skeletonHeight={20}
                  />
                ))}
              </TableRowSkeleton>
            ))}
            <TableFooter colSpan={table.getAllColumns().length}>
              Loading...
            </TableFooter>
          </tbody>
        </table>
      </div>
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
    <div className="overflow-hidden overflow-x-auto">
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
                  className={cn(
                    expandedRows[row.original.key] ? 'bg-[#EBEBEB]' : '',
                  )}
                >
                  {row.getVisibleCells().map((cell: any, cellIndex: number) => (
                    <TableCell
                      key={cell.id}
                      width={cell.column.getSize()}
                      isLast={cellIndex === row.getVisibleCells().length - 1}
                      isLastRow={
                        rowIndex === nonEmptyRows.length - 1 &&
                        emptyRows.length === 0 &&
                        !AllItemConfig[row.original.key as IEssentialItemKey]
                          ?.showExpand
                      }
                      minHeight={60}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
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
              colSpan={table.getAllColumns().length}
            />
          )}

          {/* 渲染空数据行 */}
          {emptyRows.length > 0 &&
            isExpanded &&
            emptyRows.map((row: any, rowIndex: number) => (
              <React.Fragment key={`empty-${rowIndex}`}>
                <TableRow isLastRow={rowIndex === emptyRows.length - 1}>
                  {row.getVisibleCells().map((cell: any, cellIndex: number) => (
                    <TableCell
                      key={cell.id}
                      width={cell.column.getSize()}
                      isLast={cellIndex === row.getVisibleCells().length - 1}
                      isLastRow={rowIndex === emptyRows.length - 1}
                      minHeight={60}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
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
    </div>
  );
};
