'use client';

import { cn } from '@heroui/react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import React, { FC, useCallback, useMemo, useState } from 'react';

import { Button } from '@/components/base';
import {
  ExpandableRow,
  ModalTableContainer,
  TableFooter,
  TableHeader,
  TableRow,
} from '@/components/biz/table';
import OptimizedTableCell from '@/components/biz/table/OptimizedTableCell';
import {
  CollapseItemIcon,
  PlusIcon,
  ShowMetricsIcon,
  TrendDownIcon,
} from '@/components/icons';
import { AllItemConfig } from '@/constants/itemConfig';
import { useAuth } from '@/context/AuthContext';
import { IEssentialItemKey, IPocItemKey } from '@/types/item';

import { useProjectDetailContext } from '../../context/projectDetailContext';
import { IProjectTableRowData, ITableMetaOfSubmissionQueue } from '../types';

import { useCommonColumnsOfModal } from './CommonColumns';
import ItemWeight from './ItemWeight';
import { ModalTableSkeleton } from './ModalTableSkeleton';

interface ISubmissionQueueProps {
  itemName?: string;
  itemWeight?: number;
  itemKey?: string;
  onSubmitEntry?: () => void;
}

const SubmissionQueue: FC<ISubmissionQueueProps> = ({
  itemName = 'ItemName', // Used for display purposes
  itemWeight = 22, // Used for weight calculations
  itemKey, // Used to filter data
  onSubmitEntry,
}) => {
  const { profile } = useAuth();

  const [displayedExpandedRows, setDisplayedExpandedRows] = useState<
    Record<string, boolean>
  >({});
  const [submissionQueueExpandedRows, setSubmissionQueueExpandedRows] =
    useState<Record<string, boolean>>({});
  const [showMetricsLeading, setShowMetricsLeading] = useState<boolean>(false);
  const [showMetricsSubmissionQueue, setShowMetricsSubmissionQueue] =
    useState<boolean>(false);

  const getRowUniqueId = useCallback((rowData: IProjectTableRowData) => {
    return rowData.proposalId
      ? `proposal-${rowData.proposalId}`
      : `key-${rowData.key}`;
  }, []);

  const {
    displayProposalDataListOfProject,
    project,
    getItemTopWeight,
    onCreateItemProposalVote,
    onSwitchItemProposalVote,
    onCancelVote,
    proposalsByProjectIdAndKey,
    displayProposalDataOfKey,
    showReferenceModal,
    tableDataOfDisplayed,
    tableDataOfSubmissionQueue,
    showRowOverTaken,
    showRowIsLeading,
    isProposalsByKeyLoading,
    inActionKeyMap,
    inActionItemProposalIdMap,
    currentItemKey,
    showSubmitterModal,
    isLeadingProposalNotLeading,
  } = useProjectDetailContext();

  const toggleDisplayedRowExpanded = useCallback((uniqueId: string) => {
    setDisplayedExpandedRows((prev) => ({
      ...prev,
      [uniqueId]: !prev[uniqueId],
    }));
  }, []);

  const toggleSubmissionQueueRowExpanded = useCallback((uniqueId: string) => {
    setSubmissionQueueExpandedRows((prev) => ({
      ...prev,
      [uniqueId]: !prev[uniqueId],
    }));
  }, []);

  const hasSubmissionQueueExpandedRows = useMemo(() => {
    return Object.values(submissionQueueExpandedRows).some(Boolean);
  }, [submissionQueueExpandedRows]);

  const getSubmissionQueueExpandableRowIds = useCallback(() => {
    const submissionQueueRowIds: string[] = [];

    tableDataOfSubmissionQueue.forEach((rowData) => {
      const itemConfig = AllItemConfig[rowData.key as IEssentialItemKey];
      if (itemConfig?.showExpand) {
        submissionQueueRowIds.push(getRowUniqueId(rowData));
      }
    });

    return submissionQueueRowIds;
  }, [tableDataOfSubmissionQueue, getRowUniqueId]);

  const hasExpandableRows = useMemo(() => {
    return tableDataOfSubmissionQueue.some((rowData) => {
      const itemConfig = AllItemConfig[rowData.key as IEssentialItemKey];
      return itemConfig?.showExpand;
    });
  }, [tableDataOfSubmissionQueue]);

  const handleCollapseAll = useCallback(() => {
    const submissionQueueRowIds = getSubmissionQueueExpandableRowIds();

    if (hasSubmissionQueueExpandedRows) {
      setSubmissionQueueExpandedRows({});
    } else {
      const newSubmissionQueueExpanded: Record<string, boolean> = {};

      submissionQueueRowIds.forEach((id) => {
        newSubmissionQueueExpanded[id] = true;
      });

      setSubmissionQueueExpandedRows(newSubmissionQueueExpanded);
    }
  }, [hasSubmissionQueueExpandedRows, getSubmissionQueueExpandableRowIds]);

  const handleShowMetricsLeading = useCallback(() => {
    setShowMetricsLeading((prev) => !prev);
  }, []);

  const handleShowMetricsSubmissionQueue = useCallback(() => {
    setShowMetricsSubmissionQueue((prev) => !prev);
  }, []);

  const leadingColumns = useCommonColumnsOfModal(showMetricsLeading);
  const submissionQueueColumns = useCommonColumnsOfModal(
    showMetricsSubmissionQueue,
  );

  const displayedTableMeta = useMemo(() => {
    return {
      project,
      displayProposalDataListOfProject,
      proposalsByProjectIdAndKey,
      onCreateItemProposalVote,
      onSwitchItemProposalVote,
      onCancelVote,
      profile,
      showReferenceModal,
      expandedRows: displayedExpandedRows,
      toggleRowExpanded: toggleDisplayedRowExpanded,
      showRowOverTaken, // Only displayed table needs to consider showRowOverTaken
      isLeadingProposalNotLeading,
      inActionKeyMap,
      inActionItemProposalIdMap,
      showSubmitterModal,
    } as ITableMetaOfSubmissionQueue;
  }, [
    project,
    displayProposalDataListOfProject,
    proposalsByProjectIdAndKey,
    onCreateItemProposalVote,
    onSwitchItemProposalVote,
    onCancelVote,
    profile,
    showReferenceModal,
    displayedExpandedRows,
    toggleDisplayedRowExpanded,
    showRowOverTaken,
    isLeadingProposalNotLeading,
    inActionKeyMap,
    inActionItemProposalIdMap,
    showSubmitterModal,
  ]);

  const submissionQueueTableMeta = useMemo(() => {
    return {
      project,
      displayProposalDataListOfProject,
      proposalsByProjectIdAndKey,
      onCreateItemProposalVote,
      onSwitchItemProposalVote,
      onCancelVote,
      profile,
      showReferenceModal,
      expandedRows: submissionQueueExpandedRows,
      toggleRowExpanded: toggleSubmissionQueueRowExpanded,
      showRowIsLeading, // Only submission queue table needs to consider showRowIsLeading
      inActionKeyMap,
      inActionItemProposalIdMap,
      showSubmitterModal,
    } as ITableMetaOfSubmissionQueue;
  }, [
    project,
    displayProposalDataListOfProject,
    proposalsByProjectIdAndKey,
    onCreateItemProposalVote,
    onSwitchItemProposalVote,
    onCancelVote,
    profile,
    showReferenceModal,
    submissionQueueExpandedRows,
    toggleSubmissionQueueRowExpanded,
    showRowIsLeading,
    inActionKeyMap,
    inActionItemProposalIdMap,
    showSubmitterModal,
  ]);

  const displayedTable = useReactTable({
    data: tableDataOfDisplayed,
    columns: leadingColumns,
    getCoreRowModel: getCoreRowModel(),
    meta: displayedTableMeta,
  });

  const submissionQueueTable = useReactTable({
    data: tableDataOfSubmissionQueue,
    columns: submissionQueueColumns,
    getCoreRowModel: getCoreRowModel(),
    meta: submissionQueueTableMeta,
  });

  const displayedItemWeight = useMemo(() => {
    const itemKey = currentItemKey as IPocItemKey;
    const itemConfigWeight = Number(AllItemConfig[itemKey]?.weight);
    if (displayProposalDataOfKey) {
      const itemTopWeight = Number(displayProposalDataOfKey.itemTopWeight);
      if (itemTopWeight > 0) {
        return itemTopWeight;
      }
    }
    return itemConfigWeight;
  }, [displayProposalDataOfKey, currentItemKey]);

  return (
    <div className="flex flex-col gap-[20px]">
      {/* Consensus in Progress Banner - Only show when isLeadingProposalNotLeading is true */}
      {isLeadingProposalNotLeading && (
        <>
          {/* Item Info */}
          <div className="flex flex-col gap-[5px]">
            <ItemWeight
              itemKey={itemKey as IPocItemKey}
              itemName={itemName}
              itemWeight={displayedItemWeight}
            />
          </div>
          <div
            className={cn(
              'rounded-[10px] border border-[rgba(196,125,84,0.40)] bg-[rgba(247,153,45,0.20)] p-[10px]',
            )}
          >
            <div className="flex items-center gap-[10px]">
              <TrendDownIcon size={16} className="text-[#C47D54]" />
              <span className="font-mona text-[16px] font-medium leading-[20px] text-[#C47D54]">
                Support Not Sufficient
              </span>
            </div>
            <div className="mt-[5px] font-sans text-[13px] font-normal text-black/70">
              <b>
                The displayed submission is currently lacking support against
                the current item weight.{' '}
              </b>
              To keep the displayed submission in place, additional support is
              needed to exceed the item weight.
            </div>
          </div>
        </>
      )}

      {/* Displayed Section - Show when displayProposalDataOfKey has value or is loading */}
      {(displayProposalDataOfKey || isProposalsByKeyLoading) && (
        <div className="flex flex-col gap-2.5">
          {/* Displayed Section */}
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-[5px]">
              <span className="font-mona text-[16px] font-bold leading-tight text-black opacity-80">
                Leading:
              </span>
              <span className="font-sans text-[13px] font-normal leading-[1.36] text-black opacity-80">
                {isProposalsByKeyLoading
                  ? 'Loading displayed submission...'
                  : 'This is the validated submission with its value currently displayed on the project page for this item.'}
              </span>
            </div>

            {/* Leading Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Collapse Item Button for Leading - Only show when there are expandable rows */}
              {tableDataOfDisplayed.some((rowData) => {
                const itemConfig =
                  AllItemConfig[rowData.key as IEssentialItemKey];
                return itemConfig?.showExpand;
              }) && (
                <button
                  onClick={() => {
                    const displayedRowIds: string[] = [];
                    tableDataOfDisplayed.forEach((rowData) => {
                      const itemConfig =
                        AllItemConfig[rowData.key as IEssentialItemKey];
                      if (itemConfig?.showExpand) {
                        const uniqueId = rowData.proposalId
                          ? `proposal-${rowData.proposalId}`
                          : `key-${rowData.key}`;
                        displayedRowIds.push(uniqueId);
                      }
                    });

                    const hasDisplayedExpandedRows = Object.values(
                      displayedExpandedRows,
                    ).some(Boolean);
                    if (hasDisplayedExpandedRows) {
                      setDisplayedExpandedRows({});
                    } else {
                      const newDisplayedExpanded: Record<string, boolean> = {};
                      displayedRowIds.forEach((id) => {
                        newDisplayedExpanded[id] = true;
                      });
                      setDisplayedExpandedRows(newDisplayedExpanded);
                    }
                  }}
                  className="flex items-center gap-1"
                >
                  <CollapseItemIcon size={16} />
                  <span className="text-[13px] opacity-80">Collapse Item</span>
                </button>
              )}

              {/* Show Metrics Button for Leading */}
              <button
                onClick={handleShowMetricsLeading}
                className="flex items-center gap-1"
              >
                <ShowMetricsIcon size={16} />
                <span className="text-[13px] opacity-80">Show Metrics</span>
              </button>
            </div>

            {/* Displayed Table */}
            {isProposalsByKeyLoading ? (
              <ModalTableSkeleton
                rowCount={1}
                columns={[
                  { header: 'Input', width: 320 },
                  { header: 'Reference', width: 100 },
                  { header: 'Submitter', width: 160 },
                  {
                    header: 'Support',
                    width: 180,
                    isLast: !showMetricsLeading,
                  },
                  ...(showMetricsLeading
                    ? [
                        { header: 'Accountability Metrics', width: 240 },
                        {
                          header: 'Legitimacy Metrics',
                          width: 240,
                          isLast: true,
                        },
                      ]
                    : []),
                ]}
              />
            ) : (
              <ModalTableContainer
                style={{
                  overflowX: showMetricsLeading ? 'auto' : 'hidden',
                }}
                className="tablet:w-auto mobile:w-auto w-[762px]"
              >
                <table
                  className="w-full border-separate border-spacing-0"
                  style={{ minWidth: showMetricsLeading ? '1240px' : '760px' }}
                >
                  {/* Table Header */}
                  <thead>
                    {displayedTable.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id} className="bg-[#F5F5F5]">
                        {headerGroup.headers.map((header, index) => (
                          <TableHeader
                            key={header.id}
                            width={
                              header.getSize() === 0
                                ? undefined
                                : header.getSize()
                            }
                            isFirst={index === 0}
                            isLast={index === headerGroup.headers.length - 1}
                            isContainerBordered={true}
                            className="h-auto bg-[#F5F5F5] px-[10px] py-[5px]"
                            style={
                              header.getSize() === 0
                                ? { width: 'auto' }
                                : undefined
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
                    {displayedTable.getRowModel().rows.map((row, rowIndex) => {
                      return (
                        <React.Fragment key={row.id}>
                          <TableRow
                            isLastRow={
                              rowIndex ===
                              displayedTable.getRowModel().rows.length - 1
                            }
                            className={cn(
                              // displayedExpandedRows[getRowUniqueId(row.original)]
                              //   ? 'bg-[#EBEBEB]'
                              //   : '',
                              isLeadingProposalNotLeading &&
                                'bg-[rgba(247,153,45,0.2)] hover:bg-[rgba(247,153,45,0.2)]',
                            )}
                          >
                            {row.getVisibleCells().map((cell, cellIndex) => {
                              const isFirstCell = cellIndex === 0;
                              const isLastCell =
                                cellIndex === row.getVisibleCells().length - 1;
                              const isLastRowInTable =
                                rowIndex ===
                                displayedTable.getRowModel().rows.length - 1;

                              // Generate border classes for over-taken row
                              const getOverTakenBorderClasses = () => {
                                if (!isLeadingProposalNotLeading) return '';
                                const isShowReason =
                                  tableDataOfDisplayed[0]?.reason;

                                const borderClasses = [];

                                // Add top and bottom borders for all cells
                                borderClasses.push(
                                  'border-t-1 border-t-[#F7992D] border-b-1 border-b-[#F7992D]',
                                );

                                // Add left border for first cell
                                if (isFirstCell) {
                                  borderClasses.push(
                                    'border-l-1 border-l-[#F7992D]',
                                  );
                                  // Only add bottom-left rounded corner if no reason is shown
                                  if (!isShowReason) {
                                    borderClasses.push('rounded-bl-[10px]');
                                  }
                                }

                                // Add right border for all cells except the last one (which gets it by default)
                                if (!isLastCell) {
                                  borderClasses.push(
                                    'border-r-1 border-r-[rgba(0,0,0,0.1)]',
                                  );
                                } else {
                                  // Add right border for last cell as well
                                  borderClasses.push(
                                    'border-r-1 border-r-[#F7992D]',
                                  );
                                  // Only add bottom-right rounded corner if no reason is shown
                                  if (!isShowReason) {
                                    borderClasses.push('rounded-br-[10px]');
                                  }
                                }

                                return borderClasses.join(' ');
                              };

                              return (
                                <OptimizedTableCell
                                  key={cell.id}
                                  cell={cell}
                                  cellIndex={cellIndex}
                                  width={
                                    cell.column.getSize() === 0
                                      ? undefined
                                      : cell.column.getSize()
                                  }
                                  isFirst={isFirstCell}
                                  isLast={isLastCell}
                                  isLastRow={isLastRowInTable}
                                  isContainerBordered={true}
                                  hasFooter={!!tableDataOfDisplayed[0]?.reason}
                                  className={cn(getOverTakenBorderClasses())}
                                  minHeight={60}
                                  style={
                                    cell.column.getSize() === 0
                                      ? { width: 'auto' }
                                      : undefined
                                  }
                                />
                              );
                            })}
                          </TableRow>

                          <ExpandableRow
                            rowId={getRowUniqueId(row.original)}
                            itemKey={row.original.key}
                            inputValue={row.original.input}
                            isExpanded={
                              displayedExpandedRows[
                                getRowUniqueId(row.original)
                              ] || false
                            }
                            colSpan={row.getVisibleCells().length}
                            isLastRow={
                              rowIndex ===
                              displayedTable.getRowModel().rows.length - 1
                            }
                          />
                        </React.Fragment>
                      );
                    })}
                    {/* Edit Reason Row */}
                    {tableDataOfDisplayed[0]?.reason && (
                      <TableFooter
                        colSpan={displayedTable.getAllColumns().length}
                        isContainerBordered={true}
                      >
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
          </div>
        </div>
      )}
      <div className="flex flex-col gap-[10px]">
        {/* Submission Queue Header Section */}
        <div className="flex items-center justify-between gap-[10px]">
          <div className="flex flex-col gap-[5px]">
            <div className="flex items-center gap-2">
              <span className="font-mona text-[16px] font-bold leading-tight text-black opacity-80">
                Submission Que:
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-sans text-[13px] font-normal leading-[1.36] text-black opacity-80">
                This is the list of submissions available to replace the
                displayed one.
              </span>
            </div>
          </div>
          {/* Submit Entry Button */}
          <Button
            className={cn(
              'flex items-center justify-center gap-[10px] rounded-[5px] border border-[rgba(0,0,0,0.1)]',
              'bg-[#F0F0F0] px-[14px] py-[6px]',
              'hover:bg-[rgba(0,0,0,0.1)] transition-colors duration-200',
              'h-auto min-w-0',
            )}
            onPress={onSubmitEntry}
          >
            <PlusIcon size={16} />
            <span className="font-sans text-[14px] font-semibold leading-[1.36] text-black">
              Submit an Entry
            </span>
          </Button>
        </div>

        {/* Submission Queue Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Collapse All Button - Only show when there are expandable rows */}
          {hasExpandableRows && (
            <button
              onClick={handleCollapseAll}
              className="flex items-center gap-1"
            >
              <CollapseItemIcon size={16} />
              <span className="text-[13px] opacity-80">Collapse All Items</span>
            </button>
          )}

          {/* Show Metrics Button for Submission Queue */}
          <button
            onClick={handleShowMetricsSubmissionQueue}
            className="flex items-center gap-1"
          >
            <ShowMetricsIcon size={16} />
            <span className="text-[13px] opacity-80">Show Metrics</span>
          </button>
        </div>

        {/* Table */}
        {isProposalsByKeyLoading ? (
          <ModalTableSkeleton
            rowCount={3}
            columns={[
              { header: 'Input', width: 320 },
              { header: 'Reference', width: 100 },
              { header: 'Submitter', width: 160 },
              {
                header: 'Support',
                width: 180,
                isLast: !showMetricsSubmissionQueue,
              },
              ...(showMetricsSubmissionQueue
                ? [
                    { header: 'Accountability Metrics', width: 240 },
                    { header: 'Legitimacy Metrics', width: 240, isLast: true },
                  ]
                : []),
            ]}
          />
        ) : tableDataOfSubmissionQueue.length === 0 ? (
          <div className="flex items-center justify-center rounded-[10px] border border-black/10 bg-white py-8">
            <span className="font-sans text-[14px] text-black opacity-60">
              No submission queue data available for this item.
            </span>
          </div>
        ) : (
          <ModalTableContainer
            style={{
              overflowX: showMetricsSubmissionQueue ? 'auto' : 'hidden',
            }}
            className="tablet:w-auto mobile:w-auto w-[762px]"
          >
            <table
              className="w-full border-separate border-spacing-0"
              style={{
                minWidth: showMetricsSubmissionQueue ? '1240px' : '760px',
              }}
            >
              {/* Table Header */}
              <thead>
                {submissionQueueTable.getHeaderGroups().map((headerGroup) => (
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
                        className="h-auto bg-[#F5F5F5] px-[10px] py-[5px]"
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
                {submissionQueueTable
                  .getRowModel()
                  .rows.map((row, rowIndex) => {
                    // Check if it is the first row and in leading state
                    const isFirstRowLeading =
                      showRowIsLeading && rowIndex === 0;

                    return (
                      <React.Fragment key={row.id}>
                        <TableRow
                          isLastRow={
                            rowIndex ===
                              submissionQueueTable.getRowModel().rows.length -
                                1 &&
                            !AllItemConfig[
                              row.original.key as IEssentialItemKey
                            ]?.showExpand
                          }
                          className={cn(
                            // submissionQueueExpandedRows[getRowUniqueId(row.original)]
                            //   ? 'bg-[#EBEBEB]'
                            //   : '',
                            isFirstRowLeading &&
                              'bg-[rgba(70,162,135,0.1)] hover:bg-[rgba(70,162,135,0.1)]',
                          )}
                        >
                          {row.getVisibleCells().map((cell, cellIndex) => {
                            const isFirstCell = cellIndex === 0;
                            const isLastCell =
                              cellIndex === row.getVisibleCells().length - 1;
                            const isLastRowInTable =
                              rowIndex ===
                              submissionQueueTable.getRowModel().rows.length -
                                1;

                            // Generate border classes for leading row
                            const getLeadingBorderClasses = () => {
                              if (!isFirstRowLeading) return '';

                              const borderClasses = [];

                              // Add top and bottom borders for all cells
                              borderClasses.push(
                                'border-t-1 border-t-[#46A287] border-b-1 border-b-[#46A287]',
                              );

                              // Add left border for first cell
                              if (isFirstCell) {
                                borderClasses.push(
                                  'border-l-1 border-l-[#46A287]',
                                );
                                // Only add bottom-left rounded corner if this is the last row in the table
                                if (isLastRowInTable) {
                                  borderClasses.push('rounded-bl-[10px]');
                                }
                              }

                              // Add right border for all cells except the last one (which gets it by default)
                              if (!isLastCell) {
                                borderClasses.push(
                                  'border-r-1 border-r-[rgba(0,0,0,0.1)]',
                                );
                              } else {
                                // Add right border for last cell as well
                                borderClasses.push(
                                  'border-r-1 border-r-[#46A287]',
                                );
                                // Only add bottom-right rounded corner if this is the last row in the table
                                if (isLastRowInTable) {
                                  borderClasses.push('rounded-br-[10px]');
                                }
                              }

                              return borderClasses.join(' ');
                            };

                            return (
                              <OptimizedTableCell
                                key={cell.id}
                                cell={cell}
                                cellIndex={cellIndex}
                                width={
                                  cell.column.getSize() === 0
                                    ? undefined
                                    : cell.column.getSize()
                                }
                                isFirst={isFirstCell}
                                isLast={isLastCell}
                                isLastRow={isLastRowInTable}
                                isContainerBordered={true}
                                hasFooter={false}
                                className={cn(getLeadingBorderClasses())}
                                minHeight={60}
                                style={
                                  cell.column.getSize() === 0
                                    ? { width: 'auto' }
                                    : undefined
                                }
                              />
                            );
                          })}
                        </TableRow>

                        <ExpandableRow
                          rowId={getRowUniqueId(row.original)}
                          itemKey={row.original.key}
                          inputValue={row.original.input}
                          isExpanded={
                            submissionQueueExpandedRows[
                              getRowUniqueId(row.original)
                            ] || false
                          }
                          colSpan={row.getVisibleCells().length}
                          isLastRow={
                            rowIndex ===
                            submissionQueueTable.getRowModel().rows.length - 1
                          }
                        />
                      </React.Fragment>
                    );
                  })}
              </tbody>
            </table>
          </ModalTableContainer>
        )}
      </div>
    </div>
  );
};

export default SubmissionQueue;
