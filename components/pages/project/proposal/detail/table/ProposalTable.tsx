'use client';

import { Skeleton, cn } from '@heroui/react';
import { Table, flexRender } from '@tanstack/react-table';
import React, { memo, useMemo } from 'react';

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

const ProposalTable: React.FC<ProposalTableProps> = memo(
  ({ table, isLoading, isPageExpanded, expandedRows, metricsVisible }) => {
    const noDataForThisTable = table.options.data.length === 0;
    const showSkeleton = isLoading || noDataForThisTable;

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
      [table, table.options.columns], // Ensure re-calc when column definitions change
    );

    const tableHeaders = useMemo(
      () => (
        <thead>
          <tr className="bg-[#F5F5F5]">
            {table.getHeaderGroups().map((headerGroup) =>
              headerGroup.headers.map((header, index) => (
                <th
                  key={header.id}
                  style={{
                    width: `${header.getSize()}px`,
                    boxSizing: 'border-box',
                  }}
                  className={cn(
                    'h-[30px] border-b-0 border-l-0 px-[10px] text-left text-[14px] font-[600] text-black/60',
                    index === headerGroup.headers.length - 1
                      ? 'border-r-0'
                      : 'border-r border-black/10',
                  )}
                >
                  <div
                    className="flex items-center"
                    style={{ width: '100%', overflow: 'hidden' }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </div>
                </th>
              )),
            )}
          </tr>
        </thead>
      ),
      [table, table.options.columns], // Ensure re-calc when column definitions change
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
                  {table.getAllColumns().map((column, cellIndex) => (
                    <td
                      key={`skeleton-cell-${column.id}-${rowIndex}`}
                      style={{
                        width: `${column.getSize()}px`,
                        boxSizing: 'border-box',
                      }}
                      className={cn(
                        'border-l-0',
                        cellIndex === table.getAllColumns().length - 1
                          ? 'border-r-0'
                          : 'border-r border-black/10',
                        rowIndex === table.getRowModel().rows.length - 1
                          ? 'border-b-0'
                          : 'border-b border-black/10',
                      )}
                    >
                      <div className="flex min-h-[60px] w-full items-center overflow-hidden whitespace-normal break-words px-[10px]">
                        <Skeleton className="h-[20px] w-full rounded" />
                      </div>
                    </td>
                  ))}
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
            'box-border w-full  border-separate border-spacing-0',
            isPageExpanded ? '' : 'table-fixed',
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
                  {row.getVisibleCells().map((cell, cellIndex) => (
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
                    />
                  ))}
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
  },
  (prevProps, nextProps) => {
    return (
      prevProps.table === nextProps.table &&
      prevProps.isLoading === nextProps.isLoading &&
      prevProps.isPageExpanded === nextProps.isPageExpanded &&
      prevProps.metricsVisible === nextProps.metricsVisible &&
      JSON.stringify(prevProps.expandedRows) ===
        JSON.stringify(nextProps.expandedRows)
    );
  },
);

ProposalTable.displayName = 'ProposalTable';

export default ProposalTable;
