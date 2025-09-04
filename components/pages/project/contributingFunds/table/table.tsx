'use client';

import { cn } from '@heroui/react';
import { CaretDown, CaretUp, Tray } from '@phosphor-icons/react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { FC, useMemo, useState } from 'react';

import TooltipWithQuestionIcon from '@/components/biz/FormAndTable/TooltipWithQuestionIcon';
import {
  TableCell,
  TableCellSkeleton,
  TableHeader,
  TableRow,
  TableRowSkeleton,
} from '@/components/biz/table';
import { extractProjectIds } from '@/components/biz/table/ProjectFieldRenderer';
import CaretUpDown from '@/components/icons/CaretUpDown';
import { useOptimizedProjectsByIds } from '@/hooks/useOptimizedProjectsByIds';
import { IPocItemKey } from '@/types/item';

import { useProjectTableData } from '../../detail/table/hooks/useProjectTableData';

import { GrantType, useGrantColumns } from './columns';
import { useGivenGrantsData } from './hooks/useGivenGrantsData';

interface GrantsTableProps {
  projectId: number;
  type: GrantType;
  onOpenModal?: (
    itemKey: IPocItemKey,
    contentType?: 'viewItemProposal' | 'submitPropose',
  ) => void;
}

const GrantsTable: FC<GrantsTableProps> = ({
  projectId,
  type,
  onOpenModal,
}) => {
  const columns = useGrantColumns(type);

  // Sorting state
  const [sorting, setSorting] = useState<SortingState>([]);

  // Collapsed state for controlling visibility
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { getItemRowData, isDataFetched } = useProjectTableData();
  const { data: givenGrantsData, isLoading: isLoadingGiven } =
    useGivenGrantsData(projectId);

  const receivedGrantsData = useMemo(() => {
    if (!isDataFetched || type === 'given') return [];
    return getItemRowData('funding_received_grants');
  }, [getItemRowData, isDataFetched, type]);

  const data = useMemo(() => {
    if (type === 'given') {
      return givenGrantsData;
    }
    if (!isDataFetched) return [];
    return receivedGrantsData;
  }, [type, receivedGrantsData, givenGrantsData, isDataFetched]);

  // Extract project IDs from grants data using shared helper
  const projectIds = useMemo(() => {
    // For grants, extract from organization and projectDonator fields
    return extractProjectIds(data, ['organization', 'projectDonator']);
  }, [data]);

  const { projectsMap, isLoading: isLoadingProjects } =
    useOptimizedProjectsByIds(projectIds);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    meta: {
      projectsMap,
      isLoadingProjects,
    },
  });

  const isGivenType = type === 'given';

  const title = isGivenType ? 'Given (Grants)' : 'Received (Grants)';
  const description = isGivenType
    ? 'Externally documented when, to whom, and how much funding this project has provided.'
    : 'Document when, from whom, and how much funding this project has received.';
  const showActionButtons = type === 'received';

  // Determine if we should show skeleton
  const isLoading = isGivenType ? isLoadingGiven : !isDataFetched;

  // Get current sorting state for UI display
  const currentSort = sorting[0];
  const isSortingByTime = currentSort?.id === 'date';
  const isSortingByAmount = currentSort?.id === 'amount';
  const sortDirection = currentSort?.desc ? 'desc' : 'asc';

  // Handle sorting button clicks
  const handleTimeSort = () => {
    if (isSortingByTime) {
      // If already sorting by time, toggle direction
      setSorting([{ id: 'date', desc: !currentSort.desc }]);
    } else {
      // Start sorting by time ascending
      setSorting([{ id: 'date', desc: false }]);
    }
  };

  const handleAmountSort = () => {
    if (isSortingByAmount) {
      // If already sorting by amount, toggle direction
      setSorting([{ id: 'amount', desc: !currentSort.desc }]);
    } else {
      // Start sorting by amount ascending
      setSorting([{ id: 'amount', desc: false }]);
    }
  };

  // Handle expand/collapse toggle
  const handleExpandCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="mb-[20px]">
      {/* Category Header - matching CategoryHeader.tsx style */}
      <div className="-mb-px flex items-center justify-between rounded-t-[10px] border border-b-0 border-black/10 bg-[rgba(229,229,229,0.70)] p-[10px]">
        <div className="flex flex-col gap-[5px]">
          <p className="text-[18px] font-[700] leading-[25px] text-black/80">
            {title}
            {isGivenType && (
              <span className="ml-[10px] inline-flex h-[22px] items-center gap-[5px] rounded-[5px] bg-[#DCDCDC] px-[6px] text-[13px] font-[400] text-black/50">
                Externally Linked
                <TooltipWithQuestionIcon
                  content={`These claimed entries are linked and validated by users from other projects on Pensieve. `}
                />
              </span>
            )}
          </p>
          <p className="text-[13px] font-[400] leading-[18px] text-black/40">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-[10px]">
          <button
            onClick={handleTimeSort}
            className="flex items-center gap-[5px] rounded-[5px] bg-black/[0.05] px-[10px] py-[5px] text-[13px] font-[600] text-black/80 transition-colors hover:bg-black/[0.08]"
          >
            {isSortingByTime ? (
              sortDirection === 'asc' ? (
                <CaretUp size={16} />
              ) : (
                <CaretDown size={16} />
              )
            ) : (
              <CaretUpDown size={16} className="opacity-50" />
            )}
            <span>Time</span>
          </button>
          <button
            onClick={handleAmountSort}
            className="flex items-center gap-[5px] rounded-[5px] bg-black/[0.05] px-[10px] py-[5px] text-[13px] font-[600] text-black/80 transition-colors hover:bg-black/[0.08]"
          >
            {isSortingByAmount ? (
              sortDirection === 'asc' ? (
                <CaretUp size={16} />
              ) : (
                <CaretDown size={16} />
              )
            ) : (
              <CaretUpDown size={16} className="opacity-50" />
            )}
            <span>Amount</span>
          </button>
          <button
            onClick={handleExpandCollapse}
            className="flex items-center gap-[5px] rounded-[5px] bg-black/[0.05] px-[10px] py-[5px] text-[13px] font-[600] text-black/80 transition-colors hover:bg-black/[0.08]"
          >
            {isCollapsed ? <CaretDown size={16} /> : <CaretUp size={16} />}
            <span>{isCollapsed ? 'Expand Items' : 'Collapse Items'}</span>
          </button>
        </div>
      </div>

      {showActionButtons && (
        <div className="flex items-center gap-[10px] border-x border-black/10 bg-[rgba(229,229,229,0.70)] px-[10px] pb-[10px]">
          {/* <button
        onClick={() => {
          // Open modal for viewing funding_received_grants item proposals
          onOpenModal?.('funding_received_grants', 'viewItemProposal');
        }}
        className="flex h-[30px] items-center justify-center rounded-[5px] border border-black/10 bg-[#DCDCDC] px-[10px] text-[13px] font-[400] leading-[18px] text-black transition-colors hover:bg-[#C8C8C8]"
      >
        View Item
      </button> */}
          {}
          <button
            onClick={() => {
              onOpenModal?.('funding_received_grants', 'submitPropose');
            }}
            className="flex h-[30px] items-center justify-center rounded-[5px] border border-black/10 bg-[#DCDCDC] px-[10px] text-[13px] font-[400] leading-[18px] text-black transition-colors hover:bg-[#C8C8C8]"
          >
            Propose Entry
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-b-[10px] border border-t-0 border-black/10">
        {/* <PageTableContainer > */}
        <table className="w-full border-separate border-spacing-0">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-black/10 bg-[#F5F5F5]"
              >
                {headerGroup.headers.map((header, index) => {
                  const isLast = index === headerGroup.headers.length - 1;
                  return (
                    <TableHeader
                      key={header.id}
                      className={cn(
                        'h-[48px] px-[16px] py-[14px] text-left',
                        !isLast && 'border-r border-black/5',
                      )}
                      style={{
                        width: header.getSize(),
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </TableHeader>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              // Skeleton rows when loading
              Array.from({ length: 4 }).map((_, rowIndex) => (
                <TableRowSkeleton
                  key={`skeleton-row-${rowIndex}`}
                  isLastRow={rowIndex === 3}
                >
                  {columns.map((column, cellIndex) => {
                    const isLast = cellIndex === columns.length - 1;
                    return (
                      <TableCellSkeleton
                        key={`skeleton-cell-${column.id}-${rowIndex}`}
                        width={column.size || column.minSize}
                        isLast={isLast}
                        isLastRow={rowIndex === 3}
                        isContainerBordered={true}
                        minHeight={56}
                        skeletonHeight={20}
                        className={cn(!isLast && 'border-r border-black/5')}
                      />
                    );
                  })}
                </TableRowSkeleton>
              ))
            ) : data.length === 0 ? (
              // Empty state
              <tr className={cn(isCollapsed && 'hidden')}>
                <td
                  colSpan={columns.length}
                  className="bg-white py-6 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Tray size={48} weight="thin" className="text-black/20" />
                    <p className="text-[14px] font-[400] text-black/40">
                      No data
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              // Actual data rows
              table.getRowModel().rows.map((row, rowIndex) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    rowIndex < table.getRowModel().rows.length - 1
                      ? 'border-b border-black/5'
                      : '',
                    'bg-white transition-colors hover:bg-black/[0.02]',
                    isCollapsed && 'hidden',
                  )}
                >
                  {row.getVisibleCells().map((cell, cellIndex) => {
                    const isLast =
                      cellIndex === row.getVisibleCells().length - 1;
                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(!isLast && 'border-r border-black/5')}
                        style={{
                          width: cell.column.getSize(),
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </tbody>
        </table>
        {/* </PageTableContainer> */}
      </div>
    </div>
  );
};

export default GrantsTable;
