'use client';

import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { Button } from '@/components/base';
import { organizationFieldsConfig } from '@/components/pages/project/create/form/FormData';
import FormItemManager from '@/components/pages/project/create/form/FormItemManager';
import { useFormPropsWithValue } from '@/components/pages/project/create/form/useFormPropsWithValue';
import { IItemConfig } from '@/types/item';

import { FormItemUIContainer } from '../form/FormItemUIContainer';
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

  const standardFieldConfigs = [
    organizationFieldsConfig.orgStructure,
    organizationFieldsConfig.publicGoods,
  ];

  const foundersConfig = organizationFieldsConfig.founders;
  const foundersKey = foundersConfig?.key || 'founders';

  const { fields, append, remove } = useFieldArray({
    control,
    name: foundersKey as 'founders',
  });

  return (
    <div className="mobile:gap-[20px] flex flex-col gap-[40px]">
      {standardFieldConfigs.map((itemConfig) => (
        <FormItemManager
          key={itemConfig.key}
          itemConfig={itemConfig}
          control={control}
          fieldApplicability={fieldApplicability}
          onChangeApplicability={onChangeApplicability}
          onAddReference={onAddReference}
          hasFieldReference={hasFieldReference}
        />
      ))}

      <div className="rounded-[10px] border border-black/10 bg-[#EFEFEF] p-[20px]">
        <FormItemUIContainer
          {...useFormPropsWithValue({
            fieldConfig: foundersConfig as IItemConfig<keyof IProjectFormData>,
            fieldApplicabilityMap: fieldApplicability,
            rawOnChangeApplicability: onChangeApplicability,
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
              onPress={() => append({ name: '', title: '' })}
            >
              Add Entry
            </Button>
          </div>
        </FormItemUIContainer>
      </div>
    </div>
  );
};

export default OrganizationStepForm;
