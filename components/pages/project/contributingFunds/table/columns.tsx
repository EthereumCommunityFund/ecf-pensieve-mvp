'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { useMemo } from 'react';

import { ProjectFieldRenderer } from '@/components/biz/table/ProjectFieldRenderer';
import { IFundingReceivedGrants } from '@/types/item';
import { formatDate } from '@/utils/formatters';

// For mock data in GivenGrantsTable
export interface IGivenGrant {
  date: string;
  organization: string | null;
  projectDonator: string;
  amount: string;
  expenseSheet: string;
  reference: string;
}

export type GrantType = 'given' | 'received';

// Columns for GivenGrantsTable (mock data)
export const useGivenGrantsColumns = () => {
  const columnHelper = useMemo(() => createColumnHelper<IGivenGrant>(), []);

  return useMemo(
    () => [
      columnHelper.accessor('date', {
        id: 'date',
        header: () => 'Date',
        size: 140,
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
        cell: (info) => (
          <span className="text-[14px] text-black">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('amount', {
        id: 'amount',
        header: () => 'Amount (USD)',
        size: 160,
        cell: (info) => {
          const value = info.getValue();
          if (!value) {
            return <span className="text-[14px] font-[500] text-black">-</span>;
          }

          // Format number with thousands separators
          const formatWithThousands = (num: string | number): string => {
            const numStr = String(num);
            const parts = numStr.split('.');
            const integerPart = parts[0];
            const decimalPart = parts[1];

            // Add commas as thousands separators
            const formattedInteger = integerPart.replace(
              /\B(?=(\d{3})+(?!\d))/g,
              ',',
            );

            return decimalPart !== undefined
              ? `${formattedInteger}.${decimalPart}`
              : formattedInteger;
          };

          return (
            <span className="text-[14px] font-[500] text-black">
              {formatWithThousands(value)}
            </span>
          );
        },
      }),
      columnHelper.accessor('expenseSheet', {
        id: 'expenseSheet',
        header: () => 'Expense Sheet',
        size: 160,
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
        cell: () => (
          <button className="text-[14px] transition-colors hover:text-[#1E40AF]">
            View Linkage
          </button>
        ),
      }),
    ],
    [columnHelper],
  );
};

// Columns for ReceivedGrantsTable (actual data from API)
export const useGrantColumns = (type: GrantType) => {
  const columnHelper = useMemo(
    () => createColumnHelper<IFundingReceivedGrants>(),
    [],
  );

  return useMemo(() => {
    const baseColumns: any[] = [
      columnHelper.accessor('date', {
        id: 'date',
        header: () => 'Date',
        size: 140,
        minSize: 140,
        maxSize: 140,
        enableResizing: false,
        cell: (info) => {
          const date = info.getValue();
          if (!date)
            return <span className="text-[14px] text-black/60">-</span>;

          // Handle Date object or string
          const dateStr =
            date instanceof Date ? date.toISOString() : String(date);

          return (
            <span className="text-[14px] text-black/60">
              {formatDate(dateStr, 'YYYY/MM/DD')}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: 'organization',
        header: () => 'Organization/Program',
        size: type === 'given' ? 220 : 240,
        minSize: type === 'given' ? 220 : 240,
        maxSize: type === 'given' ? 220 : 240,
        enableResizing: false,
        cell: ({ row, table }) => {
          const grant = row.original;
          // @ts-ignore - Access custom meta from table
          const { projectsMap, isLoadingProjects } = table.options.meta || {};

          return (
            <ProjectFieldRenderer
              projectValue={grant.organization}
              projectsMap={projectsMap}
              isLoadingProjects={isLoadingProjects || false}
            />
          );
        },
      }),
      columnHelper.display({
        id: 'projectDonator',
        header: () => 'Project Donator',
        size: type === 'given' ? 200 : 220,
        minSize: type === 'given' ? 200 : 220,
        maxSize: type === 'given' ? 200 : 220,
        enableResizing: false,
        cell: ({ row, table }) => {
          const grant = row.original;
          // @ts-ignore - Access custom meta from table
          const { projectsMap, isLoadingProjects } = table.options.meta || {};

          return (
            <ProjectFieldRenderer
              projectValue={grant.projectDonator}
              projectsMap={projectsMap}
              isLoadingProjects={isLoadingProjects || false}
            />
          );
        },
      }),
      columnHelper.accessor('amount', {
        id: 'amount',
        header: () => 'Amount (USD)',
        size: type === 'given' ? 160 : 180,
        minSize: type === 'given' ? 160 : 180,
        maxSize: type === 'given' ? 160 : 180,
        enableResizing: false,
        cell: (info) => {
          const value = info.getValue();
          if (!value) {
            return <span className="text-[14px] font-[500] text-black">-</span>;
          }

          // Format number with thousands separators
          const formatWithThousands = (num: string | number): string => {
            const numStr = String(num);
            const parts = numStr.split('.');
            const integerPart = parts[0];
            const decimalPart = parts[1];

            // Add commas as thousands separators
            const formattedInteger = integerPart.replace(
              /\B(?=(\d{3})+(?!\d))/g,
              ',',
            );

            return decimalPart !== undefined
              ? `${formattedInteger}.${decimalPart}`
              : formattedInteger;
          };

          return (
            <span className="text-[14px] font-[500] text-black">
              {formatWithThousands(value)}
            </span>
          );
        },
      }),
      columnHelper.accessor('expenseSheetUrl', {
        id: 'expenseSheetUrl',
        header: () => 'Expense Sheet',
        size: type === 'given' ? 160 : 180,
        minSize: type === 'given' ? 160 : 180,
        maxSize: type === 'given' ? 160 : 180,
        enableResizing: false,
        cell: (info) => {
          const url = info.getValue();
          if (!url) return <span className="text-[14px] text-black/60">-</span>;

          return (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] text-black/60 underline transition-colors hover:text-black"
            >
              {url}
            </a>
          );
        },
      }),
      columnHelper.accessor('reference', {
        id: 'reference',
        header: () => 'Reference',
        size: type === 'given' ? 140 : 160,
        minSize: type === 'given' ? 140 : 160,
        maxSize: type === 'given' ? 140 : 160,
        enableResizing: false,
        cell: (info) => {
          const url = info.getValue();
          if (!url) return <span className="text-[14px] text-black/60">-</span>;

          return (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] text-black/60 underline transition-colors hover:text-black"
            >
              {url}
            </a>
          );
        },
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
