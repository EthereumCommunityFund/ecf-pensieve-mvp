'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { useMemo } from 'react';

import { formatDate } from '@/utils/formatters';

export interface IReceivedGrant {
  date: string;
  organization: string | null;
  projectDonator: string;
  amount: string;
  expenseSheet: string;
  reference: string;
}

export const useReceivedGrantsColumns = () => {
  const columnHelper = useMemo(() => createColumnHelper<IReceivedGrant>(), []);

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
        size: 240,
        minSize: 240,
        maxSize: 240,
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
        size: 220,
        minSize: 220,
        maxSize: 220,
        enableResizing: false,
        cell: (info) => (
          <span className="text-[14px] text-black">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('amount', {
        id: 'amount',
        header: () => 'Amount (USD)',
        size: 180,
        minSize: 180,
        maxSize: 180,
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
        size: 180,
        minSize: 180,
        maxSize: 180,
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
    ];
  }, [columnHelper]);
};
