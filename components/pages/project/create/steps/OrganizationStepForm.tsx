'use client';

import React from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import { Button, Select, SelectItem } from '@/components/base';
import { organizationFieldsConfig } from '@/components/pages/project/create/FormData';
import { FormFieldContainer } from '@/components/pages/project/create/FormFieldContainer';
import { useCreateContainerPropsWithValue } from '@/components/pages/project/create/utils/useCreateContainerPropsWithValue';

import FounderFormItem from '../FounderFormItem';
import { ProjectFormData, StepFormProps } from '../types';

const OrganizationStepForm: React.FC<
  Omit<
    StepFormProps,
    'register' | 'watch' | 'setValue' | 'trigger' | 'hasFieldValue'
  >
> = ({ control, errors, onAddReference, hasFieldReference }) => {
  const { register } = useFormContext<ProjectFormData>();

  const foundersConfig = organizationFieldsConfig.founders;
  const foundersKey = foundersConfig?.key;

  const { fields, append, remove } = useFieldArray({
    control,
    name: foundersKey || 'founders',
  });

  const orgStructureOptions =
    organizationFieldsConfig.orgStructure?.options || [];
  const publicGoodsOptions =
    organizationFieldsConfig.publicGoods?.options || [];

  return (
    <div className="mobile:gap-[20px] flex flex-col gap-[40px]">
      <FormFieldContainer
        {...useCreateContainerPropsWithValue({
          fieldConfig: organizationFieldsConfig.orgStructure,
          onAddReference: onAddReference,
          hasFieldReference,
        })}
      >
        <Controller
          name={organizationFieldsConfig.orgStructure.key}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Select
              aria-label={organizationFieldsConfig.orgStructure.label}
              placeholder={organizationFieldsConfig.orgStructure.placeholder}
              selectedKeys={field.value ? [field.value] : []}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] ?? '';
                field.onChange(value as ProjectFormData['orgStructure']);
              }}
              isInvalid={!!error}
              errorMessage={error?.message}
              className="w-full"
            >
              {orgStructureOptions.map((option) => (
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

      <FormFieldContainer
        {...useCreateContainerPropsWithValue({
          fieldConfig: organizationFieldsConfig.publicGoods,
          onAddReference: onAddReference,
          hasFieldReference,
        })}
      >
        <Controller
          name={organizationFieldsConfig.publicGoods.key}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Select
              aria-label={organizationFieldsConfig.publicGoods.label}
              placeholder={organizationFieldsConfig.publicGoods.placeholder}
              selectedKeys={field.value ? [field.value] : []}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] ?? '';
                field.onChange(value as ProjectFormData['publicGoods']);
              }}
              isInvalid={!!error}
              errorMessage={error?.message}
              className="w-full"
            >
              {publicGoodsOptions.map((option) => (
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

      <div className="rounded-[10px] border border-black/10 bg-[#EFEFEF] p-[20px]">
        <FormFieldContainer
          {...useCreateContainerPropsWithValue({
            fieldConfig: organizationFieldsConfig.founders,
            onAddReference: onAddReference,
            hasFieldReference,
          })}
        >
          <div className="flex flex-col gap-2.5 pt-[10px]">
            {fields.map((field, index) => (
              <FounderFormItem
                key={field.id}
                index={index}
                remove={remove}
                register={register}
                errors={errors?.founders?.[index]}
                foundersKey={foundersKey}
                isPrimary={index === 0}
                canRemove={fields.length > 1}
              />
            ))}
          </div>

          <div className="pt-[10px]">
            <Button
              color="secondary"
              size="md"
              className="mobile:w-full px-[20px]"
              onPress={() => append({ fullName: '', titleRole: '' })}
            >
              Add Entry
            </Button>
          </div>
        </FormFieldContainer>
      </div>
    </div>
  );
};

export default OrganizationStepForm;
