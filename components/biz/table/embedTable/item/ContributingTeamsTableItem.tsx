'use client';

import React, { useMemo } from 'react';
import { Controller, FieldArrayWithId, useFormContext } from 'react-hook-form';

import ProjectSearchSelector from '@/components/biz/FormAndTable/ProjectSearch/ProjectSearchSelector';

import {
  EmbedTableCellWrapper,
  EmbedTableRemoveButtonCell,
  EmbedTableRow,
  EmbedTableSelectCell,
  EmbedTableTextInputCell,
  EmbedTableURLInputCell,
} from '../commonCells';

import { ITypeOption } from './AffiliatedProjectsTableItem';

/**
 * Contribution type options for select dropdown
 */
export const CONTRIBUTION_TYPE_OPTIONS: ITypeOption[] = [
  { value: 'core_development', label: 'Core development' },
  { value: 'technical_integration', label: 'Technical Integration' },
  { value: 'research', label: 'Research' },
  { value: 'community_growth', label: 'Community&Growth' },
  { value: 'operations_governance', label: 'Operations&Governance' },
  { value: 'design', label: 'Design' },
  { value: 'education', label: 'Education' },
  { value: 'security', label: 'Security' },
  { value: 'fundraising', label: 'Fundraising' },
  { value: 'other', label: 'Other (Specify)' },
];

interface ContributingTeamsTableItemProps {
  field: FieldArrayWithId<any, any, 'fieldId'>;
  index: number;
  remove: () => void;
  itemKey: 'contributing_teams';
  canRemove: boolean;
}

const ContributingTeamsTableItem: React.FC<ContributingTeamsTableItemProps> = ({
  index,
  remove,
  itemKey,
  canRemove,
}) => {
  const { control } = useFormContext();
  const fieldPaths = useMemo(
    () => ({
      project: `${itemKey}.${index}.project`,
      type: `${itemKey}.${index}.type`,
      description: `${itemKey}.${index}.description`,
      reference: `${itemKey}.${index}.reference`,
    }),
    [itemKey, index],
  );

  return (
    <EmbedTableRow>
      <EmbedTableCellWrapper itemKey={itemKey} columnKey="project">
        <div className="flex w-full flex-col justify-center">
          <Controller
            name={fieldPaths.project}
            control={control}
            render={({ field, fieldState }) => (
              <>
                <ProjectSearchSelector
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Search Project (on pensieve)"
                  multiple={false}
                  allowNA={false}
                  columnName="Project"
                  itemKey={'contributing_teams'}
                />
                {fieldState.error && (
                  <span className="mt-1 text-[12px] text-red-500">
                    {fieldState.error.message || 'Project is required'}
                  </span>
                )}
              </>
            )}
          />
        </div>
      </EmbedTableCellWrapper>
      <EmbedTableSelectCell
        itemKey={itemKey}
        columnKey="type"
        name={fieldPaths.type}
        placeholder="Options"
        options={CONTRIBUTION_TYPE_OPTIONS}
        selectProps={{
          classNames: {
            popoverContent: 'bg-white !min-w-[250px]',
          },
        }}
      />
      <EmbedTableTextInputCell
        itemKey={itemKey}
        columnKey="description"
        name={fieldPaths.description}
        placeholder="Give a description"
      />
      <EmbedTableURLInputCell
        itemKey={itemKey}
        columnKey="reference"
        name={fieldPaths.reference}
        placeholder="https://"
        showRightBorder={false}
      />
      <EmbedTableRemoveButtonCell
        canRemove={canRemove}
        onRemove={remove}
        ariaLabel={`Remove contributing team ${index + 1}`}
      />
    </EmbedTableRow>
  );
};

export default ContributingTeamsTableItem;
