'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { useMemo } from 'react';

import { formatDate } from '@/utils/formatters';

export interface IGivenGrant {
  date: string;
  organization: string | null;
  projectDonator: string;
  amount: string;
  expenseSheet: string;
  reference: string;
}

export const useGivenGrantsColumns = () => {
  const columnHelper = useMemo(() => createColumnHelper<IGivenGrant>(), []);

  return useMemo(() => {
    return [
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
        size: 220,
        minSize: 220,
        maxSize: 220,
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
        size: 200,
        minSize: 200,
        maxSize: 200,
        enableResizing: false,
        cell: (info) => (
          <span className="text-[14px] text-black">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('amount', {
        id: 'amount',
        header: () => 'Amount (USD)',
        size: 160,
        minSize: 160,
        maxSize: 160,
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
        size: 160,
        minSize: 160,
        maxSize: 160,
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
        size: 140,
        minSize: 140,
        maxSize: 140,
        enableResizing: false,
        cell: (info) => (
          <button className="text-[14px] text-black/60 transition-colors hover:text-black">
            {info.getValue()}
          </button>
        ),
      }),
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
    ];
  }, [columnHelper]);
};
