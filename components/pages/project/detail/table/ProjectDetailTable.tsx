'use client';

import { cn } from '@heroui/react';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { FC, useMemo } from 'react';

import { ProjectTableFieldCategory } from '@/constants/tableConfig';
import { IItemSubCategoryEnum, IPocItemKey } from '@/types/item';

import { useProjectDetailContext } from '../../context/projectDetailContext';
import TableSectionHeader from '../../proposal/detail/TableSectionHeader';

import NavigationMenu from './NavigationMenu';
import { useProjectTableColumns } from './ProjectDetailTableColumns';
import { CategoryTableSection } from './components/CategoryTableSection';
import { useProjectTableData } from './hooks/useProjectTableData';
import { useTableNavigation } from './hooks/useTableNavigation';
import { useTableStates } from './hooks/useTableStates';

interface IProjectTableProps {
  projectId: number;
  isProposalsLoading: boolean;
  isProposalsFetched: boolean;
  onSubmitProposal: () => void;
  onOpenModal?: (
    itemKey: IPocItemKey,
    contentType?: 'viewItemProposal' | 'submitPropose',
  ) => void;
  onMetricClick?: (metric: string) => void;
}

/**
 * Main ProjectDetailTable component
 * Orchestrates all sub-components and manages the overall table structure
 */
const ProjectDetailTable: FC<IProjectTableProps> = ({
  isProposalsLoading,
  onOpenModal,
  onMetricClick,
}) => {
  const { project, showReferenceModal, showSubmitterModal } =
    useProjectDetailContext();

  // Custom hooks for data and state management
  const { tableData, emptyItemsCounts } = useProjectTableData();
  const {
    expandedRows,
    expanded,
    emptyItemsExpanded,
    groupExpanded,
    metricsVisible,
    columnPinning,
    toggleRowExpanded,
    toggleCategory,
    toggleEmptyItems,
    toggleGroupExpanded,
    toggleMetricsVisible,
    toggleAllRowsInCategory,
    toggleColumnPinning,
    isColumnPinned,
  } = useTableStates();
  const { activeCategory, categoryRefs, handleCategoryClick } =
    useTableNavigation();

  // Table meta data for column components
  const coreTableMeta = useMemo(
    () => ({
      expandedRows,
      toggleRowExpanded,
      project,
      onOpenModal,
      showReferenceModal,
      onMetricClick,
      toggleColumnPinning,
      isColumnPinned,
      showSubmitterModal,
    }),
    [
      expandedRows,
      toggleRowExpanded,
      project,
      onOpenModal,
      showReferenceModal,
      onMetricClick,
      toggleColumnPinning,
      isColumnPinned,
      showSubmitterModal,
    ],
  );

  // Column definitions for each category (independent metrics visibility)
  const basicProfileColumns = useProjectTableColumns({
    isPageExpanded: false,
    showMetrics: metricsVisible[IItemSubCategoryEnum.BasicProfile],
    category: IItemSubCategoryEnum.BasicProfile,
  });

  const developmentColumns = useProjectTableColumns({
    isPageExpanded: false,
    showMetrics: metricsVisible[IItemSubCategoryEnum.Development],
    category: IItemSubCategoryEnum.Development,
  });

  const organizationColumns = useProjectTableColumns({
    isPageExpanded: false,
    showMetrics: metricsVisible[IItemSubCategoryEnum.Organization],
    category: IItemSubCategoryEnum.Organization,
  });

  const teamColumns = useProjectTableColumns({
    isPageExpanded: false,
    showMetrics: metricsVisible[IItemSubCategoryEnum.Team],
    category: IItemSubCategoryEnum.Team,
  });

  const financesColumns = useProjectTableColumns({
    isPageExpanded: false,
    showMetrics: metricsVisible[IItemSubCategoryEnum.Finances],
    category: IItemSubCategoryEnum.Finances,
  });

  const tokenColumns = useProjectTableColumns({
    isPageExpanded: false,
    showMetrics: metricsVisible[IItemSubCategoryEnum.Token],
    category: IItemSubCategoryEnum.Token,
  });

  const governanceColumns = useProjectTableColumns({
    isPageExpanded: false,
    showMetrics: metricsVisible[IItemSubCategoryEnum.Governance],
    category: IItemSubCategoryEnum.Governance,
  });

  // Create table instances for each category with their own columns
  const basicProfileTable = useReactTable({
    data: tableData[IItemSubCategoryEnum.BasicProfile] || [],
    columns: basicProfileColumns,
    getCoreRowModel: getCoreRowModel(),
    enableColumnPinning: true,
    state: {
      columnPinning: columnPinning[IItemSubCategoryEnum.BasicProfile],
    },
    meta: coreTableMeta,
  });

  const developmentTable = useReactTable({
    data: tableData[IItemSubCategoryEnum.Development] || [],
    columns: developmentColumns,
    getCoreRowModel: getCoreRowModel(),
    enableColumnPinning: true,
    state: {
      columnPinning: columnPinning[IItemSubCategoryEnum.Development],
    },
    meta: coreTableMeta,
  });

  const organizationTable = useReactTable({
    data: tableData[IItemSubCategoryEnum.Organization] || [],
    columns: organizationColumns,
    getCoreRowModel: getCoreRowModel(),
    enableColumnPinning: true,
    state: {
      columnPinning: columnPinning[IItemSubCategoryEnum.Organization],
    },
    meta: coreTableMeta,
  });

  const teamTable = useReactTable({
    data: tableData[IItemSubCategoryEnum.Team] || [],
    columns: teamColumns,
    getCoreRowModel: getCoreRowModel(),
    enableColumnPinning: true,
    state: {
      columnPinning: columnPinning[IItemSubCategoryEnum.Team],
    },
    meta: coreTableMeta,
  });

  const financesTable = useReactTable({
    data: tableData[IItemSubCategoryEnum.Finances] || [],
    columns: financesColumns,
    getCoreRowModel: getCoreRowModel(),
    enableColumnPinning: true,
    state: {
      columnPinning: columnPinning[IItemSubCategoryEnum.Finances],
    },
    meta: coreTableMeta,
  });

  const tokenTable = useReactTable({
    data: tableData[IItemSubCategoryEnum.Token] || [],
    columns: tokenColumns,
    getCoreRowModel: getCoreRowModel(),
    enableColumnPinning: true,
    state: {
      columnPinning: columnPinning[IItemSubCategoryEnum.Token],
    },
    meta: coreTableMeta,
  });

  const governanceTable = useReactTable({
    data: tableData[IItemSubCategoryEnum.Governance] || [],
    columns: governanceColumns,
    getCoreRowModel: getCoreRowModel(),
    enableColumnPinning: true,
    state: {
      columnPinning: columnPinning[IItemSubCategoryEnum.Governance],
    },
    meta: coreTableMeta,
  });

  // Create tables object
  const tables = useMemo(
    () => ({
      [IItemSubCategoryEnum.BasicProfile]: basicProfileTable,
      [IItemSubCategoryEnum.Development]: developmentTable,
      [IItemSubCategoryEnum.Organization]: organizationTable,
      [IItemSubCategoryEnum.Team]: teamTable,
      [IItemSubCategoryEnum.Finances]: financesTable,
      [IItemSubCategoryEnum.Token]: tokenTable,
      [IItemSubCategoryEnum.Governance]: governanceTable,
    }),
    [
      basicProfileTable,
      developmentTable,
      organizationTable,
      teamTable,
      financesTable,
      tokenTable,
      governanceTable,
    ],
  );

  return (
    <div className="relative">
      {/* 主容器 - 确保在所有屏幕尺寸下都居中 */}
      <div
        className={cn(
          'mx-auto w-full',
          // 桌面端：最大宽度限制，左右居中
          'lg:max-w-[1400px] pc:max-w-[1200px]',
          // 内边距：桌面端较大，移动端较小
          'px-[20px] tablet:px-[15px] mobile:px-[10px]',
          // 上边距和内边距
          'mt-[20px] pt-[20px]',
        )}
      >
        <div
          className={cn(
            'flex items-start gap-[40px]',
            // 桌面端：水平布局，表格居中
            'lg:justify-center pc:justify-center',
            // 平板和移动端：垂直布局，表格占满宽度
            'tablet:flex-col tablet:gap-[20px]',
            'mobile:flex-col mobile:gap-[20px]',
          )}
        >
          {/* 左侧导航菜单 - 仅在桌面端显示 */}
          <div className="tablet:hidden mobile:hidden w-[200px] shrink-0 self-start">
            <NavigationMenu
              activeCategory={activeCategory}
              onCategoryClick={handleCategoryClick}
            />
          </div>

          {/* 表格内容容器 */}
          <div
            className={cn(
              'w-full',
              // 桌面端：限制最大宽度，确保表格不会过宽
              'lg:max-w-[1000px] pc:max-w-[900px]',
              // 平板和移动端：充分利用可用宽度
              'tablet:max-w-none mobile:max-w-none',
              // 在桌面端作为 flex 项目时的行为
              'flex-1',
            )}
          >
            {/* 分类表格 */}
            <div className="flex flex-col gap-[40px]">
              {ProjectTableFieldCategory.map((cat) => (
                <div key={cat.key} className="flex flex-col gap-[30px]">
                  <TableSectionHeader
                    title={cat.title}
                    description={cat.description}
                  />
                  {cat.subCategories.map((subCat) => (
                    <CategoryTableSection
                      key={`${subCat.key}-${metricsVisible[subCat.key] ? 'with-metrics' : 'no-metrics'}`}
                      subCategory={subCat}
                      table={tables[subCat.key]}
                      isLoading={isProposalsLoading}
                      expanded={expanded}
                      expandedRows={expandedRows}
                      emptyItemsExpanded={emptyItemsExpanded}
                      groupExpanded={groupExpanded}
                      emptyItemsCount={emptyItemsCounts[subCat.key] || 0}
                      project={project}
                      categoryRef={(el) => {
                        categoryRefs.current[subCat.key] = el;
                      }}
                      onToggleCategory={toggleCategory}
                      onToggleEmptyItems={toggleEmptyItems}
                      onToggleGroupExpanded={toggleGroupExpanded}
                      onToggleAllRowsInCategory={toggleAllRowsInCategory}
                      metricsVisible={metricsVisible[subCat.key]}
                      onToggleMetrics={() => toggleMetricsVisible(subCat.key)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailTable;
