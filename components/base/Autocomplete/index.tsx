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
      isOptionEqualToValue={(option, value) => option.value === value.value}
      slotProps={{
        popper: {
          sx: {
            zIndex: 9999, // 确保下拉框显示在最上层
            marginTop: '4px !important', // 下拉框离输入框 4px 距离
            '& .MuiAutocomplete-paper': {
              backgroundColor: 'white', // 白色底
              border: '1px solid #e4e4e7',
              borderRadius: '12px', // 圆角处理
              boxShadow:
                '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              maxHeight: '256px', // 限制下拉框最大高度
              overflow: 'hidden', // 防止内容溢出
            },
            '& .MuiAutocomplete-listbox': {
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '0',
              boxShadow: 'none',
              maxHeight: '256px', // 限制列表最大高度
              overflow: 'auto', // 添加滚动条
              padding: '6px', // 添加内边距
              '& .MuiAutocomplete-option': {
                color: 'rgba(0, 0, 0, 0.8)',
                fontSize: '14px',
                fontWeight: '400',
                minHeight: '30px', // 设置选项最小高度
                padding: '0 12px', // 设置选项内边距
                borderRadius: '8px', // 选项圆角
                margin: '1px 0', // 选项间距
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
                '&[aria-selected="true"]': {
                  backgroundColor: 'transparent', // 已选中不需要底色
                },
                '&.Mui-focused, &:hover': {
                  backgroundColor: '#d4d4d8', // hover 背景色
                },
                '&[aria-selected="true"].Mui-focused, &[aria-selected="true"]:hover':
                  {
                    backgroundColor: '#d4d4d8', // 已选中项的 hover 状态
                  },
              },
            },
          },
          placement: 'bottom-start', // 确保下拉框在输入框下方
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 4], // 设置 4px 间距
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
