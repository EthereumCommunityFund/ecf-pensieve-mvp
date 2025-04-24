'use client';

import { Code, CurrencyEth } from '@phosphor-icons/react/dist/ssr';
import React from 'react';
import { Controller } from 'react-hook-form';

import { Input, Select, SelectItem } from '@/components/base';
import { technicalsFieldsConfig } from '@/components/pages/project/create/formData';
import { FormFieldContainer } from '@/components/pages/project/create/FormFieldContainer';
import { createContainerProps } from '@/components/pages/project/create/utils/containerProps';

import InputPrefix from '../InputPrefix';
import { ProjectFormData, StepFormProps } from '../types';

const TechnicalsStepForm: React.FC<Omit<StepFormProps, 'register'>> = ({
  control,
  errors,
  watch,
  setValue,
  fieldApplicability,
  onChangeApplicability,
  onAddReference,
  hasFieldValue,
  hasFieldReference,
}) => {
  const openSourceValue = watch(technicalsFieldsConfig.openSource.key);
  const openSourceOptions = technicalsFieldsConfig.openSource?.options || [];

  return (
    <div className="flex flex-col gap-[40px] mobile:gap-[20px]">
      <FormFieldContainer
        {...createContainerProps({
          fieldConfig: technicalsFieldsConfig.openSource,
          onAddReference: onAddReference,
          hasFieldValue,
          hasFieldReference,
        })}
      >
        <Controller
          name={technicalsFieldsConfig.openSource.key}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Select
              aria-label={technicalsFieldsConfig.openSource.label}
              placeholder={technicalsFieldsConfig.openSource.placeholder}
              selectedKeys={field.value ? [field.value] : []}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] ?? '';
                field.onChange(value as ProjectFormData['openSource']);
              }}
              isInvalid={!!error}
              errorMessage={error?.message}
              className="w-full"
            >
              {openSourceOptions.map((option) => (
                <SelectItem key={option.value} textValue={option.label}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          )}
        />
      </FormFieldContainer>

      <FormFieldContainer
        {...createContainerProps({
          fieldConfig: technicalsFieldsConfig.codeRepo,
          showApplicable: true,
          isApplicable: fieldApplicability.codeRepo,
          onChangeApplicability: (val) =>
            onChangeApplicability('codeRepo', val),
          onAddReference: onAddReference,
          hasFieldValue,
          hasFieldReference,
        })}
      >
        <Controller
          name={technicalsFieldsConfig.codeRepo.key}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              value={field.value || ''}
              onChange={(e) => field.onChange(e.target.value)}
              placeholder={technicalsFieldsConfig.codeRepo.placeholder}
              isInvalid={!!error}
              errorMessage={error?.message}
              isDisabled={!fieldApplicability.codeRepo}
              startContent={
                technicalsFieldsConfig.codeRepo.startContentText ? (
                  <InputPrefix
                    prefix={technicalsFieldsConfig.codeRepo.startContentText}
                  />
                ) : (
                  <Code className="pointer-events-none size-4 text-gray-400" />
                )
              }
              className="w-full"
              aria-label={technicalsFieldsConfig.codeRepo.label}
            />
          )}
        />
      </FormFieldContainer>

      <FormFieldContainer
        {...createContainerProps({
          fieldConfig: technicalsFieldsConfig.tokenContract,
          showApplicable: true,
          isApplicable: fieldApplicability.tokenContract,
          onChangeApplicability: (val) =>
            onChangeApplicability('tokenContract', val),
          onAddReference: onAddReference,
          hasFieldValue,
          hasFieldReference,
        })}
      >
        <Controller
          name={technicalsFieldsConfig.tokenContract.key}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              value={field.value || ''}
              onChange={(e) => field.onChange(e.target.value)}
              placeholder={technicalsFieldsConfig.tokenContract.placeholder}
              isInvalid={!!error}
              errorMessage={error?.message}
              isDisabled={!fieldApplicability.tokenContract}
              startContent={
                technicalsFieldsConfig.tokenContract.startContentText ? (
                  <InputPrefix
                    prefix={
                      technicalsFieldsConfig.tokenContract.startContentText
                    }
                  />
                ) : (
                  <CurrencyEth className="pointer-events-none size-4 text-gray-400" />
                )
              }
              className="w-full"
              aria-label={technicalsFieldsConfig.tokenContract.label}
            />
          )}
        />
      </FormFieldContainer>
    </div>
  );
};

export default TechnicalsStepForm;
