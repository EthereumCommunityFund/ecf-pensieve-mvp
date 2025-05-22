'use client';

import { Skeleton } from '@heroui/react';
import { Table, flexRender } from '@tanstack/react-table';
import React from 'react';

import { AllItemConfig } from '@/constants/itemConfig';
import { cn } from '@/lib/utils';
import { IEssentialItemKey } from '@/types/item';

import { ITableProposalItem } from '../ProposalDetails';

import InputContentRenderer from './InputContentRenderer';

interface ProposalTableProps {
  table: Table<ITableProposalItem>;
  isLoading: boolean;
  isPageExpanded: boolean;
  expandedRows: Record<string, boolean>;
}

const ProposalTable: React.FC<ProposalTableProps> = ({
  table,
  isLoading,
  isPageExpanded,
  expandedRows,
}) => {
  const noDataForThisTable = table.options.data.length === 0;
  const showSkeleton = isLoading || noDataForThisTable;

  const colGroupDefinition = (
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
  );

  const tableHeaders = (
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
              className={`h-[30px] border-b border-r border-black/10 px-[10px] text-left
                text-[14px] font-[600] text-black/60
                ${index === headerGroup.headers.length - 1 ? 'border-r-0' : ''}
              `}
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
  );

  if (showSkeleton) {
    return (
      <div className="overflow-hidden overflow-x-auto rounded-b-[10px] border border-t-0 border-black/10">
        <table className="box-border w-full table-fixed border-separate border-spacing-0">
          {colGroupDefinition}
          {tableHeaders}
          <tbody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <tr key={`skeleton-row-${rowIndex}`}>
                {table.getAllColumns().map((column, cellIndex) => (
                  <td
                    key={`skeleton-cell-${column.id}-${rowIndex}`}
                    style={{
                      width: `${column.getSize()}px`,
                      boxSizing: 'border-box',
                    }}
                    className={` border-b border-r
                      border-black/10
                      ${cellIndex === table.getAllColumns().length - 1 ? 'border-r-0' : ''}
                      ${rowIndex === 4 ? 'border-b-0' : ''}
                    `}
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
      </div>
    );
  }

  return (
    <div className="overflow-hidden overflow-x-auto rounded-b-[10px] border border-t-0 border-black/10">
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
                  <td
                    key={cell.id}
                    style={{
                      width: `${cell.column.getSize()}px`,
                      boxSizing: 'border-box',
                    }}
                    className={cn(
                      'border-b border-r border-black/10 hover:bg-[#EBEBEB]',
                      cellIndex === row.getVisibleCells().length - 1
                        ? 'border-r-0'
                        : '',
                      rowIndex === table.getRowModel().rows.length - 1 &&
                        !expandedRows[row.original.key]
                        ? 'border-b-0'
                        : '',
                    )}
                  >
                    <div className="flex min-h-[60px] w-full items-center overflow-hidden whitespace-normal break-words px-[10px]">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {AllItemConfig[row.original.key as IEssentialItemKey]
                .showExpand && (
                <tr
                  key={`${row.id}-expanded`}
                  className={cn(expandedRows[row.original.key] ? '' : 'hidden')}
                >
                  <td
                    colSpan={row.getVisibleCells().length}
                    className={`border-b border-black/10 bg-[#E1E1E1] p-[10px] ${
                      rowIndex === table.getRowModel().rows.length - 1
                        ? 'border-b-0'
                        : ''
                    }`}
                  >
                    <div className="w-full overflow-hidden rounded-[10px] border border-black/10 bg-white text-[13px]">
                      <p className="p-[10px] font-[mona] text-[15px] leading-[20px] text-black">
                        <InputContentRenderer
                          value={row.original.input}
                          displayFormType={
                            AllItemConfig[row.original.key as IEssentialItemKey]
                              .formDisplayType
                          }
                        />
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProposalTable;
