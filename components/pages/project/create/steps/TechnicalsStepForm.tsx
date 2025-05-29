'use client';

import React from 'react';
import { Controller } from 'react-hook-form';

import { technicalsFieldsConfig } from '@/components/pages/project/create/form/FormData';
import FormItemRenderer from '@/components/pages/project/create/form/FormItemRenderer';
import { useCreateContainerPropsWithValue } from '@/components/pages/project/create/utils/useCreateContainerPropsWithValue';

import { FormFieldContainer } from '../form/FormFieldContainer';
import { IStepFormProps } from '../types';

const TechnicalsStepForm: React.FC<
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
      {/* devStatus */}
      <FormFieldContainer
        {...useCreateContainerPropsWithValue({
          fieldConfig: technicalsFieldsConfig.devStatus,
          onAddReference: onAddReference,
          hasFieldReference,
        })}
      >
        <Controller
          name={technicalsFieldsConfig.devStatus.key}
          control={control}
          render={({ field, fieldState }) => (
            <FormItemRenderer
              field={field}
              fieldState={fieldState}
              itemConfig={technicalsFieldsConfig.devStatus}
              fieldApplicability={fieldApplicability}
            />
          )}
        />
      </FormFieldContainer>
      {/* openSource */}
      <FormFieldContainer
        {...useCreateContainerPropsWithValue({
          fieldConfig: technicalsFieldsConfig.openSource,
          onAddReference: onAddReference,
          hasFieldReference,
        })}
      >
        <Controller
          name={technicalsFieldsConfig.openSource.key}
          control={control}
          render={({ field, fieldState }) => (
            <FormItemRenderer
              field={field}
              fieldState={fieldState}
              itemConfig={technicalsFieldsConfig.openSource}
              fieldApplicability={fieldApplicability}
            />
          )}
        />
      </FormFieldContainer>

      {/* codeRepo */}
      <FormFieldContainer
        {...useCreateContainerPropsWithValue({
          fieldConfig: technicalsFieldsConfig.codeRepo,
          isApplicable: fieldApplicability[technicalsFieldsConfig.codeRepo.key],
          onChangeApplicability: (val: boolean) =>
            onChangeApplicability(technicalsFieldsConfig.codeRepo.key, val),
          onAddReference: onAddReference,
          hasFieldReference,
        })}
      >
        <Controller
          name={technicalsFieldsConfig.codeRepo.key}
          control={control}
          render={({ field, fieldState }) => (
            <FormItemRenderer
              field={field}
              fieldState={fieldState}
              itemConfig={technicalsFieldsConfig.codeRepo}
              fieldApplicability={fieldApplicability}
            />
          )}
        />
      </FormFieldContainer>

      {/* dappSmartContracts */}
      <FormFieldContainer
        {...useCreateContainerPropsWithValue({
          fieldConfig: technicalsFieldsConfig.dappSmartContracts,
          isApplicable:
            fieldApplicability[technicalsFieldsConfig.dappSmartContracts.key],
          onChangeApplicability: (val: boolean) =>
            onChangeApplicability(
              technicalsFieldsConfig.dappSmartContracts.key,
              val,
            ),
          onAddReference: onAddReference,
          hasFieldReference,
        })}
      >
        <Controller
          name={technicalsFieldsConfig.dappSmartContracts.key}
          control={control}
          render={({ field, fieldState }) => (
            <FormItemRenderer
              field={field}
              fieldState={fieldState}
              itemConfig={technicalsFieldsConfig.dappSmartContracts}
              fieldApplicability={fieldApplicability}
            />
          )}
        />
      </FormFieldContainer>
    </div>
  );
};

export default TechnicalsStepForm;
