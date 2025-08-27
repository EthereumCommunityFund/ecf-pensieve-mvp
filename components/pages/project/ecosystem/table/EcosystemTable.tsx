'use client';

import { cn } from '@heroui/react';
import { CaretUpDown, Info } from '@phosphor-icons/react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  PageTableContainer,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/biz/table';

interface EcosystemTableProps<T extends Record<string, any>> {
  id: string;
  title: string;
  description: string;
  filterButtonText: string;
  data: T[];
  columns: ColumnDef<T>[];
  projectId?: number;
}

function EcosystemTable<T extends Record<string, any>>({
  id,
  title,
  description,
  filterButtonText,
  data,
  columns,
}: EcosystemTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div id={id} className="mb-[48px]">
      <div className="-mb-px flex items-center justify-between rounded-t-[10px] border border-b-0 border-black/10 bg-[rgba(229,229,229,0.70)] p-[10px]">
        <div className="flex flex-col gap-[5px]">
          <p className="text-[18px] font-[700] leading-[25px] text-black/80">
            {title}
          </p>
          <p className="text-[13px] font-[400] leading-[18px] text-[#FF3636]">
            {description}
          </p>
        </div>
        <div className="flex items-center gap-[10px]">
          <button className="flex items-center gap-[5px] rounded-[5px] bg-black/[0.05] px-[10px] py-[5px] text-[13px] font-[600] text-black/80 transition-colors hover:bg-black/[0.08]">
            <CaretUpDown size={16} weight="bold" className="opacity-50" />
            <span>{filterButtonText}</span>
          </button>
          <button className="flex items-center gap-[5px] rounded-[5px] bg-black/[0.05] px-[10px] py-[5px] text-[13px] font-[600] text-black/80 transition-colors hover:bg-black/[0.08]">
            <CaretUpDown size={16} weight="bold" className="opacity-50" />
            <span>Collapse Items</span>
          </button>
        </div>
      </div>

      <PageTableContainer className="overflow-hidden rounded-b-[10px] border border-t-0 border-black/10">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-black/10 bg-[#F5F5F5]"
              >
                {headerGroup.headers.map((header, index) => {
                  const isLast = index === headerGroup.headers.length - 1;
                  return (
                    <TableHeader
                      key={header.id}
                      className={cn(
                        'h-[48px] px-[16px] py-[14px] text-left',
                        !isLast && 'border-r border-black/5',
                      )}
                      style={{
                        width: header.getSize(),
                      }}
                    >
                      <div className="flex items-center gap-[6px]">
                        <span className="text-[13px] font-[500] text-black/80">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </span>
                        {header.column.id !== 'page' && (
                          <Info
                            size={14}
                            weight="regular"
                            className="text-black/30"
                          />
                        )}
                      </div>
                    </TableHeader>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, rowIndex) => (
              <TableRow
                key={row.id}
                className={cn(
                  rowIndex < table.getRowModel().rows.length - 1
                    ? 'border-b border-black/5'
                    : '',
                  'bg-white transition-colors hover:bg-black/[0.02]',
                )}
              >
                {row.getVisibleCells().map((cell, cellIndex) => {
                  const isLast = cellIndex === row.getVisibleCells().length - 1;
                  return (
                    <TableCell
                      key={cell.id}
                      className={cn(!isLast && 'border-r border-black/5')}
                      style={{
                        width: cell.column.getSize(),
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </tbody>
        </table>
      </PageTableContainer>
    </div>
  );
}

export default EcosystemTable;
