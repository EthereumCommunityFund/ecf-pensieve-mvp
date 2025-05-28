'use client';

import { cn } from '@heroui/react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import React, { FC, useCallback, useMemo, useState } from 'react';

import { TableCell, TableHeader, TableRow } from '@/components/biz/table';
import InputContentRenderer from '@/components/biz/table/InputContentRenderer';
import { CaretUpDownIcon } from '@/components/icons';
import { AllItemConfig } from '@/constants/itemConfig';
import { useAuth } from '@/context/AuthContext';
import { IProfileCreator } from '@/types';
import { IEssentialItemKey, IPocItemKey } from '@/types/item';

import { useProjectDetailContext } from '../../context/projectDetailContext';

import { useModalContext } from './ModalContext';
import { useDisplayedColumns } from './SubmissionQueueColumns';
import { ITableMeta, TableRowData } from './types';

interface SubmissionQueueProps {
  itemName?: string;
  itemWeight?: number;
  itemKey?: string;
}

const SubmissionQueue: FC<SubmissionQueueProps> = ({
  itemName = 'ItemName',
  itemWeight = 22,
  itemKey,
}) => {
  const { profile } = useAuth();

  const [isCollapsed, setIsCollapsed] = useState(false);

  // 展开行状态管理
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // 获取项目数据
  const { displayProposalData, project, getItemTopWeight } =
    useProjectDetailContext();

  const {
    inActionKeyMap,
    onCreateItemProposalVote,
    onSwitchItemProposalVote,
    onCancelVote,
    proposalsByKey,
  } = useModalContext();

  // 根据 itemKey 从 displayProposalData 中获取真实数据
  const tableDataOfDisplayed: TableRowData[] = useMemo(() => {
    if (!displayProposalData || !itemKey) {
      return [];
    }

    // 从 displayProposalData 中找到对应 itemKey 的数据
    const proposalItem = displayProposalData.find(
      (item) => item.key === itemKey,
    );

    if (!proposalItem) {
      return [];
    }

    // TODO Fake data 需要根据实际投票数据调整
    const sumOfWeight = 5;
    const voterMemberCount = 3;

    const tableRowData: TableRowData = {
      ...proposalItem, // 继承所有 IProjectDataItem 字段
      support: {
        count: sumOfWeight,
        voters: voterMemberCount,
      },
    };

    return [tableRowData];
  }, [displayProposalData, itemKey]);

  const tableDataOfSubmissionQueue: TableRowData[] = useMemo(() => {
    if (!proposalsByKey) return [];
    const { allItemProposals } = proposalsByKey;

    const list: TableRowData[] = allItemProposals.map((itemProposal) => {
      const {
        creator,
        key,
        value = '',
        reason = '',
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

    return list;
  }, [proposalsByKey, getItemTopWeight]);

  const toggleRowExpanded = useCallback((key: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const handleReferenceClick = useCallback((rowId: string) => {
    console.log('Reference clicked for row:', rowId);
    // TODO: Implement reference modal or action
  }, []);

  const handleCollapseAll = useCallback(() => {
    setIsCollapsed(!isCollapsed);
    console.log('Collapse all clicked:', !isCollapsed);
  }, [isCollapsed]);

  const handleExpandClick = useCallback((rowId: string) => {
    console.log('Expand clicked for row:', rowId);
    // TODO: Implement expand/collapse functionality
  }, []);

  const columns = useDisplayedColumns({
    onReferenceClick: handleReferenceClick,
    onExpandClick: handleExpandClick,
    expandedRows,
    toggleRowExpanded,
  });

  const tableMeta = useMemo(() => {
    return {
      project,
      displayProposalData,
      proposalsByKey,
      onCreateItemProposalVote,
      onSwitchItemProposalVote,
      onCancelVote,
      profile,
    } as ITableMeta;
  }, [
    project,
    displayProposalData,
    proposalsByKey,
    onCreateItemProposalVote,
    onSwitchItemProposalVote,
    onCancelVote,
    profile,
  ]);

  const displayedTable = useReactTable({
    data: tableDataOfDisplayed,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    meta: tableMeta,
  });

  const submissionQueueTable = useReactTable({
    data: tableDataOfSubmissionQueue,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    meta: tableMeta,
  });

  return (
    <div className="flex flex-col gap-5">
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
              {displayedTable.getRowModel().rows.map((row, rowIndex) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    isLastRow={
                      rowIndex ===
                        displayedTable.getRowModel().rows.length - 1 &&
                      !AllItemConfig[row.original.key as IEssentialItemKey]
                        ?.showExpand
                    }
                    className={cn(
                      expandedRows[row.original.key] ? 'bg-[#EBEBEB]' : '',
                    )}
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
                            displayedTable.getRowModel().rows.length - 1 &&
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

                  {AllItemConfig[row.original.key as IEssentialItemKey]
                    ?.showExpand && (
                    <TableRow
                      key={`${row.id}-expanded`}
                      className={cn(
                        expandedRows[row.original.key] ? '' : 'hidden',
                      )}
                    >
                      <TableCell
                        className={`border-b border-black/10 bg-[#E1E1E1] p-[10px] ${
                          rowIndex ===
                          displayedTable.getRowModel().rows.length - 1
                            ? 'border-b-0'
                            : ''
                        }`}
                        style={{
                          width: '100%',
                          gridColumn: `1 / ${row.getVisibleCells().length + 1}`,
                        }}
                      >
                        <div className="w-full overflow-hidden rounded-[10px] border border-black/10 bg-white text-[13px]">
                          <p className="p-[10px] font-[mona] text-[15px] leading-[20px] text-black">
                            <InputContentRenderer
                              value={row.original.input}
                              itemKey={row.original.key as IPocItemKey}
                              displayFormType={
                                AllItemConfig[
                                  row.original.key as IEssentialItemKey
                                ]!.formDisplayType
                              }
                              isEssential={
                                AllItemConfig[
                                  row.original.key as IEssentialItemKey
                                ]!.isEssential
                              }
                            />
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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

        {/* Collapse All Button */}
        <button
          onClick={handleCollapseAll}
          className="flex items-center gap-[5px] rounded-[5px] bg-black/5 px-2.5 py-[5px] transition-colors hover:bg-black/10"
        >
          <CaretUpDownIcon size={16} className="opacity-80" />
          <span className="font-sans text-[13px] font-semibold text-black opacity-80">
            Collapse All Items
          </span>
        </button>
      </div>

      {/* Table */}
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
                  className={cn(
                    expandedRows[row.original.key] ? 'bg-[#EBEBEB]' : '',
                  )}
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
                          submissionQueueTable.getRowModel().rows.length - 1 &&
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

                {AllItemConfig[row.original.key as IEssentialItemKey]
                  ?.showExpand && (
                  <TableRow
                    key={`${row.id}-expanded`}
                    className={cn(
                      expandedRows[row.original.key] ? '' : 'hidden',
                    )}
                  >
                    <TableCell
                      className={`border-b border-black/10 bg-[#E1E1E1] p-[10px] ${
                        rowIndex ===
                        submissionQueueTable.getRowModel().rows.length - 1
                          ? 'border-b-0'
                          : ''
                      }`}
                      style={{
                        width: '100%',
                        gridColumn: `1 / ${row.getVisibleCells().length + 1}`,
                      }}
                    >
                      <div className="w-full overflow-hidden rounded-[10px] border border-black/10 bg-white text-[13px]">
                        <p className="p-[10px] font-[mona] text-[15px] leading-[20px] text-black">
                          <InputContentRenderer
                            value={row.original.input}
                            itemKey={row.original.key as IPocItemKey}
                            displayFormType={
                              AllItemConfig[
                                row.original.key as IEssentialItemKey
                              ]!.formDisplayType
                            }
                            isEssential={
                              AllItemConfig[
                                row.original.key as IEssentialItemKey
                              ]!.isEssential
                            }
                          />
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

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
