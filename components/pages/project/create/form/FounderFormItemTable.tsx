'use client';

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { XCircle } from '@phosphor-icons/react';
import React, { useCallback, useMemo } from 'react';
import {
  Control,
  FieldError,
  FieldErrorsImpl,
  Merge,
  UseFormRegister,
} from 'react-hook-form';

import {
  getRegionOptions,
  IRegionData,
  isRegionDataValid,
} from '@/utils/region';

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
  // Handle region value with validation
  const regionValue = value?.region || '';

  // Check if region data is available
  const isRegionDataAvailable = isRegionDataValid();
  const allRegionOptions = getRegionOptions();

  // Find current selected option - always ensure we have a consistent controlled state
  const selectedRegion = useMemo(() => {
    // Always return either a valid region or undefined to maintain controlled state consistency
    if (!regionValue || regionValue.trim() === '') {
      return undefined; // This ensures the component starts as controlled with undefined
    }
    return (
      allRegionOptions.find((option) => option.value === regionValue) ||
      undefined
    );
  }, [allRegionOptions, regionValue]);

  // Handle region selection change
  const handleRegionChange = useCallback(
    (newValue: IRegionData | null) => {
      onChange({ ...value, region: newValue?.value || '' });
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
        {isRegionDataAvailable ? (
          <Autocomplete
            value={selectedRegion}
            onChange={(_, newValue) => handleRegionChange(newValue)}
            options={allRegionOptions}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) =>
              option.value === value.value
            }
            size="small"
            disablePortal
            selectOnFocus
            clearOnBlur={false}
            handleHomeEndKeys
            freeSolo={false}
            disableClearable
            forcePopupIcon={false}
            blurOnSelect
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'transparent',
                borderRadius: '0',
                minHeight: '20px',
                height: '20px',
                fontSize: '13px',
                color: '#000',
                padding: '0',
                '& fieldset': {
                  border: 'none',
                },
                '&:hover fieldset': {
                  border: 'none',
                },
                '&.Mui-focused fieldset': {
                  border: 'none',
                },
                '& .MuiOutlinedInput-input': {
                  padding: '0',
                  height: '20px',
                  lineHeight: '18px',
                  color: '#000',
                  fontWeight: '400',
                  '&::placeholder': {
                    color: 'rgba(0, 0, 0, 0.6)',
                    opacity: 1,
                  },
                },
                '& .MuiAutocomplete-endAdornment': {
                  display: 'none',
                },
              },
            }}
            slotProps={{
              popper: {
                sx: {
                  zIndex: 9999,
                  marginTop: '4px !important',
                  '& .MuiAutocomplete-paper': {
                    backgroundColor: 'white',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '8px',
                    boxShadow:
                      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    maxHeight: '200px',
                    overflow: 'hidden',
                    minWidth: '300px',
                  },
                  '& .MuiAutocomplete-listbox': {
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '0',
                    boxShadow: 'none',
                    maxHeight: '200px',
                    overflow: 'auto',
                    padding: '6px',
                    '& .MuiAutocomplete-option': {
                      color: '#000',
                      fontSize: '13px',
                      fontWeight: '400',
                      minHeight: '30px',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      margin: '1px 0',
                      transition: 'all 0.15s ease',
                      '&[aria-selected="true"]': {
                        backgroundColor: 'transparent',
                      },
                      '&.Mui-focused, &:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                      },
                      '&[aria-selected="true"].Mui-focused, &[aria-selected="true"]:hover':
                        {
                          backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        },
                    },
                  },
                },
              },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Select or type to search"
                variant="outlined"
                size="small"
              />
            )}
          />
        ) : (
          <div className="flex h-[20px] items-center">
            <span className="text-[13px] text-gray-500">
              Region data unavailable
            </span>
          </div>
        )}
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
