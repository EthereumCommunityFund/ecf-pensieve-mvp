'use client';

import type { FieldArrayWithId } from 'react-hook-form';

import {
  EmbedTableRemoveButtonCell,
  EmbedTableRow,
  EmbedTableTextInputCell,
} from '../commonCells';

interface ContributorsOrganizationTableItemProps {
  field: FieldArrayWithId<any, any, 'fieldId'>;
  index: number;
  remove: () => void;
  itemKey: 'contributors_organization';
  canRemove: boolean;
}

const ContributorsOrganizationTableItem: React.FC<
  ContributorsOrganizationTableItemProps
> = ({ index, remove, itemKey, canRemove }) => {
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
        columnKey="role"
        name={`${fieldPrefix}.role`}
        placeholder="input role"
      />
      <EmbedTableTextInputCell
        itemKey={itemKey}
        columnKey="address"
        name={`${fieldPrefix}.address`}
        placeholder="input address or social identifier"
        showRightBorder={false}
      />
      <EmbedTableRemoveButtonCell
        canRemove={canRemove}
        onRemove={remove}
        ariaLabel={`Remove contributor ${index + 1}`}
      />
    </EmbedTableRow>
  );
};

export default ContributorsOrganizationTableItem;
