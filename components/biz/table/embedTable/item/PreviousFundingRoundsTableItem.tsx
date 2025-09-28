'use client';

import React, { useMemo } from 'react';
import { Controller, FieldArrayWithId, useFormContext } from 'react-hook-form';

import AmountInput from '@/components/biz/FormAndTable/AmountInput';
import DateInput from '@/components/biz/FormAndTable/DateInput';

import {
  EmbedTableCellWrapper,
  EmbedTableRemoveButtonCell,
  EmbedTableRow,
  EmbedTableURLInputCell,
} from '../commonCells';

interface PreviousFundingRoundsTableItemProps {
  field: FieldArrayWithId<any, any, 'fieldId'>;
  index: number;
  remove: () => void;
  itemKey: 'previous_funding_rounds';
  canRemove: boolean;
}

const PreviousFundingRoundsTableItem: React.FC<
  PreviousFundingRoundsTableItemProps
> = ({ index, remove, itemKey, canRemove }) => {
  const { control } = useFormContext();
  const fieldPrefix = useMemo(() => `${itemKey}.${index}`, [itemKey, index]);

  return (
    <EmbedTableRow>
      <EmbedTableCellWrapper itemKey={itemKey} columnKey="date">
        <Controller
          name={`${fieldPrefix}.date`}
          control={control}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <DateInput value={field.value} onChange={field.onChange} />
              {fieldState.error && (
                <span className="mt-1 text-[12px] text-red-500">
                  {fieldState.error.message || 'date is required'}
                </span>
              )}
            </div>
          )}
        />
      </EmbedTableCellWrapper>

      <EmbedTableCellWrapper itemKey={itemKey} columnKey="amount">
        <Controller
          name={`${fieldPrefix}.amount`}
          control={control}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <AmountInput value={field.value} onChange={field.onChange} />
              {fieldState.error && (
                <span className="mt-1 text-[12px] text-red-500">
                  {fieldState.error.message || 'amount is required'}
                </span>
              )}
            </div>
          )}
        />
      </EmbedTableCellWrapper>

      <EmbedTableURLInputCell
        itemKey={itemKey}
        columnKey="reference"
        name={`${fieldPrefix}.reference`}
        placeholder="https://"
        showRightBorder={false}
      />

      <EmbedTableRemoveButtonCell
        canRemove={canRemove}
        onRemove={remove}
        ariaLabel={`Remove previous funding round ${index + 1}`}
      />
    </EmbedTableRow>
  );
};

export default PreviousFundingRoundsTableItem;
