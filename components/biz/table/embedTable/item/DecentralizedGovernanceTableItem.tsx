'use client';

import React from 'react';
import { FieldArrayWithId } from 'react-hook-form';

import {
  EmbedTableRemoveButtonCell,
  EmbedTableRow,
  EmbedTableURLInputCell,
} from '../commonCells';

interface DecentralizedGovernanceTableItemProps {
  field: FieldArrayWithId<any, any, 'fieldId'>;
  index: number;
  remove: () => void;
  itemKey: 'decentralized_governance';
  canRemove: boolean;
}

const DecentralizedGovernanceTableItem: React.FC<
  DecentralizedGovernanceTableItemProps
> = ({ index, remove, itemKey, canRemove }) => {
  return (
    <EmbedTableRow>
      <EmbedTableURLInputCell
        itemKey={itemKey}
        columnKey="address"
        name={`${itemKey}.${index}.address`}
        placeholder="0x..."
        showRightBorder={false}
      />
      <EmbedTableRemoveButtonCell
        canRemove={canRemove}
        onRemove={remove}
        ariaLabel={`Remove governance address ${index + 1}`}
      />
    </EmbedTableRow>
  );
};

export default DecentralizedGovernanceTableItem;
