'use client';

import { cn } from '@heroui/react';
import { CaretUpDown, Info } from '@phosphor-icons/react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { FC, useMemo } from 'react';

import {
  PageTableContainer,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/biz/table';

import { IGivenGrant, useGivenGrantsColumns } from './columns';

interface GivenGrantsTableProps {
  projectId?: number;
}

// Mock data for Given (Grants)
const givenGrantsData: IGivenGrant[] = [
  {
    date: '2024-05-15',
    organization: 'Giveth',
    projectDonator: 'Octant, ENS',
    amount: '$500.00',
    expenseSheet: 'https://',
    reference: 'https://',
  },
  {
    date: '2024-04-20',
    organization: null, // Will show as "Not Applicable"
    projectDonator: 'Octant',
    amount: '$300.00',
    expenseSheet: 'https://',
    reference: 'https://',
  },
];

const GivenGrantsTable: FC<GivenGrantsTableProps> = () => {
  const columns = useGivenGrantsColumns();

  const data = useMemo(() => givenGrantsData, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="mb-[48px]">
      {/* Category Header - matching CategoryHeader.tsx style */}
      <div className="-mb-px flex items-center justify-between rounded-t-[10px] border border-b-0 border-black/10 bg-[rgba(229,229,229,0.70)] p-[10px]">
        <div className="flex flex-col gap-[5px]">
          <p className="text-[18px] font-[700] leading-[25px] text-black/80">
            Given (Grants)
          </p>
          <p className="text-[13px] font-[400] leading-[18px] text-[#FF5F5F]">
            Based on other project pages
          </p>
        </div>
        {/* dont delete this */}
        <div className="flex items-center gap-[10px]">
          <button className="flex items-center gap-[5px] rounded-[5px] bg-black/[0.05] px-[10px] py-[5px] text-[13px] font-[600] text-black/80 transition-colors hover:bg-black/[0.08]">
            <CaretUpDown size={16} weight="bold" className="opacity-50" />
            <span>Time</span>
          </button>
          <button className="flex items-center gap-[5px] rounded-[5px] bg-black/[0.05] px-[10px] py-[5px] text-[13px] font-[600] text-black/80 transition-colors hover:bg-black/[0.08]">
            <CaretUpDown size={16} weight="bold" className="opacity-50" />
            <span>Amount</span>
          </button>
          <button className="flex items-center gap-[5px] rounded-[5px] bg-black/[0.05] px-[10px] py-[5px] text-[13px] font-[600] text-black/80 transition-colors hover:bg-black/[0.08]">
            <CaretUpDown size={16} weight="bold" className="opacity-50" />
            <span>Collapse Items</span>
          </button>
        </div>
      </div>

      {/* Externally Linked Tag */}
      {/* <div className="flex items-center gap-[10px] border-x border-black/10 bg-[rgba(229,229,229,0.70)] px-[10px] py-[5px]">
        <div className="flex items-center justify-center rounded-[5px] px-[10px] py-[4px]">
          <span className="text-[13px] font-[400] leading-[18px] text-black">
            Externally Linked
          </span>
        </div>
      </div> */}

      <div className="flex items-center gap-[10px] border-x border-black/10 bg-[rgba(229,229,229,0.70)] p-[10px]">
        <button className="flex h-[30px] items-center justify-center rounded-[5px] border border-black/10 bg-[#DCDCDC] px-[10px] text-[13px] font-[400] leading-[18px] text-black transition-colors hover:bg-[#C8C8C8]">
          View Item
        </button>
        <button className="flex h-[30px] items-center justify-center rounded-[5px] border border-black/10 bg-[#DCDCDC] px-[10px] text-[13px] font-[400] leading-[18px] text-black transition-colors hover:bg-[#C8C8C8]">
          Propose Entry
        </button>
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
                        <Info
                          size={14}
                          weight="regular"
                          className="text-black/30"
                        />
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
                      className={cn(
                        // 'h-[56px] px-[16px] py-[18px]',
                        !isLast && 'border-r border-black/5',
                      )}
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
};

export default GivenGrantsTable;
