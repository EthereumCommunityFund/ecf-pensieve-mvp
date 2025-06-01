'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { useMemo } from 'react';

import { InputCol, ReferenceCol, SubmitterCol } from '@/components/biz/table';
import { CaretDownIcon, QuestionIcon, UsersIcon } from '@/components/icons';
import { AllItemConfig } from '@/constants/itemConfig';
import { IPocItemKey } from '@/types/item';

import { IProjectTableRowData, ITableMetaOfDisplayed } from '../types';

interface UseDisplayedColumnsProps extends Record<string, any> {
  isPageExpanded?: boolean;
}

export const useDisplayedColumns = (props: UseDisplayedColumnsProps) => {
  const columnHelper = useMemo(
    () => createColumnHelper<IProjectTableRowData>(),
    [],
  );

  return useMemo(() => {
    // Current Input Column
    const inputColumn = columnHelper.accessor('input', {
      id: 'input',
      header: () => <InputCol.Header />,
      size: 480,
      cell: (info) => {
        const item = info.row.original;

        const { toggleRowExpanded, expandedRows } = info.table.options
          .meta as ITableMetaOfDisplayed;
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

        const referenceValue = info.getValue();
        const { showReferenceModal } = info.table.options
          .meta as ITableMetaOfDisplayed;

        return (
          <ReferenceCol.Cell
            hasReference={!!referenceValue}
            onShowReference={() => {
              showReferenceModal?.(
                referenceValue?.value || '',
                item.key as IPocItemKey,
                item.reason || '',
              );
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
        const rowData = info.row.original;
        const submitterData = info.getValue();

        return (
          <SubmitterCol.Cell
            item={rowData}
            itemConfig={AllItemConfig[rowData.key as IPocItemKey]!}
            submitter={submitterData}
            data={rowData.createdAt}
          />
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
              <CaretDownIcon size={20} />
            </div>
          </div>
        );
      },
    });

    return [inputColumn, referenceColumn, submitterColumn, supportColumn];
  }, [columnHelper]);
};
