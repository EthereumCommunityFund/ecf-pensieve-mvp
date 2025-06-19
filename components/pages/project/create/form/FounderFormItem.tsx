'use client';

import { XCircle } from '@phosphor-icons/react';
import React from 'react';
import {
  FieldError,
  FieldErrorsImpl,
  Merge,
  UseFormRegister,
} from 'react-hook-form';

// import { Button } from '@/components/base'; // 不再使用 Hero UI Button
import { QuestionIcon } from '@/components/icons';

import { IProjectFormData } from '../types';

interface FounderFormItemProps {
  index: number;
  remove: (index: number) => void;
  register: UseFormRegister<IProjectFormData>;
  errors:
    | Merge<FieldError, FieldErrorsImpl<IProjectFormData['founders'][number]>>
    | undefined;
  foundersKey: 'founders';
  canRemove: boolean;
  showHeader?: boolean;
}

const FounderFormItem: React.FC<FounderFormItemProps> = ({
  index,
  remove,
  register,
  errors,
  foundersKey,
  canRemove,
  showHeader = false,
}) => {
  if (showHeader) {
    return (
      <div className="flex items-center border-b border-black/5 bg-[#F5F5F5]">
        <div className="flex flex-1 items-center gap-[5px] border-r border-black/10 p-[10px]">
          <span className="text-[14px] font-[600] leading-[19px] text-black/60">
            Full Name
          </span>
          <QuestionIcon size={18} />
        </div>
        <div className="flex flex-1 items-center gap-[5px] p-[10px]">
          <span className="text-[14px] font-[600] leading-[19px] text-black/60">
            Title Role
          </span>
          <QuestionIcon size={18} />
        </div>
        <div className="w-[60px] p-[10px]"></div>
      </div>
    );
  }

  return (
    <div className="flex items-stretch border-b border-black/5 bg-white">
      <div className="flex-1 border-r border-black/10 p-[10px]">
        <input
          type="text"
          placeholder="Type a name"
          {...register(`${foundersKey}.${index}.name`)}
          className="h-[20px] w-full border-none bg-transparent px-0 text-[14px] font-[600] leading-[19px] text-black placeholder:text-black/60 focus:shadow-none focus:outline-none focus:ring-0"
          style={{
            boxShadow: 'none !important',
            outline: 'none !important',
            border: 'none !important',
          }}
        />
        {errors?.name && (
          <span className="text-[13px] text-red-500">
            {errors.name.message}
          </span>
        )}
      </div>
      <div className="flex-1 p-[10px]">
        <input
          type="text"
          placeholder="Type their role or title"
          {...register(`${foundersKey}.${index}.title`)}
          className="h-[20px] w-full border-none bg-transparent px-0 text-[13px] font-[400] leading-[18px] text-black placeholder:text-black/60 focus:shadow-none focus:outline-none focus:ring-0"
          style={{
            boxShadow: 'none !important',
            outline: 'none !important',
            border: 'none !important',
          }}
        />
        {errors?.title && (
          <span className="text-[13px] text-red-500">
            {errors.title.message}
          </span>
        )}
      </div>
      <div className="flex w-[60px] items-center justify-center">
        {canRemove && (
          <button
            type="button"
            className="flex size-[40px] cursor-pointer items-center justify-center  rounded-full border-none bg-transparent p-[8px] opacity-30"
            onClick={() => remove(index)}
            aria-label={`Remove founder ${index + 1}`}
            style={{
              outline: 'none',
              boxShadow: 'none',
            }}
          >
            <XCircle size={24} />
          </button>
        )}
      </div>
    </div>
  );
};

export default FounderFormItem;
