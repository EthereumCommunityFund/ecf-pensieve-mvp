'use client';

import { createColumnHelper } from '@tanstack/react-table';
import Link from 'next/link';
import { useMemo } from 'react';

import ColumnHeaderWithTooltip from '@/components/biz/table/ColumnHeaderWithTooltip';
import { ProjectFieldRenderer } from '@/components/biz/table/ProjectFieldRenderer';
import { FUNDING_GRANTS_COLUMNS } from '@/constants/tableColumnDescriptions';
import { IFundingReceivedGrants } from '@/types/item';
import { formatAmount, formatDate } from '@/utils/formatters';

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
        header: () => (
          <ColumnHeaderWithTooltip
            label={FUNDING_GRANTS_COLUMNS.date.label}
            tooltip={FUNDING_GRANTS_COLUMNS.date.tooltip}
          />
        ),
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
        header: () => (
          <ColumnHeaderWithTooltip
            label={FUNDING_GRANTS_COLUMNS.organization.label}
            tooltip={FUNDING_GRANTS_COLUMNS.organization.tooltip}
          />
        ),
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
        header: () => (
          <ColumnHeaderWithTooltip
            label={FUNDING_GRANTS_COLUMNS.projectDonator.label}
            tooltip={FUNDING_GRANTS_COLUMNS.projectDonator.tooltip}
          />
        ),
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
        header: () => (
          <ColumnHeaderWithTooltip
            label={FUNDING_GRANTS_COLUMNS.amount.label}
            tooltip={FUNDING_GRANTS_COLUMNS.amount.tooltip}
          />
        ),
        size: type === 'given' ? 160 : 180,
        minSize: type === 'given' ? 160 : 180,
        maxSize: type === 'given' ? 160 : 180,
        enableResizing: false,
        cell: (info) => {
          const value = info.getValue();
          if (!value) {
            return <span className="text-[14px] font-[500] text-black">-</span>;
          }

          return (
            <span className="text-[14px] font-[500] text-black">
              {formatAmount(value)}
            </span>
          );
        },
      }),
      columnHelper.accessor('expenseSheetUrl', {
        id: 'expenseSheetUrl',
        header: () => (
          <ColumnHeaderWithTooltip
            label={FUNDING_GRANTS_COLUMNS.expenseSheetUrl.label}
            tooltip={FUNDING_GRANTS_COLUMNS.expenseSheetUrl.tooltip}
          />
        ),
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
        header: () => (
          <ColumnHeaderWithTooltip
            label={FUNDING_GRANTS_COLUMNS.reference.label}
            tooltip={FUNDING_GRANTS_COLUMNS.reference.tooltip}
          />
        ),
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

    if (type === 'given') {
      baseColumns.push(
        columnHelper.display({
          id: 'page',
          header: () => (
            <ColumnHeaderWithTooltip
              label={FUNDING_GRANTS_COLUMNS.page.label}
              tooltip={FUNDING_GRANTS_COLUMNS.page.tooltip}
            />
          ),
          size: 140,
          minSize: 140,
          maxSize: 140,
          enableResizing: false,
          cell: ({ row }) => {
            const sourceProjectId = (row.original as any).sourceProjectId;
            if (!sourceProjectId) {
              return <span className="text-[14px] text-black/30">-</span>;
            }
            return (
              <Link
                href={`/project/${sourceProjectId}`}
                className="text-[14px] transition-colors hover:underline hover:opacity-70"
                target="_blank"
              >
                View Linkage
              </Link>
            );
          },
        }),
      );
    }

    return baseColumns;
  }, [columnHelper, type]);
};
