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

export interface ITypeOption {
  value: string;
  label: string;
}

export const AFFILIATION_TYPE_OPTIONS: ITypeOption[] = [
  { value: 'subsidiary', label: 'Subsidiary' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'shared_team', label: 'Shared team' },
  { value: 'investor', label: 'Investor' },
  { value: 'governance_link', label: 'Governance Link' },
  { value: 'rebrand', label: 'Rebrand' },
  { value: 'other', label: 'Other (specify)' },
];

interface AffiliatedProjectsTableItemProps {
  field: FieldArrayWithId<any, any, 'fieldId'>;
  index: number;
  remove: () => void;
  itemKey: 'affiliated_projects';
  canRemove: boolean;
}

const AffiliatedProjectsTableItem: React.FC<
  AffiliatedProjectsTableItemProps
> = ({ index, remove, itemKey, canRemove }) => {
  const { control } = useFormContext();
  const fieldPaths = useMemo(
    () => ({
      project: `${itemKey}.${index}.project`,
      affiliationType: `${itemKey}.${index}.affiliationType`,
      description: `${itemKey}.${index}.description`,
      reference: `${itemKey}.${index}.reference`,
    }),
    [itemKey, index],
  );

  return (
    <EmbedTableRow>
      <EmbedTableCellWrapper itemKey={itemKey} columnKey="project">
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
                itemKey={'affiliated_projects'}
              />
              {fieldState.error && (
                <span className="mt-1 text-[12px] text-red-500">
                  {fieldState.error.message || 'Project is required'}
                </span>
              )}
            </>
          )}
        />
      </EmbedTableCellWrapper>

      <EmbedTableSelectCell
        itemKey={itemKey}
        columnKey="affiliationType"
        name={fieldPaths.affiliationType}
        placeholder="Select type"
        options={AFFILIATION_TYPE_OPTIONS}
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
        placeholder="Describe the relationship"
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
        ariaLabel={`Remove affiliated project ${index + 1}`}
      />
    </EmbedTableRow>
  );
};

export default AffiliatedProjectsTableItem;
