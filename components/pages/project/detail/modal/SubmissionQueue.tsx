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
import { CaretUpDownIcon, ClockClockwiseIcon } from '@/components/icons';
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
}

const SubmissionQueue: FC<ISubmissionQueueProps> = ({
  itemName = 'ItemName', // Used for display purposes
  itemWeight = 22, // Used for weight calculations
  itemKey, // Used to filter data
}) => {
  const { profile } = useAuth();

  const [displayedExpandedRows, setDisplayedExpandedRows] = useState<
    Record<string, boolean>
  >({});
  const [submissionQueueExpandedRows, setSubmissionQueueExpandedRows] =
    useState<Record<string, boolean>>({});

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

  const columns = useCommonColumnsOfModal();

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
      showRowOverTaken, // 只有 displayed 的 table 需要考虑 showRowOverTaken
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
      showRowIsLeading, // 只有 submission queue 的 table 需要考虑 showRowIsLeading
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
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    meta: displayedTableMeta,
  });

  const submissionQueueTable = useReactTable({
    data: tableDataOfSubmissionQueue,
    columns: columns,
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
      {/* Consensus in Progress Banner - Only show when showRowOverTaken is true */}
      {isLeadingProposalNotLeading && (
        <>
          {/* Item Info */}
          <div className="flex flex-col gap-[5px]">
            <ItemWeight itemName={itemName} itemWeight={displayedItemWeight} />
          </div>
          <div
            className={cn(
              'flex gap-[10px] rounded-[10px] border border-black/10 bg-white p-[10px]',
              showRowOverTaken ? 'items-start' : 'items-center',
            )}
          >
            <div className="shrink-0">
              <ClockClockwiseIcon size={24} />
            </div>
            <div className="flex flex-col gap-[5px]">
              <span className="font-mona text-[16px] font-medium leading-[1.25em] text-[#F7992D]">
                Consensus in Progress
              </span>
              {showRowOverTaken && (
                <span className="font-sans text-[13px] font-normal leading-[1.36181640625em] text-black opacity-70">
                  <b>
                    The displayed submission is now outpaced by a leading
                    submission with more support.{' '}
                  </b>
                  To keep the displayed submission in place, additional support
                  is needed, or if the leading submission surpasses the Item
                  Weight, it will replace the displayed one.
                </span>
              )}
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
                Displayed:
              </span>
              <span className="font-sans text-[13px] font-normal leading-[1.36] text-black opacity-80">
                {isProposalsByKeyLoading
                  ? 'Loading displayed submission...'
                  : 'This is the validated submission currently shown on the project page.'}
              </span>
            </div>

            {/* Displayed Table */}
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
              <ModalTableContainer allowInternalBorderRadius>
                <table className="w-full border-separate border-spacing-0">
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
                              showRowOverTaken &&
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
                                if (!showRowOverTaken) return '';
                                const isShowReason =
                                  tableDataOfDisplayed[0]?.reason;

                                const borderClasses = [];

                                // Add top and bottom borders for all cells
                                borderClasses.push(
                                  'border-t-1 border-t-[#F7992D] border-b-1 border-b-[#F7992D]',
                                );

                                // Add left border and bottom-left rounded corner for first cell
                                if (isFirstCell) {
                                  borderClasses.push(
                                    'border-l-1 border-l-[#F7992D]',
                                  );
                                  if (!isShowReason) {
                                    borderClasses.push('rounded-bl-[10px]');
                                  }
                                }

                                // Add right border and bottom-right rounded corner for last cell
                                if (isLastCell) {
                                  borderClasses.push(
                                    'border-r-1 border-r-[#F7992D]',
                                  );
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
                                  isLast={isLastCell}
                                  isLastRow={isLastRowInTable}
                                  isContainerBordered={true}
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
        <div className="flex items-center justify-between">
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

          {/* Collapse All Button - Only show when there are expandable rows */}
          {hasExpandableRows && (
            <button
              onClick={handleCollapseAll}
              className="flex items-center gap-[5px] rounded-[5px] bg-black/5 px-2.5 py-[5px] transition-colors hover:bg-black/10"
            >
              <CaretUpDownIcon size={16} className="opacity-80" />
              <span className="font-sans text-[13px] font-semibold text-black opacity-80">
                {hasSubmissionQueueExpandedRows
                  ? 'Collapse All Items'
                  : 'Expand All Items'}
              </span>
            </button>
          )}
        </div>

        {/* Table */}
        {isProposalsByKeyLoading ? (
          <ModalTableSkeleton
            rowCount={3}
            columns={[
              { header: 'Input', width: 480 },
              { header: 'Reference', width: 124 },
              { header: 'Submitter', width: 183 },
              { header: 'Support', width: 150, isLast: true },
            ]}
          />
        ) : tableDataOfSubmissionQueue.length === 0 ? (
          <div className="flex items-center justify-center rounded-[10px] border border-black/10 bg-white py-8">
            <span className="font-sans text-[14px] text-black opacity-60">
              No submission queue data available for this item.
            </span>
          </div>
        ) : (
          <ModalTableContainer allowInternalBorderRadius>
            <table className="w-full border-separate border-spacing-0">
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
                    // 检查是否是第一行且处于 leading 状态
                    const isFirstRowLeading =
                      showRowOverTaken && showRowIsLeading && rowIndex === 0;

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
                              'bg-[rgba(162,208,195,0.2)] hover:bg-[rgba(162,208,195,0.2)]',
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

                              // Add left border and bottom-left rounded corner for first cell
                              if (isFirstCell) {
                                borderClasses.push(
                                  'border-l-1 border-l-[#46A287]',
                                );
                                if (isLastRowInTable) {
                                  borderClasses.push('rounded-bl-[10px]');
                                }
                              }

                              // Add right border and bottom-right rounded corner for last cell
                              if (isLastCell) {
                                borderClasses.push(
                                  'border-r-1 border-r-[#46A287]',
                                );
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
                                isLast={isLastCell}
                                isLastRow={isLastRowInTable}
                                isContainerBordered={true}
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
