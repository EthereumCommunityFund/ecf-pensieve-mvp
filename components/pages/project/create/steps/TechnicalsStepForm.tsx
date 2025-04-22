'use client';

import { Input, Select, SelectItem } from '@heroui/react';
import { Code, CurrencyEth } from '@phosphor-icons/react/dist/ssr';
import React, { useEffect } from 'react';
import { Controller } from 'react-hook-form';

import { technicalsFieldsConfig } from '@/components/pages/project/create/formData';

import { FormFieldContainer } from '../FormFieldContainer';
import { ProjectFormData, StepFormProps } from '../types';

const TechnicalsStepForm: React.FC<Omit<StepFormProps, 'register'>> = ({
  control,
  errors,
  watch,
  setValue,
  onAddReference,
}) => {
  const openSourceValue = watch(technicalsFieldsConfig.openSource.key);

  const codeRepoConfig = technicalsFieldsConfig.codeRepo;
  const codeRepoApplicableKey = codeRepoConfig?.applicableKey;
  const isCodeRepoApplicable = codeRepoApplicableKey
    ? !!watch(codeRepoApplicableKey)
    : true;

  const tokenContractConfig = technicalsFieldsConfig.tokenContract;
  const tokenContractApplicableKey = tokenContractConfig?.applicableKey;
  const isTokenContractApplicable = tokenContractApplicableKey
    ? !!watch(tokenContractApplicableKey)
    : true;

  useEffect(() => {
    if (
      openSourceValue === 'No' &&
      codeRepoApplicableKey &&
      isCodeRepoApplicable
    ) {
      setValue(codeRepoApplicableKey, false, { shouldValidate: true });
    }
  }, [openSourceValue, setValue, codeRepoApplicableKey, isCodeRepoApplicable]);

  useEffect(() => {
    if (!isCodeRepoApplicable && codeRepoConfig) {
      setValue(codeRepoConfig.key, null, { shouldValidate: true });
    }
    if (!isTokenContractApplicable && tokenContractConfig) {
      setValue(tokenContractConfig.key, null, { shouldValidate: true });
    }
  }, [
    isCodeRepoApplicable,
    isTokenContractApplicable,
    setValue,
    codeRepoConfig,
    tokenContractConfig,
  ]);

  const openSourceOptions = technicalsFieldsConfig.openSource?.options || [];

  return (
    <div className="flex flex-col gap-[40px]">
      <FormFieldContainer
        label={technicalsFieldsConfig.openSource.label}
        description={technicalsFieldsConfig.openSource.description}
        shortDescription={technicalsFieldsConfig.openSource.shortDescription}
        weight={technicalsFieldsConfig.openSource.weight}
        showReference={technicalsFieldsConfig.openSource.showReference}
        onAddReference={
          technicalsFieldsConfig.openSource.showReference
            ? () =>
                onAddReference(
                  technicalsFieldsConfig.openSource.key,
                  technicalsFieldsConfig.openSource.label,
                )
            : undefined
        }
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
              items={openSourceOptions}
              className="w-full"
            >
              {(item) => (
                <SelectItem key={item.value} textValue={item.label}>
                  {item.label}
                </SelectItem>
              )}
            </Select>
          )}
        />
      </FormFieldContainer>

      {codeRepoApplicableKey && (
        <FormFieldContainer
          label={codeRepoConfig.label}
          description={codeRepoConfig.description}
          shortDescription={codeRepoConfig.shortDescription}
          weight={codeRepoConfig.weight}
          showReference={codeRepoConfig.showReference}
          showApplicable={codeRepoConfig.showApplicable}
          isApplicable={isCodeRepoApplicable}
          onApplicableChange={
            codeRepoConfig.showApplicable && codeRepoApplicableKey
              ? (isSelected) =>
                  setValue(codeRepoApplicableKey, isSelected, {
                    shouldValidate: true,
                  })
              : undefined
          }
          onAddReference={
            codeRepoConfig.showReference
              ? () => onAddReference(codeRepoConfig.key, codeRepoConfig.label)
              : undefined
          }
          isApplicableDisabled={openSourceValue === 'No'}
        >
          <Controller
            name={codeRepoConfig.key}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Input
                {...field}
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder={codeRepoConfig.placeholder}
                isInvalid={!!error}
                errorMessage={error?.message}
                isDisabled={!isCodeRepoApplicable}
                startContent={
                  codeRepoConfig.startContentText ? (
                    <div className="pointer-events-none mr-1 flex h-full items-center rounded-l-lg bg-[#E1E1E1] px-3">
                      <span className="font-semibold text-black opacity-40">
                        {codeRepoConfig.startContentText}
                      </span>
                    </div>
                  ) : (
                    <Code className="pointer-events-none size-4 text-gray-400" />
                  )
                }
                className="w-full"
                aria-label={codeRepoConfig.label}
              />
            )}
          />
        </FormFieldContainer>
      )}

      {tokenContractApplicableKey && (
        <FormFieldContainer
          label={tokenContractConfig.label}
          description={tokenContractConfig.description}
          shortDescription={tokenContractConfig.shortDescription}
          weight={tokenContractConfig.weight}
          showReference={tokenContractConfig.showReference}
          showApplicable={tokenContractConfig.showApplicable}
          isApplicable={isTokenContractApplicable}
          onApplicableChange={
            tokenContractConfig.showApplicable && tokenContractApplicableKey
              ? (isSelected) =>
                  setValue(tokenContractApplicableKey, isSelected, {
                    shouldValidate: true,
                  })
              : undefined
          }
          onAddReference={
            tokenContractConfig.showReference
              ? () =>
                  onAddReference(
                    tokenContractConfig.key,
                    tokenContractConfig.label,
                  )
              : undefined
          }
        >
          <Controller
            name={tokenContractConfig.key}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Input
                {...field}
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder={tokenContractConfig.placeholder}
                isInvalid={!!error}
                errorMessage={error?.message}
                isDisabled={!isTokenContractApplicable}
                startContent={
                  tokenContractConfig.startContentText ? (
                    <div className="pointer-events-none mr-1 flex h-full items-center rounded-l-lg bg-[#E1E1E1] px-3">
                      <span className="font-semibold text-black opacity-40">
                        {tokenContractConfig.startContentText}
                      </span>
                    </div>
                  ) : (
                    <CurrencyEth className="pointer-events-none size-4 text-gray-400" />
                  )
                }
                className="w-full"
                aria-label={tokenContractConfig.label}
              />
            )}
          />
        </FormFieldContainer>
      )}
    </div>
  );
};

export default TechnicalsStepForm;
