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
  DatePicker,
  Input,
  Select,
  SelectItem,
  Textarea,
} from '@/components/base';
import { CalendarBlankIcon, PlusIcon } from '@/components/icons';
import { IItemConfig, IItemKey } from '@/types/item';
import {
  buildDatePickerProps,
  dateToDateValue,
  dateValueToDate,
} from '@/utils/formatters';

import { IProjectFormData } from '../types';

import FounderFormItemTable from './FounderFormItemTable';
import InputPrefix from './InputPrefix';
import PhotoUpload from './PhotoUpload';
import PhysicalEntityFormItemTable from './PhysicalEntityFormItemTable';
import WebsiteFormItemTable from './WebsiteFormItemTable';

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

  const { register, formState, control } = useFormContext<IProjectFormData>();
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
              // Also trigger blur event when dropdown is closed
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
      // Ensure field.value is in array format
      const currentValue = Array.isArray(field.value) ? field.value : [];

      return (
        <div>
          <Autocomplete
            options={options || []}
            value={currentValue}
            onChange={(newValue: string[]) => {
              field.onChange(newValue);
              field.onBlur(); // Trigger validation
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
      // Ensure valid array data with at least one entry
      const foundersArray =
        Array.isArray(field.value) && field.value.length > 0
          ? field.value
          : [{ name: '', title: '' }];

      return (
        <div>
          <div className="overflow-hidden rounded-[10px] border border-black/10 bg-white">
            {/* Table header */}
            <div className="flex items-center border-b border-black/5 bg-[#F5F5F5]">
              <div className="flex flex-1 items-center gap-[5px] border-r border-black/10 p-[10px]">
                <span className="text-[14px] font-[600] leading-[19px] text-black/60">
                  Full Name
                </span>
              </div>
              <div className="flex flex-1 items-center gap-[5px] p-[10px]">
                <span className="text-[14px] font-[600] leading-[19px] text-black/60">
                  Title/Role
                </span>
              </div>
              <div className="w-[60px] p-[10px]"></div>
            </div>
            {foundersArray.map((founder: any, index: number) => {
              // Get error for specific index from fieldState
              const founderError =
                fieldState.error && Array.isArray(fieldState.error)
                  ? fieldState.error[index]
                  : undefined;

              return (
                <FounderFormItemTable
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
                  canRemove={foundersArray.length > 1}
                />
              );
            })}
            <div className="bg-[#F5F5F5] p-[10px]">
              <button
                type="button"
                className="mobile:w-full flex h-auto min-h-0 cursor-pointer items-center gap-[5px] rounded-[4px] border-none px-[8px] py-[4px] text-black opacity-60 transition-opacity duration-200 hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  // Add new item directly to existing array
                  const newFounders = [
                    ...foundersArray,
                    { name: '', title: '' },
                  ];
                  field.onChange(newFounders);
                }}
                disabled={isDisabled}
                style={{
                  outline: 'none',
                  boxShadow: 'none',
                  fontFamily: 'Open Sans, sans-serif',
                }}
              >
                <PlusIcon size={16} />
                <span className="text-[14px] font-[400] leading-[19px]">
                  Add an Entry
                </span>
              </button>
            </div>
          </div>
          {errorMessageElement}
        </div>
      );
    }

    case 'websites': {
      const websitesArray =
        Array.isArray(field.value) && field.value.length > 0
          ? field.value
          : [{ url: '', title: '' }];

      return (
        <div>
          <div className="overflow-hidden rounded-[10px] border border-black/10 bg-white">
            {/* Table header */}
            <div className="flex items-center border-b border-black/5 bg-[#F5F5F5]">
              <div className="flex flex-1 items-center gap-[5px] border-r border-black/10 p-[10px]">
                <span className="text-[14px] font-[600] leading-[19px] text-black/60">
                  Website Title
                </span>
              </div>
              <div className="flex flex-1 items-center gap-[5px] p-[10px]">
                <span className="text-[14px] font-[600] leading-[19px] text-black/60">
                  URL
                </span>
              </div>
              <div className="w-[60px] p-[10px]"></div>
            </div>
            {websitesArray.map((website: any, index: number) => {
              const websiteError =
                fieldState.error && Array.isArray(fieldState.error)
                  ? fieldState.error[index]
                  : undefined;

              return (
                <WebsiteFormItemTable
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
            <div className="bg-[#F5F5F5] p-[10px]">
              <button
                type="button"
                className="mobile:w-full flex h-auto min-h-0 cursor-pointer items-center gap-[5px] rounded-[4px] border-none px-[8px] py-[4px] text-black opacity-60 transition-opacity duration-200 hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  // Add new item directly to existing array
                  const newWebsites = [
                    ...websitesArray,
                    { title: '', url: '' },
                  ];
                  field.onChange(newWebsites);
                }}
                disabled={isDisabled}
                style={{
                  outline: 'none',
                  boxShadow: 'none',
                  fontFamily: 'Open Sans, sans-serif',
                }}
              >
                <PlusIcon size={16} />
                <span className="text-[14px] font-[400] leading-[19px]">
                  Add an Entry
                </span>
              </button>
            </div>
          </div>
          {errorMessageElement}
        </div>
      );
    }

    case 'tablePhysicalEntity':
      const physicalEntityArray =
        Array.isArray(field.value) && field.value.length > 0
          ? field.value
          : [{ legalName: '', country: '' }];

      return (
        <div>
          <div className="overflow-hidden rounded-[10px] border border-black/10 bg-white">
            {/* Table header */}
            <div className="flex items-center border-b border-black/5 bg-[#F5F5F5]">
              <div className="flex flex-1 items-center gap-[5px] border-r border-black/10 p-[10px]">
                <span className="text-[14px] font-[600] leading-[19px] text-black/60">
                  Legal Name
                </span>
              </div>
              <div className="flex flex-1 items-center gap-[5px] p-[10px]">
                <span className="text-[14px] font-[600] leading-[19px] text-black/60">
                  Country
                </span>
              </div>
              <div className="w-[60px] p-[10px]"></div>
            </div>
            {physicalEntityArray.map((website: any, index: number) => {
              const errors =
                fieldState.error && Array.isArray(fieldState.error)
                  ? fieldState.error[index]
                  : undefined;

              return (
                <PhysicalEntityFormItemTable
                  key={`${field.name}-${index}`}
                  index={index}
                  remove={() => {
                    const newItem = physicalEntityArray.filter(
                      (_: any, i: number) => i !== index,
                    );
                    field.onChange(newItem);
                  }}
                  register={register}
                  errors={errors}
                  physicalEntitiesKey={field.name as 'physical_entity'}
                  isPrimary={index === 0}
                  canRemove={physicalEntityArray.length > 1}
                  touchedFields={touchedFields}
                />
              );
            })}
            <div className="bg-[#F5F5F5] p-[10px]">
              <button
                type="button"
                className="mobile:w-full flex h-auto min-h-0 cursor-pointer items-center gap-[5px] rounded-[4px] border-none px-[8px] py-[4px] text-black opacity-60 transition-opacity duration-200 hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const newItem = [
                    ...physicalEntityArray,
                    { legalName: '', country: '' },
                  ];
                  field.onChange(newItem);
                }}
                disabled={isDisabled}
                style={{
                  outline: 'none',
                  boxShadow: 'none',
                  fontFamily: 'Open Sans, sans-serif',
                }}
              >
                <PlusIcon size={16} />
                <span className="text-[14px] font-[400] leading-[19px]">
                  Add an Entry
                </span>
              </button>
            </div>
          </div>
          {errorMessageElement}
        </div>
      );

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
