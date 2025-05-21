'use client';

import { Avatar } from '@heroui/react';
import { Image as ImageIcon } from '@phosphor-icons/react';
import React from 'react';
import { Controller } from 'react-hook-form';

import { Input, Select, SelectItem, Textarea } from '@/components/base';
import { basicsFieldsConfig } from '@/components/pages/project/create/FormData';
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
  const tagsOptions = basicsFieldsConfig.tags.options || [];

  return (
    <div className="mobile:gap-[20px] flex flex-col gap-[40px]">
      {/* name */}
      <FormFieldContainer
        {...useCreateContainerPropsWithValue({
          fieldConfig: basicsFieldsConfig.name,
          onAddReference: onAddReference,
          hasFieldReference,
        })}
      >
        <Controller
          name={basicsFieldsConfig.name.key}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <div>
              <Input
                {...field}
                placeholder={basicsFieldsConfig.name.placeholder}
                isInvalid={!!error}
                errorMessage={error?.message}
              />
            </div>
          )}
        />
      </FormFieldContainer>

      {/* tagline */}
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

      {/* categories */}
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
                aria-label={basicsFieldsConfig.categories.label}
              >
                {presetCategories.map((category) => (
                  <SelectItem
                    key={category}
                    textValue={category}
                    aria-label={category}
                  >
                    {category}
                  </SelectItem>
                ))}
              </Select>
            </div>
          )}
        />
      </FormFieldContainer>

      {/* tags */}
      <FormFieldContainer
        {...useCreateContainerPropsWithValue({
          fieldConfig: basicsFieldsConfig.tags,
          onAddReference: onAddReference,
          hasFieldReference,
        })}
      >
        <Controller
          name={basicsFieldsConfig.tags.key}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <div>
              <Select
                variant="bordered"
                placeholder={basicsFieldsConfig.tags.placeholder}
                selectionMode="multiple"
                selectedKeys={field.value || []}
                onSelectionChange={(keys) => field.onChange(Array.from(keys))}
                isInvalid={!!error}
                errorMessage={error?.message}
                aria-label={basicsFieldsConfig.categories.label}
              >
                {tagsOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    textValue={option.label}
                    aria-label={option.label}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
          )}
        />
      </FormFieldContainer>

      {/* mainDescription */}
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

      {/* logoUrl */}
      <FormFieldContainer
        {...useCreateContainerPropsWithValue({
          fieldConfig: basicsFieldsConfig.logoUrl,
          onAddReference: onAddReference,
          hasFieldReference,
        })}
      >
        <div className="flex items-center gap-4">
          <Controller
            name={basicsFieldsConfig.logoUrl.key}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <div>
                <PhotoUpload
                  initialUrl={field.value ?? undefined}
                  onUploadSuccess={field.onChange}
                  className="size-[140px] rounded-full bg-transparent"
                >
                  <Avatar
                    size="lg"
                    icon={<ImageIcon className="size-[64px] text-gray-400" />}
                    src={field.value ?? undefined}
                    alt={basicsFieldsConfig.logoUrl.label}
                    className="size-[140px] cursor-pointer border border-dashed border-gray-300 bg-black/5 hover:bg-gray-200"
                  />
                </PhotoUpload>
                {errors.logoUrl && (
                  <p className="text-danger text-[12px]">
                    {errors.logoUrl.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>
      </FormFieldContainer>

      {/* websiteUrl */}
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

      {/* appUrl */}
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

      {/* whitePaper */}
      <FormFieldContainer
        {...useCreateContainerPropsWithValue({
          fieldConfig: basicsFieldsConfig.whitePaper,
          onAddReference: onAddReference,
          hasFieldReference,
        })}
      >
        <Controller
          name={basicsFieldsConfig.whitePaper.key}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <div>
              <Input
                {...field}
                startContent={
                  basicsFieldsConfig.whitePaper.startContentText && (
                    <InputPrefix
                      prefix={basicsFieldsConfig.whitePaper.startContentText}
                    />
                  )
                }
                classNames={{
                  inputWrapper: 'pl-0 pr-[10px]',
                }}
                placeholder={basicsFieldsConfig.whitePaper.placeholder}
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
