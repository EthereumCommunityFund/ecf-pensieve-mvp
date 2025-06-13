import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import * as React from 'react';
import { useCallback } from 'react';

import { CheckSelectIcon } from '@/components/icons';

import SelectCheckItem from './selectCheckItem';

const filter = createFilterOptions<FilmOptionType>();

interface IProps {
  options?: Array<{ value: string; label: string }>;
  onChange: (value: string[]) => void;
  initialValues?: FilmOptionType[];
  value?: string[];
  isDisabled?: boolean;
  placeholder?: string;
  isInvalid?: boolean;
}

export default function SelectCategories({
  onChange,
  value: outerValue,
  initialValues = [],
  options = [],
  isDisabled = false,
  placeholder,
  isInvalid = false,
}: IProps) {
  const [value, setValue] = React.useState<FilmOptionType[]>(initialValues);
  React.useEffect(() => {
    if (outerValue) {
      setValue(
        outerValue.map((item) => ({ value: item, label: item, isAdd: false })),
      );
    }
  }, [outerValue]);

  const handleChange = useCallback(
    (newValue: FilmOptionType[]) => {
      const seenValues = new Set<string>();
      const uniqueValues = newValue.filter((item) => {
        if (seenValues.has(item.value)) {
          return false;
        }
        seenValues.add(item.value);
        return true;
      });

      if (!outerValue) {
        setValue(uniqueValues);
      }
      onChange(uniqueValues.map((item) => item.value) || []);
    },
    [onChange, outerValue],
  );

  return (
    <Autocomplete
      size="small"
      multiple
      value={value}
      onChange={(_, newValue) => handleChange(newValue)}
      disabled={isDisabled}
      sx={{
        '& .MuiAutocomplete-tag': {
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '4px',
          color: 'black',
          fontSize: '14px',
          '& .MuiChip-deleteIcon': {
            color: 'rgba(0, 0, 0, 0.3)',
            '&:hover': {
              color: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
        '& .MuiAutocomplete-popupIndicator': {
          borderRadius: '4px',
          width: '24px',
          height: '24px',
          marginRight: '8px',
          color: 'rgba(0, 0, 0, 0.6)',
          backgroundImage: 'url(/arrow.svg)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: '16px 16px',
          '& .MuiSvgIcon-root': {
            display: 'none', // Hide default icon
          },
        },
        '& .MuiAutocomplete-clearIndicator': {
          color: 'rgba(0, 0, 0, 0.6)',
        },
      }}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);

        const { inputValue } = params;
        const isExisting = options.some(
          (option) => inputValue === option.label,
        );
        if (inputValue !== '' && !isExisting) {
          filtered.push({
            value: inputValue,
            label: `Add "${inputValue}"`,
            isAdd: true,
          });
        }

        return filtered;
      }}
      disablePortal
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      options={options}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      slotProps={{
        popper: {
          sx: {
            zIndex: 9999, // Ensure dropdown shows on top layer
            marginTop: '4px !important', // 4px distance between dropdown and input
            '& .MuiAutocomplete-paper': {
              backgroundColor: 'white', // White background
              border: '1px solid #e4e4e7',
              borderRadius: '12px', // Rounded corners
              boxShadow:
                '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              maxHeight: '256px', // Limit dropdown max height
              overflow: 'hidden', // Prevent content overflow
            },
            '& .MuiAutocomplete-listbox': {
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '0',
              boxShadow: 'none',
              maxHeight: '256px', // Limit list max height
              overflow: 'auto', // Add scrollbar
              padding: '6px', // Add inner padding
              '& .MuiAutocomplete-option': {
                color: 'rgba(0, 0, 0, 0.8)',
                fontSize: '14px',
                fontWeight: '400',
                minHeight: '30px', // Set option minimum height
                padding: '0 12px', // Set option inner padding
                borderRadius: '8px', // Option rounded corners
                margin: '1px 0', // Option spacing
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
                '&[aria-selected="true"]': {
                  backgroundColor: 'transparent', // Selected doesn't need background
                },
                '&.Mui-focused, &:hover': {
                  backgroundColor: '#d4d4d8', // hover background color
                },
                '&[aria-selected="true"].Mui-focused, &[aria-selected="true"]:hover':
                  {
                    backgroundColor: '#d4d4d8', // hover state for selected items
                  },
              },
            },
          },
          placement: 'bottom-start', // Ensure dropdown appears below input
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 4], // Set 4px spacing
              },
            },
            {
              name: 'flip',
              enabled: true,
              options: {
                altBoundary: true,
                rootBoundary: 'viewport',
                padding: 8,
              },
            },
            {
              name: 'preventOverflow',
              enabled: true,
              options: {
                altAxis: true,
                altBoundary: true,
                tether: false,
                rootBoundary: 'viewport',
                padding: 8,
              },
            },
          ],
        },
      }}
      getOptionLabel={(option) => {
        if ((option as any).isAdd) {
          return option.value;
        }
        return option.label;
      }}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props as any;
        const isSelected =
          value.findIndex((item) => item.value === option.value) > -1;
        const isAddOption = (option as any).isAdd;

        return (
          <li key={key} {...optionProps}>
            <span style={{ flex: 1 }}>{option.label}</span>
            {isSelected && !isAddOption && <CheckSelectIcon size={12} />}
          </li>
        );
      }}
      renderInput={(params) => {
        return (
          <TextField
            {...params}
            placeholder={placeholder}
            error={isInvalid}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                borderRadius: '8px',
                minHeight: '40px',
                fontSize: '14px',
                color: '#18181b',
                transition: 'all 0.15s ease',
                '& fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.1)',
                  borderWidth: '1px',
                },
                '&:hover fieldset': {
                  borderColor: '#d4d4d8',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#18181b',
                  borderWidth: '1px',
                },
                '&.Mui-error fieldset': {
                  borderColor: '#ef4444',
                  borderWidth: '1px',
                },
                '& .MuiOutlinedInput-input': {
                  padding: '0 12px',
                  color: '#18181b',
                  '&::placeholder': {
                    color: '#71717a',
                    opacity: 1,
                  },
                },
              },
            }}
            slotProps={{
              input: {
                ...params.InputProps,
                startAdornment: (
                  <>
                    <React.Fragment>
                      {params.InputProps.startAdornment}
                    </React.Fragment>
                  </>
                ),
              },
            }}
          />
        );
      }}
    />
  );
}

interface FilmOptionType {
  value: string;
  label: string;
  isAdd?: boolean;
}

export { SelectCheckItem };
