'use client';

import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { PlusIcon } from '@/components/icons';
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
          <div className="overflow-hidden rounded-[10px] border border-black/10 bg-white">
            <FounderFormItem
              index={0}
              remove={() => {}}
              register={register}
              errors={undefined}
              foundersKey={foundersKey}
              canRemove={false}
              showHeader={true}
            />
            {fields.map((field, index) => (
              <FounderFormItem
                key={field.id}
                index={index}
                remove={remove}
                register={register}
                errors={errors?.founders?.[index]}
                foundersKey={foundersKey}
                canRemove={fields.length > 1}
              />
            ))}
            <div className="bg-[#F5F5F5] p-[10px]">
              <button
                type="button"
                className="mobile:w-full flex h-auto min-h-0  cursor-pointer items-center gap-[5px] rounded-[4px] border-none px-[8px] py-[4px] text-black opacity-60 transition-opacity duration-200 hover:opacity-100"
                onClick={() => append({ name: '', title: '' })}
                style={{
                  outline: 'none',
                  boxShadow: 'none',
                  fontFamily: 'Open Sans, sans-serif',
                }}
              >
                <PlusIcon size={16} />
                <span className="text-[14px] font-[400] leading-[19px]">
                  Add an Entry
                </span>
              </button>
            </div>
          </div>
        </FormItemUIContainer>
      </div>
    </div>
  );
};

export default OrganizationStepForm;
