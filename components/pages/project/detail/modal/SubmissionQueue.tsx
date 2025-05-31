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

import { useSubmissionQueueColumns } from './SubmissionQueueColumns';

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

  // 分别管理两个表格的展开状态
  const [displayedExpandedRows, setDisplayedExpandedRows] = useState<
    Record<string, boolean>
  >({});
  const [submissionQueueExpandedRows, setSubmissionQueueExpandedRows] =
    useState<Record<string, boolean>>({});

  // 辅助函数：生成唯一标识符
  const getRowUniqueId = useCallback((rowData: IProjectTableRowData) => {
    // 优先使用 proposalId，如果没有则用 key + 其他标识符组合
    return rowData.proposalId
      ? `proposal-${rowData.proposalId}`
      : `key-${rowData.key}`;
  }, []);

  // 获取项目数据
  const {
    displayProposalDataListOfProject,
    project,
    getItemTopWeight,
    onCreateItemProposalVote,
    onSwitchItemProposalVote,
    onCancelVote,
    proposalsByProjectIdAndKey,
    voteResultOfLeadingProposal,
    displayProposalDataOfKey,
    showReferenceModal,
  } = useProjectDetailContext();

  const tableDataOfDisplayed: IProjectTableRowData[] = useMemo(() => {
    if (!displayProposalDataOfKey) return [];
    return [displayProposalDataOfKey];
  }, [displayProposalDataOfKey]);

  const tableDataOfSubmissionQueue: IProjectTableRowData[] = useMemo(() => {
    if (!proposalsByProjectIdAndKey) return [];
    const { allItemProposals } = proposalsByProjectIdAndKey;

    const list: IProjectTableRowData[] = allItemProposals.map(
      (itemProposal) => {
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
      },
    );

    // 根据 weight 排序
    return list.sort((a, b) => {
      return b.support.count - a.support.count;
    });
  }, [proposalsByProjectIdAndKey, getItemTopWeight]);

  // 为 Displayed Table 创建独立的 toggle 函数
  const toggleDisplayedRowExpanded = useCallback((uniqueId: string) => {
    setDisplayedExpandedRows((prev) => ({
      ...prev,
      [uniqueId]: !prev[uniqueId],
    }));
  }, []);

  // 为 Submission Queue Table 创建独立的 toggle 函数
  const toggleSubmissionQueueRowExpanded = useCallback((uniqueId: string) => {
    setSubmissionQueueExpandedRows((prev) => ({
      ...prev,
      [uniqueId]: !prev[uniqueId],
    }));
  }, []);

  // 检查 Submission Queue 表格是否有任何行已展开
  const hasSubmissionQueueExpandedRows = useMemo(() => {
    return Object.values(submissionQueueExpandedRows).some(Boolean);
  }, [submissionQueueExpandedRows]);

  // 获取 Submission Queue 表格中所有可展开的行的 ID
  const getSubmissionQueueExpandableRowIds = useCallback(() => {
    const submissionQueueRowIds: string[] = [];

    // 获取 Submission Queue 表格中可展开的行
    tableDataOfSubmissionQueue.forEach((rowData) => {
      const itemConfig = AllItemConfig[rowData.key as IEssentialItemKey];
      if (itemConfig?.showExpand) {
        submissionQueueRowIds.push(getRowUniqueId(rowData));
      }
    });

    return submissionQueueRowIds;
  }, [tableDataOfSubmissionQueue, getRowUniqueId]);

  const handleCollapseAll = useCallback(() => {
    const submissionQueueRowIds = getSubmissionQueueExpandableRowIds();

    if (hasSubmissionQueueExpandedRows) {
      // 如果有展开的行，则全部收起
      setSubmissionQueueExpandedRows({});
    } else {
      // 如果没有展开的行，则全部展开
      const newSubmissionQueueExpanded: Record<string, boolean> = {};

      submissionQueueRowIds.forEach((id) => {
        newSubmissionQueueExpanded[id] = true;
      });

      setSubmissionQueueExpandedRows(newSubmissionQueueExpanded);
    }
  }, [hasSubmissionQueueExpandedRows, getSubmissionQueueExpandableRowIds]);

  const columns = useSubmissionQueueColumns();

  // 为 Displayed Table 创建独立的 tableMeta
  const displayedTableMeta = useMemo(() => {
    return {
      project,
      displayProposalDataListOfProject,
      proposalsByProjectIdAndKey,
      onCreateItemProposalVote,
      onSwitchItemProposalVote,
      onCancelVote,
      profile,
      voteResultOfLeadingProposal,
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
    voteResultOfLeadingProposal,
    showReferenceModal,
    displayedExpandedRows,
    toggleDisplayedRowExpanded,
  ]);

  // 为 Submission Queue Table 创建独立的 tableMeta
  const submissionQueueTableMeta = useMemo(() => {
    return {
      project,
      displayProposalDataListOfProject,
      proposalsByProjectIdAndKey,
      onCreateItemProposalVote,
      onSwitchItemProposalVote,
      onCancelVote,
      profile,
      voteResultOfLeadingProposal,
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
    voteResultOfLeadingProposal,
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
                    className={cn()
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
                      rowIndex === displayedTable.getRowModel().rows.length - 1
                    }
                  />
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
            {hasSubmissionQueueExpandedRows
              ? 'Collapse All Items'
              : 'Expand All Items'}
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
                  className={cn()
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

                <ExpandableRow
                  rowId={getRowUniqueId(row.original)}
                  itemKey={row.original.key}
                  inputValue={row.original.input}
                  isExpanded={
                    submissionQueueExpandedRows[getRowUniqueId(row.original)] ||
                    false
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
