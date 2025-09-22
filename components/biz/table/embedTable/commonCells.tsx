'use client';

import { cn } from '@heroui/react';
import { XCircle } from '@phosphor-icons/react';
import React, { PropsWithChildren } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { Select, SelectItem } from '@/components/base/select';
import URLInput from '@/components/biz/FormAndTable/URLInput';
import { IItemKey } from '@/types/item';

import { getColumnConfig } from './embedTableUtils';

const BASE_CELL_CLASS =
  'flex shrink-0 items-center border-r border-black/10 px-[10px] py-[5px]';
const INPUT_CLASS =
  'h-[32px] w-full border-none bg-transparent px-[4px] rounded-[6px] text-[14px] font-[400] leading-[19px] text-black placeholder:text-black/60 focus:shadow-none focus:outline-none focus:ring-0';

export const EmbedTableRow: React.FC<
  PropsWithChildren<{ className?: string }>
> = ({ children, className }) => (
  <div
    className={cn(
      'flex min-h-[40px] w-full items-stretch border-b border-black/10 bg-white last:border-b-0',
      className,
    )}
  >
    {children}
  </div>
);

interface EmbedTableCellWrapperProps extends PropsWithChildren {
  itemKey: IItemKey | string;
  columnKey: string;
  className?: string;
  showRightBorder?: boolean;
}

export const EmbedTableCellWrapper: React.FC<EmbedTableCellWrapperProps> = ({
  itemKey,
  columnKey,
  className,
  children,
  showRightBorder = true,
}) => {
  const width = getColumnConfig(itemKey as IItemKey, columnKey)?.width;

  return (
    <div
      className={cn(
        BASE_CELL_CLASS,
        !showRightBorder && 'border-r-0',
        className,
      )}
      style={
        width
          ? {
              width,
              minWidth: width,
            }
          : undefined
      }
    >
      {children}
    </div>
  );
};

interface EmbedTableTextInputCellProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  itemKey: IItemKey | string;
  columnKey: string;
  name: string;
  errorMessageOverride?: (message?: string) => string | undefined;
  showRightBorder?: boolean;
}

export const EmbedTableTextInputCell: React.FC<
  EmbedTableTextInputCellProps
> = ({
  itemKey,
  columnKey,
  name,
  placeholder,
  className,
  errorMessageOverride,
  showRightBorder,
  ...inputProps
}) => {
  const { control } = useFormContext();

  return (
    <EmbedTableCellWrapper
      itemKey={itemKey}
      columnKey={columnKey}
      showRightBorder={showRightBorder}
    >
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <div className="w-full">
            <input
              {...field}
              {...inputProps}
              value={field.value ?? ''}
              placeholder={placeholder}
              className={cn(
                INPUT_CLASS,
                className,
                fieldState.error && 'bg-red-50',
              )}
              style={{
                boxShadow: 'none !important',
                outline: 'none !important',
                border: 'none !important',
                ...(inputProps.style || {}),
              }}
            />
            {fieldState.error && (
              <span className="mt-1 text-[12px] text-red-500">
                {errorMessageOverride
                  ? errorMessageOverride(fieldState.error.message)
                  : fieldState.error.message}
              </span>
            )}
          </div>
        )}
      />
    </EmbedTableCellWrapper>
  );
};

interface EmbedTableSelectCellProps {
  itemKey: IItemKey | string;
  columnKey: string;
  name: string;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
  selectProps?: Partial<React.ComponentProps<typeof Select>>;
  errorMessageOverride?: (message?: string) => string | undefined;
  showRightBorder?: boolean;
}

export const EmbedTableSelectCell: React.FC<EmbedTableSelectCellProps> = ({
  itemKey,
  columnKey,
  name,
  placeholder,
  options,
  selectProps,
  errorMessageOverride,
  showRightBorder,
}) => {
  const { control } = useFormContext();
  const { classNames, ...restSelectProps } = selectProps || {};

  const defaultClassNames = {
    trigger:
      'h-[32px] min-h-[32px] border-none bg-transparent shadow-none px-0',
    mainWrapper: 'border-none shadow-none',
    innerWrapper: 'px-0',
    listboxWrapper: 'bg-white !max-w-none',
    popoverContent: 'bg-white !min-w-[260px]',
    ...(classNames || {}),
  };

  return (
    <EmbedTableCellWrapper
      itemKey={itemKey}
      columnKey={columnKey}
      showRightBorder={showRightBorder}
    >
      <Controller
        name={name}
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
              placeholder={placeholder}
              aria-label={placeholder || columnKey}
              radius="none"
              {...restSelectProps}
              classNames={defaultClassNames}
            >
              {options.map((option) => (
                <SelectItem key={option.value} textValue={option.label}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
            {fieldState.error && (
              <span className="mt-1 text-[12px] text-red-500">
                {errorMessageOverride
                  ? errorMessageOverride(fieldState.error.message)
                  : fieldState.error.message || 'Selection is required'}
              </span>
            )}
          </div>
        )}
      />
    </EmbedTableCellWrapper>
  );
};

interface EmbedTableURLInputCellProps {
  itemKey: IItemKey | string;
  columnKey: string;
  name: string;
  placeholder?: string;
  showRightBorder?: boolean;
}

export const EmbedTableURLInputCell: React.FC<EmbedTableURLInputCellProps> = ({
  itemKey,
  columnKey,
  name,
  placeholder,
  showRightBorder,
}) => {
  const { control } = useFormContext();

  return (
    <EmbedTableCellWrapper
      itemKey={itemKey}
      columnKey={columnKey}
      showRightBorder={showRightBorder}
    >
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <div className="w-full">
            <URLInput
              value={field.value || ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder={placeholder}
            />
            {fieldState.error && (
              <span className="mt-1 text-[12px] text-red-500">
                {fieldState.error.message}
              </span>
            )}
          </div>
        )}
      />
    </EmbedTableCellWrapper>
  );
};

interface EmbedTableRemoveButtonCellProps {
  canRemove: boolean;
  onRemove: () => void;
  ariaLabel: string;
}

export const EmbedTableRemoveButtonCell: React.FC<
  EmbedTableRemoveButtonCellProps
> = ({ canRemove, onRemove, ariaLabel }) => {
  if (!canRemove) return null;

  return (
    <div className="flex w-[60px] items-center justify-center">
      <button
        type="button"
        className="flex size-[40px] cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-[8px] opacity-30"
        onClick={onRemove}
        aria-label={ariaLabel}
        style={{ outline: 'none', boxShadow: 'none' }}
      >
        <span className="sr-only">{ariaLabel}</span>
        <XCircle size={24} />
      </button>
    </div>
  );
};
