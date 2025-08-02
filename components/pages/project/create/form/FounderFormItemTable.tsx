'use client';

import { XCircle } from '@phosphor-icons/react';
import React, { useCallback } from 'react';
import {
  Control,
  FieldError,
  FieldErrorsImpl,
  Merge,
  UseFormRegister,
} from 'react-hook-form';

import RegionAutocomplete from '@/components/biz/table/RegionAutocomplete';

import { IFounder, IProjectFormData } from '../types';

interface FounderFormItemTableProps {
  index: number;
  remove: (index: number) => void;
  register: UseFormRegister<IProjectFormData>;
  control: Control<IProjectFormData>;
  errors:
    | Merge<FieldError, FieldErrorsImpl<IProjectFormData['founders'][number]>>
    | undefined;
  foundersKey: string;
  canRemove: boolean;
  onRemove?: () => void;
  value: IFounder;
  onChange: (value: IFounder) => void;
}

const FounderFormItemTable: React.FC<FounderFormItemTableProps> = ({
  index,
  remove,
  register,
  control,
  errors,
  foundersKey,
  canRemove,
  onRemove,
  value,
  onChange,
}) => {
  // Handle region value with validation - ensure stable value
  const regionValue = value?.region ?? '';

  // Handle region selection change
  const handleRegionChange = useCallback(
    (newValue: string) => {
      onChange({ ...value, region: newValue });
    },
    [onChange, value],
  );

  return (
    <div className="flex items-stretch border-b border-black/5 bg-white">
      <div className="flex-1 border-r border-black/10 p-[10px]">
        <input
          type="text"
          placeholder="Type a name"
          value={value?.name || ''}
          onChange={(e) => {
            onChange({ ...value, name: e.target.value });
          }}
          className={`h-[20px] w-full border-none bg-transparent px-0 text-[14px] font-[600] leading-[19px] text-black placeholder:text-black/60 focus:shadow-none focus:outline-none focus:ring-0 ${errors?.name ? 'bg-red-50' : ''}`}
          style={{
            boxShadow: 'none !important',
            outline: 'none !important',
            border: 'none !important',
          }}
        />
        {errors?.name && (
          <span className="text-[13px] text-red-500">
            {typeof errors?.name === 'string'
              ? errors.name
              : errors?.name?.message || 'Name is required'}
          </span>
        )}
      </div>
      <div className="flex-1 border-r border-black/10 p-[10px]">
        <input
          type="text"
          placeholder="Type their role or title"
          value={value?.title || ''}
          onChange={(e) => {
            onChange({ ...value, title: e.target.value });
          }}
          className={`h-[20px] w-full border-none bg-transparent px-0 text-[13px] font-[400] leading-[18px] text-black placeholder:text-black/60 focus:shadow-none focus:outline-none focus:ring-0`}
          style={{
            boxShadow: 'none !important',
            outline: 'none !important',
            border: 'none !important',
          }}
        />
        {errors?.title && (
          <span className="text-[13px] text-red-500">
            {typeof errors.title === 'string'
              ? errors.title
              : errors.title?.message || 'Title is required'}
          </span>
        )}
      </div>
      <div className="flex-1 p-[10px]">
        <RegionAutocomplete
          value={regionValue}
          onChange={handleRegionChange}
          placeholder="Select or type to search"
        />
        {errors?.region && (
          <span className="text-[13px] text-red-500">
            {typeof errors?.region === 'string'
              ? errors.region
              : errors?.region?.message || 'Region is required'}
          </span>
        )}
      </div>
      <div className="flex w-[60px] items-center justify-center">
        {canRemove && (
          <button
            type="button"
            className="flex size-[40px] cursor-pointer items-center justify-center  rounded-full border-none bg-transparent p-[8px] opacity-30"
            onClick={() => {
              if (onRemove) {
                onRemove();
              } else {
                remove(index);
              }
            }}
            aria-label={`Remove founder ${index + 1}`}
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

export default FounderFormItemTable;
