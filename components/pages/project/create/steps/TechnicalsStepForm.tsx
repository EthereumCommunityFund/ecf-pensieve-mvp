'use client';

import { Code } from '@phosphor-icons/react/dist/ssr';
import React from 'react';
import { Controller } from 'react-hook-form';

import { Input, Select, SelectItem } from '@/components/base';
import { technicalsFieldsConfig } from '@/components/pages/project/create/FormData';
import { FormFieldContainer } from '@/components/pages/project/create/FormFieldContainer';
import { useCreateContainerPropsWithValue } from '@/components/pages/project/create/utils/useCreateContainerPropsWithValue';

import InputPrefix from '../InputPrefix';
import { IProjectFormData, IStepFormProps } from '../types';

const TechnicalsStepForm: React.FC<
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
  const openSourceValue = watch(technicalsFieldsConfig.openSource.key);
  const openSourceOptions = technicalsFieldsConfig.openSource?.options || [];

  return (
    <div className="mobile:gap-[20px] flex flex-col gap-[40px]">
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
          render={({ field, fieldState: { error } }) => (
            <Select
              aria-label={technicalsFieldsConfig.openSource.label}
              placeholder={technicalsFieldsConfig.openSource.placeholder}
              selectedKeys={field.value ? [field.value] : []}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] ?? '';
                field.onChange(value as IProjectFormData['openSource']);
              }}
              isInvalid={!!error}
              errorMessage={error?.message}
              className="w-full"
            >
              {openSourceOptions.map((option) => (
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

      {/* codeRepo */}
      <FormFieldContainer
        {...useCreateContainerPropsWithValue({
          fieldConfig: technicalsFieldsConfig.codeRepo,
          isApplicable: fieldApplicability.codeRepo,
          onChangeApplicability: (val) =>
            onChangeApplicability('codeRepo', val),
          onAddReference: onAddReference,
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
              classNames={{
                inputWrapper: 'pl-0 pr-[10px]',
              }}
              aria-label={technicalsFieldsConfig.codeRepo.label}
            />
          )}
        />
      </FormFieldContainer>

      {/* tokenContract */}
      <FormFieldContainer
        {...useCreateContainerPropsWithValue({
          fieldConfig: technicalsFieldsConfig.tokenContract,
          isApplicable: fieldApplicability.tokenContract,
          onChangeApplicability: (val) =>
            onChangeApplicability('tokenContract', val),
          onAddReference: onAddReference,
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
              className="w-full"
              aria-label={technicalsFieldsConfig.tokenContract.label}
            />
          )}
        />
      </FormFieldContainer>

      {/* dappSmartContracts */}
      <FormFieldContainer
        {...useCreateContainerPropsWithValue({
          fieldConfig: technicalsFieldsConfig.dappSmartContracts,
          isApplicable: fieldApplicability.dappSmartContracts,
          onChangeApplicability: (val) =>
            onChangeApplicability('dappSmartContracts', val),
          onAddReference: onAddReference,
          hasFieldReference,
        })}
      >
        <Controller
          name={technicalsFieldsConfig.dappSmartContracts.key}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Input
              {...field}
              value={field.value || ''}
              onChange={(e) => field.onChange(e.target.value)}
              placeholder={
                technicalsFieldsConfig.dappSmartContracts.placeholder
              }
              isInvalid={!!error}
              errorMessage={error?.message}
              isDisabled={!fieldApplicability.dappSmartContracts}
              className="w-full"
              aria-label={technicalsFieldsConfig.dappSmartContracts.label}
            />
          )}
        />
      </FormFieldContainer>
    </div>
  );
};

export default TechnicalsStepForm;
