'use client';

import React from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import { Button } from '@/components/base';
import { organizationFieldsConfig } from '@/components/pages/project/create/form/FormData';
import FormItemRenderer from '@/components/pages/project/create/form/FormItemRenderer';
import { useCreateContainerPropsWithValue } from '@/components/pages/project/create/utils/useCreateContainerPropsWithValue';

import { FormFieldContainer } from '../form/FormFieldContainer';
import FounderFormItem from '../form/FounderFormItem';
import { IProjectFormData, IStepFormProps } from '../types';

const OrganizationStepForm: React.FC<
  Omit<
    IStepFormProps,
    'register' | 'watch' | 'setValue' | 'trigger' | 'hasFieldValue'
  >
> = ({
  control,
  errors,
  fieldApplicability,
  onChangeApplicability,
  onAddReference,
  hasFieldReference,
}) => {
  const { register } = useFormContext<IProjectFormData>();

  const foundersConfig = organizationFieldsConfig.founders;
  const foundersKey = foundersConfig?.key;

  const { fields, append, remove } = useFieldArray({
    control,
    name: foundersKey || 'founders',
  });

  return (
    <div className="mobile:gap-[20px] flex flex-col gap-[40px]">
      {/* orgStructure */}
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
          render={({ field, fieldState }) => (
            <FormItemRenderer
              field={field}
              fieldState={fieldState}
              itemConfig={organizationFieldsConfig.orgStructure}
              fieldApplicability={fieldApplicability}
            />
          )}
        />
      </FormFieldContainer>

      {/* publicGoods */}
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
          render={({ field, fieldState }) => (
            <FormItemRenderer
              field={field}
              fieldState={fieldState}
              itemConfig={organizationFieldsConfig.publicGoods}
              fieldApplicability={fieldApplicability}
            />
          )}
        />
      </FormFieldContainer>

      {/* founders */}
      <div className="rounded-[10px] border border-black/10 bg-[#EFEFEF] p-[20px]">
        <FormFieldContainer
          {...useCreateContainerPropsWithValue({
            fieldConfig: organizationFieldsConfig.founders,
            isApplicable:
              fieldApplicability[organizationFieldsConfig.founders.key],
            onChangeApplicability: (val: boolean) =>
              onChangeApplicability(organizationFieldsConfig.founders.key, val),
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
