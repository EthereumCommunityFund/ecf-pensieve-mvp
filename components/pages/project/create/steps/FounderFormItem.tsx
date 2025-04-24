'use client';

import { Button } from '@heroui/react';
import React from 'react';
import {
  FieldError,
  FieldErrorsImpl,
  Merge,
  UseFormRegister,
} from 'react-hook-form';

import { Input } from '@/components/base';
import XCircleIcon from '@/components/icons/XCircle';

import { ProjectFormData } from '../types';

interface FounderFormItemProps {
  index: number;
  remove: (index: number) => void;
  register: UseFormRegister<ProjectFormData>;
  errors:
    | Merge<FieldError, FieldErrorsImpl<ProjectFormData['founders'][number]>>
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
    <div className="flex items-start gap-[10px] mobile:flex-col">
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
        <Button
          isIconOnly
          size="sm"
          className="mt-[24px] h-[40px] bg-transparent"
          onPress={() => remove(index)}
          aria-label={`Remove founder ${index + 1}`}
        >
          <XCircleIcon size={24} />
        </Button>
      )}
    </div>
  );
};

export default FounderFormItem;
