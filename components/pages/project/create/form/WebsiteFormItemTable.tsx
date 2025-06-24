'use client';

import { XCircle } from '@phosphor-icons/react';
import React from 'react';
import {
  FieldError,
  FieldErrorsImpl,
  Merge,
  UseFormRegister,
} from 'react-hook-form';

import { IProjectFormData } from '../types';

interface WebsiteFormItemTableProps {
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

const WebsiteFormItemTable: React.FC<WebsiteFormItemTableProps> = ({
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
    <div className="flex items-stretch border-b border-black/5 bg-white">
      <div className="flex-1 border-r border-black/10 p-[10px]">
        <input
          type="text"
          placeholder="Type a title"
          {...register(`${websitesKey}.${index}.title`)}
          className={`h-[20px] w-full border-none bg-transparent px-0 text-[14px] font-[600] leading-[19px] text-black placeholder:text-black/60 focus:shadow-none focus:outline-none focus:ring-0 ${titleTouched && errors?.title ? 'bg-red-50' : ''}`}
          style={{
            boxShadow: 'none !important',
            outline: 'none !important',
            border: 'none !important',
          }}
        />
        {titleTouched && errors?.title && (
          <span className="text-[13px] text-red-500">
            {errors?.title?.message}
          </span>
        )}
      </div>
      <div className="flex-1 p-[10px]">
        <input
          type="text"
          placeholder="Type a URL"
          {...register(`${websitesKey}.${index}.url`)}
          className={`h-[20px] w-full border-none bg-transparent px-0 text-[13px] font-[400] leading-[18px] text-black placeholder:text-black/60 focus:shadow-none focus:outline-none focus:ring-0`}
          style={{
            boxShadow: 'none !important',
            outline: 'none !important',
            border: 'none !important',
          }}
        />
        {urlTouched && errors?.url && (
          <span className="text-[13px] text-red-500">
            {errors?.url?.message}
          </span>
        )}
      </div>
      <div className="flex w-[60px] items-center justify-center">
        {canRemove && (
          <button
            type="button"
            className="flex size-[40px] cursor-pointer items-center justify-center  rounded-full border-none bg-transparent p-[8px] opacity-30"
            onClick={() => remove(index)}
            aria-label={`Remove website ${index + 1}`}
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

export default WebsiteFormItemTable;
