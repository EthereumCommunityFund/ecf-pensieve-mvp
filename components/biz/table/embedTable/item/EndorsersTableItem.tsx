'use client';

import type { FieldArrayWithId } from 'react-hook-form';

import {
  EmbedTableRemoveButtonCell,
  EmbedTableRow,
  EmbedTableTextInputCell,
  EmbedTableURLInputCell,
} from '../commonCells';

interface EndorsersTableItemProps {
  field: FieldArrayWithId<any, any, 'fieldId'>;
  index: number;
  remove: () => void;
  itemKey: 'endorsers';
  canRemove: boolean;
}

const EndorsersTableItem: React.FC<EndorsersTableItemProps> = ({
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
        columnKey="socialIdentifier"
        name={`${fieldPrefix}.socialIdentifier`}
        placeholder="input social identifier"
      />
      <EmbedTableURLInputCell
        itemKey={itemKey}
        columnKey="reference"
        name={`${fieldPrefix}.reference`}
        placeholder="https://example.com"
        showRightBorder={false}
      />
      <EmbedTableRemoveButtonCell
        canRemove={canRemove}
        onRemove={remove}
        ariaLabel={`Remove endorser ${index + 1}`}
      />
    </EmbedTableRow>
  );
};

export default EndorsersTableItem;
