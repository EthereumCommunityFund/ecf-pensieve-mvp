'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { useMemo } from 'react';

import { formatDate } from '@/utils/formatters';

export interface IGrant {
  date: string;
  organization: string | null;
  projectDonator: string;
  amount: string;
  expenseSheet: string;
  reference: string;
}

export type GrantType = 'given' | 'received';

export const useGrantColumns = (type: GrantType) => {
  const columnHelper = useMemo(() => createColumnHelper<IGrant>(), []);

  return useMemo(() => {
    const baseColumns: any[] = [
      columnHelper.accessor('date', {
        id: 'date',
        header: () => 'Date',
        size: 140,
        minSize: 140,
        maxSize: 140,
        enableResizing: false,
        cell: (info) => (
          <span className="text-[14px] text-black/60">
            {formatDate(info.getValue(), 'YYYY/MM/DD')}
          </span>
        ),
      }),
      columnHelper.accessor('organization', {
        id: 'organization',
        header: () => 'Organization/Program',
        size: type === 'given' ? 220 : 240,
        minSize: type === 'given' ? 220 : 240,
        maxSize: type === 'given' ? 220 : 240,
        enableResizing: false,
        cell: (info) => {
          const value = info.getValue();
          if (!value) {
            return (
              <span className="text-[14px] text-black">Not Applicable</span>
            );
          }
          return <span className="text-[14px] text-black">{value}</span>;
        },
      }),
      columnHelper.accessor('projectDonator', {
        id: 'projectDonator',
        header: () => 'Project Donator',
        size: type === 'given' ? 200 : 220,
        minSize: type === 'given' ? 200 : 220,
        maxSize: type === 'given' ? 200 : 220,
        enableResizing: false,
        cell: (info) => (
          <span className="text-[14px] text-black">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('amount', {
        id: 'amount',
        header: () => 'Amount (USD)',
        size: type === 'given' ? 160 : 180,
        minSize: type === 'given' ? 160 : 180,
        maxSize: type === 'given' ? 160 : 180,
        enableResizing: false,
        cell: (info) => (
          <span className="text-[14px] font-[500] text-black">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('expenseSheet', {
        id: 'expenseSheet',
        header: () => 'Expense Sheet',
        size: type === 'given' ? 160 : 180,
        minSize: type === 'given' ? 160 : 180,
        maxSize: type === 'given' ? 160 : 180,
        enableResizing: false,
        cell: (info) => (
          <button className="text-[14px] text-black/60 transition-colors hover:text-black">
            {info.getValue()}
          </button>
        ),
      }),
      columnHelper.accessor('reference', {
        id: 'reference',
        header: () => 'Reference',
        size: type === 'given' ? 140 : 160,
        minSize: type === 'given' ? 140 : 160,
        maxSize: type === 'given' ? 140 : 160,
        enableResizing: false,
        cell: (info) => (
          <button className="text-[14px] text-black/60 transition-colors hover:text-black">
            {info.getValue()}
          </button>
        ),
      }),
    ];

    // Add the extra "View Linkage" column only for 'given' type
    if (type === 'given') {
      baseColumns.push(
        columnHelper.display({
          id: 'page',
          header: () => 'Page',
          size: 140,
          minSize: 140,
          maxSize: 140,
          enableResizing: false,
          cell: () => (
            <button className="text-[14px] transition-colors hover:text-[#1E40AF]">
              View Linkage
            </button>
          ),
        }),
      );
    }

    return baseColumns;
  }, [columnHelper, type]);
};
