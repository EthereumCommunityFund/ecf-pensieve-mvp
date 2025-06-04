import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import * as React from 'react';
import { useCallback } from 'react';

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
    (value: FilmOptionType[]) => {
      if (!outerValue) {
        setValue(value);
      }
      onChange(value.map((item) => item.value) || []);
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
            color: 'rgba(0, 0, 0, 0.6)',
            '&:hover': {
              color: 'rgba(0, 0, 0, 0.8)',
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
            display: 'none', // 隐藏默认图标
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
      slotProps={{
        popper: {
          sx: {
            '& .MuiAutocomplete-listbox': {
              backgroundColor: 'white',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              '& .MuiAutocomplete-option': {
                color: 'black',
                fontSize: '14px',
                '&[aria-selected="true"]': {
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                },
                '&.Mui-focused': {
                  backgroundColor: 'rgb(212, 212, 216)',
                },
              },
            },
          },
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
        return (
          <li key={key} {...optionProps}>
            <SelectCheckItem
              label={option.label}
              isChecked={
                value.findIndex((item) => item.value === option.value) > -1
              }
              showCheck={!(option as any).isAdd}
            />
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
                height: '40px',
                fontSize: '14px',
                color: 'black',
                '& fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.1)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.4)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.4)',
                  borderWidth: '1px',
                },
                '&.Mui-error fieldset': {
                  borderColor: '#ef4444',
                },
                '& .MuiOutlinedInput-input': {
                  padding: '0 10px',
                  color: 'black',
                  '&::placeholder': {
                    color: 'rgba(0, 0, 0, 0.6)',
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
