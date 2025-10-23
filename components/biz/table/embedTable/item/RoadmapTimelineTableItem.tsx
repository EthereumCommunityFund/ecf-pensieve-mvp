'use client';

import React, { useMemo } from 'react';
import { Controller, FieldArrayWithId, useFormContext } from 'react-hook-form';

import DateInput from '@/components/biz/FormAndTable/DateInput';
import URLInput from '@/components/biz/FormAndTable/URLInput';

import {
  EmbedTableCellWrapper,
  EmbedTableRemoveButtonCell,
  EmbedTableRow,
  EmbedTableSelectCell,
  EmbedTableTextInputCell,
} from '../commonCells';

export const ROADMAP_STATUS_OPTIONS = [
  { value: 'Reached', label: 'Reached' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Planned', label: 'Planned' },
];

interface RoadmapTimelineTableItemProps {
  field: FieldArrayWithId<any, any, 'fieldId'>;
  index: number;
  remove: () => void;
  itemKey: 'roadmap_timeline';
  canRemove: boolean;
}

const RoadmapTimelineTableItem: React.FC<RoadmapTimelineTableItemProps> = ({
  index,
  remove,
  itemKey,
  canRemove,
}) => {
  const { control } = useFormContext();
  const fieldPrefix = useMemo(() => `${itemKey}.${index}`, [itemKey, index]);

  return (
    <EmbedTableRow>
      <EmbedTableTextInputCell
        itemKey={itemKey}
        columnKey="milestone"
        name={`${fieldPrefix}.milestone`}
        placeholder="Name the milestone"
      />

      <EmbedTableTextInputCell
        itemKey={itemKey}
        columnKey="description"
        name={`${fieldPrefix}.description`}
        placeholder="Describe the milestone"
      />

      <EmbedTableCellWrapper itemKey={itemKey} columnKey="date">
        <Controller
          name={`${fieldPrefix}.date`}
          control={control}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <DateInput value={field.value} onChange={field.onChange} />
              {fieldState.error && (
                <span className="mt-1 text-[12px] text-red-500">
                  {fieldState.error.message || 'Target date is required'}
                </span>
              )}
            </div>
          )}
        />
      </EmbedTableCellWrapper>

      <EmbedTableSelectCell
        itemKey={itemKey}
        columnKey="status"
        name={`${fieldPrefix}.status`}
        placeholder="Select status"
        options={ROADMAP_STATUS_OPTIONS}
      />

      <EmbedTableCellWrapper itemKey={itemKey} columnKey="reference">
        <Controller
          name={`${fieldPrefix}.reference`}
          control={control}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <URLInput
                value={field.value}
                onChange={field.onChange}
                placeholder="https://example.com"
              />
              {fieldState.error && (
                <span className="mt-1 text-[12px] text-red-500">
                  {fieldState.error.message ||
                    'Please enter a valid reference URL'}
                </span>
              )}
            </div>
          )}
        />
      </EmbedTableCellWrapper>

      <EmbedTableRemoveButtonCell
        canRemove={canRemove}
        onRemove={remove}
        ariaLabel={`Remove milestone ${index + 1}`}
      />
    </EmbedTableRow>
  );
};

export default RoadmapTimelineTableItem;
