'use client';

import { XCircle } from '@phosphor-icons/react';
import React, { useCallback } from 'react';
import { FieldError, FieldErrorsImpl, Merge } from 'react-hook-form';

import RegionAutocomplete from '@/components/biz/table/RegionAutocomplete';
import { IPhysicalEntity } from '@/types/item';

interface PhysicalEntityFormItemTableProps {
  index: number;
  remove: (index: number) => void;
  errors: Merge<FieldError, FieldErrorsImpl<IPhysicalEntity>> | undefined;
  isPrimary: boolean;
  canRemove: boolean;
  touchedFields: any;
  isSubmitted?: boolean;
  value: IPhysicalEntity;
  onChange: (value: IPhysicalEntity) => void;
}

const PhysicalEntityFormItemTable: React.FC<
  PhysicalEntityFormItemTableProps
> = ({
  index,
  remove,
  errors,
  isPrimary,
  canRemove,
  touchedFields,
  isSubmitted,
  value,
  onChange,
}) => {
  const legalNameTouched = touchedFields.physical_entity?.[index]?.legalName;

  // Handle region value with validation - ensure stable value
  const regionValue = value?.country ?? '';

  // Handle region selection change
  const handleRegionChange = useCallback(
    (newValue: string) => {
      onChange({ ...value, country: newValue });
    },
    [onChange, value],
  );
  return (
    <div className="flex items-stretch border-b border-black/5 bg-white">
      <div className="flex-1 border-r border-black/10 p-[10px]">
        <input
          type="text"
          placeholder="Type a legal name"
          value={value?.legalName || ''}
          onChange={(e) => {
            onChange({ ...value, legalName: e.target.value });
          }}
          className={`h-[20px] w-full border-none bg-transparent px-0 text-[14px] font-[600] leading-[19px] text-black placeholder:text-black/60 focus:shadow-none focus:outline-none focus:ring-0 ${legalNameTouched && errors?.legalName ? 'bg-red-50' : ''}`}
          style={{
            boxShadow: 'none !important',
            outline: 'none !important',
            border: 'none !important',
          }}
        />
        {errors?.legalName &&
          (legalNameTouched || !isPrimary || isSubmitted) && (
            <span className="text-[13px] text-red-500">
              {typeof errors.legalName === 'string'
                ? errors.legalName
                : errors.legalName?.message || 'legal name is required'}
            </span>
          )}
      </div>
      <div className="flex-1 p-[10px]">
        <RegionAutocomplete
          value={regionValue}
          onChange={handleRegionChange}
          placeholder="Select or type to search"
        />
        {errors?.country && (
          <span className="text-[13px] text-red-500">
            {typeof errors?.country === 'string'
              ? errors.country
              : errors?.country?.message || 'Region is required'}
          </span>
        )}
      </div>
      <div className="flex w-[60px] items-center justify-center">
        {canRemove && (
          <button
            type="button"
            className="flex size-[40px] cursor-pointer items-center justify-center  rounded-full border-none bg-transparent p-[8px] opacity-30"
            onClick={() => remove(index)}
            aria-label={`Remove website ${index + 1}`}
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

export default PhysicalEntityFormItemTable;
