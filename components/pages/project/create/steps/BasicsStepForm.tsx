'use client';

import { Avatar, Select, SelectItem, cn } from '@heroui/react';
import { Image as ImageIcon } from '@phosphor-icons/react';
import React from 'react';
import { Controller } from 'react-hook-form';

import { Input, Textarea } from '@/components/base';
import { basicsFieldsConfig } from '@/components/pages/project/create/formData';
import { FormFieldContainer } from '@/components/pages/project/create/FormFieldContainer';
import { createContainerProps } from '@/components/pages/project/create/utils/containerProps';

import InputPrefix from '../InputPrefix';
import PhotoUpload from '../PhotoUpload';
import { StepFormProps } from '../types';

const BasicsStepForm: React.FC<Omit<StepFormProps, 'register'>> = ({
  control,
  errors,
  setValue,
  trigger,
  fieldApplicability,
  onChangeApplicability,
  onAddReference,
  hasFieldValue,
  hasFieldReference,
}) => {
  const categoriesConfig = basicsFieldsConfig.categories;
  const presetCategories = categoriesConfig?.presetCategories || [];

  return (
    <div className="flex flex-col gap-[40px] mobile:gap-[20px]">
      <FormFieldContainer
        {...createContainerProps({
          fieldConfig: basicsFieldsConfig.projectName,
          onAddReference: onAddReference,
          hasFieldValue,
          hasFieldReference,
        })}
      >
        <Controller
          name={basicsFieldsConfig.projectName.key}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <div>
              <Input
                {...field}
                placeholder={basicsFieldsConfig.projectName.placeholder}
                isInvalid={!!error}
                errorMessage={error?.message}
              />
            </div>
          )}
        />
      </FormFieldContainer>

      <FormFieldContainer
        {...createContainerProps({
          fieldConfig: basicsFieldsConfig.tagline,
          onAddReference: onAddReference,
          hasFieldValue,
          hasFieldReference,
        })}
      >
        <Controller
          name={basicsFieldsConfig.tagline.key}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <div>
              <Input
                {...field}
                placeholder={basicsFieldsConfig.tagline.placeholder}
                isInvalid={!!error}
                errorMessage={error?.message}
              />
            </div>
          )}
        />
      </FormFieldContainer>

      <FormFieldContainer
        {...createContainerProps({
          fieldConfig: basicsFieldsConfig.categories,
          onAddReference: onAddReference,
          hasFieldValue,
          hasFieldReference,
        })}
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
                selectedKeys={field.value || []}
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
        {...createContainerProps({
          fieldConfig: basicsFieldsConfig.mainDescription,
          onAddReference: onAddReference,
          hasFieldValue,
          hasFieldReference,
        })}
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
        {...createContainerProps({
          fieldConfig: basicsFieldsConfig.projectLogo,
          onAddReference: onAddReference,
          hasFieldValue,
          hasFieldReference,
        })}
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
                  className="size-[140px] rounded-full bg-transparent"
                >
                  <Avatar
                    size="lg"
                    icon={<ImageIcon className="size-[64px] text-gray-400" />}
                    src={field.value ?? undefined}
                    alt={basicsFieldsConfig.projectLogo.label}
                    className="size-[140px] cursor-pointer border border-dashed border-gray-300 bg-black/5 hover:bg-gray-200"
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
        {...createContainerProps({
          fieldConfig: basicsFieldsConfig.websiteUrl,
          onAddReference: onAddReference,
          hasFieldValue,
          hasFieldReference,
        })}
      >
        <Controller
          name={basicsFieldsConfig.websiteUrl.key}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <div>
              <Input
                {...field}
                startContent={
                  basicsFieldsConfig.websiteUrl.startContentText && (
                    <InputPrefix
                      prefix={basicsFieldsConfig.websiteUrl.startContentText}
                    />
                  )
                }
                classNames={{
                  inputWrapper: 'pl-0 pr-[10px]',
                }}
                placeholder={basicsFieldsConfig.websiteUrl.placeholder}
                isInvalid={!!error}
                errorMessage={error?.message}
              />
            </div>
          )}
        />
      </FormFieldContainer>

      <FormFieldContainer
        {...createContainerProps({
          fieldConfig: basicsFieldsConfig.appUrl,
          showApplicable: true,
          isApplicable: fieldApplicability.appUrl,
          onChangeApplicability: (val) => onChangeApplicability('appUrl', val),
          onAddReference: onAddReference,
          hasFieldValue,
          hasFieldReference,
        })}
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
                isDisabled={!fieldApplicability.appUrl}
                classNames={{
                  inputWrapper: 'pl-0 pr-[10px]',
                }}
                startContent={
                  basicsFieldsConfig.appUrl.startContentText && (
                    <InputPrefix
                      prefix={basicsFieldsConfig.appUrl.startContentText}
                    />
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
