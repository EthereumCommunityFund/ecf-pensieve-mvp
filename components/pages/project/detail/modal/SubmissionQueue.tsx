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
  TableCell,
  TableFooter,
  TableHeader,
  TableRow,
} from '@/components/biz/table';
import { CaretUpDownIcon } from '@/components/icons';
import { AllItemConfig } from '@/constants/itemConfig';
import { useAuth } from '@/context/AuthContext';
import { IProfileCreator } from '@/types';
import { IEssentialItemKey, IPocItemKey } from '@/types/item';

import { useProjectDetailContext } from '../../context/projectDetailContext';
import { IProjectTableRowData, ITableMetaOfSubmissionQueue } from '../types';

import { useCommonColumnsOfModal } from './CommonColumns';
import ItemWeight from './ItemWeight';

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
  } = useProjectDetailContext();

  const tableDataOfDisplayed: IProjectTableRowData[] = useMemo(() => {
    if (!displayProposalDataOfKey) return [];
    return [displayProposalDataOfKey];
  }, [displayProposalDataOfKey]);

  const tableDataOfSubmissionQueue: IProjectTableRowData[] = useMemo(() => {
    if (!proposalsByProjectIdAndKey) return [];
    const { allItemProposals, leadingProposal } = proposalsByProjectIdAndKey;

    const list: IProjectTableRowData[] = allItemProposals
      .filter(
        (itemProposal) => itemProposal.id !== leadingProposal?.itemProposalId,
      )
      .map((itemProposal) => {
        const {
          creator,
          key,
          value = '',
          projectId,
          createdAt,
          id,
          voteRecords = [],
          ref = '',
        } = itemProposal;

        // 构建符合 IProjectDataItem 结构的数据
        const baseData = {
          key,
          property: key,
          input: value,
          reference: ref ? { key, value: ref } : null,
          submitter: creator,
          createdAt: createdAt,
          projectId: projectId,
          proposalId: id,
          itemTopWeight: getItemTopWeight(key as IPocItemKey),
        };

        // 对于单个item，每人只能投一票, 不需要根据用户去重
        const sumOfWeight = voteRecords.reduce((acc, vote) => {
          return acc + Number(vote.weight);
        }, 0);

        const voterMap = new Map<string, number>();

        voteRecords.forEach((voteRecord) => {
          const userId =
            typeof voteRecord.creator === 'string'
              ? voteRecord.creator
              : (voteRecord.creator as IProfileCreator).userId;
          voterMap.set(
            userId,
            (voterMap.get(userId) || 0) + Number(voteRecord.weight),
          );
        });

        return {
          ...baseData,
          support: {
            count: sumOfWeight,
            voters: voterMap.size,
          },
        };
      });

    // 根据 weight 排序
    return list.sort((a, b) => {
      return b.support.count - a.support.count;
    });
  }, [proposalsByProjectIdAndKey, getItemTopWeight]);

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

  return (
    <div className="flex flex-col gap-5">
      <ItemWeight itemName={itemName} itemWeight={itemWeight} />
      {displayProposalDataOfKey && (
        <div className="flex flex-col gap-2.5">
          {/* Displayed Section */}
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-[5px]">
              <span className="font-mona text-[16px] font-bold leading-tight text-black opacity-80">
                Displayed:
              </span>
              <span className="font-sans text-[13px] font-normal leading-[1.36] text-black opacity-80">
                This is the validated submission currently shown on the project
                page.
              </span>
            </div>

            {/* Displayed Table */}
            <div className="overflow-hidden rounded-[10px] border border-black/10 bg-white">
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
                          className="h-auto border-b-0 border-l-0 border-r border-black/10 bg-[#F5F5F5] px-2.5 py-4"
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
                  {displayedTable.getRowModel().rows.map((row, rowIndex) => (
                    <React.Fragment key={row.id}>
                      <TableRow
                        isLastRow={
                          rowIndex ===
                            displayedTable.getRowModel().rows.length - 1 &&
                          !AllItemConfig[row.original.key as IEssentialItemKey]
                            ?.showExpand
                        }
                        className={
                          cn()
                          // displayedExpandedRows[getRowUniqueId(row.original)]
                          //   ? 'bg-[#EBEBEB]'
                          //   : '',
                        }
                      >
                        {row.getVisibleCells().map((cell, cellIndex) => (
                          <TableCell
                            key={cell.id}
                            width={
                              cell.column.getSize() === 0
                                ? undefined
                                : cell.column.getSize()
                            }
                            isLast={
                              cellIndex === row.getVisibleCells().length - 1
                            }
                            isLastRow={
                              rowIndex ===
                                displayedTable.getRowModel().rows.length - 1 &&
                              !AllItemConfig[
                                row.original.key as IEssentialItemKey
                              ]?.showExpand
                            }
                            className="border-b-0 border-l-0 border-r border-black/10 px-2.5"
                            minHeight={60}
                            style={
                              cell.column.getSize() === 0
                                ? { width: 'auto' }
                                : undefined
                            }
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>

                      <ExpandableRow
                        rowId={getRowUniqueId(row.original)}
                        itemKey={row.original.key}
                        inputValue={row.original.input}
                        isExpanded={
                          displayedExpandedRows[getRowUniqueId(row.original)] ||
                          false
                        }
                        colSpan={row.getVisibleCells().length}
                        isLastRow={
                          rowIndex ===
                          displayedTable.getRowModel().rows.length - 1
                        }
                      />
                    </React.Fragment>
                  ))}
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
            </div>
          </div>
        </div>
      )}

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
              This is the list of submissions available to replace the displayed
              one.
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
      {tableDataOfSubmissionQueue.length === 0 ? (
        <div className="flex items-center justify-center rounded-[10px] border border-black/10 bg-white py-8">
          <span className="font-sans text-[14px] text-black opacity-60">
            No submission queue data available for this item.
          </span>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[10px] border border-black/10 bg-white">
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
                      className="h-auto border-b-0 border-l-0 border-r border-black/10 bg-[#F5F5F5] px-2.5 py-4"
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
              {submissionQueueTable.getRowModel().rows.map((row, rowIndex) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    isLastRow={
                      rowIndex ===
                        submissionQueueTable.getRowModel().rows.length - 1 &&
                      !AllItemConfig[row.original.key as IEssentialItemKey]
                        ?.showExpand
                    }
                    className={
                      cn()
                      // submissionQueueExpandedRows[getRowUniqueId(row.original)]
                      //   ? 'bg-[#EBEBEB]'
                      //   : '',
                    }
                  >
                    {row.getVisibleCells().map((cell, cellIndex) => (
                      <TableCell
                        key={cell.id}
                        width={
                          cell.column.getSize() === 0
                            ? undefined
                            : cell.column.getSize()
                        }
                        isLast={cellIndex === row.getVisibleCells().length - 1}
                        isLastRow={
                          rowIndex ===
                            submissionQueueTable.getRowModel().rows.length -
                              1 &&
                          !AllItemConfig[row.original.key as IEssentialItemKey]
                            ?.showExpand
                        }
                        className="border-b-0 border-l-0 border-r border-black/10 px-2.5"
                        minHeight={60}
                        style={
                          cell.column.getSize() === 0
                            ? { width: 'auto' }
                            : undefined
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
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
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Submit Entry Button */}
      <button className="flex w-full items-center justify-center gap-2.5 rounded-[5px] border border-black/10 bg-[#E6E6E6] px-[30px] py-2.5 transition-colors hover:bg-[#D6D6D6]">
        <span className="font-sans text-[14px] font-semibold text-black">
          Submit an Entry
        </span>
      </button>
    </div>
  );
};

export default SubmissionQueue;
