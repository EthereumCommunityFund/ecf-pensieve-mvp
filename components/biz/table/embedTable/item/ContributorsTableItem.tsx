'use client';

import { cn } from '@heroui/react';
import { XCircle } from '@phosphor-icons/react';
import React, { useCallback, useMemo } from 'react';
import { Controller, FieldArrayWithId, useFormContext } from 'react-hook-form';

import { Select, SelectItem } from '@/components/base/select';

import { getColumnConfig } from '../embedTableUtils';

import type { ITypeOption } from './AffiliatedProjectsTableItem';

export const CONTRIBUTOR_ROLE_OPTIONS: ITypeOption[] = [
  { value: 'employee', label: 'Employee' },
  { value: 'researcher', label: 'Researcher' },
  { value: 'assistant', label: 'Assistant' },
  { value: 'project_participant', label: 'Project Participant' },
  { value: 'author', label: 'Author' },
  { value: 'community_member', label: 'Community Member' },
  { value: 'other', label: 'Other (specify)' },
];

interface ContributorsTableItemProps {
  field: FieldArrayWithId<any, any, 'fieldId'>;
  index: number;
  remove: () => void;
  itemKey: 'contributors';
  canRemove: boolean;
}

const ContributorsTableItem: React.FC<ContributorsTableItemProps> = ({
  index,
  remove,
  itemKey,
  canRemove,
}) => {
  const { control } = useFormContext();

  const fieldPaths = useMemo(
    () => ({
      name: `${itemKey}.${index}.name`,
      role: `${itemKey}.${index}.role`,
      address: `${itemKey}.${index}.address`,
    }),
    [itemKey, index],
  );

  const getConfig = useCallback(
    (columnKey: string) => getColumnConfig(itemKey, columnKey),
    [itemKey],
  );

  const baseClass =
    'flex shrink-0 items-center border-r border-black/10 px-[10px] py-[5px]';

  const renderTextField = (
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
  );

  return (
    <div className="flex min-h-[40px] w-full items-stretch border-b border-black/10 bg-white last:border-b-0">
      {renderTextField(fieldPaths.name, 'input name', 'name')}

      <div className={cn(baseClass, `w-[${getConfig('role')?.width}px]`)}>
        <Controller
          name={fieldPaths.role}
          control={control}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <Select
                selectedKeys={field.value ? [field.value] : []}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string;
                  if (selectedKey !== undefined) {
                    field.onChange(selectedKey);
                  }
                }}
                onBlur={field.onBlur}
                placeholder="select role"
                aria-label="Select contributor role"
                classNames={{
                  trigger:
                    'h-[32px] min-h-[32px] border-none bg-transparent shadow-none px-0',
                  mainWrapper: 'border-none shadow-none',
                  innerWrapper: 'px-0',
                  listboxWrapper: 'bg-white !max-w-none',
                  popoverContent: 'bg-white !min-w-[260px]',
                }}
                radius="none"
              >
                {CONTRIBUTOR_ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} textValue={option.label}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
              {fieldState.error && (
                <span className="mt-1 text-[12px] text-red-500">
                  {fieldState.error.message || 'role is required'}
                </span>
              )}
            </div>
          )}
        />
      </div>

      {renderTextField(
        fieldPaths.address,
        'input address or social identifier',
        'address',
      )}

      {canRemove && (
        <div className="flex w-[60px] items-center justify-center">
          <button
            type="button"
            className="flex size-[40px] cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-[8px] opacity-30"
            onClick={remove}
            aria-label={`Remove contributor ${index + 1}`}
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

export default ContributorsTableItem;
