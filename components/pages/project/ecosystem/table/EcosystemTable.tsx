'use client';

import { cn } from '@heroui/react';
import { Tray } from '@phosphor-icons/react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  TableCell,
  TableCellSkeleton,
  TableHeader,
  TableRow,
  TableRowSkeleton,
} from '@/components/biz/table';
import { ITypeOption } from '@/components/biz/table/embedTable/item/AffiliatedProjectsTableItem';
import ArrowsOutLineVerticalIcon from '@/components/icons/ArrowsOutLineVertical';
import FunnelIcon from '@/components/icons/Funnel';
import { useOptimizedProjectsByIds } from '@/hooks/useOptimizedProjectsByIds';
import { IPocItemKey } from '@/types/item';
import { extractProjectIdsByKeyName } from '@/utils/item';

interface EcosystemTableProps<T extends Record<string, any>> {
  id: string;
  itemKey: IPocItemKey;
  title: string;
  description: string;
  filterButtonText: string;
  data: T[];
  columns: ColumnDef<T>[];
  projectId?: number;
  isDataFetched?: boolean;
  typeKey: string;
  typeOptions?: ITypeOption[];
  onOpenModal?: (
    itemKey: IPocItemKey,
    contentType?: 'viewItemProposal' | 'submitPropose',
  ) => void;
}

function EcosystemTable<T extends Record<string, any>>({
  id,
  title,
  itemKey,
  description,
  filterButtonText,
  data,
  columns,
  isDataFetched = true,
  typeKey,
  typeOptions = [],
  onOpenModal,
}: EcosystemTableProps<T>) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize after component mount to avoid state update during render
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Extract project IDs from the data using shared helper
  const projectIds = useMemo(() => {
    if (!isInitialized) return [];
    return extractProjectIdsByKeyName(data, 'project');
  }, [data, isInitialized]);

  const { projectsMap, isLoading: isLoadingProjects } =
    useOptimizedProjectsByIds(projectIds);

  // Filter data based on selected type
  const filteredData = useMemo(() => {
    if (selectedType === '' || !typeKey) return data;
    return data.filter((item) => item[typeKey] === selectedType);
  }, [data, selectedType, typeKey]);

  // Handle expand/collapse toggle
  const handleExpandCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      projectsMap,
      isLoadingProjects,
    },
  });

  return (
    <div id={id} className="mb-[48px]">
      <div className="mobile:flex-col mobile:items-start -mb-px flex items-center justify-between gap-[4px] rounded-t-[10px] border border-b-0 border-black/10 bg-[rgba(229,229,229,0.70)] p-[10px]">
        <div className="flex flex-col gap-[5px]">
          <p className="text-[18px] font-[700] leading-[25px] text-black/80">
            {title}
          </p>
          <p className="text-[13px] font-[400] leading-[18px] text-black/40">
            {description}
          </p>
        </div>
        <div className="flex items-center gap-[10px]">
          {/* Type filter dropdown */}
          <button
            onClick={() => {
              onOpenModal?.(itemKey, 'viewItemProposal');
            }}
            className="flex items-center gap-[5px] rounded-[5px] bg-black/[0.05] px-[10px] py-[5px] text-[13px] font-[600] text-black/80 transition-colors hover:bg-black/[0.08]"
          >
            View Item
          </button>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-[5px] rounded-[5px] bg-black/[0.05] px-[10px] py-[5px] text-[13px] font-[600] text-black/80 transition-colors hover:bg-black/[0.08]"
            >
              <FunnelIcon
                className={cn(selectedType ? 'opacity-50' : 'opacity-20')}
              />
              <span>
                {selectedType
                  ? filterButtonText
                  : typeOptions.find((opt) => opt.value === selectedType)
                      ?.label || filterButtonText}
              </span>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full z-50 mt-[4px] min-w-[200px] rounded-[8px] border border-black/10 bg-white shadow-lg">
                <div className="py-[4px]">
                  {typeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        // Toggle selection - click again to deselect
                        if (selectedType === option.value) {
                          setSelectedType('');
                        } else {
                          setSelectedType(option.value);
                        }
                        setIsDropdownOpen(false);
                      }}
                      className={cn(
                        'w-full px-[12px] py-[8px] text-left text-[13px] transition-colors hover:bg-black/[0.05]',
                        selectedType === option.value &&
                          'bg-black/[0.05] font-[600]',
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleExpandCollapse}
            className="flex items-center gap-[5px] rounded-[5px] bg-black/[0.05] px-[10px] py-[5px] text-[13px] font-[600] text-black/80 transition-colors hover:bg-black/[0.08]"
          >
            <ArrowsOutLineVerticalIcon
              className={cn(isCollapsed ? 'opacity-50' : 'opacity-20')}
            />
            <span className="w-[100px]">
              {isCollapsed ? 'Expand Items' : 'Collapse Items'}
            </span>
          </button>
        </div>
      </div>

      <div className="mobile:overflow-auto overflow-hidden rounded-b-[10px] border border-t-0 border-black/10">
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
            ) : filteredData.length === 0 ? (
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
      </div>
    </div>
  );
}

export default EcosystemTable;
