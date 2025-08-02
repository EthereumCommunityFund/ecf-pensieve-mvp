'use client';

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import React, { useMemo } from 'react';

import {
  getRegionOptions,
  IRegionData,
  isRegionDataValid,
} from '@/utils/region';

interface RegionAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RegionAutocomplete: React.FC<RegionAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'Select or type to search',
  className = '',
}) => {
  // Check if region data is available
  const isRegionDataAvailable = isRegionDataValid();
  const allRegionOptions = getRegionOptions();

  // Find current selected option - ensure controlled state
  const selectedRegion = useMemo<IRegionData | undefined>(() => {
    if (!value || value.trim() === '') {
      return undefined;
    }
    return (
      allRegionOptions.find((option) => option.value === value) || undefined
    );
  }, [allRegionOptions, value]);

  // Handle region selection change
  const handleRegionChange = (newValue: IRegionData | null) => {
    onChange(newValue?.value || '');
  };

  if (!isRegionDataAvailable) {
    return (
      <div className="flex h-[20px] items-center">
        <span className="text-[13px] text-gray-500">
          Region data unavailable
        </span>
      </div>
    );
  }

  return (
    <Autocomplete
      value={selectedRegion}
      onChange={(_, newValue) => handleRegionChange(newValue)}
      options={allRegionOptions}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, value) => option.value === value?.value}
      size="small"
      disablePortal
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      freeSolo={false}
      disableClearable
      forcePopupIcon={false}
      blurOnSelect
      className={className}
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
          placeholder={placeholder}
          variant="outlined"
          size="small"
        />
      )}
    />
  );
};

export default RegionAutocomplete;
