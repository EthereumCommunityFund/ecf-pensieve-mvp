'use client';

import { cn } from '@heroui/react';
import { XCircle } from '@phosphor-icons/react';
import React, { useCallback, useMemo } from 'react';
import { Controller, FieldArrayWithId, useFormContext } from 'react-hook-form';

import { Select, SelectItem } from '@/components/base/select';

import { BOOL_TYPE_OPTIONS, getColumnConfig } from '../embedTableUtils';

interface AdvisorsTableItemProps {
  field: FieldArrayWithId<any, any, 'fieldId'>;
  index: number;
  remove: () => void;
  itemKey: 'advisors';
  canRemove: boolean;
}

const AdvisorsTableItem: React.FC<AdvisorsTableItemProps> = ({
  field,
  index,
  remove,
  itemKey,
  canRemove,
}) => {
  const { control } = useFormContext();

  const fieldPaths = useMemo(
    () => ({
      name: `${itemKey}.${index}.name`,
      address: `${itemKey}.${index}.address`,
      title: `${itemKey}.${index}.title`,
      active: `${itemKey}.${index}.active`,
    }),
    [itemKey, index],
  );

  const getConfig = useCallback(
    (columnKey: string) => {
      return getColumnConfig(itemKey, columnKey);
    },
    [itemKey],
  );

  const baseClass =
    'flex shrink-0 items-center border-r border-black/10 px-[10px] py-[5px]';

  return (
    <div
      key={index}
      className="flex min-h-[40px] w-full items-stretch border-b border-black/10 bg-white last:border-b-0"
    >
      <div className={cn(baseClass, `w-[${getConfig('name')?.width}px]`)}>
        <Controller
          name={fieldPaths.name}
          control={control}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <input
                type="text"
                value={field.value || ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="input name"
                className={cn(
                  'h-[32px] w-full border-none bg-transparent px-0',
                  'text-[14px] font-[400] leading-[19px] text-black',
                  'placeholder:text-black/60 focus:shadow-none focus:outline-none focus:ring-0',
                  fieldState.error && 'bg-red-50',
                )}
                style={{
                  boxShadow: 'none !important',
                  outline: 'none !important',
                  border: 'none !important',
                }}
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

      <div className={cn(baseClass, `w-[${getConfig('title')?.width}px]`)}>
        <Controller
          name={fieldPaths.title}
          control={control}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <input
                type="text"
                value={field.value || ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="input title"
                className={cn(
                  'h-[32px] w-full border-none bg-transparent px-0',
                  'text-[14px] font-[400] leading-[19px] text-black',
                  'placeholder:text-black/60 focus:shadow-none focus:outline-none focus:ring-0',
                  fieldState.error && 'bg-red-50',
                )}
                style={{
                  boxShadow: 'none !important',
                  outline: 'none !important',
                  border: 'none !important',
                }}
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

      <div className={cn(baseClass, `w-[${getConfig('address')?.width}px]`)}>
        <Controller
          name={fieldPaths.address}
          control={control}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <input
                type="text"
                value={field.value || ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="input address"
                className={cn(
                  'h-[32px] w-full border-none bg-transparent px-0',
                  'text-[14px] font-[400] leading-[19px] text-black',
                  'placeholder:text-black/60 focus:shadow-none focus:outline-none focus:ring-0',
                  fieldState.error && 'bg-red-50',
                )}
                style={{
                  boxShadow: 'none !important',
                  outline: 'none !important',
                  border: 'none !important',
                }}
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

      <div
        className={cn(
          baseClass,
          'flex-col justify-center',
          `w-[${getConfig('active')?.width}px]`,
        )}
      >
        <Controller
          name={fieldPaths.active}
          control={control}
          render={({ field, fieldState }) => (
            <>
              <Select
                selectedKeys={field.value ? [field.value] : []}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string;
                  if (selectedKey !== undefined) {
                    field.onChange(selectedKey);
                  }
                }}
                placeholder="select"
                aria-label="Select integration type"
                classNames={{
                  base: 'max-w-full',
                  trigger: `h-[32px] min-h-[32px] border-none bg-transparent shadow-none px-0`,
                  mainWrapper: 'border-none shadow-none',
                  innerWrapper: 'px-0',
                  listboxWrapper: 'bg-white !max-w-none',
                  popoverContent: 'bg-white !min-w-[320px]',
                }}
                radius="none"
              >
                {BOOL_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} textValue={option.label}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
              {fieldState.error && (
                <span className="mt-1 text-[12px] text-red-500">
                  {fieldState.error.message || 'Type is required'}
                </span>
              )}
            </>
          )}
        />
      </div>

      {/* Delete Button Column */}
      {canRemove && (
        <div className="flex w-[60px] items-center justify-center">
          <button
            type="button"
            className="flex size-[40px] cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-[8px] opacity-30"
            onClick={remove}
            aria-label={`Remove stack integration ${index + 1}`}
            style={{
              outline: 'none',
              boxShadow: 'none',
            }}
          >
            <XCircle size={24} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AdvisorsTableItem;
