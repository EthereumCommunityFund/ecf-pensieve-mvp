'use client';

import { cn } from '@heroui/react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import React, { FC, useCallback, useMemo, useState } from 'react';

import {
  TableCell,
  TableCellSkeleton,
  TableFooter,
  TableHeader,
  TableRow,
  TableRowSkeleton,
} from '@/components/biz/table';
import InputContentRenderer from '@/components/biz/table/InputContentRenderer';
import { useProjectDetail } from '@/components/pages/project/context/projectDetail';
import { useColumns } from '@/components/pages/project/detail/table/Column';
import { AllItemConfig } from '@/constants/itemConfig';
import {
  IEssentialItemKey,
  IItemSubCategoryEnum,
  IPocItemKey,
} from '@/types/item';

// Import category components and utilities
import CategoryHeader from '@/components/pages/project/proposal/detail/table/CategoryHeader';
import { ProjectTableFieldCategory } from '@/constants/tableConfig';

import TableSectionHeader from '../../proposal/detail/TableSectionHeader';

import { prepareProjectTableData } from './utils';

const DefaultExpandedSubCat: Record<IItemSubCategoryEnum, boolean> = {
  [IItemSubCategoryEnum.Organization]: true,
  [IItemSubCategoryEnum.Team]: true,
  [IItemSubCategoryEnum.BasicProfile]: true,
  [IItemSubCategoryEnum.Development]: true,
  [IItemSubCategoryEnum.Finances]: true,
  [IItemSubCategoryEnum.Token]: true,
  [IItemSubCategoryEnum.Governance]: true,
};

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
  const [expanded, setExpanded] = useState(DefaultExpandedSubCat);

  // 切换行展开状态
  const toggleRowExpanded = useCallback((key: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  // 切换分类展开状态
  const toggleCategory = useCallback((category: IItemSubCategoryEnum) => {
    setExpanded((prev) => {
      const newExpanded = { ...prev };
      newExpanded[category] = !newExpanded[category];
      return newExpanded;
    });
  }, []);

  // 创建分类表格数据
  const tableData = useMemo(() => prepareProjectTableData(project), [project]);

  const coreTableMeta = useMemo(
    () => ({
      expandedRows,
      toggleRowExpanded,
      project,
    }),
    [expandedRows, toggleRowExpanded, project],
  );

  // TODO：可变数据优先用coreTableMeta来传递，避免columns重新创建与重新渲染table
  const columns = useColumns({
    expandedRows,
    toggleRowExpanded,
    isPageExpanded: false,
    onOpenSwitchVoteModal,
  });

  const basicProfileTable = useReactTable({
    data: tableData[IItemSubCategoryEnum.BasicProfile],
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: coreTableMeta,
  });

  const technicalDevelopmentTable = useReactTable({
    data: tableData[IItemSubCategoryEnum.Development],
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: coreTableMeta,
  });

  const organizationTable = useReactTable({
    data: tableData[IItemSubCategoryEnum.Organization],
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: coreTableMeta,
  });

  const teamTable = useReactTable({
    data: tableData[IItemSubCategoryEnum.Team],
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: coreTableMeta,
  });

  const financialTable = useReactTable({
    data: tableData[IItemSubCategoryEnum.Finances],
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: coreTableMeta,
  });

  const tokenTable = useReactTable({
    data: tableData[IItemSubCategoryEnum.Token],
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: coreTableMeta,
  });

  const governanceTable = useReactTable({
    data: tableData[IItemSubCategoryEnum.Governance],
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: coreTableMeta,
  });

  const tables = useMemo(() => {
    return {
      [IItemSubCategoryEnum.BasicProfile]: basicProfileTable,
      [IItemSubCategoryEnum.Development]: technicalDevelopmentTable,
      [IItemSubCategoryEnum.Organization]: organizationTable,
      [IItemSubCategoryEnum.Team]: teamTable,
      [IItemSubCategoryEnum.Finances]: financialTable,
      [IItemSubCategoryEnum.Token]: tokenTable,
      [IItemSubCategoryEnum.Governance]: governanceTable,
    };
  }, [
    basicProfileTable,
    technicalDevelopmentTable,
    organizationTable,
    teamTable,
    financialTable,
    tokenTable,
    governanceTable,
  ]);

  // 渲染单个分类表格
  const renderCategoryTable = (table: any, isLoading: boolean = false) => {
    const showSkeleton = isLoading || !project;
    const noDataForThisTable = table.options.data.length === 0;

    const colGroupDefinition = (
      <colgroup>
        {table.getAllColumns().map((column: any) => (
          <col
            key={column.id}
            style={{
              width: `${column.getSize()}px`,
            }}
          />
        ))}
      </colgroup>
    );

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

    if (showSkeleton || noDataForThisTable) {
      return (
        <div className="overflow-hidden overflow-x-auto">
          <table className="box-border w-full table-fixed border-separate border-spacing-0">
            {colGroupDefinition}
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
          {colGroupDefinition}
          {tableHeaders}
          <tbody>
            {table.getRowModel().rows.map((row: any, rowIndex: number) => (
              <React.Fragment key={rowIndex}>
                <TableRow
                  isLastRow={
                    rowIndex === table.getRowModel().rows.length - 1 &&
                    !AllItemConfig[row.original.key as IEssentialItemKey]
                      ?.showExpand
                  }
                  className={cn(
                    expandedRows[row.original.key] ? 'bg-[#EBEBEB]' : '',
                  )}
                >
                  {row.getVisibleCells().map((cell: any, cellIndex: number) => (
                    <TableCell
                      key={cell.id}
                      width={cell.column.getSize()}
                      isLast={cellIndex === row.getVisibleCells().length - 1}
                      isLastRow={
                        rowIndex === table.getRowModel().rows.length - 1 &&
                        !AllItemConfig[row.original.key as IEssentialItemKey]
                          ?.showExpand
                      }
                      minHeight={60}
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
                  <tr
                    key={`${row.id}-expanded`}
                    className={cn(
                      expandedRows[row.original.key] ? '' : 'hidden',
                    )}
                  >
                    <td
                      colSpan={row.getVisibleCells().length}
                      className={`border-b border-black/10 bg-[#E1E1E1] p-[10px] ${
                        rowIndex === table.getRowModel().rows.length - 1
                          ? 'border-b-0'
                          : ''
                      }`}
                    >
                      <div className="w-full overflow-hidden rounded-[10px] border border-black/10 bg-white text-[13px]">
                        <p className="p-[10px] font-[mona] text-[15px] leading-[20px] text-black">
                          <InputContentRenderer
                            itemKey={row.original.key as IPocItemKey}
                            value={row.original.input}
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
                    </td>
                  </tr>
                )}
              </React.Fragment>
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
          {ProjectTableFieldCategory.map((cat) => (
            <div key={cat.key} className="flex flex-col gap-[20px]">
              <TableSectionHeader
                title={cat.title}
                description={cat.description}
              />
              {cat.subCategories.map((subCat) => (
                <div key={subCat.key}>
                  <CategoryHeader
                    title={subCat.title}
                    description={subCat.description}
                    category={subCat.key}
                    isExpanded={expanded[subCat.key]}
                    onToggle={() => toggleCategory(subCat.key)}
                  />
                  <div style={getAnimationStyle(expanded[subCat.key])}>
                    {renderCategoryTable(
                      tables[subCat.key],
                      isProposalsLoading,
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectData;
