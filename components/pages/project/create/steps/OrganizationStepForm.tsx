'use client';

import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { PlusIcon } from '@/components/icons';
import { organizationFieldsConfig } from '@/components/pages/project/create/form/FormData';
import FormItemManager from '@/components/pages/project/create/form/FormItemManager';
import { useFormPropsWithValue } from '@/components/pages/project/create/form/useFormPropsWithValue';
import { IItemConfig } from '@/types/item';

import { FormItemUIContainer } from '../form/FormItemUIContainer';
import FounderFormItemTable from '../form/FounderFormItemTable';
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
            {/* Table header */}
            <div className="flex items-center border-b border-black/5 bg-[#F5F5F5]">
              <div className="flex flex-1 items-center gap-[5px] border-r border-black/10 p-[10px]">
                <span className="text-[14px] font-[600] leading-[19px] text-black/60">
                  Full Name
                </span>
              </div>
              <div className="flex flex-1 items-center gap-[5px] p-[10px]">
                <span className="text-[14px] font-[600] leading-[19px] text-black/60">
                  Title/Role
                </span>
              </div>
              <div className="w-[60px] p-[10px]"></div>
            </div>
            {fields.map((field, index) => (
              <FounderFormItemTable
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
                className="mobile:w-full flex h-auto min-h-0 cursor-pointer items-center gap-[5px] rounded-[4px] border-none px-[8px] py-[4px] text-black opacity-60 transition-opacity duration-200 hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  append({ name: '', title: '' });

                  // Focus on the first input field of the new row
                  const newIndex = fields.length;
                  setTimeout(() => {
                    const nameInput = document.querySelector(
                      `input[name="${foundersKey}.${newIndex}.name"]`,
                    ) as HTMLInputElement;
                    if (nameInput) {
                      nameInput.focus();
                    }
                  }, 0);
                }}
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
