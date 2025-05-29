'use client';

import React from 'react';
import { Controller } from 'react-hook-form';

import { basicsFieldsConfig } from '@/components/pages/project/create/form/FormData';
import FormItemRenderer from '@/components/pages/project/create/form/FormItemRenderer';
import { useCreateContainerPropsWithValue } from '@/components/pages/project/create/utils/useCreateContainerPropsWithValue';

import { FormFieldContainer } from '../form/FormFieldContainer';
import { IStepFormProps } from '../types';

const BasicsStepForm: React.FC<
  Omit<IStepFormProps, 'register' | 'hasFieldValue'>
> = ({
  control,
  fieldApplicability,
  onChangeApplicability,
  onAddReference,
  hasFieldReference,
}) => {
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
          render={({ field, fieldState }) => (
            <FormItemRenderer
              field={field}
              fieldState={fieldState}
              itemConfig={basicsFieldsConfig.name}
              fieldApplicability={fieldApplicability}
            />
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
          render={({ field, fieldState }) => (
            <FormItemRenderer
              field={field}
              fieldState={fieldState}
              itemConfig={basicsFieldsConfig.tagline}
              fieldApplicability={fieldApplicability}
            />
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
          render={({ field, fieldState }) => (
            <FormItemRenderer
              field={field}
              fieldState={fieldState}
              itemConfig={basicsFieldsConfig.categories}
              fieldApplicability={fieldApplicability}
            />
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
          render={({ field, fieldState }) => (
            <FormItemRenderer
              field={field}
              fieldState={fieldState}
              itemConfig={basicsFieldsConfig.tags}
              fieldApplicability={fieldApplicability}
            />
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
          render={({ field, fieldState }) => (
            <FormItemRenderer
              field={field}
              fieldState={fieldState}
              itemConfig={basicsFieldsConfig.mainDescription}
              fieldApplicability={fieldApplicability}
            />
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
        <Controller
          name={basicsFieldsConfig.logoUrl.key}
          control={control}
          render={({ field, fieldState }) => (
            <FormItemRenderer
              field={field}
              fieldState={fieldState}
              itemConfig={basicsFieldsConfig.logoUrl}
              fieldApplicability={fieldApplicability}
            />
          )}
        />
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
          render={({ field, fieldState }) => (
            <FormItemRenderer
              field={field}
              fieldState={fieldState}
              itemConfig={basicsFieldsConfig.websiteUrl}
              fieldApplicability={fieldApplicability}
            />
          )}
        />
      </FormFieldContainer>

      {/* appUrl */}
      <FormFieldContainer
        {...useCreateContainerPropsWithValue({
          fieldConfig: basicsFieldsConfig.appUrl,
          isApplicable: fieldApplicability[basicsFieldsConfig.appUrl.key],
          onChangeApplicability: (val: boolean) =>
            onChangeApplicability(basicsFieldsConfig.appUrl.key, val),
          onAddReference: onAddReference,
          hasFieldReference,
        })}
      >
        <Controller
          name={basicsFieldsConfig.appUrl.key}
          control={control}
          render={({ field, fieldState }) => (
            <FormItemRenderer
              field={field}
              fieldState={fieldState}
              itemConfig={basicsFieldsConfig.appUrl}
              fieldApplicability={fieldApplicability}
            />
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
          render={({ field, fieldState }) => (
            <FormItemRenderer
              field={field}
              fieldState={fieldState}
              itemConfig={basicsFieldsConfig.whitePaper}
              fieldApplicability={fieldApplicability}
            />
          )}
        />
      </FormFieldContainer>

      {/* dateFounded */}
      <FormFieldContainer
        {...useCreateContainerPropsWithValue({
          fieldConfig: basicsFieldsConfig.dateFounded,
          onAddReference: onAddReference,
          hasFieldReference,
        })}
      >
        <Controller
          name={basicsFieldsConfig.dateFounded.key}
          control={control}
          render={({ field, fieldState }) => (
            <FormItemRenderer
              field={field}
              fieldState={fieldState}
              itemConfig={basicsFieldsConfig.dateFounded}
              fieldApplicability={fieldApplicability}
            />
          )}
        />
      </FormFieldContainer>

      {/* dateLaunch */}
      <FormFieldContainer
        {...useCreateContainerPropsWithValue({
          fieldConfig: basicsFieldsConfig.dateLaunch,
          isApplicable: fieldApplicability[basicsFieldsConfig.dateLaunch.key],
          onChangeApplicability: (val: boolean) =>
            onChangeApplicability(basicsFieldsConfig.dateLaunch.key, val),
          onAddReference: onAddReference,
          hasFieldReference,
        })}
      >
        <Controller
          name={basicsFieldsConfig.dateLaunch.key}
          control={control}
          render={({ field, fieldState }) => (
            <FormItemRenderer
              field={field}
              fieldState={fieldState}
              itemConfig={basicsFieldsConfig.dateLaunch}
              fieldApplicability={fieldApplicability}
            />
          )}
        />
      </FormFieldContainer>
    </div>
  );
};

export default BasicsStepForm;
