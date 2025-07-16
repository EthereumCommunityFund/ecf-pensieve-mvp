'use client';

import React from 'react';
import {
  Control,
  FieldArrayWithId,
  FieldErrors,
  useFieldArray,
  UseFormRegister,
} from 'react-hook-form';

import {
  GenericFormItemTable,
  IColumnConfig,
} from '@/components/biz/table/GenericFormItemTable';

import { IProjectFormData } from '../types';

interface TableFormControlProps {
  control: Control<IProjectFormData>;
  register: UseFormRegister<IProjectFormData>;
  name: keyof IProjectFormData;
  errors: FieldErrors<IProjectFormData>;
  columns: IColumnConfig<any>[];
  defaultRowValue: any;
  isDisabled?: boolean;
}

const TableFormControl: React.FC<TableFormControlProps> = ({
  control,
  register,
  name,
  errors,
  columns,
  defaultRowValue,
  isDisabled,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: name as any, // useFieldArray has typing issues with complex forms
  });

  // Ensure there's at least one row initially
  React.useEffect(() => {
    if (fields.length === 0) {
      append(defaultRowValue, { shouldFocus: false });
    }
  }, [fields, append, defaultRowValue]);

  return (
    <GenericFormItemTable
      name={name}
      fields={fields as FieldArrayWithId<IProjectFormData>[]}
      columns={columns}
      control={control}
      register={register}
      errors={errors}
      append={append}
      remove={remove}
      defaultRowValue={defaultRowValue}
      isDisabled={isDisabled}
    />
  );
};

export default TableFormControl;
