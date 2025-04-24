'use client';

import { Button, Select, SelectItem, Tooltip } from '@heroui/react';
import { Plus, Scales, Trash } from '@phosphor-icons/react/dist/ssr';
import React from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import { Input } from '@/components/base';
import { organizationFieldsConfig } from '@/components/pages/project/create/formData';
import { FormFieldContainer } from '@/components/pages/project/create/FormFieldContainer';
import { createContainerProps } from '@/components/pages/project/create/utils/containerProps';

import { ProjectFormData, StepFormProps } from '../types';

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

      <FormFieldContainer
        {...createContainerProps({
          fieldConfig: organizationFieldsConfig.founders,
          onAddReference: onAddReference,
          hasFieldValue,
          hasFieldReference,
        })}
      >
        <div className="space-y-4 rounded-lg border border-gray-200 bg-[#EFEFEF] p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <h3 className="text-lg font-semibold text-black">
                {foundersConfig?.label}
              </h3>
              {foundersConfig?.weight && (
                <div className="flex h-6 items-center justify-center rounded bg-black/5 px-1 text-xs text-black/50">
                  <span>Weight:</span>
                  <span className="ml-1">{foundersConfig?.weight}</span>
                </div>
              )}
            </div>
            {foundersConfig?.shortDescription && (
              <Tooltip content={foundersConfig?.shortDescription}>
                <span className="cursor-help">
                  <Scales className="size-5 text-gray-400" />
                </span>
              </Tooltip>
            )}
          </div>
          {foundersConfig?.description && (
            <p className="text-sm text-gray-700 opacity-80">
              {foundersConfig?.description}
            </p>
          )}

          <div className="flex flex-col gap-2.5">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-lg border border-black/10 bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-base font-semibold">
                    创始人 #{index + 1}
                    {index === 0 && (
                      <span className="ml-1 text-xs text-blue-600">(主要)</span>
                    )}
                  </h4>
                  {fields.length > 1 && (
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="danger"
                      onPress={() => remove(index)}
                      aria-label={`Remove founder ${index + 1}`}
                    >
                      <Trash className="size-4" />
                    </Button>
                  )}
                </div>

                <div className="md:grid-cols-2 grid gap-4">
                  <div className="flex flex-col gap-2.5">
                    <label className="text-sm font-semibold text-black">
                      全名
                    </label>
                    <Input
                      placeholder="完整姓名"
                      {...register(`${foundersKey}.${index}.fullName`)}
                      isInvalid={!!errors?.founders?.[index]?.fullName}
                      errorMessage={
                        errors?.founders?.[index]?.fullName?.message
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <label className="text-sm font-semibold text-black">
                      职位/角色
                    </label>
                    <Input
                      placeholder="职位或者在项目中的角色"
                      {...register(`${foundersKey}.${index}.titleRole`)}
                      isInvalid={!!errors?.founders?.[index]?.titleRole}
                      errorMessage={
                        errors?.founders?.[index]?.titleRole?.message
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
            <div className="flex">
              {foundersConfig?.showReference && onAddReference && (
                <Button
                  variant="light"
                  size="sm"
                  className="h-auto rounded bg-black/5 p-2 text-xs opacity-60"
                  onPress={() =>
                    onAddReference(foundersKey, foundersConfig?.label)
                  }
                >
                  + 添加引用
                </Button>
              )}
            </div>
            <Button
              variant="ghost"
              color="primary"
              className="rounded-md border border-black/10 bg-black/5 px-5 py-2.5"
              startContent={<Plus size={16} />}
              onPress={() => append({ fullName: '', titleRole: '' })}
            >
              添加创始人
            </Button>
          </div>
        </div>
      </FormFieldContainer>
    </div>
  );
};

export default OrganizationStepForm;
