'use client';

import { cn } from '@heroui/react';
import { Info, Tray } from '@phosphor-icons/react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';

import {
  PageTableContainer,
  TableCell,
  TableCellSkeleton,
  TableHeader,
  TableRow,
  TableRowSkeleton,
} from '@/components/biz/table';
import { extractProjectIds } from '@/components/biz/table/ProjectFieldRenderer';
import { useOptimizedProjectsByIds } from '@/hooks/useOptimizedProjectsByIds';

interface EcosystemTableProps<T extends Record<string, any>> {
  id: string;
  title: string;
  description: string;
  filterButtonText: string;
  data: T[];
  columns: ColumnDef<T>[];
  projectId?: number;
  isDataFetched?: boolean;
}

function EcosystemTable<T extends Record<string, any>>({
  id,
  title,
  description,
  filterButtonText,
  data,
  columns,
  isDataFetched = true,
}: EcosystemTableProps<T>) {
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize after component mount to avoid state update during render
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Extract project IDs from the data using shared helper
  const projectIds = useMemo(() => {
    if (!isInitialized) return [];
    return extractProjectIds(data, 'project');
  }, [data, isInitialized]);

  const { projectsMap, isLoading: isLoadingProjects } =
    useOptimizedProjectsByIds(projectIds);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      projectsMap,
      isLoadingProjects,
    },
  });

  return (
    <div id={id} className="mb-[48px]">
      <div className="-mb-px flex items-center justify-between rounded-t-[10px] border border-b-0 border-black/10 bg-[rgba(229,229,229,0.70)] p-[10px]">
        <div className="flex flex-col gap-[5px]">
          <p className="text-[18px] font-[700] leading-[25px] text-black/80">
            {title}
          </p>
          <p className="text-[13px] font-[400] leading-[18px] text-black/40">
            {description}
          </p>
        </div>
        {/* <div className="flex items-center gap-[10px]">
          <button className="flex items-center gap-[5px] rounded-[5px] bg-black/[0.05] px-[10px] py-[5px] text-[13px] font-[600] text-black/80 transition-colors hover:bg-black/[0.08]">
            <CaretUpDown size={16} weight="bold" className="opacity-50" />
            <span>{filterButtonText}</span>
          </button>
          <button className="flex items-center gap-[5px] rounded-[5px] bg-black/[0.05] px-[10px] py-[5px] text-[13px] font-[600] text-black/80 transition-colors hover:bg-black/[0.08]">
            <CaretUpDown size={16} weight="bold" className="opacity-50" />
            <span>Collapse Items</span>
          </button>
        </div> */}
      </div>

      <PageTableContainer className="overflow-hidden rounded-b-[10px] border border-t-0 border-black/10">
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
                      <div className="flex items-center gap-[6px]">
                        <span className="text-[13px] font-[500] text-black/80">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </span>
                        {header.column.id !== 'page' && (
                          <Info
                            size={14}
                            weight="regular"
                            className="text-black/30"
                          />
                        )}
                      </div>
                    </TableHeader>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {!isDataFetched ? (
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
              <tr>
                <td
                  colSpan={columns.length}
                  className="bg-white py-12 text-center"
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
      </PageTableContainer>
    </div>
  );
}

export default EcosystemTable;
