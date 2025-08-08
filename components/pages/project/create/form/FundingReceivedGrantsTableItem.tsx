'use client';

import { cn } from '@heroui/react';
import { XCircle } from '@phosphor-icons/react';
import React, { useEffect, useMemo } from 'react';
import { Controller, FieldArrayWithId, useFormContext } from 'react-hook-form';

import AmountInput from './AmountInput';
import DateInput from './DateInput';
import ProjectSearchSelector from './ProjectSearchSelector';
import URLInput from './URLInput';

interface FundingReceivedGrantsTableItemProps {
  field: FieldArrayWithId<any, any, 'fieldId'>;
  index: number;
  remove: () => void;
  itemKey: 'funding_received_grants';
  canRemove: boolean;
}

const FundingReceivedGrantsTableItem: React.FC<
  FundingReceivedGrantsTableItemProps
> = ({ field, index, remove, itemKey, canRemove }) => {
  const { control, watch } = useFormContext();

  // Create stable field paths using useMemo
  const fieldPaths = useMemo(
    () => ({
      date: `${itemKey}.${index}.date`,
      organization: `${itemKey}.${index}.organization`,
      projectDonator: `${itemKey}.${index}.projectDonator`,
      amount: `${itemKey}.${index}.amount`,
      reference: `${itemKey}.${index}.reference`,
    }),
    [itemKey, index],
  );

  // Monitor current row data for integrity
  const currentRowData = watch(`${itemKey}.${index}`);

  // Data integrity check
  useEffect(() => {
    if (currentRowData) {
      // Log warning if critical fields are unexpectedly empty
      if (currentRowData.date === null && currentRowData.amount === '') {
        console.warn(
          `[FundingReceivedGrantsTableItem] Row ${index} data integrity check - possible reset detected`,
          currentRowData,
        );
      }
    }
  }, [currentRowData, index]);

  return (
    <div
      key={index}
      className="flex min-h-[40px] w-full items-stretch border-b border-black/10 bg-white last:border-b-0"
    >
      {/* Date Column */}
      <div className="flex w-[158px] shrink-0 flex-col justify-center border-r border-black/10 px-[10px] py-[5px]">
        <Controller
          name={fieldPaths.date}
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
      <div className="flex w-[300px] shrink-0 flex-col justify-center border-r border-black/10 px-[10px] py-[5px]">
        <Controller
          name={fieldPaths.organization}
          control={control}
          render={({ field, fieldState }) => (
            <>
              <ProjectSearchSelector
                value={field.value}
                onChange={(value) => {
                  // Use onChange without triggering validation
                  field.onChange(value);
                }}
                onBlur={field.onBlur}
                placeholder="Search or select organizations"
                multiple={true}
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

      {/* Project Donator Column */}
      <div className="flex w-[300px] shrink-0 flex-col justify-center border-r border-black/10 px-[10px] py-[5px]">
        <Controller
          name={fieldPaths.projectDonator}
          control={control}
          render={({ field, fieldState }) => (
            <>
              <ProjectSearchSelector
                value={field.value}
                onChange={(value) => {
                  // Use onChange without triggering validation
                  field.onChange(value);
                }}
                onBlur={field.onBlur}
                placeholder="Search or select projects"
                multiple={true}
                disabled={false}
                columnName={'Project Donator'}
              />
              {fieldState.error && (
                <span className="mt-1 text-[12px] text-red-500">
                  {fieldState.error.message ||
                    'project donator selection error'}
                </span>
              )}
            </>
          )}
        />
      </div>

      {/* Amount Column */}
      <div className="flex w-[138px] shrink-0 flex-col justify-center border-r border-black/10 px-[10px] py-[5px]">
        <Controller
          name={fieldPaths.amount}
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
          'flex flex-1 min-w-[143px] shrink-0 flex-col justify-center px-[10px] py-[5px]',
          canRemove ? 'border-r border-black/10' : '',
        )}
      >
        <Controller
          name={fieldPaths.reference}
          control={control}
          render={({ field, fieldState }) => (
            <>
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
            </>
          )}
        />
      </div>

      {/* Actions Column */}
      <div className="flex w-[60px] items-center justify-center">
        {canRemove && (
          <button
            type="button"
            className="flex size-[40px] cursor-pointer items-center justify-center  rounded-full border-none bg-transparent p-[8px] opacity-30"
            onClick={remove}
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

export default React.memo(FundingReceivedGrantsTableItem);
