'use client';

import { Avatar } from '@heroui/react';
import { Image as ImageIcon } from '@phosphor-icons/react';
import React from 'react';
import { Controller } from 'react-hook-form';

import { Input, Select, SelectItem, Textarea } from '@/components/base';
import { basicsFieldsConfig } from '@/components/pages/project/create/formData';
import { FormFieldContainer } from '@/components/pages/project/create/FormFieldContainer';
import { useCreateContainerPropsWithValue } from '@/components/pages/project/create/utils/useCreateContainerPropsWithValue';

import InputPrefix from '../InputPrefix';
import PhotoUpload from '../PhotoUpload';
import { StepFormProps } from '../types';

const BasicsStepForm: React.FC<
  Omit<StepFormProps, 'register' | 'hasFieldValue'>
> = ({
  control,
  errors,
  setValue,
  trigger,
  fieldApplicability,
  onChangeApplicability,
  onAddReference,
  hasFieldReference,
}) => {
  const categoriesConfig = basicsFieldsConfig.categories;
  const presetCategories = categoriesConfig?.presetCategories || [];

  return (
    <div className="flex flex-col gap-[40px] mobile:gap-[20px]">
      <FormFieldContainer
        {...useCreateContainerPropsWithValue({
          fieldConfig: basicsFieldsConfig.projectName,
          onAddReference: onAddReference,
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
        {...useCreateContainerPropsWithValue({
          fieldConfig: basicsFieldsConfig.tagline,
          onAddReference: onAddReference,
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
        {...useCreateContainerPropsWithValue({
          fieldConfig: basicsFieldsConfig.categories,
          onAddReference: onAddReference,
          hasFieldReference,
        })}
      >
        <Controller
          name={basicsFieldsConfig.categories.key}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <div>
              <Select
                variant="bordered"
                placeholder={basicsFieldsConfig.categories.placeholder}
                selectionMode="multiple"
                selectedKeys={field.value || []}
                onSelectionChange={(keys) => field.onChange(Array.from(keys))}
                isInvalid={!!error}
                errorMessage={error?.message}
              >
                {presetCategories.map((category) => (
                  <SelectItem key={category} textValue={category}>
                    {category}
                  </SelectItem>
                ))}
              </Select>
            </div>
          )}
        />
      </FormFieldContainer>

      <FormFieldContainer
        {...useCreateContainerPropsWithValue({
          fieldConfig: basicsFieldsConfig.mainDescription,
          onAddReference: onAddReference,
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
        {...useCreateContainerPropsWithValue({
          fieldConfig: basicsFieldsConfig.projectLogo,
          onAddReference: onAddReference,
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
        {...useCreateContainerPropsWithValue({
          fieldConfig: basicsFieldsConfig.websiteUrl,
          onAddReference: onAddReference,
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
        {...useCreateContainerPropsWithValue({
          fieldConfig: basicsFieldsConfig.appUrl,
          showApplicable: true,
          isApplicable: fieldApplicability.appUrl,
          onChangeApplicability: (val) => onChangeApplicability('appUrl', val),
          onAddReference: onAddReference,
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
