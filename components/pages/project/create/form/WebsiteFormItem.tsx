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

import InputPrefix from './InputPrefix';

interface WebsiteFormItemProps {
  index: number;
  remove: (index: number) => void;
  register: UseFormRegister<IProjectFormData>;
  errors:
    | Merge<FieldError, FieldErrorsImpl<IProjectFormData['websites'][number]>>
    | undefined;
  websitesKey: 'websites';
  isPrimary: boolean;
  canRemove: boolean;
  touchedFields: any;
}

const WebsiteFormItem: React.FC<WebsiteFormItemProps> = ({
  index,
  remove,
  register,
  errors,
  websitesKey,
  isPrimary,
  canRemove,
  touchedFields,
}) => {
  const titleTouched = touchedFields.websites?.[index]?.title;
  const urlTouched = touchedFields.websites?.[index]?.url;
  return (
    <div className="mobile:flex-col flex items-start gap-[10px]">
      <Input
        className="flex-1"
        label="Website Title"
        labelPlacement="outside"
        placeholder="Type a title"
        {...register(`${websitesKey}.${index}.title`)}
        isInvalid={titleTouched && !!errors?.title}
        errorMessage={titleTouched ? errors?.title?.message : undefined}
        classNames={{
          label: 'text-[14px] font-[400] text-black leading-[20px]',
        }}
      />
      <Input
        className="flex-1"
        label="URL"
        labelPlacement="outside"
        placeholder="Type a URL"
        startContent={<InputPrefix prefix={'https://'} />}
        {...register(`${websitesKey}.${index}.url`)}
        isInvalid={urlTouched && !!errors?.url}
        errorMessage={urlTouched ? errors?.url?.message : undefined}
        classNames={{
          inputWrapper: 'pl-0 pr-[10px]',
          label: 'text-[14px] font-[400] text-black leading-[20px]',
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

export default WebsiteFormItem;
