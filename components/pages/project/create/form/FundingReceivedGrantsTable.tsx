'use client';

import { cn } from '@heroui/react';
import { Plus, XCircle } from '@phosphor-icons/react';
import React, { useState } from 'react';
import { FieldError } from 'react-hook-form';

import { IFundingReceivedGrants } from '@/types/item';

import AmountInput from './AmountInput';
import DateInput from './DateInput';
import ProjectSearchSelector from './ProjectSearchSelector';
import TooltipWithQuestionIcon from './TooltipWithQuestionIcon';
import URLInput from './URLInput';

interface FundingReceivedGrantsTableProps {
  value?: IFundingReceivedGrants[];
  onChange: (value: IFundingReceivedGrants[]) => void;
  disabled?: boolean;
  error?: FieldError;
}

const FundingReceivedGrantsTable: React.FC<FundingReceivedGrantsTableProps> = ({
  value = [],
  onChange,
  disabled = false,
  error,
}) => {
  const [rows, setRows] = useState<IFundingReceivedGrants[]>(
    value.length > 0
      ? value
      : [{ date: null, organization: '', amount: '', reference: '' }],
  );

  const updateRows = (newRows: IFundingReceivedGrants[]) => {
    setRows(newRows);
    onChange(newRows);
  };

  const addRow = () => {
    const newRows = [
      ...rows,
      { date: null, organization: '', amount: '', reference: '' },
    ];
    updateRows(newRows);
  };

  const removeRow = (index: number) => {
    if (rows.length > 1) {
      const newRows = rows.filter((_, i) => i !== index);
      updateRows(newRows);
    }
  };

  const updateRow = (
    index: number,
    field: keyof IFundingReceivedGrants,
    value: string | Date,
  ) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    updateRows(newRows);
  };

  return (
    <div className="w-full">
      {/* Table Container */}
      <div className="relative w-full overflow-x-scroll rounded-[10px] border border-black/10 bg-white">
        {/* Table Header */}
        <div className="flex h-[40px] w-full items-center border-b border-black/5 bg-[#F5F5F5]">
          <div className="flex h-full w-[158px] shrink-0 items-center border-r border-black/10 px-[10px]">
            <div className="flex items-center gap-[5px]">
              <span className="text-[14px] font-[600] text-[rgb(51,51,51)] opacity-60">
                Date
              </span>
              <TooltipWithQuestionIcon content="The Date of when this grant was given to this project" />
            </div>
          </div>
          <div className="flex h-full w-[301px] shrink-0 items-center border-r border-black/10 px-[10px]">
            <div className="flex items-center gap-[5px]">
              <span className="text-[14px] font-[600] text-[rgb(51,51,51)] opacity-60">
                Organization/Program
              </span>
              <TooltipWithQuestionIcon content="This refers to the organization or program this project has received their grants from" />
            </div>
          </div>
          <div className="flex h-full w-[138px] shrink-0 items-center border-r border-black/10 px-[10px]">
            <div className="flex items-center gap-[5px]">
              <span className="shrink-0 text-[14px] font-[600] text-[rgb(51,51,51)] opacity-60">
                Amount (USD)
              </span>
              <TooltipWithQuestionIcon content="This is the amount received at the time of this grant was given" />
            </div>
          </div>
          <div
            className={cn(
              'flex-1 flex h-full min-w-[143px] shrink-0 items-center  px-[10px] bg-[#F5F5F5]',
              rows.length > 1 ? 'border-r border-black/10' : '',
            )}
          >
            <div className="flex items-center gap-[5px]">
              <span className="text-[14px] font-[600] text-[rgb(51,51,51)] opacity-60">
                Reference
              </span>
              <TooltipWithQuestionIcon content="This is the reference link that acts as  evidence for this entry" />
            </div>
          </div>
          {rows.length > 1 && (
            <div className="flex h-full w-[60px] items-center justify-center">
              {/* Actions column header */}
            </div>
          )}
        </div>

        {/* Table Rows */}
        {rows.map((row, index) => (
          <div
            key={index}
            className="flex h-[40px] w-full items-center border-b border-black/10 bg-white last:border-b-0"
          >
            {/* Date Column */}
            <div className="flex h-full w-[158px] shrink-0 items-center border-r border-black/10 px-[10px]">
              <DateInput
                value={row.date}
                onChange={(value) =>
                  updateRow(index, 'date', value || new Date())
                }
                disabled={disabled}
              />
            </div>

            {/* Organization Column */}
            <div className="flex h-full w-[301px] shrink-0 items-center border-r border-black/10 px-[10px]">
              <ProjectSearchSelector
                value={row.organization}
                onChange={(value) => updateRow(index, 'organization', value)}
                disabled={disabled}
                placeholder="Search or select organization"
              />
            </div>

            {/* Amount Column */}
            <div className="flex h-full w-[138px] shrink-0 items-center border-r border-black/10 px-[10px]">
              <AmountInput
                value={row.amount}
                onChange={(value) => updateRow(index, 'amount', value)}
                disabled={disabled}
                placeholder="$000.00"
              />
            </div>

            {/* Reference Column */}
            <div
              className={cn(
                'flex-1 flex h-full min-w-[143px] shrink-0 items-center px-[10px]',
                rows.length > 1 ? 'border-r border-black/10' : '',
              )}
            >
              <URLInput
                value={row.reference}
                onChange={(value) => updateRow(index, 'reference', value)}
                disabled={disabled}
                placeholder="https://"
                required={false}
              />
            </div>

            {/* Actions Column */}
            {rows.length > 1 && (
              <div className="flex h-full w-[60px] items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  disabled={disabled}
                  className="flex size-[32px] items-center justify-center p-[4px] opacity-30"
                >
                  <XCircle size={24} className="text-black" />
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Add Row Section */}
        <div className="flex h-[40px] w-full items-center bg-[#F5F5F5] p-[10px]">
          <button
            type="button"
            onClick={addRow}
            disabled={disabled}
            className="mobile:w-full flex h-auto min-h-0 cursor-pointer items-center gap-[5px] rounded-[4px] border-none px-[8px] py-[4px] text-black opacity-60 transition-opacity duration-200 hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Plus size={16} className="text-black" />
            <span className="text-[14px] font-[400] text-black">
              Add an Entry
            </span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-2 text-[13px] text-red-500">
          {error.message || 'This field is required'}
        </div>
      )}
    </div>
  );
};

export default FundingReceivedGrantsTable;
