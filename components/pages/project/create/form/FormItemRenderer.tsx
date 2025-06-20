import { Avatar } from '@heroui/react';
import { DateValue } from '@internationalized/date';
import { Image as ImageIcon } from '@phosphor-icons/react';
import React from 'react';
import {
  ControllerFieldState,
  ControllerRenderProps,
  useFormContext,
} from 'react-hook-form';

import {
  Autocomplete,
  Button,
  DatePicker,
  Input,
  Select,
  SelectItem,
  Textarea,
} from '@/components/base';
import { CalendarBlankIcon } from '@/components/icons';
import { IItemConfig, IItemKey } from '@/types/item';
import {
  buildDatePickerProps,
  dateToDateValue,
  dateValueToDate,
} from '@/utils/formatters';

import { IProjectFormData } from '../types';

import FounderFormItem from './FounderFormItem';
import InputPrefix from './InputPrefix';
import PhotoUpload from './PhotoUpload';
import WebsiteFormItem from './WebsiteFormItem';

interface FormItemRendererProps {
  field: ControllerRenderProps<any, any>;
  fieldState: ControllerFieldState;
  itemConfig: IItemConfig<IItemKey>;
  fieldApplicability: Record<string, boolean>;
}

const FormItemRenderer: React.FC<FormItemRendererProps> = ({
  field,
  fieldState,
  itemConfig,
  fieldApplicability,
}) => {
  const { error } = fieldState;
  const {
    key: itemKey,
    placeholder,
    label,
    options,
    startContentText,
    minRows,
    formDisplayType,
    componentsProps = {},
  } = itemConfig;

  const { register, formState } = useFormContext<IProjectFormData>();
  const { touchedFields } = formState;

  const isDisabled = fieldApplicability?.[itemKey] === false;

  const errorMessageElement = error ? (
    <p className="mt-1 text-[12px] text-red-500">{error.message}</p>
  ) : null;

  switch (formDisplayType) {
    case 'string':
    case 'link':
      return (
        <div>
          <Input
            {...field}
            value={field.value || ''}
            placeholder={placeholder}
            isInvalid={!!error}
            isDisabled={isDisabled}
            startContent={
              startContentText ? (
                <InputPrefix prefix={startContentText} />
              ) : undefined
            }
            classNames={{
              inputWrapper: startContentText ? 'pl-0 pr-[10px]' : undefined,
            }}
          />
          {errorMessageElement}
        </div>
      );
    case 'stringMultiple':
      return (
        <Input
          {...field}
          value={field.value || ''}
          placeholder={placeholder}
          isInvalid={!!error}
          isDisabled={isDisabled}
        />
      );
    case 'textarea':
      return (
        <div>
          <Textarea
            {...field}
            value={field.value || ''}
            placeholder={placeholder}
            isInvalid={!!error}
            isDisabled={isDisabled}
            minRows={minRows}
          />
          {errorMessageElement}
        </div>
      );

    case 'select':
    case 'selectMultiple': {
      const isMultiple = formDisplayType === 'selectMultiple';
      const currentSelectedKeys: Set<string> = new Set();

      if (isMultiple) {
        if (Array.isArray(field.value)) {
          field.value.forEach((val) => {
            if (val !== null && val !== undefined) {
              currentSelectedKeys.add(String(val));
            }
          });
        } else if (
          typeof field.value === 'string' &&
          field.value.trim() !== ''
        ) {
          field.value.split(',').forEach((part) => {
            const trimmedPart = part.trim();
            if (trimmedPart) {
              currentSelectedKeys.add(trimmedPart);
            }
          });
        }
      } else {
        if (
          field.value !== null &&
          field.value !== undefined &&
          String(field.value).trim() !== ''
        ) {
          currentSelectedKeys.add(String(field.value));
        }
      }

      return (
        <div>
          <Select
            name={field.name}
            ref={field.ref}
            variant="bordered"
            placeholder={placeholder}
            selectionMode={isMultiple ? 'multiple' : 'single'}
            selectedKeys={currentSelectedKeys}
            onSelectionChange={(selectedItems: 'all' | Set<React.Key>) => {
              if (selectedItems === 'all') {
                if (isMultiple && options) {
                  field.onChange(options.map((opt) => opt.value));
                } else {
                  field.onChange(null);
                }
              } else {
                if (isMultiple) {
                  const newValues = Array.from(selectedItems).map((key) =>
                    String(key),
                  );
                  field.onChange(newValues);
                } else {
                  const firstKey = Array.from(selectedItems)[0];
                  field.onChange(firstKey != null ? String(firstKey) : null);
                }
              }
              // Trigger blur event for validation after selection is complete
              // Also trigger blur event when dropdown is closed
              // Ensure field.value is an array
              field.onBlur(); // Trigger validation
            }}
            onClose={() => {
              // 当下拉框关闭时也触发 blur 事件
              field.onBlur();
            }}
            isInvalid={!!error}
            isDisabled={isDisabled}
            aria-label={label}
          >
            {(options || []).map((option) => (
              <SelectItem
                key={option.value}
                textValue={option.label}
                aria-label={option.label}
              >
                {option.label}
              </SelectItem>
            ))}
          </Select>
          {errorMessageElement}
        </div>
      );
    }
    case 'autoComplete': {
      // 确保 field.value 是数组格式
      const currentValue = Array.isArray(field.value) ? field.value : [];

      return (
        <div>
          <Autocomplete
            options={options || []}
            value={currentValue}
            onChange={(newValue: string[]) => {
              field.onChange(newValue);
              field.onBlur(); // 触发验证
            }}
            placeholder={placeholder}
            isDisabled={isDisabled}
            isInvalid={!!error}
          />
          {errorMessageElement}
        </div>
      );
    }
    case 'img': {
      return (
        <div>
          <PhotoUpload
            initialUrl={field.value ?? undefined}
            onUploadSuccess={(url: string) => {
              field.onChange(url);
            }}
            className="size-[140px] rounded-full bg-transparent"
          >
            <Avatar
              size="lg"
              icon={<ImageIcon className="size-[64px] text-gray-400" />}
              src={field.value ?? undefined}
              alt={label || 'Upload image'}
              className="size-[140px] cursor-pointer border border-dashed border-gray-300 bg-black/5 hover:bg-gray-200"
            />
          </PhotoUpload>
          {errorMessageElement}
        </div>
      );
    }
    case 'date': {
      const dateConstraintProps = buildDatePickerProps(
        itemConfig.dateConstraints,
      );

      return (
        <div>
          <DatePicker
            showMonthAndYearPickers={true}
            value={dateToDateValue(field.value)}
            onChange={(dateValue: DateValue | null) => {
              field.onChange(dateValueToDate(dateValue));
            }}
            isInvalid={!!error}
            isDisabled={isDisabled}
            className="w-full"
            aria-label={label}
            radius="sm"
            selectorIcon={<CalendarBlankIcon size={20} />}
            {...dateConstraintProps}
          />
          {errorMessageElement}
        </div>
      );
    }

    case 'founderList': {
      // 确保有有效的数组数据
      const foundersArray = Array.isArray(field.value) ? field.value : [];

      return (
        <div>
          <div className="flex flex-col gap-2.5 pt-[10px]">
            {foundersArray.map((founder: any, index: number) => {
              // Get error for specific index from fieldState
              const founderError =
                fieldState.error && Array.isArray(fieldState.error)
                  ? fieldState.error[index]
                  : undefined;

              return (
                <FounderFormItem
                  key={index}
                  index={index}
                  remove={() => {
                    const newFounders = foundersArray.filter(
                      (_: any, i: number) => i !== index,
                    );
                    field.onChange(newFounders);
                  }}
                  register={register}
                  errors={founderError}
                  foundersKey={field.name as 'founders'}
                  isPrimary={index === 0}
                  canRemove={foundersArray.length > 1}
                />
              );
            })}
          </div>

          <div className="pt-[10px]">
            <Button
              color="secondary"
              size="md"
              className="mobile:w-full px-[20px]"
              onPress={() => {
                field.onChange([...foundersArray, { name: '', title: '' }]);
              }}
              isDisabled={isDisabled}
            >
              Add Entry(FormItemRenderer)
            </Button>
          </div>
          {errorMessageElement}
        </div>
      );
    }

    case 'websites': {
      const websitesArray = Array.isArray(field.value) ? field.value : [];

      return (
        <div className="rounded-[10px] border border-black/10 bg-[#EFEFEF] p-[10px]">
          <div className="flex flex-col gap-2.5 pt-[10px]">
            {websitesArray.map((website: any, index: number) => {
              const websiteError =
                fieldState.error && Array.isArray(fieldState.error)
                  ? fieldState.error[index]
                  : undefined;
              return (
                <WebsiteFormItem
                  key={`${field.name}-${index}`}
                  index={index}
                  remove={() => {
                    const newWebsites = websitesArray.filter(
                      (_: any, i: number) => i !== index,
                    );
                    field.onChange(newWebsites);
                  }}
                  register={register}
                  errors={websiteError}
                  websitesKey={field.name as 'websites'}
                  isPrimary={index === 0}
                  canRemove={websitesArray.length > 1}
                  touchedFields={touchedFields}
                />
              );
            })}
          </div>
          <div className="pt-[10px]">
            <Button
              color="secondary"
              size="md"
              className="mobile:w-full px-[20px]"
              onPress={() => {
                field.onChange([...websitesArray, { url: '', title: '' }]);
              }}
              isDisabled={isDisabled}
            >
              Add an Entry
            </Button>
          </div>
          {errorMessageElement}
        </div>
      );
    }

    case 'roadmap':
      return (
        <div className="rounded-md border border-dashed border-gray-300 p-4 text-center text-gray-500">
          roadmap
        </div>
      );

    default:
      return (
        <div className="rounded-md border border-red-500 p-4 text-red-500">
          Not supported field type: {formDisplayType} (field: {label || itemKey}
          ){errorMessageElement}
        </div>
      );
  }
};

export default FormItemRenderer;
