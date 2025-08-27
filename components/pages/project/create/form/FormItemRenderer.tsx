import { Avatar, cn, Tooltip } from '@heroui/react';
import { DateValue } from '@internationalized/date';
import { Image as ImageIcon } from '@phosphor-icons/react';
import React, { useCallback, useMemo } from 'react';
import {
  ControllerFieldState,
  ControllerRenderProps,
  useFormContext,
} from 'react-hook-form';

import {
  Autocomplete,
  Input,
  LocaleDatePicker,
  Select,
  SelectItem,
  Textarea,
} from '@/components/base';
import { MultiContractEntry } from '@/components/biz/project/smart-contracts';
import type { SmartContract } from '@/components/biz/project/smart-contracts/ContractEntry';
import { CalendarBlankIcon, PlusIcon } from '@/components/icons';
import { generateUUID } from '@/lib/utils/uuid';
import { IItemConfig, IItemKey } from '@/types/item';
import {
  buildDatePickerProps,
  dateToDateValue,
  dateValueToDate,
} from '@/utils/formatters';

import { IFormTypeEnum, IFounder, IProjectFormData } from '../types';

import AffiliatedProjectsTableItem from './AffiliatedProjectsTableItem';
import ContributingTeamsTableItem from './ContributingTeamsTableItem';
import FounderFormItemTable from './FounderFormItemTable';
import FundingReceivedGrantsTableItem from './FundingReceivedGrantsTableItem';
import InputPrefix from './InputPrefix';
import PhotoUpload from './PhotoUpload';
import PhysicalEntityFormItemTable from './PhysicalEntityFormItemTable';
import SocialLinkFormItemTable from './SocialLinkFormItemTable';
import StackIntegrationsTableItem from './StackIntegrationsTableItem';
import TooltipWithQuestionIcon from './TooltipWithQuestionIcon';
import { useAffiliatedProjects } from './useAffiliatedProjects';
import { useContributingTeams } from './useContributingTeams';
import { useFundingReceivedGrants } from './useFundingReceivedGrants';
import { useStackIntegrations } from './useStackIntegrations';
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
  } = itemConfig;

  const { register, formState, control, getValues, setValue } =
    useFormContext<IProjectFormData>();
  const { touchedFields, isSubmitted } = formState;

  const isDisabled = fieldApplicability?.[itemKey] === false;

  const disableNameEdit = useMemo(() => {
    return itemKey === 'name' && formType === IFormTypeEnum.Proposal;
  }, [itemKey, formType]);

  // Smart contracts values (used only when formDisplayType === 'multiContracts')
  // When field is not applicable, value should be empty array

  // Process smart contracts value - now always an array
  const smartContractsValue: SmartContract[] = useMemo(() => {
    if (formDisplayType !== 'multiContracts') {
      return [];
    }

    // If field is not applicable, return empty array
    if (fieldApplicability?.dappSmartContracts === false) {
      return [];
    }

    // Field value should already be an array of SmartContract
    if (Array.isArray(field.value)) {
      return field.value;
    }

    // Fallback: return default contract if somehow not an array
    return [
      {
        id: generateUUID(),
        chain: '',
        addresses: '',
      },
    ];
  }, [formDisplayType, field.value, fieldApplicability]);

  // Callbacks for smart contracts (always defined, but only used when needed)
  const handleContractsChange = useCallback(
    (contracts: SmartContract[]) => {
      // Directly set the contracts array
      field.onChange(contracts);
    },
    [field],
  );

  const {
    fields: fundingFields,
    handleAddField: handleAddFundingField,
    handleRemoveField: handleRemoveFundingField,
  } = useFundingReceivedGrants({
    control,
    formDisplayType,
    fieldName: field.name as any,
  });

  const {
    fields: affiliatedFields,
    handleAddField: handleAddAffiliatedField,
    handleRemoveField: handleRemoveAffiliatedField,
  } = useAffiliatedProjects({
    control,
    formDisplayType,
    fieldName: field.name as any,
  });

  const {
    fields: contributingFields,
    handleAddField: handleAddContributingField,
    handleRemoveField: handleRemoveContributingField,
  } = useContributingTeams({
    control,
    formDisplayType,
    fieldName: field.name as any,
  });

  const {
    fields: stackFields,
    handleAddField: handleAddStackField,
    handleRemoveField: handleRemoveStackField,
  } = useStackIntegrations({
    control,
    formDisplayType,
    fieldName: field.name as any,
  });

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
          <LocaleDatePicker
            locale="en-CA"
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
                  isSubmitted={isSubmitted}
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

    case 'social_links': {
      const socialLinksArray =
        Array.isArray(field.value) && field.value.length > 0
          ? field.value
          : [{ platform: '', url: '', _id: crypto.randomUUID() }];

      return (
        <div>
          <div className="overflow-hidden rounded-[10px] border border-black/10 bg-white">
            {/* Table header */}
            <div className="flex items-center border-b border-black/5 bg-[#F5F5F5]">
              <div className="flex flex-1 items-center gap-[5px] border-r border-black/10 p-[10px]">
                <span className="text-[14px] font-[600] leading-[19px] text-black/60">
                  Platform
                </span>
              </div>
              <div className="flex flex-1 items-center gap-[5px] p-[10px]">
                <span className="text-[14px] font-[600] leading-[19px] text-black/60">
                  URL
                </span>
              </div>
              <div className="w-[60px] p-[10px]"></div>
            </div>
            {socialLinksArray.map((socialLink: any, index: number) => {
              const socialLinkError =
                fieldState.error && Array.isArray(fieldState.error)
                  ? fieldState.error[index]
                  : undefined;

              return (
                <SocialLinkFormItemTable
                  key={socialLink._id}
                  index={index}
                  remove={() => {
                    const currentSocialLinks =
                      getValues(field.name as any) || [];
                    const newSocialLinks = currentSocialLinks.filter(
                      (_: any, i: number) => i !== index,
                    );
                    field.onChange(newSocialLinks);
                  }}
                  errors={socialLinkError}
                  isPrimary={index === 0}
                  canRemove={socialLinksArray.length > 1}
                  touchedFields={touchedFields}
                  isSubmitted={isSubmitted}
                  value={socialLink}
                  onChange={(updatedSocialLink) => {
                    const currentSocialLinks =
                      getValues(field.name as any) || [];
                    const newSocialLinks = [...currentSocialLinks];
                    newSocialLinks[index] = updatedSocialLink;
                    field.onChange(newSocialLinks);
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
                  const currentSocialLinks = getValues(field.name as any) || [];
                  const newSocialLinks = [
                    ...currentSocialLinks,
                    { platform: '', url: '', _id: crypto.randomUUID() },
                  ];
                  setValue(field.name as any, newSocialLinks, {
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
                  errors={errors}
                  isPrimary={index === 0}
                  canRemove={physicalEntitiesArray.length > 1}
                  touchedFields={touchedFields}
                  isSubmitted={isSubmitted}
                  value={item}
                  onChange={(updatedEntity) => {
                    const currentEntities = getValues(field.name as any) || [];
                    const newEntities = [...currentEntities];
                    newEntities[index] = updatedEntity;
                    field.onChange(newEntities);
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
                <PlusIcon size={16} />
                Add Physical Entity
              </button>
            </div>
          </div>
          {errorMessageElement}
        </div>
      );
    }

    case 'fundingReceivedGrants': {
      return (
        <div className="tablet:max-w-[9999px] mobile:max-w-[9999px] w-full max-w-[760px] overflow-x-scroll">
          <div className="w-fit overflow-hidden rounded-[10px] border border-black/10 bg-white">
            {/* Table header */}
            <div className="flex h-[40px] items-center border-b border-black/5 bg-[#F5F5F5]">
              <div className="flex h-full w-[158px] shrink-0 items-center border-r border-black/10 px-[10px]">
                <div className="flex items-center gap-[5px]">
                  <span className="text-[14px] font-[600] text-[rgb(51,51,51)] opacity-60">
                    Date
                  </span>
                  <TooltipWithQuestionIcon content="The Date of when this grant was given to this project" />
                </div>
              </div>
              <div className="flex h-full w-[300px] shrink-0 items-center border-r border-black/10 px-[10px]">
                <div className="flex items-center gap-[5px]">
                  <span className="text-[14px] font-[600] text-[rgb(51,51,51)] opacity-60">
                    Organization/Program
                  </span>
                  <TooltipWithQuestionIcon content="This refers to the organization or program this project has received their grants from" />
                </div>
              </div>
              <div className="flex h-full w-[300px] shrink-0 items-center border-r border-black/10 px-[10px]">
                <div className="flex items-center gap-[5px]">
                  <span className="text-[14px] font-[600] text-[rgb(51,51,51)] opacity-60">
                    Project Donator
                  </span>
                  <TooltipWithQuestionIcon content="Projects that have donated to this funding round or acted as sponsors" />
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
              <div className="flex h-full w-[200px] shrink-0 items-center border-r border-black/10 px-[10px]">
                <div className="flex items-center gap-[5px]">
                  <span className="text-[14px] font-[600] text-[rgb(51,51,51)] opacity-60">
                    Expense Sheet
                  </span>
                  <TooltipWithQuestionIcon content="Link to detailed expense breakdown showing how the grant funds were utilized" />
                </div>
              </div>
              <div
                className={cn(
                  'flex h-full w-[200px] shrink-0 items-center px-[10px] bg-[#F5F5F5]',
                  fundingFields.length > 1 ? 'border-r border-black/10' : '',
                )}
              >
                <div className="flex items-center gap-[5px]">
                  <span className="text-[14px] font-[600] text-[rgb(51,51,51)] opacity-60">
                    Reference
                  </span>
                  <TooltipWithQuestionIcon content="This is the reference link that acts as  evidence for this entry" />
                </div>
              </div>
              {fundingFields.length > 1 && (
                <div className="flex h-full w-[60px] items-center justify-center">
                  {/* Actions column header */}
                </div>
              )}
            </div>
            {fundingFields.map((field, index) => {
              return (
                <FundingReceivedGrantsTableItem
                  key={field.fieldId}
                  field={field}
                  index={index}
                  remove={() => handleRemoveFundingField(index)}
                  itemKey={'funding_received_grants'}
                  canRemove={fundingFields.length > 1}
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
                  handleAddFundingField();
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

    case 'affiliated_projects': {
      return (
        <div className="tablet:max-w-[9999px] mobile:max-w-[9999px] w-full max-w-[760px] overflow-x-scroll">
          <div className="w-fit overflow-hidden rounded-[10px] border border-black/10 bg-white">
            {/* Table header */}
            <div className="flex h-[40px] items-center border-b border-black/5 bg-[#F5F5F5]">
              <div className="flex h-full w-[300px] shrink-0 items-center border-r border-black/10 px-[10px]">
                <div className="flex items-center gap-[5px]">
                  <span className="text-[14px] font-[600] text-[rgb(51,51,51)] opacity-60">
                    Project
                  </span>
                  <TooltipWithQuestionIcon content="The project that has an affiliation with this project" />
                </div>
              </div>
              <div className="flex h-full w-[180px] shrink-0 items-center border-r border-black/10 px-[10px]">
                <div className="flex items-center gap-[5px]">
                  <span className="text-[14px] font-[600] text-[rgb(51,51,51)] opacity-60">
                    Affiliation Type
                  </span>
                  <TooltipWithQuestionIcon content="The type of relationship between the projects" />
                </div>
              </div>
              <div className="flex h-full w-[250px] shrink-0 items-center border-r border-black/10 px-[10px]">
                <div className="flex items-center gap-[5px]">
                  <span className="text-[14px] font-[600] text-[rgb(51,51,51)] opacity-60">
                    Description
                  </span>
                  <TooltipWithQuestionIcon content="Description of the affiliation relationship" />
                </div>
              </div>
              <div
                className={cn(
                  'flex h-full w-[200px] shrink-0 items-center px-[10px] bg-[#F5F5F5]',
                  affiliatedFields.length > 1 ? 'border-r border-black/10' : '',
                )}
              >
                <div className="flex items-center gap-[5px]">
                  <span className="text-[14px] font-[600] text-[rgb(51,51,51)] opacity-60">
                    Reference
                  </span>
                  <TooltipWithQuestionIcon content="Reference link for more information about this affiliation" />
                </div>
              </div>
              {affiliatedFields.length > 1 && (
                <div className="flex h-full w-[60px] items-center justify-center">
                  {/* Actions column header */}
                </div>
              )}
            </div>
            {affiliatedFields.map((field, index) => {
              return (
                <AffiliatedProjectsTableItem
                  key={field.fieldId}
                  field={field}
                  index={index}
                  remove={() => handleRemoveAffiliatedField(index)}
                  itemKey={'affiliated_projects'}
                  canRemove={affiliatedFields.length > 1}
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
                  handleAddAffiliatedField();
                }}
              >
                <PlusIcon size={16} />
                Add an Entry
              </button>
            </div>
          </div>
          {errorMessageElement}
        </div>
      );
    }

    case 'contributing_teams': {
      return (
        <div className="tablet:max-w-[9999px] mobile:max-w-[9999px] w-full max-w-[760px] overflow-x-scroll">
          <div className="w-fit overflow-hidden rounded-[10px] border border-black/10 bg-white">
            {/* Table header */}
            <div className="flex h-[40px] items-center border-b border-black/5 bg-[#F5F5F5]">
              <div className="flex h-full w-[300px] shrink-0 items-center border-r border-black/10 px-[10px]">
                <div className="flex items-center gap-[5px]">
                  <span className="text-[14px] font-[600] text-[rgb(51,51,51)] opacity-60">
                    Project
                  </span>
                  <TooltipWithQuestionIcon content="The team or organization that contributed to this project" />
                </div>
              </div>
              <div className="flex h-full w-[200px] shrink-0 items-center border-r border-black/10 px-[10px]">
                <div className="flex items-center gap-[5px]">
                  <span className="text-[14px] font-[600] text-[rgb(51,51,51)] opacity-60">
                    Area of Contribution
                  </span>
                  <TooltipWithQuestionIcon content="The type of contribution provided" />
                </div>
              </div>
              <div className="flex h-full w-[250px] shrink-0 items-center border-r border-black/10 px-[10px]">
                <div className="flex items-center gap-[5px]">
                  <span className="text-[14px] font-[600] text-[rgb(51,51,51)] opacity-60">
                    Description
                  </span>
                  <TooltipWithQuestionIcon content="Description of the contribution" />
                </div>
              </div>
              <div
                className={cn(
                  'flex h-full w-[200px] shrink-0 items-center px-[10px] bg-[#F5F5F5]',
                  contributingFields.length > 1
                    ? 'border-r border-black/10'
                    : '',
                )}
              >
                <div className="flex items-center gap-[5px]">
                  <span className="text-[14px] font-[600] text-[rgb(51,51,51)] opacity-60">
                    Reference
                  </span>
                  <TooltipWithQuestionIcon content="Reference link for more information about this contribution" />
                </div>
              </div>
              {contributingFields.length > 1 && (
                <div className="flex h-full w-[60px] items-center justify-center">
                  {/* Actions column header */}
                </div>
              )}
            </div>
            {contributingFields.map((field, index) => {
              return (
                <ContributingTeamsTableItem
                  key={field.fieldId}
                  field={field}
                  index={index}
                  remove={() => handleRemoveContributingField(index)}
                  itemKey={'contributing_teams'}
                  canRemove={contributingFields.length > 1}
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
                  handleAddContributingField();
                }}
              >
                <PlusIcon size={16} />
                Add an Entry
              </button>
            </div>
          </div>
          {errorMessageElement}
        </div>
      );
    }

    case 'stack_integrations': {
      return (
        <div className="tablet:max-w-[9999px] mobile:max-w-[9999px] w-full max-w-[760px] overflow-x-scroll">
          <div className="w-fit overflow-hidden rounded-[10px] border border-black/10 bg-white">
            {/* Table header */}
            <div className="flex h-[40px] items-center border-b border-black/5 bg-[#F5F5F5]">
              <div className="flex h-full w-[240px] shrink-0 items-center border-r border-black/10 px-[10px]">
                <div className="flex items-center gap-[5px]">
                  <span className="text-[14px] font-[600] text-[rgb(51,51,51)] opacity-60">
                    Project
                  </span>
                  <TooltipWithQuestionIcon content="The project or technology integrated with this project" />
                </div>
              </div>
              <div className="flex h-full w-[180px] shrink-0 items-center border-r border-black/10 px-[10px]">
                <div className="flex items-center gap-[5px]">
                  <span className="text-[14px] font-[600] text-[rgb(51,51,51)] opacity-60">
                    Type
                  </span>
                  <TooltipWithQuestionIcon content="The type of integration or dependency" />
                </div>
              </div>
              <div className="flex h-full w-[200px] shrink-0 items-center border-r border-black/10 px-[10px]">
                <div className="flex items-center gap-[5px]">
                  <span className="text-[14px] font-[600] text-[rgb(51,51,51)] opacity-60">
                    Description
                  </span>
                  <TooltipWithQuestionIcon content="Description of the integration" />
                </div>
              </div>
              <div className="flex h-full w-[180px] shrink-0 items-center border-r border-black/10 px-[10px]">
                <div className="flex items-center gap-[5px]">
                  <span className="text-[14px] font-[600] text-[rgb(51,51,51)] opacity-60">
                    Reference
                  </span>
                  <TooltipWithQuestionIcon content="Reference link for more information" />
                </div>
              </div>
              <div
                className={cn(
                  'flex h-full w-[180px] shrink-0 items-center px-[10px] bg-[#F5F5F5]',
                  stackFields.length > 1 ? 'border-r border-black/10' : '',
                )}
              >
                <div className="flex items-center gap-[5px]">
                  <span className="text-[14px] font-[600] text-[rgb(51,51,51)] opacity-60">
                    Repository
                  </span>
                  <TooltipWithQuestionIcon content="Repository link for the integration" />
                </div>
              </div>
              {stackFields.length > 1 && (
                <div className="flex h-full w-[60px] items-center justify-center">
                  {/* Actions column header */}
                </div>
              )}
            </div>
            {stackFields.map((field, index) => {
              return (
                <StackIntegrationsTableItem
                  key={field.fieldId}
                  field={field}
                  index={index}
                  remove={() => handleRemoveStackField(index)}
                  itemKey={'stack_integrations'}
                  canRemove={stackFields.length > 1}
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
                  handleAddStackField();
                }}
              >
                <PlusIcon size={16} />
                Add an Entry
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

    case 'multiContracts':
      return (
        <MultiContractEntry
          value={smartContractsValue}
          onChange={handleContractsChange}
          weight={typeof itemConfig.weight === 'number' ? itemConfig.weight : 0}
          disabled={
            isDisabled || fieldApplicability?.dappSmartContracts === false
          }
          placeholder={itemConfig.placeholder}
        />
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
