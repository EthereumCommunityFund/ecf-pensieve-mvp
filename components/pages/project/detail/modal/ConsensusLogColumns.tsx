'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { useMemo } from 'react';

import { InputCol, SubmitterCol } from '@/components/biz/table';
import { CaretDownIcon, QuestionIcon } from '@/components/icons';
import { AllItemConfig } from '@/constants/itemConfig';
import { IEssentialItemKey } from '@/types/item';

import { IConsensusLogRowData } from '../types';

interface UseConsensusLogColumnsProps {
  onExpandClick?: (rowId: string) => void;
  itemKey?: string;
}

export const useConsensusLogColumns = ({
  onExpandClick,
  itemKey,
}: UseConsensusLogColumnsProps = {}) => {
  const columnHelper = useMemo(
    () => createColumnHelper<IConsensusLogRowData>(),
    [],
  );

  return useMemo(() => {
    // Date/Time Column
    const dateTimeColumn = columnHelper.accessor('dateTime', {
      id: 'dateTime',
      header: () => (
        <div className="flex items-center gap-[5px]">
          <span className="font-sans text-[14px] font-semibold text-[#333] opacity-60">
            Date / Time
          </span>
          <QuestionIcon size={18} className="opacity-40" />
        </div>
      ),
      size: 130,
      cell: (info) => {
        const dateTime = info.getValue();
        return (
          <div className="flex flex-col justify-center">
            <span className="font-sans text-[14px] font-normal text-black">
              {dateTime.date}
            </span>
            <span className="font-sans text-[12px] font-semibold text-black opacity-60">
              {dateTime.time}
            </span>
          </div>
        );
      },
    });

    // Input Column - following the same pattern as SubmissionQueueColumns.tsx
    const inputColumn = columnHelper.accessor('input', {
      id: 'input',
      header: () => <InputCol.Header />,
      size: 480,
      cell: (info) => {
        const item = info.row.original;
        const inputValue = info.getValue();

        // Check if this item type supports expansion
        const itemConfig = itemKey
          ? AllItemConfig[itemKey as IEssentialItemKey]
          : null;
        const canExpand = itemConfig?.showExpand || false;

        return (
          <div className="font-mona flex w-full items-center justify-between gap-[10px]">
            <div className="flex-1 overflow-hidden whitespace-normal break-words text-[13px] leading-[19px] text-black/80">
              {inputValue || '---'}
            </div>
            {/* Show expand button only if the item type supports expansion */}
            {canExpand && (
              <button
                onClick={() => onExpandClick?.(item.id)}
                className="flex size-[24px] shrink-0 items-center justify-center opacity-50 transition-opacity hover:opacity-100"
              >
                <CaretDownIcon size={18} />
              </button>
            )}
          </div>
        );
      },
    });

    // Lead By Column - following the same pattern as SubmitterCol from SubmissionQueueColumns.tsx
    const leadByColumn = columnHelper.accessor('leadBy', {
      id: 'leadBy',
      header: () => <SubmitterCol.Header />,
      size: 183,
      cell: (info) => {
        const leadByData = info.getValue();
        const item = info.row.original;

        // Create a mock submitter object that matches SubmitterCol.Cell props
        const submitter = {
          name: leadByData.name,
          avatarUrl: leadByData.avatar || null, // Use avatar if available
          userId: leadByData.userId || 'unknown', // Use userId if available, fallback to 'unknown'
        };

        // Create a mock item config for consistency
        const ItemConfig = {
          isEssential: true, // Treat consensus log items as essential
        };

        // Create a mock item with the required structure
        const mockItem = {
          input: item.input,
          createdAt: new Date(item.dateTime.date),
          key: 'consensus-log',
        };

        return (
          <SubmitterCol.Cell
            item={mockItem as any}
            itemConfig={ItemConfig as any}
            submitter={submitter as any}
            data={new Date(leadByData.date)}
          />
        );
      },
    });

    // Weight-at-time Column
    const weightColumn = columnHelper.accessor('weight', {
      id: 'weight',
      header: () => (
        <div className="flex items-center gap-[5px]">
          <span className="font-sans text-[14px] font-semibold text-[#333] opacity-60">
            Weight-at-time
          </span>
          <QuestionIcon size={18} className="opacity-40" />
        </div>
      ),
      size: 180,
      cell: (info) => {
        const weight = info.getValue();
        const isPositive = weight.change.startsWith('+');
        return (
          <div className="flex items-center gap-[10px]">
            <span className="font-sans text-[14px] font-semibold text-black">
              {weight.current}
            </span>
            <span
              className={`font-sans text-[14px] font-normal ${
                isPositive ? 'text-[#64C0A5]' : 'text-red-500'
              }`}
            >
              {weight.change}
            </span>
          </div>
        );
      },
    });

    return [dateTimeColumn, inputColumn, leadByColumn, weightColumn];
  }, [columnHelper, onExpandClick, itemKey]);
};
