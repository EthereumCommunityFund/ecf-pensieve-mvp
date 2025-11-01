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
 * Stack integration type options for select dropdown
 */
export const STACK_INTEGRATION_TYPE_OPTIONS: ITypeOption[] = [
  { value: 'dependency', label: 'Dependency' },
  { value: 'integration_interfacing', label: 'Integration / Interfacing' },
  { value: 'plugin_extension', label: 'Plugin / Extension' },
  { value: 'embedding', label: 'Embedding' },
  { value: 'forking_inheritance', label: 'Forking / Inheritance' },
  { value: 'wrapping_abstraction', label: 'Wrapping / Abstraction' },
  { value: 'service_consumption', label: 'Service Consumption' },
  { value: 'modular_composition', label: 'Modular Composition' },
  { value: 'peer_to_peer', label: 'Peer-to-Peer Relationship' },
  { value: 'middleware_broker', label: 'Middleware / Broker' },
] as const;

interface StackIntegrationsTableItemProps {
  field: FieldArrayWithId<any, any, 'fieldId'>;
  index: number;
  remove: () => void;
  itemKey: 'stack_integrations';
  canRemove: boolean;
}

const StackIntegrationsTableItem: React.FC<StackIntegrationsTableItemProps> = ({
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
      repository: `${itemKey}.${index}.repository`,
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
                  placeholder="ethereum"
                  multiple={false}
                  allowNA={false}
                  columnName="Project"
                  itemKey={'stack_integrations'}
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
        placeholder="dependency"
        options={STACK_INTEGRATION_TYPE_OPTIONS}
        selectProps={{
          classNames: {
            popoverContent: 'bg-white !min-w-[320px]',
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
      />
      <EmbedTableURLInputCell
        itemKey={itemKey}
        columnKey="repository"
        name={fieldPaths.repository}
        placeholder="https://"
        showRightBorder={false}
      />
      <EmbedTableRemoveButtonCell
        canRemove={canRemove}
        onRemove={remove}
        ariaLabel={`Remove stack integration ${index + 1}`}
      />
    </EmbedTableRow>
  );
};

export default StackIntegrationsTableItem;
