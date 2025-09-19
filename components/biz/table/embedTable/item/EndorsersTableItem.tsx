'use client';

import { cn } from '@heroui/react';
import { XCircle } from '@phosphor-icons/react';
import React, { useCallback, useMemo } from 'react';
import { Controller, FieldArrayWithId, useFormContext } from 'react-hook-form';

import URLInput from '@/components/biz/FormAndTable/URLInput';

import { getColumnConfig } from '../embedTableUtils';

interface EndorsersTableItemProps {
  field: FieldArrayWithId<any, any, 'fieldId'>;
  index: number;
  remove: () => void;
  itemKey: 'endorsers';
  canRemove: boolean;
}

const EndorsersTableItem: React.FC<EndorsersTableItemProps> = ({
  index,
  remove,
  itemKey,
  canRemove,
}) => {
  const { control } = useFormContext();

  const fieldPaths = useMemo(
    () => ({
      name: `${itemKey}.${index}.name`,
      socialIdentifier: `${itemKey}.${index}.socialIdentifier`,
      reference: `${itemKey}.${index}.reference`,
    }),
    [itemKey, index],
  );

  const getConfig = useCallback(
    (columnKey: string) => getColumnConfig(itemKey, columnKey),
    [itemKey],
  );

  const baseClass =
    'flex shrink-0 items-center border-r border-black/10 px-[10px] py-[5px]';

  const renderTextInput = (
    fieldName: string,
    placeholder: string,
    columnKey: string,
  ) => (
    <div className={cn(baseClass, `w-[${getConfig(columnKey)?.width}px]`)}>
      <Controller
        name={fieldName}
        control={control}
        render={({ field, fieldState }) => (
          <div className="w-full">
            <input
              type="text"
              value={field.value || ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder={placeholder}
              className={cn(
                'h-[32px] w-full border-none bg-transparent rounded-[5px] px-[4px]',
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
  );

  return (
    <div className="flex min-h-[40px] w-full items-stretch border-b border-black/10 bg-white last:border-b-0">
      {renderTextInput(fieldPaths.name, 'input name', 'name')}
      {renderTextInput(
        fieldPaths.socialIdentifier,
        'input social identifier',
        'socialIdentifier',
      )}

      <div className={cn(baseClass, `w-[${getConfig('reference')?.width}px]`)}>
        <Controller
          name={fieldPaths.reference}
          control={control}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <URLInput
                value={field.value || ''}
                onChange={field.onChange}
                placeholder="https://example.com"
                required={true}
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

      {canRemove && (
        <div className="flex w-[60px] items-center justify-center">
          <button
            type="button"
            className="flex size-[40px] cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-[8px] opacity-30"
            onClick={remove}
            aria-label={`Remove endorser ${index + 1}`}
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

export default EndorsersTableItem;
