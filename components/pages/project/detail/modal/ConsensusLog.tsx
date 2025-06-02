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
  TableHeader,
  TableRow,
} from '@/components/biz/table';
import OptimizedTableCell from '@/components/biz/table/OptimizedTableCell';
import { useProjectDetailContext } from '@/components/pages/project/context/projectDetailContext';
import { AllItemConfig } from '@/constants/itemConfig';
import { IEssentialItemKey } from '@/types/item';
import { formatDate } from '@/utils/formatters';

import { IConsensusLogRowData } from '../types';

import { useConsensusLogColumns } from './ConsensusLogColumns';
import { ModalTableSkeleton } from './ModalTableSkeleton';

interface ConsensusLogProps {
  itemName?: string;
  itemWeight?: number;
  itemKey?: string;
}

const ConsensusLog: FC<ConsensusLogProps> = ({
  itemName = 'ItemName',
  itemWeight = 22,
  itemKey,
}) => {
  // 展开行状态管理
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // 获取项目数据
  const {
    proposalHistory,
    isProposalHistoryLoading,
    isProposalHistoryFetched,
  } = useProjectDetailContext();

  // 根据 itemKey 从 proposalHistory 中获取真实数据
  const tableData: IConsensusLogRowData[] = useMemo(() => {
    if (!itemKey) {
      console.log('ConsensusLog: Missing itemKey', { itemKey });
      return [];
    }

    if (!proposalHistory) {
      console.log('ConsensusLog: No proposalHistory data available');
      return [];
    }

    if (!proposalHistory || proposalHistory.length === 0) {
      console.log('ConsensusLog: No proposalHistory data available');
      return [];
    }

    console.log(
      'ConsensusLog: Processing proposalHistory for itemKey:',
      itemKey,
      'proposalHistory:',
      proposalHistory,
    );

    // 按照 createdAt 时间倒序排列
    const sortedHistory = [...proposalHistory].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return sortedHistory.map((historyItem, index) => {
      const createdAt = new Date(historyItem.createdAt);

      // 获取创建者信息，可能来自 proposal 或 itemProposal
      const creator =
        historyItem.proposal?.creator || historyItem.itemProposal?.creator;

      // 获取投票记录，可能来自 proposal 或 itemProposal
      const voteRecords =
        historyItem.proposal?.voteRecords ||
        historyItem.itemProposal?.voteRecords ||
        [];

      // 计算当前权重
      const currentWeight = voteRecords.reduce((acc: number, vote: any) => {
        return acc + Number(vote.weight || 0);
      }, 0);

      // 计算权重变化（这里简化处理，实际可能需要更复杂的逻辑）
      const weightChange =
        index === sortedHistory.length - 1
          ? currentWeight // 第一个提案，权重变化就是当前权重
          : Math.abs(
              currentWeight -
                (sortedHistory[index + 1]?.proposal?.voteRecords?.reduce(
                  (acc: number, vote: any) => acc + Number(vote.weight || 0),
                  0,
                ) ||
                  sortedHistory[index + 1]?.itemProposal?.voteRecords?.reduce(
                    (acc: number, vote: any) => acc + Number(vote.weight || 0),
                    0,
                  ) ||
                  0),
            );

      const isPositive =
        index === sortedHistory.length - 1 || currentWeight > 0;

      // 获取输入值，可能来自 proposal 的 items 或 itemProposal 的 value
      let inputValue = 'No input provided';
      if (historyItem.itemProposal?.value) {
        inputValue =
          typeof historyItem.itemProposal.value === 'string'
            ? historyItem.itemProposal.value
            : JSON.stringify(historyItem.itemProposal.value);
      } else if (historyItem.proposal?.items) {
        // 从 proposal 的 items 中找到对应 key 的值
        const item = historyItem.proposal.items.find(
          (item: any) => item.key === itemKey,
        );
        if (item && (item as any).value) {
          inputValue =
            typeof (item as any).value === 'string'
              ? (item as any).value
              : JSON.stringify((item as any).value);
        }
      }

      return {
        id: `consensus-${historyItem.id}`,
        dateTime: {
          date: formatDate(createdAt),
          time:
            createdAt.toLocaleTimeString('en-US', {
              hour12: false,
              timeZone: 'GMT',
              hour: '2-digit',
              minute: '2-digit',
            }) + ' GMT',
        },
        input: inputValue,
        leadBy: {
          name: creator?.name || 'Unknown User',
          date: formatDate(createdAt),
          avatar: creator?.avatarUrl || undefined,
          userId: creator?.userId || undefined,
        },
        weight: {
          current: currentWeight.toString(),
          change: `${isPositive ? '+' : '-'}${weightChange}`,
        },
      };
    });
  }, [itemKey, proposalHistory]);

  // 切换行展开状态
  const toggleRowExpanded = useCallback((key: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  // Event handlers
  const handleExpandClick = useCallback(
    (rowId: string) => {
      console.log('Expand clicked for row:', rowId);
      toggleRowExpanded(rowId);
    },
    [toggleRowExpanded],
  );

  // Create table meta
  const coreTableMeta = useMemo(
    () => ({
      expandedRows,
      toggleRowExpanded,
    }),
    [expandedRows, toggleRowExpanded],
  );

  // Create columns
  const columns = useConsensusLogColumns({
    onExpandClick: handleExpandClick,
    itemKey,
  });

  // Create table instance
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: coreTableMeta,
  });

  // Loading state
  if (isProposalHistoryLoading) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-[5px]">
          <span className="font-mona text-[16px] font-bold leading-tight text-black opacity-80">
            Vote History:
          </span>
          <span className="font-sans text-[13px] font-normal leading-[1.36] text-black opacity-80">
            Loading consensus log data...
          </span>
        </div>
        <ModalTableSkeleton
          rowCount={4}
          columns={[
            { header: 'Date / Time', width: 180 },
            { header: 'Input', width: 480 },
            { header: 'Submitter', width: 183 },
            { header: 'Weight-at-time', width: 200, isLast: true },
          ]}
        />
      </div>
    );
  }

  // Error state
  if (isProposalHistoryFetched && !proposalHistory) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-[5px]">
          <span className="font-mona text-[16px] font-bold leading-tight text-black opacity-80">
            Vote History:
          </span>
          <span className="font-sans text-[13px] font-normal leading-[1.36] text-black opacity-80">
            Failed to load consensus log data.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Vote History Header */}
      <div className="flex flex-col gap-[5px]">
        <span className="font-mona text-[16px] font-bold leading-tight text-black opacity-80">
          Vote History:
        </span>
        <span className="font-sans text-[13px] font-normal leading-[1.36] text-black opacity-80">
          This shows the consensus log for all item proposals related to this
          key.
        </span>
      </div>

      {/* Table */}
      {tableData.length === 0 ? (
        <div className="flex items-center justify-center rounded-[10px] border border-black/10 bg-white py-8">
          <span className="font-sans text-[14px] text-black opacity-60">
            No consensus log data available for this item.
          </span>
        </div>
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
                      isLast={index === headerGroup.headers.length - 1}
                      isContainerBordered={true}
                      className="h-auto bg-[#F5F5F5] px-2.5 py-4"
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
                      (rowIndex === table.getRowModel().rows.length - 1 &&
                        !itemKey) ||
                      !AllItemConfig[itemKey as IEssentialItemKey]?.showExpand
                    }
                    className={cn(
                      expandedRows[row.original.id] ? 'bg-[#EBEBEB]' : '',
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
                          (rowIndex === table.getRowModel().rows.length - 1 &&
                            !itemKey) ||
                          !AllItemConfig[itemKey as IEssentialItemKey]
                            ?.showExpand
                        }
                        isContainerBordered={true}
                        className="px-2.5"
                        minHeight={60}
                        style={
                          cell.column.getSize() === 0
                            ? { width: 'auto' }
                            : undefined
                        }
                      />
                    ))}
                  </TableRow>

                  {/* 可展开行 */}
                  {itemKey && (
                    <ExpandableRow
                      rowId={row.original.id}
                      itemKey={itemKey}
                      inputValue={row.original.input}
                      isExpanded={expandedRows[row.original.id] || false}
                      colSpan={row.getVisibleCells().length}
                      isLastRow={
                        rowIndex === table.getRowModel().rows.length - 1
                      }
                    />
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </ModalTableContainer>
      )}
    </div>
  );
};

export default ConsensusLog;
