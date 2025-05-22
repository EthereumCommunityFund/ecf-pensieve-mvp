'use client';

import React from 'react';
import { Controller } from 'react-hook-form';

import { Input, Select, SelectItem } from '@/components/base';
import { financialFieldsConfig } from '@/components/pages/project/create/FormData';
import { FormFieldContainer } from '@/components/pages/project/create/FormFieldContainer';
import { useCreateContainerPropsWithValue } from '@/components/pages/project/create/utils/useCreateContainerPropsWithValue';

import { IProjectFormData, IStepFormProps } from '../types';

const FinancialStepForm: React.FC<
  Omit<IStepFormProps, 'register' | 'hasFieldValue'>
> = ({
  control,
  errors,
  watch,
  setValue,
  fieldApplicability,
  onChangeApplicability,
  onAddReference,
  hasFieldReference,
}) => {
  const fundingStatusOptions =
    financialFieldsConfig.fundingStatus?.options || [];

  return (
    <div className="mobile:gap-[20px] flex flex-col gap-[40px]">
      {/* fundingStatus */}
      <FormFieldContainer
        {...useCreateContainerPropsWithValue({
          fieldConfig: financialFieldsConfig.fundingStatus,
          isApplicable: fieldApplicability.fundingStatus,
          onChangeApplicability: (val) =>
            onChangeApplicability('fundingStatus', val),
          onAddReference: onAddReference,
          hasFieldReference,
        })}
      >
        <Controller
          name={financialFieldsConfig.fundingStatus.key}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Select
              aria-label={financialFieldsConfig.fundingStatus.label}
              placeholder={financialFieldsConfig.fundingStatus.placeholder}
              selectedKeys={field.value ? [field.value] : []}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] ?? null;
                field.onChange(value as IProjectFormData['fundingStatus']);
              }}
              isInvalid={!!error}
              errorMessage={error?.message}
              isDisabled={!fieldApplicability.fundingStatus}
              className="w-full"
            >
              {fundingStatusOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  textValue={option.label}
                  aria-label={option.label}
                >
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          )}
        />
      </FormFieldContainer>

      {/* tokenContract */}
      <FormFieldContainer
        {...useCreateContainerPropsWithValue({
          fieldConfig: financialFieldsConfig.tokenContract,
          isApplicable: fieldApplicability.tokenContract,
          onChangeApplicability: (val) =>
            onChangeApplicability('tokenContract', val),
          onAddReference: onAddReference,
          hasFieldReference,
        })}
      >
        <Controller
          name={financialFieldsConfig.tokenContract.key}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              value={field.value || ''}
              onChange={(e) => field.onChange(e.target.value)}
              placeholder={financialFieldsConfig.tokenContract.placeholder}
              isInvalid={!!error}
              errorMessage={error?.message}
              isDisabled={!fieldApplicability.tokenContract}
              className="w-full"
              aria-label={financialFieldsConfig.tokenContract.label}
            />
          )}
        />
      </FormFieldContainer>
    </div>
  );
};

export default FinancialStepForm;
