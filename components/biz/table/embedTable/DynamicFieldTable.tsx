import { cn, ScrollShadow } from '@heroui/react';
import React from 'react';

import TooltipWithQuestionIcon from '@/components/biz/FormAndTable/TooltipWithQuestionIcon';
import { PlusIcon } from '@/components/icons';

import { DynamicFieldConfig } from './dynamicFieldsConfig';
import AffiliatedProjectsTableItem from './item/AffiliatedProjectsTableItem';
import ContributingTeamsTableItem from './item/ContributingTeamsTableItem';
import FundingReceivedGrantsTableItem from './item/FundingReceivedGrantsTableItem';
import StackIntegrationsTableItem from './item/StackIntegrationsTableItem';

interface DynamicFieldTableProps {
  config: DynamicFieldConfig;
  fields: any[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  itemKey: string;
  errorMessage?: React.ReactNode;
}

// Map component names to actual FormAndTable
const TABLE_ITEM_COMPONENTS: Record<string, React.ComponentType<any>> = {
  FundingReceivedGrantsTableItem: FundingReceivedGrantsTableItem,
  AffiliatedProjectsTableItem: AffiliatedProjectsTableItem,
  ContributingTeamsTableItem: ContributingTeamsTableItem,
  StackIntegrationsTableItem: StackIntegrationsTableItem,
};

/**
 * Generic dynamic field table component that renders based on configuration
 * Eliminates duplicate code for table-based form fields
 */
const DynamicFieldTable: React.FC<DynamicFieldTableProps> = ({
  config,
  fields,
  onAdd,
  onRemove,
  itemKey,
  errorMessage,
}) => {
  const TableItemComponent = TABLE_ITEM_COMPONENTS[config.tableComponent];

  if (!TableItemComponent) {
    console.error(`Table component ${config.tableComponent} not found`);
    return null;
  }

  return (
    <ScrollShadow
      className="tablet:max-w-[9999px] mobile:max-w-[9999px] w-full max-w-[760px] overflow-x-scroll"
      orientation="horizontal"
    >
      <div className="w-fit overflow-hidden rounded-[10px] border border-black/10 bg-white">
        {/* Table header */}
        <div className="flex h-[40px] items-center border-b border-black/5 bg-[#F5F5F5]">
          {config.columns.map((column, colIndex) => {
            const isLast = colIndex === config.columns.length - 1;
            const hasActions = fields.length > 1;

            return (
              <div
                key={column.key}
                className={cn(
                  'flex h-full shrink-0 items-center px-[10px]',
                  `w-[${column.width}]`,
                  !isLast || hasActions ? 'border-r border-black/10' : '',
                  isLast && !hasActions ? 'bg-[#F5F5F5]' : '',
                )}
                style={{ width: column.width }}
              >
                <div className="flex items-center gap-[5px]">
                  <span className="text-[14px] font-[600] text-[rgb(51,51,51)] opacity-60">
                    {column.label}
                  </span>
                  {column.tooltip && (
                    <TooltipWithQuestionIcon content={column.tooltip} />
                  )}
                </div>
              </div>
            );
          })}
          {fields.length > 1 && (
            <div className="flex h-full w-[60px] items-center justify-center">
              {/* Actions column header */}
            </div>
          )}
        </div>

        {/* Table rows */}
        {fields.map((field, index) => (
          <TableItemComponent
            key={field.fieldId}
            field={field}
            index={index}
            remove={() => onRemove(index)}
            itemKey={itemKey}
            canRemove={fields.length > 1}
          />
        ))}

        {/* Add button */}
        <div className="bg-[#F5F5F5] p-[10px]">
          <button
            type="button"
            className="mobile:w-full flex h-auto min-h-0 cursor-pointer items-center gap-[5px] rounded-[4px] border-none px-[8px] py-[4px] text-black opacity-60 transition-opacity duration-200 hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAdd();
            }}
            style={{
              outline: 'none',
              boxShadow: 'none',
              fontFamily: 'Open Sans, sans-serif',
            }}
          >
            <PlusIcon size={16} />
            <span className="text-[14px] font-[400] leading-[19px]">
              {config.addButtonText || 'Add an Entry'}
            </span>
          </button>
        </div>
      </div>
      {errorMessage}
    </ScrollShadow>
  );
};

export default DynamicFieldTable;
