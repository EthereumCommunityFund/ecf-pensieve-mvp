import { Avatar } from '@heroui/react';
import { DateValue, parseDate } from '@internationalized/date';
import { Image as ImageIcon } from '@phosphor-icons/react';
import dayjs from 'dayjs';
import React from 'react';
import {
  ControllerFieldState,
  ControllerRenderProps,
  useFormContext,
} from 'react-hook-form';

import {
  Button,
  DatePicker,
  Input,
  Select,
  SelectItem,
  Textarea,
} from '@/components/base';
import { CalendarBlankIcon } from '@/components/icons';
import { IItemConfig, IItemKey } from '@/types/item';

import { IProjectFormData } from '../types';

import FounderFormItem from './FounderFormItem';
import InputPrefix from './InputPrefix';
import PhotoUpload from './PhotoUpload';

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
  } = itemConfig;

  // 始终获取 form context，但只在需要时使用
  const { register } = useFormContext<IProjectFormData>();

  const dateToDateValue = (date: Date | null | undefined): DateValue | null => {
    if (!date) return null;
    try {
      const dateString = dayjs(date).format('YYYY-MM-DD');
      return parseDate(dateString);
    } catch (e) {
      console.error('Error parsing date for DatePicker:', date, e);
      return null;
    }
  };

  const dateValueToDate = (dateValue: DateValue | null): Date | null => {
    if (!dateValue) return null;
    try {
      return dayjs(dateValue.toString()).toDate();
    } catch (e) {
      console.error('Error converting DateValue to Date:', dateValue, e);
      return null;
    }
  };

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
            onBlur={field.onBlur}
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
    case 'date':
      return (
        <div>
          <DatePicker
            showMonthAndYearPickers={true} // Default, can be from itemConfig
            value={dateToDateValue(field.value)}
            onChange={(dateValue: DateValue | null) => {
              field.onChange(dateValueToDate(dateValue));
            }}
            isInvalid={!!error}
            isDisabled={isDisabled}
            // isRequired={itemConfig.isEssential} // Or a specific 'isRequired' in itemConfig
            className="w-full" // Default, can be from itemConfig
            aria-label={label}
            radius="sm" // Default, can be from itemConfig
            selectorIcon={<CalendarBlankIcon size={20} />} // Default
          />
          {errorMessageElement}
        </div>
      );

    case 'founderList': {
      // 确保有有效的数组数据
      const foundersArray = Array.isArray(field.value) ? field.value : [];

      return (
        <div>
          <div className="flex flex-col gap-2.5 pt-[10px]">
            {foundersArray.map((founder: any, index: number) => {
              // 从 fieldState 中获取特定索引的错误
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
              Add Entry
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
