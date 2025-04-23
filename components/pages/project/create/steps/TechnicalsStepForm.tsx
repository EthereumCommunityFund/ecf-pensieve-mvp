'use client';

import { Input, Select, SelectItem } from '@heroui/react';
import { Code, CurrencyEth } from '@phosphor-icons/react/dist/ssr';
import React from 'react';
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
  applicableStates,
  onChangeApplicableStates,
}) => {
  const openSourceValue = watch(technicalsFieldsConfig.openSource.key);

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

      <FormFieldContainer
        label={technicalsFieldsConfig.codeRepo.label}
        description={technicalsFieldsConfig.codeRepo.description}
        shortDescription={technicalsFieldsConfig.codeRepo.shortDescription}
        weight={technicalsFieldsConfig.codeRepo.weight}
        showReference={technicalsFieldsConfig.codeRepo.showReference}
        showApplicable={true}
        isApplicable={applicableStates.codeRepo}
        onApplicableChange={(val) => onChangeApplicableStates('codeRepo', val)}
        onAddReference={
          technicalsFieldsConfig.codeRepo.showReference
            ? () =>
                onAddReference(
                  technicalsFieldsConfig.codeRepo.key,
                  technicalsFieldsConfig.codeRepo.label,
                )
            : undefined
        }
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
              isDisabled={!applicableStates.codeRepo}
              startContent={
                technicalsFieldsConfig.codeRepo.startContentText ? (
                  <div className="pointer-events-none mr-1 flex h-full items-center rounded-l-lg bg-[#E1E1E1] px-3">
                    <span className="font-semibold text-black opacity-40">
                      {technicalsFieldsConfig.codeRepo.startContentText}
                    </span>
                  </div>
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
        label={technicalsFieldsConfig.tokenContract.label}
        description={technicalsFieldsConfig.tokenContract.description}
        shortDescription={technicalsFieldsConfig.tokenContract.shortDescription}
        weight={technicalsFieldsConfig.tokenContract.weight}
        showReference={technicalsFieldsConfig.tokenContract.showReference}
        showApplicable={true}
        isApplicable={applicableStates.tokenContract}
        onApplicableChange={(val) =>
          onChangeApplicableStates('tokenContract', val)
        }
        onAddReference={
          technicalsFieldsConfig.tokenContract.showReference
            ? () =>
                onAddReference(
                  technicalsFieldsConfig.tokenContract.key,
                  technicalsFieldsConfig.tokenContract.label,
                )
            : undefined
        }
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
              isDisabled={!applicableStates.tokenContract}
              startContent={
                technicalsFieldsConfig.tokenContract.startContentText ? (
                  <div className="pointer-events-none mr-1 flex h-full items-center rounded-l-lg bg-[#E1E1E1] px-3">
                    <span className="font-semibold text-black opacity-40">
                      {technicalsFieldsConfig.tokenContract.startContentText}
                    </span>
                  </div>
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
