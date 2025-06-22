'use client';

import { XCircle } from '@phosphor-icons/react';
import React from 'react';
import {
  FieldError,
  FieldErrorsImpl,
  Merge,
  useFormContext,
} from 'react-hook-form';

interface FounderFormItemTableProps {
  index: number;
  remove: (index: number) => void;
  errors: Merge<FieldError, FieldErrorsImpl<any>> | undefined;
  foundersKey: string;
  canRemove: boolean;
  onRemove?: () => void;
}

const FounderFormItemTable: React.FC<FounderFormItemTableProps> = ({
  index,
  remove,
  errors,
  foundersKey,
  canRemove,
  onRemove,
}) => {
  const { register, formState } = useFormContext();

  // Use register for controlled inputs to avoid focus issues
  const nameRegister = register(`${foundersKey}.${index}.name`);
  const titleRegister = register(`${foundersKey}.${index}.title`);

  // Get field errors from form state
  const foundersErrors = formState.errors?.[foundersKey];
  const founderError = Array.isArray(foundersErrors)
    ? foundersErrors[index]
    : undefined;
  const nameError = founderError?.name;
  const titleError = founderError?.title;

  return (
    <div className="flex items-stretch border-b border-black/5 bg-white">
      <div className="flex-1 border-r border-black/10 p-[10px]">
        <input
          type="text"
          placeholder="Type a name"
          {...nameRegister}
          className={`h-[20px] w-full border-none bg-transparent px-0 text-[14px] font-[600] leading-[19px] text-black placeholder:text-black/60 focus:shadow-none focus:outline-none focus:ring-0 ${errors?.name || nameError ? 'bg-red-50' : ''}`}
          style={{
            boxShadow: 'none !important',
            outline: 'none !important',
            border: 'none !important',
          }}
        />
        {(errors?.name || nameError) && (
          <span className="text-[13px] text-red-500">
            {typeof (errors?.name || nameError) === 'string'
              ? errors?.name || nameError
              : ((errors?.name || nameError) as any)?.message ||
                'Invalid input'}
          </span>
        )}
      </div>
      <div className="flex-1 p-[10px]">
        <input
          type="text"
          placeholder="Type their role or title"
          {...titleRegister}
          className={`h-[20px] w-full border-none bg-transparent px-0 text-[13px] font-[400] leading-[18px] text-black placeholder:text-black/60 focus:shadow-none focus:outline-none focus:ring-0 ${errors?.title || titleError ? 'bg-red-50' : ''}`}
          style={{
            boxShadow: 'none !important',
            outline: 'none !important',
            border: 'none !important',
          }}
        />
        {(errors?.title || titleError) && (
          <span className="text-[13px] text-red-500">
            {typeof (errors?.title || titleError) === 'string'
              ? errors?.title || titleError
              : ((errors?.title || titleError) as any)?.message ||
                'Invalid input'}
          </span>
        )}
      </div>
      <div className="flex w-[60px] items-center justify-center">
        {canRemove && (
          <button
            type="button"
            className="flex size-[40px] cursor-pointer items-center justify-center  rounded-full border-none bg-transparent p-[8px] opacity-30"
            onClick={() => {
              if (onRemove) {
                onRemove();
              } else {
                remove(index);
              }
            }}
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

export default FounderFormItemTable;
