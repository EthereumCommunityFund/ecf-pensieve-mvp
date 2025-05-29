'use client';

import React from 'react';
import { Controller } from 'react-hook-form';

import { financialFieldsConfig } from '@/components/pages/project/create/form/FormData';
import FormItemRenderer from '@/components/pages/project/create/form/FormItemRenderer';
import { useCreateContainerPropsWithValue } from '@/components/pages/project/create/utils/useCreateContainerPropsWithValue';

import { FormFieldContainer } from '../form/FormFieldContainer';
import { IStepFormProps } from '../types';

const FinancialStepForm: React.FC<
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
      {/* fundingStatus */}
      <FormFieldContainer
        {...useCreateContainerPropsWithValue({
          fieldConfig: financialFieldsConfig.fundingStatus,
          isApplicable:
            fieldApplicability[financialFieldsConfig.fundingStatus.key],
          onChangeApplicability: (val: boolean) =>
            onChangeApplicability(financialFieldsConfig.fundingStatus.key, val),
          onAddReference: onAddReference,
          hasFieldReference,
        })}
      >
        <Controller
          name={financialFieldsConfig.fundingStatus.key}
          control={control}
          render={({ field, fieldState }) => (
            <FormItemRenderer
              field={field}
              fieldState={fieldState}
              itemConfig={financialFieldsConfig.fundingStatus}
              fieldApplicability={fieldApplicability}
            />
          )}
        />
      </FormFieldContainer>

      {/* tokenContract */}
      <FormFieldContainer
        {...useCreateContainerPropsWithValue({
          fieldConfig: financialFieldsConfig.tokenContract,
          onAddReference: onAddReference,
          hasFieldReference,
        })}
      >
        <Controller
          name={financialFieldsConfig.tokenContract.key}
          control={control}
          render={({ field, fieldState }) => (
            <FormItemRenderer
              field={field}
              fieldState={fieldState}
              itemConfig={financialFieldsConfig.tokenContract}
              fieldApplicability={fieldApplicability}
            />
          )}
        />
      </FormFieldContainer>
    </div>
  );
};

export default FinancialStepForm;
