'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { useMemo } from 'react';

import { CaretDownIcon, QuestionIcon } from '@/components/icons';

import { IConsensusLogRowData } from '../types';

interface UseConsensusLogColumnsProps {
  onExpandClick?: (rowId: string) => void;
}

export const useConsensusLogColumns = ({
  onExpandClick,
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
      size: 124,
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

    // Input Column with Expand functionality
    const inputColumn = columnHelper.accessor('input', {
      id: 'input',
      header: () => (
        <div className="flex items-center gap-[5px]">
          <span className="font-sans text-[14px] font-semibold text-[#333] opacity-60">
            Input
          </span>
          <QuestionIcon size={18} className="opacity-40" />
        </div>
      ),
      size: 0, // Auto width
      cell: (info) => {
        const item = info.row.original;

        return (
          <div
            className="flex cursor-pointer items-center justify-between gap-[5px] opacity-70"
            onClick={() => onExpandClick?.(item.id)}
          >
            <span className="font-sans text-[13px] font-semibold">Expand</span>
            <CaretDownIcon size={18} className="opacity-50" />
          </div>
        );
      },
    });

    // Lead By Column
    const leadByColumn = columnHelper.accessor('leadBy', {
      id: 'leadBy',
      header: () => (
        <div className="flex items-center gap-[5px]">
          <span className="font-sans text-[14px] font-semibold text-[#333] opacity-60">
            Lead By
          </span>
          <QuestionIcon size={18} className="opacity-40" />
        </div>
      ),
      size: 140,
      cell: (info) => {
        const leadBy = info.getValue();
        return (
          <div className="flex items-center gap-[5px]">
            <div className="size-6 rounded-full bg-[#D9D9D9]"></div>
            <div className="flex flex-col">
              <span className="font-sans text-[14px] font-normal text-black">
                {leadBy.name}
              </span>
              <span className="font-sans text-[12px] font-semibold text-black opacity-60">
                {leadBy.date}
              </span>
            </div>
          </div>
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
      size: 150,
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
  }, [columnHelper, onExpandClick]);
};
