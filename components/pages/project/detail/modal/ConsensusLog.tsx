'use client';

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { FC, useCallback, useMemo } from 'react';

import { TableCell, TableHeader, TableRow } from '@/components/biz/table';
import { useProjectDetailContext } from '@/components/pages/project/context/projectDetailContext';
import { formatDate } from '@/utils/formatters';

import { useConsensusLogColumns } from './ConsensusLogColumns';
import { useModalContext } from './Context';
import { ConsensusLogRowData } from './types';

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
  // 获取项目数据
  const { project } = useProjectDetailContext();

  // 尝试使用 Modal Context 获取数据，如果不可用则回退到直接调用
  let proposalHistory;
  let isHistoryLoading = false;

  try {
    const modalContext = useModalContext();
    proposalHistory = modalContext.proposalHistory;
    isHistoryLoading = modalContext.isProposalHistoryLoading;
  } catch (error) {
    // Modal context 不可用，使用模拟数据或者可以添加直接的 trpc 调用作为回退
    proposalHistory = undefined;
    isHistoryLoading = false;
  }

  // 根据 itemKey 从项目数据中获取真实数据
  const tableData: ConsensusLogRowData[] = useMemo(() => {
    if (!project || !itemKey) {
      console.log('ConsensusLog: Missing project or itemKey', {
        project: !!project,
        itemKey,
      });
      return [];
    }

    console.log(
      'ConsensusLog: Processing data for itemKey:',
      itemKey,
      'project:',
      project.name,
      'proposalHistory:',
      proposalHistory,
      'isHistoryLoading:',
      isHistoryLoading,
    );

    // 如果有真实的投票历史数据，使用它们
    if (proposalHistory && proposalHistory.length > 0) {
      return proposalHistory.map((log, index) => {
        const createdAt = new Date(log.createdAt);
        const creator = log.proposal?.creator || log.itemProposal?.creator;

        // 计算权重变化（这里使用模拟数据，实际应该从投票记录中计算）
        const baseWeight = 100;
        const weightChange = Math.floor(Math.random() * 50) + 10;
        const isPositive = Math.random() > 0.3; // 70% 概率为正数

        return {
          id: `consensus-${log.id}`,
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
          input: `Vote action ${index + 1}`,
          leadBy: {
            name: creator?.username || 'Unknown User',
            date: formatDate(createdAt),
          },
          weight: {
            current: (
              baseWeight + (isPositive ? weightChange : -weightChange)
            ).toString(),
            change: `${isPositive ? '+' : '-'}${weightChange}`,
          },
        };
      });
    }

    // 如果没有真实数据，使用模拟数据
    const mockConsensusData: ConsensusLogRowData[] = [
      {
        id: 'consensus-1',
        dateTime: {
          date: '00/00/0000',
          time: '00:00 GMT',
        },
        input: 'Vote action 1',
        leadBy: {
          name: 'Username',
          date: '00/00/0000',
        },
        weight: {
          current: '000',
          change: '+00',
        },
      },
      {
        id: 'consensus-2',
        dateTime: {
          date: '00/00/0000',
          time: '00:00 GMT',
        },
        input: 'Vote action 2',
        leadBy: {
          name: 'Username',
          date: '00/00/0000',
        },
        weight: {
          current: '000',
          change: '+00',
        },
      },
      {
        id: 'consensus-3',
        dateTime: {
          date: '00/00/0000',
          time: '00:00 GMT',
        },
        input: 'Vote action 3',
        leadBy: {
          name: 'Username',
          date: '00/00/0000',
        },
        weight: {
          current: '000',
          change: '+00',
        },
      },
      {
        id: 'consensus-4',
        dateTime: {
          date: '00/00/0000',
          time: '00:00 GMT',
        },
        input: 'Vote action 4',
        leadBy: {
          name: 'Username',
          date: '00/00/0000',
        },
        weight: {
          current: '000',
          change: '+00',
        },
      },
      {
        id: 'consensus-5',
        dateTime: {
          date: '00/00/0000',
          time: '00:00 GMT',
        },
        input: 'Vote action 5',
        leadBy: {
          name: 'Username',
          date: '00/00/0000',
        },
        weight: {
          current: '000',
          change: '+00',
        },
      },
    ];

    return mockConsensusData;
  }, [project, itemKey, proposalHistory, isHistoryLoading]);

  // Event handlers
  const handleExpandClick = useCallback((rowId: string) => {
    console.log('Expand clicked for row:', rowId);
    // TODO: Implement expand/collapse functionality
  }, []);

  // Create columns
  const columns = useConsensusLogColumns({
    onExpandClick: handleExpandClick,
  });

  // Create table instance
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Vote History Header */}
      <div className="flex flex-col gap-[5px]">
        <span className="font-mona text-[16px] font-bold leading-tight text-black opacity-80">
          Vote History:
        </span>
        <span className="font-sans text-[13px] font-normal leading-[1.36] text-black opacity-80">
          This is the validated submission currently shown on the project page.
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[10px] border border-black/10 bg-white">
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
            {table.getRowModel().rows.map((row, rowIndex) => (
              <TableRow
                key={row.id}
                isLastRow={rowIndex === table.getRowModel().rows.length - 1}
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
                    className="border-b-0 border-l-0 border-r border-black/10 px-2.5"
                    minHeight={60}
                    style={
                      cell.column.getSize() === 0
                        ? { width: 'auto' }
                        : undefined
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConsensusLog;
