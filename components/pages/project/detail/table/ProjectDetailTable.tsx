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
import { CaretDownIcon, CaretUpIcon } from '@/components/icons';
import PencilCircleIcon from '@/components/icons/PencilCircle';
import {
  IProjectDataItem,
  useColumns,
} from '@/components/pages/project/detail/table/Column';
import { AllItemConfig } from '@/constants/itemConfig';
import {
  IEssentialItemKey,
  IItemSubCategoryEnum,
  IPocItemKey,
} from '@/types/item';

// Import category components and utilities
import CategoryHeader from '@/components/pages/project/proposal/detail/table/CategoryHeader';
import { ProjectTableFieldCategory } from '@/constants/tableConfig';

import { useProjectDetailContext } from '../../context/projectDetailContext';
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
  onOpenModal?: (
    itemKey: IPocItemKey,
    contentType?: 'viewItemProposal' | 'submitPropose',
  ) => void;
}

const ProjectDetailTable: FC<ProjectDataProps> = ({
  isProposalsLoading,
  onOpenModal,
}) => {
  const { project, displayProposalData } = useProjectDetailContext();
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // 分类展开状态管理
  const [expanded, setExpanded] = useState(DefaultExpandedSubCat);

  // 空数据分组展开状态管理
  const [emptyItemsExpanded, setEmptyItemsExpanded] = useState<
    Record<IItemSubCategoryEnum, boolean>
  >({
    [IItemSubCategoryEnum.Organization]: false,
    [IItemSubCategoryEnum.Team]: false,
    [IItemSubCategoryEnum.BasicProfile]: false,
    [IItemSubCategoryEnum.Development]: false,
    [IItemSubCategoryEnum.Finances]: false,
    [IItemSubCategoryEnum.Token]: false,
    [IItemSubCategoryEnum.Governance]: false,
  });

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

  // 切换空数据分组展开状态
  const toggleEmptyItems = useCallback((category: IItemSubCategoryEnum) => {
    setEmptyItemsExpanded((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  }, []);

  // 创建分类表格数据（包含空数据项目）
  const { tableData, emptyItemsCounts } = useMemo(() => {
    if (!displayProposalData) {
      // 如果没有 displayProposalData，使用 prepareProjectTableData 创建默认数据
      const defaultData = prepareProjectTableData({
        project,
        displayProposalData: undefined,
      });
      return {
        tableData: defaultData,
        emptyItemsCounts: {} as Record<IItemSubCategoryEnum, number>,
      };
    }

    // 如果有 displayProposalData，按分类组织数据
    const result: Record<IItemSubCategoryEnum, IProjectDataItem[]> =
      ProjectTableFieldCategory.reduce(
        (acc, catConfig) => {
          catConfig.subCategories.forEach((subCatConfig) => {
            acc[subCatConfig.key] = [];
          });
          return acc;
        },
        {} as Record<IItemSubCategoryEnum, IProjectDataItem[]>,
      );

    // 空数据项目计数
    const emptyCounts: Record<IItemSubCategoryEnum, number> =
      ProjectTableFieldCategory.reduce(
        (acc, catConfig) => {
          catConfig.subCategories.forEach((subCatConfig) => {
            acc[subCatConfig.key] = 0;
          });
          return acc;
        },
        {} as Record<IItemSubCategoryEnum, number>,
      );

    // 创建 displayProposalData 的映射以便快速查找
    const displayItemMap = displayProposalData.reduce(
      (acc, curr) => {
        acc[curr.key as IPocItemKey] = curr;
        return acc;
      },
      {} as Record<IPocItemKey, IProjectDataItem>,
    );

    // 检查输入值是否为空的辅助函数
    const isInputEmpty = (input: any): boolean => {
      if (input === null || input === undefined || input === '') return true;
      if (Array.isArray(input) && input.length === 0) return true;
      if (typeof input === 'string' && input.trim() === '') return true;
      return false;
    };

    // 按照配置的顺序组织数据
    ProjectTableFieldCategory.forEach((categoryConfig) => {
      categoryConfig.subCategories.forEach((subCategoryConfig) => {
        const { items, itemsNotEssential = [] } = subCategoryConfig;
        const emptyItems: IProjectDataItem[] = [];

        // 先添加 essential items
        items.forEach((itemKey) => {
          const item = displayItemMap[itemKey as IPocItemKey];
          if (item) {
            result[subCategoryConfig.key].push(item);
          }
        });

        // 处理 itemsNotEssential
        itemsNotEssential.forEach((itemKey) => {
          const existingItem = displayItemMap[itemKey as IPocItemKey];
          if (existingItem) {
            // 如果有数据且不为空，添加到主表格
            if (!isInputEmpty(existingItem.input)) {
              result[subCategoryConfig.key].push(existingItem);
            } else {
              // 如果有数据但为空，添加到空数据列表
              emptyItems.push({ ...existingItem, isEmptyItem: true } as any);
            }
          } else {
            // 为没有 proposal 数据的 itemsNotEssential 创建默认条目并添加到空数据列表
            const itemConfig = AllItemConfig[itemKey as IPocItemKey];
            if (itemConfig) {
              const defaultItem: IProjectDataItem = {
                key: itemKey,
                property: itemConfig.label || itemKey,
                input: '',
                reference: null,
                submitter: {
                  userId: 'default',
                  name: 'Creator',
                  avatarUrl: null,
                  address: '',
                  weight: null,
                  invitationCodeId: null,
                  createdAt: project?.createdAt
                    ? new Date(project.createdAt)
                    : new Date(),
                  updatedAt: project?.createdAt
                    ? new Date(project.createdAt)
                    : new Date(),
                },
                createdAt: project?.createdAt
                  ? new Date(project.createdAt)
                  : new Date(),
                projectId: project?.id || 0,
                proposalId: 0,
                itemTopWeight: 0,
                isEmptyItem: true,
              } as any;
              emptyItems.push(defaultItem);
            }
          }
        });

        // 将空数据项目添加到主表格数据的末尾
        result[subCategoryConfig.key].push(...emptyItems);
        emptyCounts[subCategoryConfig.key] = emptyItems.length;
      });
    });

    return { tableData: result, emptyItemsCounts: emptyCounts };
  }, [project, displayProposalData]);

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
    onOpenModal,
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
  const renderCategoryTable = (
    table: any,
    isLoading: boolean = false,
    subCategoryKey?: IItemSubCategoryEnum,
  ) => {
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
            {(() => {
              const rows = table.getRowModel().rows;
              const nonEmptyRows = rows.filter(
                (row: any) => !(row.original as any).isEmptyItem,
              );
              const emptyRows = rows.filter(
                (row: any) => (row.original as any).isEmptyItem,
              );
              const isExpanded = subCategoryKey
                ? emptyItemsExpanded[subCategoryKey]
                : false;

              return (
                <>
                  {/* 渲染非空数据行 */}
                  {nonEmptyRows.map((row: any, rowIndex: number) => (
                    <React.Fragment key={rowIndex}>
                      <TableRow
                        isLastRow={
                          rowIndex === nonEmptyRows.length - 1 &&
                          emptyRows.length === 0 &&
                          !AllItemConfig[row.original.key as IEssentialItemKey]
                            ?.showExpand
                        }
                        className={cn(
                          expandedRows[row.original.key] ? 'bg-[#EBEBEB]' : '',
                        )}
                      >
                        {row
                          .getVisibleCells()
                          .map((cell: any, cellIndex: number) => (
                            <TableCell
                              key={cell.id}
                              width={cell.column.getSize()}
                              isLast={
                                cellIndex === row.getVisibleCells().length - 1
                              }
                              isLastRow={
                                rowIndex === nonEmptyRows.length - 1 &&
                                emptyRows.length === 0 &&
                                !AllItemConfig[
                                  row.original.key as IEssentialItemKey
                                ]?.showExpand
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
                              rowIndex === nonEmptyRows.length - 1 &&
                              emptyRows.length === 0
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

                  {/* 渲染空数据分组标题行 */}
                  {subCategoryKey &&
                    renderEmptyItemsGroupHeader(subCategoryKey, table)}

                  {/* 渲染空数据行 */}
                  {emptyRows.length > 0 &&
                    isExpanded &&
                    emptyRows.map((row: any, rowIndex: number) => (
                      <React.Fragment key={`empty-${rowIndex}`}>
                        <TableRow isLastRow={rowIndex === emptyRows.length - 1}>
                          {row
                            .getVisibleCells()
                            .map((cell: any, cellIndex: number) => (
                              <TableCell
                                key={cell.id}
                                width={cell.column.getSize()}
                                isLast={
                                  cellIndex === row.getVisibleCells().length - 1
                                }
                                isLastRow={rowIndex === emptyRows.length - 1}
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
                            key={`empty-${row.id}-expanded`}
                            className={cn(
                              expandedRows[row.original.key] ? '' : 'hidden',
                            )}
                          >
                            <td
                              colSpan={row.getVisibleCells().length}
                              className={`border-b border-black/10 bg-[#E1E1E1] p-[10px] ${
                                rowIndex === emptyRows.length - 1
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
                </>
              );
            })()}
            {/* <TableFooter colSpan={table.getAllColumns().length}>
              footer
            </TableFooter> */}
          </tbody>
        </table>
      </div>
    );
  };

  // 渲染空数据分组标题行
  const renderEmptyItemsGroupHeader = (
    subCategoryKey: IItemSubCategoryEnum,
    table: any,
  ) => {
    const emptyItemsCount = emptyItemsCounts[subCategoryKey] || 0;
    const isExpanded = emptyItemsExpanded[subCategoryKey];

    return (
      <tr
        className="cursor-pointer "
        onClick={() => emptyItemsCount > 0 && toggleEmptyItems(subCategoryKey)}
      >
        <td
          colSpan={table.getAllColumns().length}
          className="border-x border-b border-black/10 bg-[#F5F5F5] p-[10px_20px] hover:bg-[#F5F5F5]"
        >
          <div className="flex items-center justify-between gap-[20px]">
            {/* 左侧内容 */}
            <div className="flex items-center gap-[10px]">
              {/* PencilCircle 图标 */}
              <div className="opacity-50">
                <PencilCircleIcon size={20} className="text-black" />
              </div>

              {/* 文本内容 */}
              <div className="flex items-center gap-[10px]">
                <span className="text-[14px] font-[600] text-black opacity-60">
                  View Empty Items
                </span>
                <span className="text-[14px] font-[600] text-black opacity-30">
                  ({emptyItemsCount})
                </span>
              </div>
            </div>

            {/* 右侧 CaretUp 图标 */}
            <div className="flex items-center">
              {isExpanded ? (
                <CaretUpIcon size={18} className="text-black" />
              ) : (
                <CaretDownIcon size={18} className="text-black" />
              )}
            </div>
          </div>
        </td>
      </tr>
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
                      subCat.key,
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

export default ProjectDetailTable;
