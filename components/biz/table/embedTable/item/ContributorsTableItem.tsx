'use client';

import type { FieldArrayWithId } from 'react-hook-form';

import {
  EmbedTableRemoveButtonCell,
  EmbedTableRow,
  EmbedTableSelectCell,
  EmbedTableTextInputCell,
} from '../commonCells';

import type { ITypeOption } from './AffiliatedProjectsTableItem';

export const CONTRIBUTOR_ROLE_OPTIONS: ITypeOption[] = [
  { value: 'employee', label: 'Employee' },
  { value: 'researcher', label: 'Researcher' },
  { value: 'assistant', label: 'Assistant' },
  { value: 'project_participant', label: 'Project Participant' },
  { value: 'author', label: 'Author' },
  { value: 'community_member', label: 'Community Member' },
  { value: 'other', label: 'Other (specify)' },
];

interface ContributorsTableItemProps {
  field: FieldArrayWithId<any, any, 'fieldId'>;
  index: number;
  remove: () => void;
  itemKey: 'contributors';
  canRemove: boolean;
}

const ContributorsTableItem: React.FC<ContributorsTableItemProps> = ({
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
      <EmbedTableSelectCell
        itemKey={itemKey}
        columnKey="role"
        name={`${fieldPrefix}.role`}
        placeholder="select role"
        options={CONTRIBUTOR_ROLE_OPTIONS}
        selectProps={{
          classNames: {
            popoverContent: 'bg-white !min-w-[260px]',
          },
        }}
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

export default ContributorsTableItem;
