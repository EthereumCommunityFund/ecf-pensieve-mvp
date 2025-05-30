import { cn } from '@heroui/react';
import { ColumnDef, flexRender, Table } from '@tanstack/react-table';
import React from 'react';

import { AllItemConfig } from '@/constants/itemConfig';
import { IPocItemKey } from '@/types/item';

import { TableCell } from './Cell';
import { TableHeader } from './Header';
import InputContentRenderer from './InputContentRenderer';
import { TableRow } from './Row';
import { TableRowOfEditReason } from './RowOfEditReason';

export interface IBaeTableRow {
  key: IPocItemKey;
  value: any;
  reference?: string;
  reason?: string;
}

export interface ITableRowRendererProps<
  TRowData extends IBaeTableRow,
  TValue = unknown,
> {
  tableInstance: Table<TRowData>;
  columns: ColumnDef<TRowData, TValue>[];
  expandedRows: Partial<Record<IPocItemKey, boolean>>;
}

const BaseTableRenderer = <TRowData extends IBaeTableRow, TValue = unknown>({
  tableInstance,
  columns,
  expandedRows,
}: ITableRowRendererProps<TRowData, TValue>): React.ReactElement => {
  return (
    <table className="w-full border-separate border-spacing-0">
      <thead>
        {tableInstance.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} className="bg-[#F5F5F5]">
            {headerGroup.headers.map((header, index) => (
              <TableHeader
                key={header.id}
                width={header.getSize()}
                isLast={index === headerGroup.headers.length - 1}
                className="h-auto border-b border-l-0 border-r border-black/10 bg-[#F5F5F5] px-2.5 py-3"
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </TableHeader>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {tableInstance.getRowModel().rows.map((row, rowIndex) => {
          const { key, reason } = row.original;
          const itemConfig = AllItemConfig[key as IPocItemKey];
          return (
            <React.Fragment key={row.id}>
              <TableRow
                isLastRow={
                  rowIndex === tableInstance.getRowModel().rows.length - 1 &&
                  !itemConfig?.showExpand &&
                  !reason
                }
                className={cn(
                  expandedRows[row.original.key as IPocItemKey]
                    ? 'bg-[#EBEBEB]'
                    : '',
                )}
              >
                {row.getVisibleCells().map((cell, cellIndex) => (
                  <TableCell
                    key={cell.id}
                    width={
                      cell.column.getSize() === 0
                        ? undefined
                        : cell.column.getSize()
                    }
                    isLast={cellIndex === row.getVisibleCells().length - 1}
                    isLastRow={
                      rowIndex ===
                        tableInstance.getRowModel().rows.length - 1 &&
                      !itemConfig?.showExpand &&
                      !reason
                    }
                    className="border-b-0 border-l-0 border-r border-black/10 px-2.5"
                    minHeight={60}
                    style={
                      cell.column.getSize() === 0
                        ? { width: 'auto' }
                        : undefined
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
              {itemConfig?.showExpand && (
                <TableRow
                  key={`${row.id}-expanded`}
                  className={cn(
                    expandedRows[row.original.key as IPocItemKey]
                      ? ''
                      : 'hidden',
                  )}
                >
                  <TableCell
                    className={`border-b border-black/10 bg-[#E1E1E1] p-[10px] ${
                      rowIndex === tableInstance.getRowModel().rows.length - 1
                        ? 'border-b-0'
                        : ''
                    }`}
                    style={{
                      width: '100%',
                      gridColumn: `1 / ${row.getVisibleCells().length + 1}`,
                    }}
                    colspan={row.getVisibleCells().length}
                  >
                    <div className="w-full overflow-hidden rounded-[10px] border border-black/10 bg-white text-[13px]">
                      <p className="p-[10px] font-[mona] text-[15px] leading-[20px] text-black">
                        <InputContentRenderer
                          value={row.original.value}
                          itemKey={row.original.key as IPocItemKey}
                          displayFormType={
                            AllItemConfig[row.original.key as IPocItemKey]!
                              .formDisplayType
                          }
                          isEssential={
                            AllItemConfig[row.original.key as IPocItemKey]!
                              .isEssential
                          }
                        />
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {row.original.reason && (
                <TableRowOfEditReason
                  reason={row.original.reason}
                  colspan={columns.length}
                />
              )}
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  );
};

export default BaseTableRenderer;
