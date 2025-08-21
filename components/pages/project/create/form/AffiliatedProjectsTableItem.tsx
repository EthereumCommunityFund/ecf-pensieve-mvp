'use client';

import { cn } from '@heroui/react';
import { XCircle } from '@phosphor-icons/react';
import React, { useMemo } from 'react';
import { Controller, FieldArrayWithId, useFormContext } from 'react-hook-form';

import { Select, SelectItem } from '@/components/base/select';

import ProjectSearchSelector from './ProjectSearchSelector';
import URLInput from './URLInput';

/**
 * Affiliation type enum for project relationships
 */
export enum AffiliationType {
  Partner = 'Partner',
  Investor = 'Investor',
  Portfolio = 'Portfolio',
  Subsidiary = 'Subsidiary',
  ParentCompany = 'Parent Company',
  StrategicAlliance = 'Strategic Alliance',
  TechnologyProvider = 'Technology Provider',
  ServiceProvider = 'Service Provider',
  EcosystemMember = 'Ecosystem Member',
  Fork = 'Fork',
  Integration = 'Integration',
  Other = 'Other',
}

/**
 * Affiliation type options for select dropdown
 */
export const AFFILIATION_TYPE_OPTIONS = [
  { value: AffiliationType.Partner, label: 'Partner' },
  { value: AffiliationType.Investor, label: 'Investor' },
  { value: AffiliationType.Portfolio, label: 'Portfolio' },
  { value: AffiliationType.Subsidiary, label: 'Subsidiary' },
  { value: AffiliationType.ParentCompany, label: 'Parent Company' },
  { value: AffiliationType.StrategicAlliance, label: 'Strategic Alliance' },
  { value: AffiliationType.TechnologyProvider, label: 'Technology Provider' },
  { value: AffiliationType.ServiceProvider, label: 'Service Provider' },
  { value: AffiliationType.EcosystemMember, label: 'Ecosystem Member' },
  { value: AffiliationType.Fork, label: 'Fork' },
  { value: AffiliationType.Integration, label: 'Integration' },
  { value: AffiliationType.Other, label: 'Other' },
];

interface AffiliatedProjectsTableItemProps {
  field: FieldArrayWithId<any, any, 'fieldId'>;
  index: number;
  remove: () => void;
  itemKey: 'affiliated_projects';
  canRemove: boolean;
}

const AffiliatedProjectsTableItem: React.FC<
  AffiliatedProjectsTableItemProps
> = ({ field, index, remove, itemKey, canRemove }) => {
  const { control } = useFormContext();

  // Create stable field paths using useMemo
  const fieldPaths = useMemo(
    () => ({
      project: `${itemKey}.${index}.project`,
      affiliationType: `${itemKey}.${index}.affiliationType`,
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
                placeholder="Search or select project"
                multiple={false}
                allowNA={false}
                columnName="Project"
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

      {/* Affiliation Type Column */}
      <div className="flex w-[180px] shrink-0 flex-col justify-center border-r border-black/10 px-[10px] py-[5px]">
        <Controller
          name={fieldPaths.affiliationType}
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
                placeholder="Select type"
                aria-label="Select affiliation type"
                classNames={{
                  base: 'max-w-full',
                  trigger: `h-[32px] min-h-[32px] border-none bg-transparent shadow-none px-0 ${
                    fieldState.error ? 'bg-red-50' : ''
                  }`,
                  value:
                    'text-[14px] font-[600] leading-[19px] text-black pl-0',
                  mainWrapper: 'border-none shadow-none',
                  innerWrapper: 'px-0',
                  listboxWrapper: 'bg-white',
                  popoverContent: 'bg-white',
                }}
                radius="none"
              >
                {AFFILIATION_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} textValue={option.label}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
              {fieldState.error && (
                <span className="mt-1 text-[12px] text-red-500">
                  {fieldState.error.message || 'Affiliation type is required'}
                </span>
              )}
            </>
          )}
        />
      </div>

      {/* Description Column */}
      <div className="flex w-[250px] shrink-0 flex-col justify-center border-r border-black/10 px-[10px] py-[5px]">
        <Controller
          name={fieldPaths.description}
          control={control}
          render={({ field, fieldState }) => (
            <>
              <textarea
                value={field.value || ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="Describe the relationship"
                className={cn(
                  'min-h-[32px] w-full resize-none border-none bg-transparent px-0',
                  'text-[14px] font-[400] leading-[19px] text-black',
                  'placeholder:text-black/60 focus:shadow-none focus:outline-none focus:ring-0',
                  fieldState.error && 'bg-red-50',
                )}
                style={{
                  boxShadow: 'none !important',
                  outline: 'none !important',
                  border: 'none !important',
                }}
                rows={1}
              />
              {fieldState.error && (
                <span className="mt-1 text-[12px] text-red-500">
                  {fieldState.error.message || 'Description is required'}
                </span>
              )}
            </>
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
            aria-label={`Remove affiliated project ${index + 1}`}
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

export default AffiliatedProjectsTableItem;
