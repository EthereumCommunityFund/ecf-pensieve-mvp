'use client';

import { XCircle } from '@phosphor-icons/react';
import React from 'react';
import {
  FieldError,
  FieldErrorsImpl,
  Merge,
  UseFormRegister,
} from 'react-hook-form';

import { Button, Input } from '@/components/base';

import { IProjectFormData } from '../types';

interface FounderFormItemProps {
  index: number;
  remove: (index: number) => void;
  register: UseFormRegister<IProjectFormData>;
  errors:
    | Merge<FieldError, FieldErrorsImpl<IProjectFormData['founders'][number]>>
    | undefined;
  foundersKey: 'founders';
  isPrimary: boolean;
  canRemove: boolean;
}

const FounderFormItem: React.FC<FounderFormItemProps> = ({
  index,
  remove,
  register,
  errors,
  foundersKey,
  isPrimary,
  canRemove,
}) => {
  return (
    <div className="mobile:flex-col flex items-start gap-[10px]">
      <Input
        className="flex-1"
        label="Full Name"
        labelPlacement="outside"
        placeholder="Type a name"
        {...register(`${foundersKey}.${index}.fullName`)}
        isInvalid={!!errors?.fullName}
        errorMessage={errors?.fullName?.message}
        classNames={{
          label: 'text-[14px] font-[600] text-black leading-[20px]',
        }}
      />
      <Input
        className="flex-1"
        label="Title / Role"
        labelPlacement="outside"
        placeholder="Type their role or title"
        {...register(`${foundersKey}.${index}.titleRole`)}
        isInvalid={!!errors?.titleRole}
        errorMessage={errors?.titleRole?.message}
        classNames={{
          label: 'text-[14px] font-[600] text-black leading-[20px]',
        }}
      />
      {canRemove && (
        <div className="mobile:mt-0 mobile:w-full mt-[28px] flex justify-end">
          <Button
            isIconOnly
            size="sm"
            className="mobile:hidden size-[32px] border-none bg-transparent p-[4px] text-[13px] font-[400] leading-[16px] text-black"
            onPress={() => remove(index)}
            aria-label={`Remove founder ${index + 1}`}
          >
            <XCircle size={24} />
          </Button>

          <Button
            size="sm"
            className="mobile:flex hidden gap-[5px] border-none bg-transparent p-[5px] text-[13px] font-[400] leading-[16px] text-black"
            onPress={() => remove(index)}
            aria-label={`Remove founder ${index + 1}`}
          >
            <XCircle size={20} />
            <span>Remove</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default FounderFormItem;
