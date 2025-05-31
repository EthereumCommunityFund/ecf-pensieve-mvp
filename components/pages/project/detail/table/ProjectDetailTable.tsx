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
}

/**
 * Main ProjectDetailTable component
 * Orchestrates all sub-components and manages the overall table structure
 */
const ProjectDetailTable: FC<IProjectTableProps> = ({
  isProposalsLoading,
  onOpenModal,
}) => {
  const { project, showReferenceModal } = useProjectDetailContext();

  // Custom hooks for data and state management
  const { tableData, emptyItemsCounts } = useProjectTableData();
  const {
    expandedRows,
    expanded,
    emptyItemsExpanded,
    groupExpanded,
    metricsVisible,
    toggleRowExpanded,
    toggleCategory,
    toggleEmptyItems,
    toggleGroupExpanded,
    toggleMetricsVisible,
    toggleAllRowsInCategory,
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
    }),
    [expandedRows, toggleRowExpanded, project, onOpenModal, showReferenceModal],
  );

  // Column definitions
  const columns = useProjectTableColumns({
    isPageExpanded: false,
    showMetrics: metricsVisible,
  });

  // Create table instances for each category
  const basicProfileTable = useReactTable({
    data: tableData[IItemSubCategoryEnum.BasicProfile] || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: coreTableMeta,
  });

  const developmentTable = useReactTable({
    data: tableData[IItemSubCategoryEnum.Development] || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: coreTableMeta,
  });

  const organizationTable = useReactTable({
    data: tableData[IItemSubCategoryEnum.Organization] || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: coreTableMeta,
  });

  const teamTable = useReactTable({
    data: tableData[IItemSubCategoryEnum.Team] || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: coreTableMeta,
  });

  const financesTable = useReactTable({
    data: tableData[IItemSubCategoryEnum.Finances] || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: coreTableMeta,
  });

  const tokenTable = useReactTable({
    data: tableData[IItemSubCategoryEnum.Token] || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: coreTableMeta,
  });

  const governanceTable = useReactTable({
    data: tableData[IItemSubCategoryEnum.Governance] || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
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
      metricsVisible, // 添加 metricsVisible 依赖
    ],
  );

  return (
    <div
      className={cn(
        'mt-[20px] px-[160px] tablet:px-[10px] mobile:px-[10px] pt-[20px] ',
        'flex items-start gap-[40px] ',
        'tablet:flex-col mobile:flex-col tablet:gap-[20px] mobile:gap-[20px]',
      )}
    >
      {/* 左侧导航菜单 - 固定定位 */}
      <div className="tablet:hidden mobile:hidden shrink-0">
        <div className="sticky top-[20px]">
          <NavigationMenu
            activeCategory={activeCategory}
            onCategoryClick={handleCategoryClick}
          />
        </div>
      </div>

      {/* 右侧表格内容 */}
      <div className="w-full max-w-[1000px] flex-1">
        {/* 分类表格 */}
        <div className="flex flex-col gap-[20px]">
          {ProjectTableFieldCategory.map((cat) => (
            <div key={cat.key} className="flex flex-col gap-[20px]">
              <TableSectionHeader
                title={cat.title}
                description={cat.description}
              />
              {cat.subCategories.map((subCat) => (
                <CategoryTableSection
                  key={`${subCat.key}-${metricsVisible ? 'with-metrics' : 'no-metrics'}`}
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
                  metricsVisible={metricsVisible}
                  onToggleMetrics={toggleMetricsVisible}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailTable;
