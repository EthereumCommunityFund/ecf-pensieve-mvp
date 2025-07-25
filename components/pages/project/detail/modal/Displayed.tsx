'use client';

import { cn } from '@heroui/react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import React, { FC, useCallback, useMemo, useState } from 'react';

import {
  ExpandableRow,
  ModalTableContainer,
  TableFooter,
  TableHeader,
  TableRow,
} from '@/components/biz/table';
import OptimizedTableCell from '@/components/biz/table/OptimizedTableCell';
import { ClockClockwiseIcon } from '@/components/icons';
import { useProjectDetailContext } from '@/components/pages/project/context/projectDetailContext';
import { AllItemConfig } from '@/constants/itemConfig';
import { useAuth } from '@/context/AuthContext';
import { IEssentialItemKey, IPocItemKey } from '@/types/item';

import {
  IAccountabilityMetric,
  ILegitimacyMetric,
  IProjectTableRowData,
  ITableMetaOfSubmissionQueue,
  IWeb3Metric,
} from '../types';

import { useCommonColumnsOfModal } from './CommonColumns';
import ItemWeight from './ItemWeight';
import { ModalTableSkeleton } from './ModalTableSkeleton';

interface DisplayedProps {
  itemName?: string;
  itemWeight?: number;
  itemKey?: string;
  onViewSubmissions: () => void;
}
const accountabilityMetrics: IAccountabilityMetric[] = [
  { name: 'Transparency', isExpanded: false },
  { name: 'Participation', isExpanded: false },
  { name: 'Performance Eval', isExpanded: false },
];

const legitimacyMetrics: ILegitimacyMetric[] = [
  { name: 'Legitimacy by Transparency', isExpanded: false },
];

const web3Metrics: IWeb3Metric[] = [
  { label: 'Privacy:', value: '---' },
  { label: 'Decentralization:', value: '---' },
  { label: 'Security:', value: '---' },
  { label: 'On-Chain Transparency:', value: '---' },
];

const Displayed: FC<DisplayedProps> = ({
  itemName = 'ItemName',
  itemWeight = 22,
  itemKey,
  onViewSubmissions,
}) => {
  const { profile } = useAuth();

  // Get project data
  const {
    displayProposalDataListOfProject,
    showReferenceModal,
    displayProposalDataOfKey,
    project,
    onCreateItemProposalVote,
    onSwitchItemProposalVote,
    onCancelVote,
    proposalsByProjectIdAndKey,
    tableDataOfDisplayed,
    showRowOverTaken,
    isProposalsByKeyLoading,
    isProposalsByKeyFetched,
    showSubmitterModal,
    isLeadingProposalNotLeading,
  } = useProjectDetailContext();

  // Expanded row state management
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Function to generate unique identifier - consistent with SubmissionQueue component
  const getRowUniqueId = useCallback((rowData: IProjectTableRowData) => {
    return rowData.proposalId
      ? `proposal-${rowData.proposalId}`
      : `key-${rowData.key}`;
  }, []);

  // Toggle row expanded state
  const toggleRowExpanded = useCallback((uniqueId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [uniqueId]: !prev[uniqueId],
    }));
  }, []);

  const coreTableMeta = useMemo(
    () =>
      ({
        project,
        displayProposalDataListOfProject,
        proposalsByProjectIdAndKey,
        onCreateItemProposalVote,
        onSwitchItemProposalVote,
        onCancelVote,
        profile,
        showReferenceModal,
        expandedRows,
        toggleRowExpanded,
        showSubmitterModal,
      }) as ITableMetaOfSubmissionQueue,
    [
      project,
      displayProposalDataListOfProject,
      proposalsByProjectIdAndKey,
      onCreateItemProposalVote,
      onSwitchItemProposalVote,
      onCancelVote,
      profile,
      showReferenceModal,
      expandedRows,
      toggleRowExpanded,
      showSubmitterModal,
    ],
  );

  const displayedItemWeight = useMemo(() => {
    if (!displayProposalDataOfKey) return 0;
    return displayProposalDataOfKey.itemTopWeight;
  }, [displayProposalDataOfKey]);

  // Create columns
  const columns = useCommonColumnsOfModal();

  // Create table instance
  const table = useReactTable({
    data: tableDataOfDisplayed,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: coreTableMeta,
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Item Info */}
      <div className="flex flex-col gap-[5px] border-b border-black/10 pb-5">
        <div className="flex items-center gap-2">
          <span className="font-mona text-[14px] leading-[1.43] text-black opacity-80">
            Item:
          </span>
        </div>
        <ItemWeight
          itemKey={itemKey as IPocItemKey}
          itemName={itemName}
          itemWeight={displayedItemWeight}
        />
      </div>

      {/* Consensus Status Info */}
      {isLeadingProposalNotLeading && (
        <div className="flex items-center gap-[5px] rounded-[10px]">
          <ClockClockwiseIcon size={20} />
          <span className="font-sans text-[13px] font-normal leading-[18px] text-black">
            This item is current undergoing consensus.{' '}
            <span
              className="cursor-pointer font-[700] text-black hover:underline"
              onClick={onViewSubmissions}
            >
              View Submissions
            </span>
          </span>
        </div>
      )}

      {/* Table */}
      {isProposalsByKeyLoading ? (
        <ModalTableSkeleton
          rowCount={1}
          columns={[
            { header: 'Input', width: 480 },
            { header: 'Reference', width: 124 },
            { header: 'Submitter', width: 183 },
            { header: 'Support', width: 150, isLast: true },
          ]}
        />
      ) : (
        <ModalTableContainer>
          <table className="w-full border-separate border-spacing-0">
            {/* Table Header */}
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-[#F5F5F5]">
                  {headerGroup.headers.map((header, index) => (
                    <TableHeader
                      key={header.id}
                      width={
                        header.getSize() === 0 ? undefined : header.getSize()
                      }
                      isFirst={index === 0}
                      isLast={index === headerGroup.headers.length - 1}
                      isContainerBordered={true}
                      className="h-auto bg-[#F5F5F5] py-[5px]"
                      style={
                        header.getSize() === 0 ? { width: 'auto' } : undefined
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHeader>
                  ))}
                </tr>
              ))}
            </thead>

            {/* Table Body */}
            <tbody>
              {table.getRowModel().rows.map((row, rowIndex) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    isLastRow={
                      rowIndex === table.getRowModel().rows.length - 1 &&
                      !AllItemConfig[row.original.key as IEssentialItemKey]
                        ?.showExpand
                    }
                    className={cn(
                      expandedRows[getRowUniqueId(row.original)]
                        ? 'bg-[#EBEBEB]'
                        : '',
                    )}
                  >
                    {row.getVisibleCells().map((cell, cellIndex) => (
                      <OptimizedTableCell
                        key={cell.id}
                        cell={cell}
                        cellIndex={cellIndex}
                        width={
                          cell.column.getSize() === 0
                            ? undefined
                            : cell.column.getSize()
                        }
                        isLast={cellIndex === row.getVisibleCells().length - 1}
                        isLastRow={
                          rowIndex === table.getRowModel().rows.length - 1
                        }
                        isContainerBordered={true}
                        className=""
                        minHeight={60}
                        style={
                          cell.column.getSize() === 0
                            ? { width: 'auto' }
                            : undefined
                        }
                      />
                    ))}
                  </TableRow>

                  <ExpandableRow
                    rowId={getRowUniqueId(row.original)}
                    itemKey={row.original.key}
                    inputValue={row.original.input}
                    isExpanded={
                      expandedRows[getRowUniqueId(row.original)] || false
                    }
                    colSpan={row.getVisibleCells().length}
                    isLastRow={rowIndex === table.getRowModel().rows.length - 1}
                  />
                </React.Fragment>
              ))}
              {tableDataOfDisplayed[0]?.reason && (
                <TableFooter colSpan={table.getAllColumns().length}>
                  <div className="flex items-center gap-[5px]">
                    <span className="font-sans text-[13px] opacity-50">
                      Edit Reason:
                    </span>
                    <span className="font-sans text-[13px]">
                      {tableDataOfDisplayed[0]?.reason}
                    </span>
                  </div>
                </TableFooter>
              )}
            </tbody>
          </table>
        </ModalTableContainer>
      )}
      {/* Accountability Metrics Section */}
      {/* <div className="flex flex-col gap-5 border-t border-black/10 pt-5"> */}
      {/* Accountability Metrics */}
      {/* <div className="flex flex-col gap-2.5 rounded-[10px] bg-[#F5F5F5] p-2.5">
          <div className="flex flex-col gap-[5px]">
            <div className="font-mona text-[14px] font-semibold leading-[1.43em] text-black opacity-80">
              Accountability Metrics:
            </div>
            <div className="font-sans text-[13px] font-normal leading-[1.36em] text-black opacity-50">
              This item falls under the following criteria,
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            {accountabilityMetrics.map((metric) => (
              <div
                key={metric.name}
                className={cn('flex items-center justify-between gap-2.5')}
              >
                <span className="font-sans text-[13px] font-normal leading-[1.36em] text-black">
                  {metric.name}
                </span>
                <div className="flex size-[18px] items-center justify-center opacity-50">
                  <CaretDownIcon size={18} />
                </div>
              </div>
            ))}
          </div>
        </div> */}

      {/* Legitimacy Analysis */}
      {/* <div className="flex flex-col gap-2.5 rounded-[10px] bg-[#F5F5F5] p-2.5">
          <div className="flex flex-col gap-[5px]">
            <div className="font-mona text-[14px] font-semibold leading-[1.43em] text-black opacity-80">
              Legitimacy Analysis:
            </div>
            <div className="font-sans text-[13px] font-normal leading-[1.36em] text-black opacity-50">
              This item falls under the following criteria,
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            {legitimacyMetrics.map((metric) => (
              <div
                key={metric.name}
                className={cn('flex items-center justify-between gap-2.5')}
              >
                <span className="font-sans text-[13px] font-normal leading-[1.36em] text-black">
                  {metric.name}
                </span>
                <div className="flex size-[18px] items-center justify-center opacity-50">
                  <CaretDownIcon size={18} />
                </div>
              </div>
            ))}
          </div>
        </div> */}

      {/* Web3 Metrics */}
      {/* <div className="flex flex-col gap-2.5 rounded-[10px] bg-[#F5F5F5] p-2.5">
          <div className="font-mona text-[14px] font-semibold leading-[1.43em] text-black opacity-80">
            Web3 Metrics (coming soon)
          </div>
          <div className="flex flex-col gap-2.5 opacity-30">
            {web3Metrics.map((metric) => (
              <div
                key={metric.label}
                className={cn('flex items-center justify-between gap-2.5')}
              >
                <span className="font-sans text-[14px] font-normal leading-[1.43em] text-black">
                  {metric.label}
                </span>
                <span className="font-sans text-[14px] font-semibold leading-[1.36em] text-black">
                  {metric.value}
                </span>
              </div>
            ))}
          </div>
        </div> */}
      {/* </div> */}
    </div>
  );
};

export default Displayed;
