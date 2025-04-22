'use client';

import { Avatar, Input, Select, SelectItem, Textarea, cn } from '@heroui/react';
import { Scales } from '@phosphor-icons/react/dist/ssr';
import React, { useEffect } from 'react';
import { Controller } from 'react-hook-form';

import { basicsFieldsConfig } from '@/components/pages/project/create/formData';

import { FormFieldContainer } from '../FormFieldContainer';
import PhotoUpload from '../PhotoUpload';
import { StepFormProps } from '../types';

const BasicsStepForm: React.FC<Omit<StepFormProps, 'register'>> = ({
  control,
  errors,
  watch,
  setValue,
  trigger,
  onAddReference,
}) => {
  const appUrlConfig = basicsFieldsConfig.appUrl;
  const appUrlApplicableKey = appUrlConfig?.applicableKey;
  const isAppUrlApplicable = appUrlApplicableKey
    ? watch(appUrlApplicableKey)
    : true;

  useEffect(() => {
    if (!isAppUrlApplicable) {
      setValue(basicsFieldsConfig.appUrl.key, null, { shouldValidate: true });
    }
  }, [isAppUrlApplicable, setValue]);

  const categoriesConfig = basicsFieldsConfig.categories;
  const presetCategories = categoriesConfig?.presetCategories || [];

  return (
    <div className="flex flex-col gap-[40px]">
      <FormFieldContainer
        label={basicsFieldsConfig.projectName.label}
        description={basicsFieldsConfig.projectName.description}
        shortDescription={basicsFieldsConfig.projectName.shortDescription}
        weight={basicsFieldsConfig.projectName.weight}
        showReference={basicsFieldsConfig.projectName.showReference}
        onAddReference={
          basicsFieldsConfig.projectName.showReference
            ? () =>
                onAddReference(
                  basicsFieldsConfig.projectName.key,
                  basicsFieldsConfig.projectName.label,
                )
            : undefined
        }
      >
        <Controller
          name={basicsFieldsConfig.projectName.key}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <div>
              <Input
                {...field}
                classNames={{
                  base: cn('group w-full', error ? 'border-red-500' : ''),
                  inputWrapper: cn(
                    'bg-[rgba(0,0,0,0.05)] border border-[rgba(0,0,0,0.1)]',
                    'rounded-lg px-3 h-[42px]',
                  ),
                  input:
                    'font-normal text-black placeholder:text-black placeholder:opacity-60',
                }}
                placeholder={basicsFieldsConfig.projectName.placeholder}
                isInvalid={!!error}
                errorMessage={error?.message}
              />
            </div>
          )}
        />
      </FormFieldContainer>

      <FormFieldContainer
        label={basicsFieldsConfig.tagline.label}
        description={basicsFieldsConfig.tagline.description}
        shortDescription={basicsFieldsConfig.tagline.shortDescription}
        weight={basicsFieldsConfig.tagline.weight}
        showReference={basicsFieldsConfig.tagline.showReference}
        onAddReference={
          basicsFieldsConfig.tagline.showReference
            ? () =>
                onAddReference(
                  basicsFieldsConfig.tagline.key,
                  basicsFieldsConfig.tagline.label,
                )
            : undefined
        }
      >
        <Controller
          name={basicsFieldsConfig.tagline.key}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <div>
              <Input
                {...field}
                classNames={{
                  base: cn('group w-full', error ? 'border-red-500' : ''),
                  inputWrapper: cn(
                    'bg-[rgba(0,0,0,0.05)] border border-[rgba(0,0,0,0.1)]',
                    'rounded-lg px-3 h-[42px]',
                  ),
                  input:
                    'font-normal text-black placeholder:text-black placeholder:opacity-60',
                }}
                placeholder={basicsFieldsConfig.tagline.placeholder}
                isInvalid={!!error}
                errorMessage={error?.message}
              />
            </div>
          )}
        />
      </FormFieldContainer>

      <FormFieldContainer
        label={basicsFieldsConfig.categories.label}
        description={basicsFieldsConfig.categories.description}
        shortDescription={basicsFieldsConfig.categories.shortDescription}
        weight={basicsFieldsConfig.categories.weight}
        showReference={basicsFieldsConfig.categories.showReference}
        onAddReference={
          basicsFieldsConfig.categories.showReference
            ? () =>
                onAddReference(
                  basicsFieldsConfig.categories.key,
                  basicsFieldsConfig.categories.label,
                )
            : undefined
        }
      >
        <Controller
          name={basicsFieldsConfig.categories.key}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <div>
              <Select
                classNames={{
                  base: cn('group w-full', error ? 'border-red-500' : ''),
                  trigger: cn(
                    'bg-[rgba(0,0,0,0.05)] border border-[rgba(0,0,0,0.1)] rounded-lg h-[42px]',
                  ),
                }}
                placeholder={basicsFieldsConfig.categories.placeholder}
                selectionMode="multiple"
                selectedKeys={field.value}
                onSelectionChange={(keys) => field.onChange(Array.from(keys))}
                isInvalid={!!error}
                errorMessage={error?.message}
                items={presetCategories.map((category) => ({
                  value: category,
                  label: category,
                }))}
              >
                {(item) => (
                  <SelectItem key={item.value} textValue={item.label}>
                    {item.label}
                  </SelectItem>
                )}
              </Select>
            </div>
          )}
        />
      </FormFieldContainer>

      <FormFieldContainer
        label={basicsFieldsConfig.mainDescription.label}
        description={basicsFieldsConfig.mainDescription.description}
        shortDescription={basicsFieldsConfig.mainDescription.shortDescription}
        weight={basicsFieldsConfig.mainDescription.weight}
        showReference={basicsFieldsConfig.mainDescription.showReference}
        onAddReference={
          basicsFieldsConfig.mainDescription.showReference
            ? () =>
                onAddReference(
                  basicsFieldsConfig.mainDescription.key,
                  basicsFieldsConfig.mainDescription.label,
                )
            : undefined
        }
      >
        <Controller
          name={basicsFieldsConfig.mainDescription.key}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <div>
              <Textarea
                {...field}
                classNames={{
                  base: cn('group', error ? 'border-red-500' : ''),
                  inputWrapper: cn(
                    'bg-[rgba(0,0,0,0.05)] border border-[rgba(0,0,0,0.1)]',
                    'rounded-lg px-3 min-h-[100px]',
                  ),
                  input:
                    'font-normal text-black placeholder:text-black placeholder:opacity-60',
                }}
                placeholder={basicsFieldsConfig.mainDescription.placeholder}
                isInvalid={!!error}
                errorMessage={error?.message}
                minRows={basicsFieldsConfig.mainDescription.minRows}
              />
            </div>
          )}
        />
      </FormFieldContainer>

      <FormFieldContainer
        label={basicsFieldsConfig.projectLogo.label}
        description={basicsFieldsConfig.projectLogo.description}
        shortDescription={basicsFieldsConfig.projectLogo.shortDescription}
        showReference={basicsFieldsConfig.projectLogo.showReference}
        onAddReference={
          basicsFieldsConfig.projectLogo.showReference
            ? () =>
                onAddReference(
                  basicsFieldsConfig.projectLogo.key,
                  basicsFieldsConfig.projectLogo.label,
                )
            : undefined
        }
      >
        <div className="flex items-center gap-4">
          <Controller
            name={basicsFieldsConfig.projectLogo.key}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <>
                <PhotoUpload
                  initialUrl={field.value ?? undefined}
                  onUploadSuccess={field.onChange}
                  api="/api/file/upload"
                  className="rounded-full"
                >
                  <Avatar
                    size="lg"
                    icon={<Scales className="size-8 text-gray-400" />}
                    src={field.value ?? undefined}
                    alt={basicsFieldsConfig.projectLogo.label}
                    className="cursor-pointer border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
                  />
                </PhotoUpload>
                {error && (
                  <p className="self-center text-sm text-red-600">
                    {error.message}
                  </p>
                )}
              </>
            )}
          />
        </div>
      </FormFieldContainer>

      <FormFieldContainer
        label={basicsFieldsConfig.websiteUrl.label}
        description={basicsFieldsConfig.websiteUrl.description}
        shortDescription={basicsFieldsConfig.websiteUrl.shortDescription}
        weight={basicsFieldsConfig.websiteUrl.weight}
        showReference={basicsFieldsConfig.websiteUrl.showReference}
        onAddReference={
          basicsFieldsConfig.websiteUrl.showReference
            ? () =>
                onAddReference(
                  basicsFieldsConfig.websiteUrl.key,
                  basicsFieldsConfig.websiteUrl.label,
                )
            : undefined
        }
      >
        <Controller
          name={basicsFieldsConfig.websiteUrl.key}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <div>
              <Input
                {...field}
                classNames={{
                  base: cn('group w-full', error ? 'border-red-500' : ''),
                  inputWrapper: cn(
                    'bg-[rgba(0,0,0,0.05)] border border-[rgba(0,0,0,0.1)]',
                    'rounded-lg h-[42px] flex px-0',
                  ),
                  input:
                    'font-normal text-black placeholder:text-black placeholder:opacity-60',
                }}
                startContent={
                  basicsFieldsConfig.websiteUrl.startContentText && (
                    <div className="mr-1 flex h-full items-center rounded-l-lg bg-[#E1E1E1] px-3">
                      <span className="font-semibold text-black opacity-40">
                        {basicsFieldsConfig.websiteUrl.startContentText}
                      </span>
                    </div>
                  )
                }
                placeholder={basicsFieldsConfig.websiteUrl.placeholder}
                isInvalid={!!error}
                errorMessage={error?.message}
              />
            </div>
          )}
        />
      </FormFieldContainer>

      <FormFieldContainer
        label={basicsFieldsConfig.appUrl.label}
        description={basicsFieldsConfig.appUrl.description}
        shortDescription={basicsFieldsConfig.appUrl.shortDescription}
        weight={basicsFieldsConfig.appUrl.weight}
        showReference={basicsFieldsConfig.appUrl.showReference}
        showApplicable={basicsFieldsConfig.appUrl.showApplicable}
        isApplicable={!!isAppUrlApplicable}
        onApplicableChange={
          basicsFieldsConfig.appUrl.applicableKey
            ? (isSelected) =>
                setValue(basicsFieldsConfig.appUrl.applicableKey!, isSelected, {
                  shouldValidate: true,
                })
            : undefined
        }
        onAddReference={
          basicsFieldsConfig.appUrl.showReference
            ? () =>
                onAddReference(
                  basicsFieldsConfig.appUrl.key,
                  basicsFieldsConfig.appUrl.label,
                )
            : undefined
        }
      >
        <Controller
          name={basicsFieldsConfig.appUrl.key}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <div>
              <Input
                {...field}
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value)}
                isDisabled={!isAppUrlApplicable}
                classNames={{
                  base: cn('group w-full', error ? 'border-red-500' : ''),
                  inputWrapper: cn(
                    'bg-[rgba(0,0,0,0.05)] border border-[rgba(0,0,0,0.1)]',
                    'rounded-lg h-[42px] flex px-0',
                    !isAppUrlApplicable ? 'opacity-50 cursor-not-allowed' : '',
                  ),
                  input:
                    'font-normal text-black placeholder:text-black placeholder:opacity-60',
                }}
                startContent={
                  basicsFieldsConfig.appUrl.startContentText && (
                    <div className="mr-1 flex h-full items-center rounded-l-lg bg-[#E1E1E1] px-3">
                      <span className="font-semibold text-black opacity-40">
                        {basicsFieldsConfig.appUrl.startContentText}
                      </span>
                    </div>
                  )
                }
                placeholder={basicsFieldsConfig.appUrl.placeholder}
                isInvalid={!!error}
                errorMessage={error?.message}
              />
            </div>
          )}
        />
      </FormFieldContainer>
    </div>
  );
};

export default BasicsStepForm;
