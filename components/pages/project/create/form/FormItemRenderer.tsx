import { Avatar, cn, Tooltip } from '@heroui/react';
import { DateValue } from '@internationalized/date';
import { Image as ImageIcon } from '@phosphor-icons/react';
import React, { useMemo } from 'react';
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

import { IFormTypeEnum, IFounder, IProjectFormData } from '../types';

import FounderFormItemTable from './FounderFormItemTable';
import FundingReceivedGrantsTableItem from './FundingReceivedGrantsTableItem';
import InputPrefix from './InputPrefix';
import PhotoUpload from './PhotoUpload';
import PhysicalEntityFormItemTable from './PhysicalEntityFormItemTable';
import TooltipWithQuestionIcon from './TooltipWithQuestionIcon';
import WebsiteFormItemTable from './WebsiteFormItemTable';

interface FormItemRendererProps {
  field: ControllerRenderProps<any, any>;
  fieldState: ControllerFieldState;
  itemConfig: IItemConfig<IItemKey>;
  fieldApplicability: Record<string, boolean>;
  formType: IFormTypeEnum;
}

const FormItemRenderer: React.FC<FormItemRendererProps> = ({
  field,
  fieldState,
  itemConfig,
  fieldApplicability,
  formType,
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

  const { register, formState, control, getValues, setValue } =
    useFormContext<IProjectFormData>();
  const { touchedFields } = formState;

  const isDisabled = fieldApplicability?.[itemKey] === false;

  const disableNameEdit = useMemo(() => {
    return itemKey === 'name' && formType === IFormTypeEnum.Proposal;
  }, [itemKey, formType]);

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
            isDisabled={isDisabled || disableNameEdit}
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
            classNames={{
              listboxWrapper: itemKey === 'categories' ? '!max-h-[500px]' : '',
            }}
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
      const foundersArray: IFounder[] =
        Array.isArray(field.value) && field.value.length > 0
          ? field.value
          : [
              {
                name: '',
                title: '',
                region: undefined,
                _id: crypto.randomUUID(),
              },
            ];

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
              <div className="flex flex-1 items-center gap-[5px] border-r border-black/10 p-[10px]">
                <span className="text-[14px] font-[600] leading-[19px] text-black/60">
                  Title/Role
                </span>
              </div>
              <div className="flex flex-1 items-center gap-[5px] p-[10px]">
                <span className="text-[14px] font-[600] leading-[19px] text-black/60">
                  Country/Region
                </span>
                <Tooltip
                  content={
                    <div className="flex flex-col gap-1">
                      <span>
                        Following{' '}
                        <a
                          href="https://www.iso.org/iso-3166-country-codes.html"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600"
                        >
                          {` ISO 3166 `}
                        </a>{' '}
                        standard
                      </span>
                    </div>
                  }
                  classNames={{
                    content: 'p-[10px] rounded-[5px] border border-black/10',
                  }}
                  closeDelay={0}
                >
                  <div className="flex size-[18px] items-center justify-center rounded bg-white opacity-40">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <circle
                        cx="9"
                        cy="9"
                        r="6.75"
                        stroke="black"
                        strokeWidth="1"
                      />
                      <circle
                        cx="9"
                        cy="6.75"
                        r="2.25"
                        stroke="black"
                        strokeWidth="1"
                      />
                      <path
                        d="M9 12.09L9 12.09"
                        stroke="black"
                        strokeWidth="1"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </Tooltip>
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
                  key={founder._id}
                  index={index}
                  remove={() => {
                    const currentFounders =
                      getValues(itemConfig.key as any) || [];
                    const newFounders = currentFounders.filter(
                      (_: any, i: number) => i !== index,
                    );
                    field.onChange(newFounders);
                  }}
                  register={register}
                  control={control}
                  errors={founderError}
                  foundersKey={itemConfig.key as any}
                  canRemove={foundersArray.length > 1}
                  value={founder}
                  onChange={(updatedFounder) => {
                    const currentFounders =
                      getValues(itemConfig.key as any) || [];
                    const newFounders = [...currentFounders];
                    newFounders[index] = updatedFounder;
                    field.onChange(newFounders);
                  }}
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
                  const currentFounders =
                    getValues(itemConfig.key as any) || [];
                  const newFounders = [
                    ...currentFounders,
                    {
                      name: '',
                      title: '',
                      region: undefined,
                      _id: crypto.randomUUID(),
                    },
                  ];
                  // Use setValue with shouldValidate: false to avoid triggering validation
                  setValue(itemConfig.key as any, newFounders, {
                    shouldValidate: false,
                  });
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
      // 确保每个 website 都有唯一的 _id
      const websitesArray =
        Array.isArray(field.value) && field.value.length > 0
          ? field.value
          : [{ url: '', title: '', _id: crypto.randomUUID() }];

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
                  key={website._id}
                  index={index}
                  remove={() => {
                    const currentWebsites = getValues('websites') || [];
                    const newWebsites = currentWebsites.filter(
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
                  // Get current form values to preserve any unsaved changes
                  const currentWebsites = getValues('websites') || [];
                  const newWebsites = [
                    ...currentWebsites,
                    { title: '', url: '', _id: crypto.randomUUID() },
                  ];
                  // Use setValue with shouldValidate: false to avoid triggering validation
                  setValue('websites', newWebsites, { shouldValidate: false });
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

    case 'tablePhysicalEntity': {
      const physicalEntitiesArray =
        Array.isArray(field.value) && field.value.length > 0
          ? field.value
          : [{ legalName: '', country: '', _id: crypto.randomUUID() }];

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
            {physicalEntitiesArray.map((item: any, index: number) => {
              const errors =
                fieldState.error && Array.isArray(fieldState.error)
                  ? fieldState.error[index]
                  : undefined;

              return (
                <PhysicalEntityFormItemTable
                  key={item._id}
                  index={index}
                  remove={() => {
                    const currentEntities = getValues(field.name as any) || [];
                    const newEntities = currentEntities.filter(
                      (_: any, i: number) => i !== index,
                    );
                    field.onChange(newEntities);
                  }}
                  register={register}
                  errors={errors}
                  physicalEntitiesKey={field.name as 'physical_entity'}
                  isPrimary={index === 0}
                  canRemove={physicalEntitiesArray.length > 1}
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
                  const currentEntities = getValues(field.name as any) || [];
                  // Use setValue with shouldValidate: false to avoid triggering validation
                  setValue(
                    field.name as any,
                    [
                      ...currentEntities,
                      { legalName: '', country: '', _id: crypto.randomUUID() },
                    ],
                    { shouldValidate: false },
                  );
                }}
              >
                <PlusIcon className="size-[16px]" />
                Add Physical Entity
              </button>
            </div>
          </div>
          {errorMessageElement}
        </div>
      );
    }

    case 'fundingReceivedGrants': {
      const valueArray =
        Array.isArray(field.value) && field.value.length > 0
          ? field.value.map((item: any) => ({
              ...item,
              _id: item._id || crypto.randomUUID(),
            }))
          : [
              {
                date: null,
                organization: '',
                amount: '',
                reference: '',
                _id: crypto.randomUUID(),
              },
            ];

      return (
        <div>
          <div className="overflow-hidden rounded-[10px] border border-black/10 bg-white">
            {/* Table header */}
            <div className="flex h-[40px] w-full items-center border-b border-black/5 bg-[#F5F5F5]">
              <div className="flex h-full w-[158px] shrink-0 items-center border-r border-black/10 px-[10px]">
                <div className="flex items-center gap-[5px]">
                  <span className="text-[14px] font-[600] text-[rgb(51,51,51)] opacity-60">
                    Date
                  </span>
                  <TooltipWithQuestionIcon content="The Date of when this grant was given to this project" />
                </div>
              </div>
              <div className="flex h-full w-[301px] shrink-0 items-center border-r border-black/10 px-[10px]">
                <div className="flex items-center gap-[5px]">
                  <span className="text-[14px] font-[600] text-[rgb(51,51,51)] opacity-60">
                    Organization/Program
                  </span>
                  <TooltipWithQuestionIcon content="This refers to the organization or program this project has received their grants from" />
                </div>
              </div>
              <div className="flex h-full w-[138px] shrink-0 items-center border-r border-black/10 px-[10px]">
                <div className="flex items-center gap-[5px]">
                  <span className="shrink-0 text-[14px] font-[600] text-[rgb(51,51,51)] opacity-60">
                    Amount (USD)
                  </span>
                  <TooltipWithQuestionIcon content="This is the amount received at the time of this grant was given" />
                </div>
              </div>
              <div
                className={cn(
                  'flex-1 flex h-full min-w-[143px] shrink-0 items-center  px-[10px] bg-[#F5F5F5]',
                  valueArray.length > 1 ? 'border-r border-black/10' : '',
                )}
              >
                <div className="flex items-center gap-[5px]">
                  <span className="text-[14px] font-[600] text-[rgb(51,51,51)] opacity-60">
                    Reference
                  </span>
                  <TooltipWithQuestionIcon content="This is the reference link that acts as  evidence for this entry" />
                </div>
              </div>
              {valueArray.length > 1 && (
                <div className="flex h-full w-[60px] items-center justify-center">
                  {/* Actions column header */}
                </div>
              )}
            </div>
            {valueArray.map((item: any, index: number) => {
              return (
                <FundingReceivedGrantsTableItem
                  key={item._id}
                  index={index}
                  remove={() => {
                    const currentValue = getValues(itemConfig.key as any) || [];
                    const newValue = currentValue.filter(
                      (_: any, i: number) => i !== index,
                    );
                    field.onChange(newValue);
                  }}
                  itemKey={field.name as 'funding_received_grants'}
                  canRemove={valueArray.length > 1}
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
                  field.onChange([
                    ...valueArray,
                    {
                      date: null,
                      organization: '',
                      amount: '',
                      reference: '',
                      _id: crypto.randomUUID(),
                    },
                  ]);
                }}
              >
                <PlusIcon size={16} />
                Add an Entity
              </button>
            </div>
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
