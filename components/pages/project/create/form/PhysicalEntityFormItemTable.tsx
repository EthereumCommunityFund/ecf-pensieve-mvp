'use client';

import { XCircle } from '@phosphor-icons/react';
import React from 'react';
import {
  FieldError,
  FieldErrorsImpl,
  Merge,
  UseFormRegister,
} from 'react-hook-form';

import { IPhysicalEntity } from '@/types/item';

interface PhysicalEntityFormItemTableProps {
  index: number;
  remove: (index: number) => void;
  register: UseFormRegister<any>;
  errors: Merge<FieldError, FieldErrorsImpl<IPhysicalEntity>> | undefined;
  physicalEntitiesKey: 'physical_entity';
  isPrimary: boolean;
  canRemove: boolean;
  touchedFields: any;
}

const PhysicalEntityFormItemTable: React.FC<
  PhysicalEntityFormItemTableProps
> = ({
  index,
  remove,
  register,
  errors,
  physicalEntitiesKey,
  isPrimary,
  canRemove,
  touchedFields,
}) => {
  const legalNameTouched = touchedFields.physical_entity?.[index]?.legalName;
  const countryTouched = touchedFields.physical_entity?.[index]?.country;
  return (
    <div className="flex items-stretch border-b border-black/5 bg-white">
      <div className="flex-1 border-r border-black/10 p-[10px]">
        <input
          type="text"
          placeholder="Type a legal name"
          {...register(`${physicalEntitiesKey}.${index}.legalName`)}
          className={`h-[20px] w-full border-none bg-transparent px-0 text-[14px] font-[600] leading-[19px] text-black placeholder:text-black/60 focus:shadow-none focus:outline-none focus:ring-0 ${legalNameTouched && errors?.legalName ? 'bg-red-50' : ''}`}
          style={{
            boxShadow: 'none !important',
            outline: 'none !important',
            border: 'none !important',
          }}
        />
        {errors?.legalName && (legalNameTouched || !isPrimary) && (
          <span className="text-[13px] text-red-500">
            {typeof errors.legalName === 'string'
              ? errors.legalName
              : errors.legalName?.message || 'legal name is required'}
          </span>
        )}
      </div>
      <div className="flex-1 p-[10px]">
        <input
          type="text"
          placeholder="Type a country"
          {...register(`${physicalEntitiesKey}.${index}.country`)}
          className={`h-[20px] w-full border-none bg-transparent px-0 text-[13px] font-[400] leading-[18px] text-black placeholder:text-black/60 focus:shadow-none focus:outline-none focus:ring-0`}
          style={{
            boxShadow: 'none !important',
            outline: 'none !important',
            border: 'none !important',
          }}
        />
        {errors?.country && (countryTouched || !isPrimary) && (
          <span className="text-[13px] text-red-500">
            {typeof errors.country === 'string'
              ? errors.country
              : errors.country?.message || 'country is required'}
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

export default PhysicalEntityFormItemTable;
