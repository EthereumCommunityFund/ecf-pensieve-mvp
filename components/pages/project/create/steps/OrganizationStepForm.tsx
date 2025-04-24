'use client';

import { Select, SelectItem } from '@heroui/react';
import React from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import { Button } from '@/components/base';
import { organizationFieldsConfig } from '@/components/pages/project/create/formData';
import { FormFieldContainer } from '@/components/pages/project/create/FormFieldContainer';
import { createContainerProps } from '@/components/pages/project/create/utils/containerProps';

import { ProjectFormData, StepFormProps } from '../types';

import FounderFormItem from './FounderFormItem';

const OrganizationStepForm: React.FC<
  Omit<StepFormProps, 'register' | 'watch' | 'setValue' | 'trigger'>
> = ({ control, errors, onAddReference, hasFieldValue, hasFieldReference }) => {
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
    <div className="flex flex-col gap-[40px] mobile:gap-[20px]">
      <FormFieldContainer
        {...createContainerProps({
          fieldConfig: organizationFieldsConfig.orgStructure,
          onAddReference: onAddReference,
          hasFieldValue,
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
              items={orgStructureOptions}
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
        {...createContainerProps({
          fieldConfig: organizationFieldsConfig.publicGoods,
          onAddReference: onAddReference,
          hasFieldValue,
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
              items={publicGoodsOptions}
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

      <div className="rounded-[10px] border border-black/10 bg-[#EFEFEF] p-[20px]">
        <FormFieldContainer
          {...createContainerProps({
            fieldConfig: organizationFieldsConfig.founders,
            onAddReference: onAddReference,
            hasFieldValue,
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
              className="px-[20px]"
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
