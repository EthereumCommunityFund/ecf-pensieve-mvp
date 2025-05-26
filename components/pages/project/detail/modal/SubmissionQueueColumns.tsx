'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { useMemo } from 'react';

import { InputCol, ReferenceCol, SubmitterCol } from '@/components/biz/table';
import { CaretUpIcon, QuestionIcon, UsersIcon } from '@/components/icons';

import { TableRowData } from './types';

interface UseSubmissionQueueColumnsProps {
  onReferenceClick?: (rowId: string) => void;
  onExpandClick?: (rowId: string) => void;
  expandedRows?: Record<string, boolean>;
  toggleRowExpanded?: (key: string) => void;
}

export const useSubmissionQueueColumns = ({
  onReferenceClick,
  onExpandClick,
  expandedRows = {},
  toggleRowExpanded,
}: UseSubmissionQueueColumnsProps = {}) => {
  const columnHelper = useMemo(() => createColumnHelper<TableRowData>(), []);

  return useMemo(() => {
    // Input Column with Expand functionality
    const inputColumn = columnHelper.accessor('input', {
      id: 'input',
      header: () => <InputCol.Header />,
      size: 480,
      cell: (info) => {
        const item = info.row.original;
        const isRowExpanded = expandedRows[item.key];

        return (
          <InputCol.Cell
            value={info.getValue()}
            itemKey={item.key as any}
            isExpanded={isRowExpanded}
            onToggleExpand={
              toggleRowExpanded ? () => toggleRowExpanded(item.key) : undefined
            }
          />
        );
      },
    });

    // Reference Column
    const referenceColumn = columnHelper.accessor('reference', {
      id: 'reference',
      header: () => (
        <div className="flex items-center gap-[5px]">
          <span className="font-sans text-[14px] font-semibold text-[#333] opacity-60">
            Reference
          </span>
          <QuestionIcon size={18} className="opacity-40" />
        </div>
      ),
      size: 124,
      cell: (info) => {
        const hasReference = !!info.getValue();
        const item = info.row.original;

        return (
          <button
            className="flex h-[39px] w-full items-center justify-center rounded-[5px] border border-black/10 bg-[#E6E6E6] px-[30px] py-2.5 transition-colors hover:bg-[#D6D6D6] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => onReferenceClick?.(item.id)}
            disabled={!hasReference}
          >
            <span className="font-sans text-[13px] font-normal text-black">
              Reference
            </span>
          </button>
        );
      },
    });

    // Submitter Column
    const submitterColumn = columnHelper.accessor('submitter', {
      id: 'submitter',
      header: () => (
        <div className="flex items-center gap-[5px]">
          <span className="font-sans text-[14px] font-semibold text-[#333] opacity-60">
            Submitter
          </span>
          <QuestionIcon size={18} className="opacity-40" />
        </div>
      ),
      size: 124,
      cell: (info) => {
        const submitter = info.getValue();
        return (
          <div className="flex items-center gap-[5px]">
            <div className="size-6 rounded-full bg-[#D9D9D9]"></div>
            <div className="flex flex-col">
              <span className="font-sans text-[14px] font-normal text-black">
                {submitter.name}
              </span>
              <span className="font-sans text-[12px] font-semibold text-black opacity-60">
                {submitter.date}
              </span>
            </div>
          </div>
        );
      },
    });

    // Support Column
    const supportColumn = columnHelper.accessor('support', {
      id: 'support',
      header: () => (
        <div className="flex items-center gap-[5px]">
          <span className="font-sans text-[14px] font-semibold text-[#333] opacity-60">
            Support
          </span>
          <QuestionIcon size={18} className="opacity-40" />
        </div>
      ),
      size: 150,
      cell: (info) => {
        const support = info.getValue();
        return (
          <div className="flex items-center gap-[19px]">
            <div className="flex items-center gap-2.5">
              <div className="relative size-9">
                <div className="absolute inset-0 rounded-full border-[3px] border-[#E6E6E6]"></div>
                <div className="absolute inset-0 rounded-full border-[3px] border-[#64C0A5] border-r-transparent border-t-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mona text-[14px] font-semibold">
                    {support.count}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-[5px] opacity-20">
                <UsersIcon size={20} />
                <span className="font-mona text-[14px] font-semibold">
                  {support.voters}
                </span>
              </div>
            </div>
            <div className="flex h-auto w-[35px] items-center justify-center bg-transparent opacity-30">
              <CaretUpIcon size={20} />
            </div>
          </div>
        );
      },
    });

    return [inputColumn, referenceColumn, submitterColumn, supportColumn];
  }, [
    columnHelper,
    onReferenceClick,
    onExpandClick,
    expandedRows,
    toggleRowExpanded,
  ]);
};

// Displayed Table Columns Hook
interface UseDisplayedColumnsProps {
  onReferenceClick?: (rowId: string) => void;
  onExpandClick?: (rowId: string) => void;
  expandedRows?: Record<string, boolean>;
  toggleRowExpanded?: (key: string) => void;
}

export const useDisplayedColumns = ({
  onReferenceClick,
  onExpandClick,
  expandedRows = {},
  toggleRowExpanded,
}: UseDisplayedColumnsProps = {}) => {
  const columnHelper = useMemo(() => createColumnHelper<TableRowData>(), []);

  return useMemo(() => {
    // Current Input Column
    const inputColumn = columnHelper.accessor('input', {
      id: 'input',
      header: () => <InputCol.Header />,
      size: 480,
      cell: (info) => {
        const item = info.row.original;
        const isRowExpanded = expandedRows[item.key];

        return (
          <InputCol.Cell
            value={info.getValue()}
            itemKey={item.key as any}
            isExpanded={isRowExpanded}
            onToggleExpand={
              toggleRowExpanded ? () => toggleRowExpanded(item.key) : undefined
            }
          />
        );
      },
    });

    // Reference Column
    const referenceColumn = columnHelper.accessor('reference', {
      id: 'reference',
      header: () => <ReferenceCol.Header />,
      size: 124,
      cell: (info) => {
        const item = info.row.original;
        return (
          <ReferenceCol.Cell
            hasReference={!!info.getValue()}
            onShowReference={() => {
              onReferenceClick?.(item.id);
              console.log('Show reference for:', item.key);
            }}
          />
        );
      },
    });

    // Submitter Column
    const submitterColumn = columnHelper.accessor('submitter', {
      id: 'submitter',
      header: () => <SubmitterCol.Header />,
      size: 183,
      cell: (info) => {
        return <SubmitterCol.Cell submitter={info.getValue()} />;
      },
    });

    // Support Column
    const supportColumn = columnHelper.accessor('support', {
      id: 'support',
      header: () => (
        <div className="flex items-center gap-[5px]">
          <span className="font-sans text-[14px] font-semibold text-[#333] opacity-60">
            Support
          </span>
          <QuestionIcon size={18} />
        </div>
      ),
      size: 150,
      cell: (info) => {
        const support = info.getValue();
        return (
          <div className="flex items-center gap-[19px]">
            <div className="flex items-center gap-2.5">
              <div className="relative size-9">
                <div className="absolute inset-0 rounded-full border-[3px] border-[#E6E6E6]"></div>
                <div className="absolute inset-0 rounded-full border-[3px] border-[#64C0A5] border-r-transparent border-t-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mona text-[13px] font-semibold">
                    {support.count}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-[5px] opacity-20">
                <UsersIcon size={20} />
                <span className="font-mona text-[14px] font-semibold">
                  {support.voters}
                </span>
              </div>
            </div>
            <div className="flex h-auto w-[35px] items-center justify-center bg-transparent opacity-30">
              <CaretUpIcon size={20} />
            </div>
          </div>
        );
      },
    });

    return [inputColumn, referenceColumn, submitterColumn, supportColumn];
  }, [
    columnHelper,
    onReferenceClick,
    onExpandClick,
    expandedRows,
    toggleRowExpanded,
  ]);
};
