'use client';

import { cn } from '@heroui/react';
import { XCircle } from '@phosphor-icons/react';
import React, { useMemo } from 'react';
import { Controller, FieldArrayWithId, useFormContext } from 'react-hook-form';

import { Select, SelectItem } from '@/components/base/select';
import ProjectSearchSelector from '@/components/biz/FormAndTable/ProjectSearch/ProjectSearchSelector';
import URLInput from '@/components/biz/FormAndTable/URLInput';

import { ITypeOption } from './AffiliatedProjectsTableItem';

/**
 * Contribution type options for select dropdown
 */
export const CONTRIBUTION_TYPE_OPTIONS: ITypeOption[] = [
  { value: 'core_development', label: 'Core development' },
  { value: 'technical_integration', label: 'Technical Integration' },
  { value: 'research', label: 'Research' },
  { value: 'community_growth', label: 'Community&Growth' },
  { value: 'operations_governance', label: 'Operations&Governance' },
  { value: 'design', label: 'Design' },
  { value: 'education', label: 'Education' },
  { value: 'security', label: 'Security' },
  { value: 'fundraising', label: 'Fundraising' },
  { value: 'other', label: 'Other (Specify)' },
];

interface ContributingTeamsTableItemProps {
  field: FieldArrayWithId<any, any, 'fieldId'>;
  index: number;
  remove: () => void;
  itemKey: 'contributing_teams';
  canRemove: boolean;
}

const ContributingTeamsTableItem: React.FC<ContributingTeamsTableItemProps> = ({
  field,
  index,
  remove,
  itemKey,
  canRemove,
}) => {
  const { control } = useFormContext();

  // Create stable field paths using useMemo
  const fieldPaths = useMemo(
    () => ({
      project: `${itemKey}.${index}.project`,
      type: `${itemKey}.${index}.type`,
      description: `${itemKey}.${index}.description`,
      reference: `${itemKey}.${index}.reference`,
    }),
    [itemKey, index],
  );

  return (
    <div
      key={index}
      className="flex min-h-[40px] w-full items-stretch border-b border-black/10 bg-white last:border-b-0"
    >
      {/* Project Column */}
      <div className="flex w-[300px] shrink-0 flex-col justify-center border-r border-black/10 px-[10px] py-[5px]">
        <Controller
          name={fieldPaths.project}
          control={control}
          render={({ field, fieldState }) => (
            <>
              <ProjectSearchSelector
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                }}
                onBlur={field.onBlur}
                placeholder="Search Project (on pensieve)"
                multiple={false}
                allowNA={false}
                columnName="Project"
                itemKey={'contributing_teams'}
              />
              {fieldState.error && (
                <span className="mt-1 text-[12px] text-red-500">
                  {fieldState.error.message || 'Project is required'}
                </span>
              )}
            </>
          )}
        />
      </div>

      {/* Area of Contribution Column */}
      <div className="flex w-[200px] shrink-0 flex-col justify-center border-r border-black/10 px-[10px] py-[5px]">
        <Controller
          name={fieldPaths.type}
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
                placeholder="Options"
                aria-label="Select area of contribution"
                classNames={{
                  base: 'max-w-full',
                  trigger: `h-[32px] min-h-[32px] border-none bg-transparent shadow-none px-0 ${
                    fieldState.error ? 'bg-red-50' : ''
                  }`,
                  mainWrapper: 'border-none shadow-none',
                  innerWrapper: 'px-0',
                  listboxWrapper: 'bg-white !max-w-none',
                  popoverContent: 'bg-white !min-w-[250px]',
                }}
                radius="none"
              >
                {CONTRIBUTION_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} textValue={option.label}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
              {fieldState.error && (
                <span className="mt-1 text-[12px] text-red-500">
                  {fieldState.error.message ||
                    'Area of contribution is required'}
                </span>
              )}
            </>
          )}
        />
      </div>

      {/* Description Column */}
      <div className="flex w-[250px] shrink-0 items-center border-r border-black/10 px-[10px] py-[5px]">
        <Controller
          name={fieldPaths.description}
          control={control}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <input
                type="text"
                value={field.value || ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="Give a description"
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

      {/* Reference Column */}
      <div
        className={cn(
          'flex w-[200px] shrink-0 flex-col justify-center px-[10px] py-[5px]',
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

      {/* Delete Button Column */}
      {canRemove && (
        <div className="flex w-[60px] items-center justify-center">
          <button
            type="button"
            className="flex size-[40px] cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-[8px] opacity-30"
            onClick={remove}
            aria-label={`Remove contributing team ${index + 1}`}
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

export default ContributingTeamsTableItem;
