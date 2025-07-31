'use client';

import { cn } from '@heroui/react';
import { XCircle } from '@phosphor-icons/react';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import AmountInput from './AmountInput';
import DateInput from './DateInput';
import ProjectSearchSelector from './ProjectSearchSelector';
import URLInput from './URLInput';

interface FundingReceivedGrantsTableItemProps {
  index: number;
  remove: (index: number) => void;
  itemKey: 'funding_received_grants';
  canRemove: boolean;
}

const FundingReceivedGrantsTableItem: React.FC<
  FundingReceivedGrantsTableItemProps
> = ({ index, remove, itemKey, canRemove }) => {
  const { control } = useFormContext();

  return (
    <div
      key={index}
      className="flex min-h-[40px] w-full items-stretch border-b border-black/10 bg-white last:border-b-0"
    >
      {/* Date Column */}
      <div className="flex w-[158px] shrink-0 flex-col justify-center border-r border-black/10 px-[10px] py-[5px]">
        <Controller
          name={`${itemKey}.${index}.date`}
          control={control}
          render={({ field, fieldState }) => (
            <>
              <DateInput value={field.value} onChange={field.onChange} />
              {fieldState.error && (
                <span className="mt-1 text-[12px] text-red-500">
                  {fieldState.error.message || 'date is required'}
                </span>
              )}
            </>
          )}
        />
      </div>

      {/* Organization Column */}
      <div className="flex w-[301px] shrink-0 flex-col justify-center border-r border-black/10 px-[10px] py-[5px]">
        <Controller
          name={`${itemKey}.${index}.organization`}
          control={control}
          render={({ field, fieldState }) => (
            <>
              <ProjectSearchSelector
                value={field.value}
                onChange={field.onChange}
                placeholder="Search or select organization"
              />
              {fieldState.error && (
                <span className="mt-1 text-[12px] text-red-500">
                  {fieldState.error.message || 'organization is required'}
                </span>
              )}
            </>
          )}
        />
      </div>

      {/* Amount Column */}
      <div className="flex w-[138px] shrink-0 flex-col justify-center border-r border-black/10 px-[10px] py-[5px]">
        <Controller
          name={`${itemKey}.${index}.amount`}
          control={control}
          render={({ field, fieldState }) => (
            <>
              <AmountInput
                value={field.value}
                onChange={field.onChange}
                placeholder="$000.00"
              />
              {fieldState.error && (
                <span className="mt-1 text-[12px] text-red-500">
                  {fieldState.error.message || 'amount is required'}
                </span>
              )}
            </>
          )}
        />
      </div>

      {/* Reference Column */}
      <div
        className={cn(
          'flex-1 flex flex-col justify-center h-full min-w-[143px] shrink-0 items-center px-[10px] py-[5px]',
          canRemove ? 'border-r border-black/10' : '',
        )}
      >
        <Controller
          name={`${itemKey}.${index}.reference`}
          control={control}
          render={({ field, fieldState }) => (
            <div className="flex min-h-[40px] flex-col justify-center">
              <URLInput
                value={field.value}
                onChange={field.onChange}
                placeholder="https://"
                required={false}
              />
              {fieldState.error && (
                <span className="mt-1 text-[12px] text-red-500">
                  {fieldState.error.message}
                </span>
              )}
            </div>
          )}
        />
      </div>

      {/* Actions Column */}
      <div className="flex w-[60px] items-center justify-center">
        {canRemove && (
          <button
            type="button"
            className="flex size-[40px] cursor-pointer items-center justify-center  rounded-full border-none bg-transparent p-[8px] opacity-30"
            onClick={() => remove(index)}
            aria-label={`Remove line ${index + 1}`}
            style={{
              outline: 'none',
              boxShadow: 'none',
            }}
          >
            <XCircle size={24} />
          </button>
        )}
      </div>
    </div>
  );
};

export default FundingReceivedGrantsTableItem;
