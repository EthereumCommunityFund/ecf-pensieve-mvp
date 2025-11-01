'use client';

import type { FieldArrayWithId } from 'react-hook-form';

import {
  EmbedTableRemoveButtonCell,
  EmbedTableRow,
  EmbedTableSelectCell,
  EmbedTableTextInputCell,
} from '../commonCells';
import { BOOL_TYPE_OPTIONS } from '../embedTableUtils';

interface AdvisorsTableItemProps {
  field: FieldArrayWithId<any, any, 'fieldId'>;
  index: number;
  remove: () => void;
  itemKey: 'advisors';
  canRemove: boolean;
}

const AdvisorsTableItem: React.FC<AdvisorsTableItemProps> = ({
  index,
  remove,
  itemKey,
  canRemove,
}) => {
  const fieldPrefix = `${itemKey}.${index}`;

  return (
    <EmbedTableRow>
      <EmbedTableTextInputCell
        itemKey={itemKey}
        columnKey="name"
        name={`${fieldPrefix}.name`}
        placeholder="input name"
      />
      <EmbedTableTextInputCell
        itemKey={itemKey}
        columnKey="title"
        name={`${fieldPrefix}.title`}
        placeholder="input title"
      />
      <EmbedTableTextInputCell
        itemKey={itemKey}
        columnKey="address"
        name={`${fieldPrefix}.address`}
        placeholder="input address"
      />
      <EmbedTableSelectCell
        itemKey={itemKey}
        columnKey="active"
        name={`${fieldPrefix}.active`}
        placeholder="select"
        options={BOOL_TYPE_OPTIONS.map(({ value, label }) => ({
          value,
          label,
        }))}
        selectProps={{
          classNames: {
            popoverContent: 'bg-white !min-w-[320px]',
          },
        }}
        showRightBorder={false}
      />
      <EmbedTableRemoveButtonCell
        canRemove={canRemove}
        onRemove={remove}
        ariaLabel={`Remove advisor ${index + 1}`}
      />
    </EmbedTableRow>
  );
};

export default AdvisorsTableItem;
