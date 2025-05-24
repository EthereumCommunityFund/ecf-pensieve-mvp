'use client';

import { cn } from '@heroui/react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { FC, useCallback, useMemo, useState } from 'react';

import {
  TableCell,
  TableCellSkeleton,
  TableHeader,
  TableRow,
  TableRowSkeleton,
} from '@/components/biz/table';
import { useProjectDetail } from '@/components/pages/project/context/projectDetail';
import { useColumns } from '@/components/pages/project/detail/table/Column';
import { IItemCategoryEnum } from '@/types/item';

// Import category components and utilities
import { TableFooter } from '@/components/biz/table';
import { TableFieldCategory } from '@/components/pages/project/proposal/detail/constants';
import CategoryHeader from '@/components/pages/project/proposal/detail/table/CategoryHeader';

import { prepareProjectTableData } from './utils';

interface ProjectDataProps {
  projectId: number;
  isProposalsLoading: boolean;
  isProposalsFetched: boolean;
  onSubmitProposal: () => void;
  onOpenSwitchVoteModal?: (itemKey: string) => void;
}

const ProjectData: FC<ProjectDataProps> = ({
  isProposalsLoading,
  onOpenSwitchVoteModal,
}) => {
  const { project } = useProjectDetail();
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // 分类展开状态管理
  const [expanded, setExpanded] = useState<Record<IItemCategoryEnum, boolean>>({
    [IItemCategoryEnum.Basics]: true,
    [IItemCategoryEnum.Technicals]: true,
    [IItemCategoryEnum.Organization]: true,
    [IItemCategoryEnum.Financial]: true,
  });

  // 切换行展开状态
  const toggleRowExpanded = useCallback((key: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  // 切换分类展开状态
  const toggleCategory = useCallback((category: IItemCategoryEnum) => {
    setExpanded((prev) => {
      const newExpanded = { ...prev };
      newExpanded[category] = !newExpanded[category];
      return newExpanded;
    });
  }, []);

  // 创建分类表格数据
  const tableData = useMemo(() => prepareProjectTableData(project), [project]);

  // 使用抽离出来的 columns
  const columns = useColumns({
    expandedRows,
    toggleRowExpanded,
    isPageExpanded: false,
    onOpenSwitchVoteModal,
  });

  // 创建分类表格实例
  const basicsTable = useReactTable({
    data: tableData[IItemCategoryEnum.Basics],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const technicalsTable = useReactTable({
    data: tableData[IItemCategoryEnum.Technicals],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const organizationTable = useReactTable({
    data: tableData[IItemCategoryEnum.Organization],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const financialTable = useReactTable({
    data: tableData[IItemCategoryEnum.Financial],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // 渲染单个分类表格
  const renderCategoryTable = (
    table: any,
    isLoading: boolean = false,
    category?: IItemCategoryEnum,
  ) => {
    const showSkeleton = isLoading || !project;

    const tableHeaders = (
      <thead>
        <tr className="bg-[#F5F5F5]">
          {table.getHeaderGroups().map((headerGroup: any) =>
            headerGroup.headers.map((header: any, index: number) => (
              <TableHeader
                key={header.id}
                width={header.getSize()}
                isLast={index === headerGroup.headers.length - 1}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </TableHeader>
            )),
          )}
        </tr>
      </thead>
    );

    if (showSkeleton) {
      return (
        <div className="overflow-hidden overflow-x-auto">
          <table className="box-border w-full table-fixed border-separate border-spacing-0">
            {tableHeaders}
            <tbody>
              {Array.from({ length: 3 }).map((_, rowIndex) => (
                <TableRowSkeleton
                  key={`skeleton-row-${rowIndex}`}
                  isLastRow={rowIndex === 2}
                >
                  {table
                    .getAllColumns()
                    .map((column: any, cellIndex: number) => (
                      <TableCellSkeleton
                        key={`skeleton-cell-${column.id}-${rowIndex}`}
                        width={column.getSize()}
                        isLast={cellIndex === table.getAllColumns().length - 1}
                        isLastRow={rowIndex === 2}
                        minHeight={60}
                        skeletonHeight={20}
                      />
                    ))}
                </TableRowSkeleton>
              ))}
              <TableFooter colSpan={table.getAllColumns().length}>
                Loading...
              </TableFooter>
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div className="overflow-hidden overflow-x-auto">
        <table className="box-border w-full table-fixed border-separate border-spacing-0">
          {tableHeaders}
          <tbody>
            {table.getRowModel().rows.map((row: any) => (
              <TableRow
                key={row.id}
                isLastRow={false} // 不再是最后一行，因为有 Footer
              >
                {row.getVisibleCells().map((cell: any, cellIndex: number) => (
                  <TableCell
                    key={cell.id}
                    width={cell.column.getSize()}
                    isLast={cellIndex === row.getVisibleCells().length - 1}
                    isLastRow={false} // 不再是最后一行，因为有 Footer
                    minHeight={60}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            <TableFooter colSpan={table.getAllColumns().length}>
              footer
            </TableFooter>
          </tbody>
        </table>
      </div>
    );
  };

  // 动画样式
  const getAnimationStyle = (isExpanded: boolean) => ({
    height: isExpanded ? 'auto' : '0',
    opacity: isExpanded ? 1 : 0,
    overflow: 'hidden',
    transition: 'opacity 0.2s ease',
    transform: isExpanded ? 'translateY(0)' : 'translateY(-10px)',
    transformOrigin: 'top',
    transitionProperty: 'opacity, transform',
    transitionDuration: '0.2s',
  });

  return (
    <div
      className={cn(
        'mt-[20px] px-[160px] tablet:px-[10px] mobile:px-[10px] pt-[20px] ',
        'flex items-start justify-center gap-[40px] ',
        'tablet:flex-col mobile:flex-col tablet:gap-[20px] mobile:gap-[20px]',
      )}
    >
      <div className="w-full max-w-[1000px]">
        <div className="mb-[20px] flex flex-col gap-[10px]">
          <h2 className="text-[24px] font-[700] leading-[33px] text-black/80">
            Project Overview
          </h2>
          <p className="text-[16px] font-[600] leading-[22px] text-black/40">
            This section displays items that describe the organization's
            contributors, structure..
          </p>
        </div>

        {/* 分类表格 */}
        <div className="flex flex-col gap-[20px]">
          {Object.values(IItemCategoryEnum).map((category) => (
            <div
              key={category}
              className="overflow-hidden rounded-[10px] bg-white"
            >
              <CategoryHeader
                title={TableFieldCategory[category].title}
                description={TableFieldCategory[category].description}
                category={category}
                isExpanded={expanded[category]}
                onToggle={() => toggleCategory(category)}
              />
              <div style={getAnimationStyle(expanded[category])}>
                {renderCategoryTable(
                  category === IItemCategoryEnum.Basics
                    ? basicsTable
                    : category === IItemCategoryEnum.Financial
                      ? financialTable
                      : category === IItemCategoryEnum.Technicals
                        ? technicalsTable
                        : organizationTable,
                  isProposalsLoading,
                  category,
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectData;
