'use client';

import { XCircle } from '@phosphor-icons/react';
import {
  Control,
  FieldArrayWithId,
  FieldErrors,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFormRegister,
} from 'react-hook-form';

import { PlusIcon } from '@/components/icons';

// Configuration for a single column in the generic table
export interface IColumnConfig<T> {
  header: string;
  accessor: keyof T;
  placeholder: string;
  width?: string; // e.g., 'flex-1', 'w-[200px]'
}

interface GenericFormItemTableProps<T extends Record<string, any>> {
  name: string;
  fields: FieldArrayWithId<T>[];
  columns: IColumnConfig<T[keyof T]>[];
  errors: FieldErrors<T>;
  control: Control<T>;
  register: UseFormRegister<T>;
  append: UseFieldArrayAppend<T, any>;
  remove: UseFieldArrayRemove;
  defaultRowValue: T[keyof T];
  isDisabled?: boolean;
}

export function GenericFormItemTable<T extends Record<string, any>>({
  name,
  fields,
  columns,
  errors,
  register,
  append,
  remove,
  defaultRowValue,
  isDisabled,
}: GenericFormItemTableProps<T>) {
  const formErrors = errors[name as keyof T] as
    | FieldErrors<T[keyof T][]>
    | undefined;

  return (
    <div>
      <div className="overflow-hidden rounded-[10px] border border-black/10 bg-white">
        {/* Table header */}
        <div className="flex items-center border-b border-black/5 bg-[#F5F5F5]">
          {columns.map((col, index) => (
            <div
              key={String(col.accessor)}
              className={`flex items-center gap-[5px] p-[10px] ${col.width || 'flex-1'} ${index < columns.length - 1 ? 'border-r border-black/10' : ''}`}
            >
              <span className="text-[14px] font-[600] leading-[19px] text-black/60">
                {col.header}
              </span>
            </div>
          ))}
          <div className="w-[60px] p-[10px]"></div>
        </div>

        {/* Table body */}
        {fields.map((field, index) => {
          const fieldErrors =
            formErrors && Array.isArray(formErrors)
              ? (formErrors as any)[index]
              : undefined;

          return (
            <div
              key={field.id}
              className="flex items-stretch border-b border-black/5 bg-white"
            >
              {columns.map((col, colIndex) => (
                <div
                  key={String(col.accessor)}
                  className={`p-[10px] ${col.width || 'flex-1'} ${colIndex < columns.length - 1 ? 'border-r border-black/10' : ''}`}
                >
                  <input
                    type="text"
                    placeholder={col.placeholder}
                    {...register(
                      `${name}.${index}.${String(col.accessor)}` as any,
                    )}
                    className="h-[20px] w-full border-none bg-transparent px-0 text-[14px] font-[600] leading-[19px] text-black placeholder:text-black/60 focus:shadow-none focus:outline-none focus:ring-0"
                    style={{
                      boxShadow: 'none !important',
                      outline: 'none !important',
                      border: 'none !important',
                    }}
                  />
                  {fieldErrors && (fieldErrors as any)[col.accessor] && (
                    <span className="text-[13px] text-red-500">
                      {(fieldErrors as any)[col.accessor]?.message}
                    </span>
                  )}
                </div>
              ))}
              <div className="flex w-[60px] items-center justify-center">
                {fields.length > 1 && (
                  <button
                    type="button"
                    className="flex size-[40px] cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-[8px] opacity-30 transition-opacity hover:opacity-100"
                    onClick={() => remove(index)}
                    aria-label={`Remove item ${index + 1}`}
                    style={{ outline: 'none', boxShadow: 'none' }}
                  >
                    <XCircle size={24} />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Add button */}
        <div className="bg-[#F5F5F5] p-[10px]">
          <button
            type="button"
            className="mobile:w-full flex h-auto min-h-0 cursor-pointer items-center gap-[5px] rounded-[4px] border-none px-[8px] py-[4px] text-black opacity-60 transition-opacity duration-200 hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30"
            onClick={() => append(defaultRowValue)}
            disabled={isDisabled}
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
    </div>
  );
}
