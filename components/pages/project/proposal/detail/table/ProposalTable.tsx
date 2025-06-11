'use client';

import { Skeleton, cn } from '@heroui/react';
import { Table, flexRender } from '@tanstack/react-table';
import React, { useMemo } from 'react';

import { ExpandableRow, TableContainer } from '@/components/biz/table';
import OptimizedTableCell from '@/components/biz/table/OptimizedTableCell';

import { ITableProposalItem } from '../ProposalDetails';

interface ProposalTableProps {
  table: Table<ITableProposalItem>;
  isLoading: boolean;
  isPageExpanded: boolean;
  expandedRows: Record<string, boolean>;
  metricsVisible: boolean;
}

const ProposalTable: React.FC<ProposalTableProps> = ({
  table,
  isLoading,
  isPageExpanded,
  expandedRows,
  metricsVisible,
}) => {
  const noDataForThisTable = table.options.data.length === 0;
  const showSkeleton = isLoading || noDataForThisTable;

  const tableColumns = table.options.columns;
  const columnPinning = table.getState().columnPinning;

  const colGroupDefinition = useMemo(
    () => (
      <colgroup>
        {table.getAllColumns().map((column) => (
          <col
            key={column.id}
            style={{
              width: `${column.getSize()}px`,
            }}
          />
        ))}
      </colgroup>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table, tableColumns, columnPinning], // Ensure re-calc when column definitions or pinning state change
  );

  const tableHeaders = useMemo(
    () => (
      <thead>
        <tr className="bg-[#F5F5F5]">
          {table.getHeaderGroups().map((headerGroup) =>
            headerGroup.headers.map((header, index) => {
              const isPinned = header.column.getIsPinned();
              const pinnedPosition =
                isPinned === 'left'
                  ? header.column.getStart('left')
                  : isPinned === 'right'
                    ? header.column.getAfter('right')
                    : undefined;

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
                <th
                  key={header.id}
                  style={{
                    width: `${header.getSize()}px`,
                    boxSizing: 'border-box',
                    ...(isPinned === 'left' && { left: pinnedPosition }),
                    ...(isPinned === 'right' && { right: pinnedPosition }),
                    ...(isPinned && {
                      backgroundColor: 'rgba(245, 245, 245, 0.8)',
                      backdropFilter: 'blur(24px)',
                      position: 'sticky',
                      zIndex: 10,
                      // Add border only for the last left-pinned or first right-pinned column
                      ...(isLastLeftPinned && {
                        borderRight: '1px solid rgba(0, 0, 0, 0.1)',
                      }),
                      ...(isFirstRightPinned && {
                        borderLeft: '1px solid rgba(0, 0, 0, 0.1)',
                      }),
                    }),
                  }}
                  className={cn(
                    'h-[30px] border-b-0 border-l-0 px-[10px] text-left text-[14px] font-[600] text-black/60',
                    index === headerGroup.headers.length - 1
                      ? 'border-r-0'
                      : 'border-r border-black/10',
                    isPinned && 'sticky z-10',
                    isPinned === 'left' && 'shadow-[2px_0_4px_rgba(0,0,0,0.1)]',
                    isPinned === 'right' &&
                      'shadow-[-2px_0_4px_rgba(0,0,0,0.1)]',
                    // Remove right border only for left-pinned columns that are NOT the last one
                    isPinned === 'left' && !isLastLeftPinned && 'border-r-0',
                  )}
                >
                  <div className="flex items-center" style={{ width: '100%' }}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </div>
                </th>
              );
            }),
          )}
        </tr>
      </thead>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table, tableColumns, columnPinning],
  );

  if (showSkeleton) {
    return (
      <TableContainer
        bordered
        background="white"
        className="overflow-x-auto rounded-b-[10px] border-t-0"
      >
        <table className="box-border w-full table-fixed border-separate border-spacing-0">
          {colGroupDefinition}
          {tableHeaders}
          <tbody>
            {Array.from({ length: 10 }).map((_, rowIndex) => (
              <tr key={`skeleton-row-${rowIndex}`}>
                {table.getAllColumns().map((column, cellIndex) => {
                  const isPinned = column.getIsPinned();
                  const pinnedPosition =
                    isPinned === 'left'
                      ? column.getStart('left')
                      : isPinned === 'right'
                        ? column.getAfter('right')
                        : undefined;

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
                    <td
                      key={`skeleton-cell-${column.id}-${rowIndex}`}
                      style={{
                        width: `${column.getSize()}px`,
                        boxSizing: 'border-box',
                        ...(isPinned === 'left' && { left: pinnedPosition }),
                        ...(isPinned === 'right' && {
                          right: pinnedPosition,
                        }),
                        ...(isPinned && {
                          backgroundColor: '#F5F5F5',
                          position: 'sticky',
                          zIndex: 10,
                          // Add border only for the last left-pinned or first right-pinned column
                          ...(isLastLeftPinned && {
                            borderRight: '1px solid rgba(0, 0, 0, 0.1)',
                          }),
                          ...(isFirstRightPinned && {
                            borderLeft: '1px solid rgba(0, 0, 0, 0.1)',
                          }),
                        }),
                      }}
                      className={cn(
                        'border-l-0',
                        cellIndex === table.getAllColumns().length - 1
                          ? 'border-r-0'
                          : 'border-r border-black/10',
                        rowIndex === table.getRowModel().rows.length - 1
                          ? 'border-b-0'
                          : 'border-b border-black/10',
                        isPinned && 'sticky z-10',
                        isPinned === 'left' &&
                          'shadow-[2px_0_4px_rgba(0,0,0,0.1)]',
                        isPinned === 'right' &&
                          'shadow-[-2px_0_4px_rgba(0,0,0,0.1)]',
                        // Remove right border only for left-pinned columns that are NOT the last one
                        isPinned === 'left' &&
                          !isLastLeftPinned &&
                          'border-r-0',
                      )}
                    >
                      <div className="flex min-h-[60px] w-full items-center overflow-hidden whitespace-normal break-words px-[10px]">
                        <Skeleton className="h-[20px] w-full rounded" />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </TableContainer>
    );
  }

  return (
    <TableContainer
      bordered
      background="white"
      className="overflow-x-auto rounded-b-[10px] border-t-0"
    >
      <table
        className={cn(
          'box-border w-full border-separate border-spacing-0',
          // Always use table-fixed for consistent column widths
          'table-fixed',
        )}
      >
        {colGroupDefinition}
        {tableHeaders}
        <tbody>
          {table.getRowModel().rows.map((row, rowIndex) => (
            <React.Fragment key={rowIndex}>
              <tr
                className={cn(
                  'bg-white hover:bg-[#F5F5F5]',
                  expandedRows[row.original.key] ? 'bg-[#EBEBEB]' : '',
                )}
              >
                {row.getVisibleCells().map((cell, cellIndex) => {
                  const isPinned = cell.column.getIsPinned();
                  const pinnedPosition =
                    isPinned === 'left'
                      ? cell.column.getStart('left')
                      : isPinned === 'right'
                        ? cell.column.getAfter('right')
                        : undefined;

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
                        rowIndex === table.getRowModel().rows.length - 1
                      }
                      minHeight={60}
                      isContainerBordered={true}
                      className={cn(
                        isPinned && 'sticky z-10',
                        isPinned === 'left' &&
                          'shadow-[2px_0_4px_rgba(0,0,0,0.1)]',
                        isPinned === 'right' &&
                          'shadow-[-2px_0_4px_rgba(0,0,0,0.1)]',
                        // Remove right border only for left-pinned columns that are NOT the last one
                        isPinned === 'left' &&
                          !isLastLeftPinned &&
                          'border-r-0',
                      )}
                      style={{
                        ...(isPinned === 'left' && { left: pinnedPosition }),
                        ...(isPinned === 'right' && {
                          right: pinnedPosition,
                        }),
                        ...(isPinned && {
                          backgroundColor: '#F5F5F5',
                          position: 'sticky',
                          zIndex: 10,
                          // Add border only for the last left-pinned or first right-pinned column
                          ...(isLastLeftPinned && {
                            borderRight: '1px solid rgba(0, 0, 0, 0.1)',
                          }),
                          ...(isFirstRightPinned && {
                            borderLeft: '1px solid rgba(0, 0, 0, 0.1)',
                          }),
                        }),
                      }}
                    />
                  );
                })}
              </tr>

              <ExpandableRow
                rowId={row.id}
                itemKey={row.original.key}
                inputValue={row.original.input}
                isExpanded={expandedRows[row.original.key] || false}
                colSpan={row.getVisibleCells().length}
                isLastRow={rowIndex === table.getRowModel().rows.length - 1}
              />
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </TableContainer>
  );
};

ProposalTable.displayName = 'ProposalTable';

export default ProposalTable;
