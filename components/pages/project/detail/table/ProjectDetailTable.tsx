'use client';

import { cn } from '@heroui/react';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { FC, useEffect, useMemo } from 'react';

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
    cleanupInvalidPinnedColumns,
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

  // Clean up invalid fixed columns after columns are built
  // Clean up invalid fixed columns for each category
  // Desktop: max width limit, centered
  // Padding: larger on desktop, smaller on mobile
  // Top margin and padding
  // Desktop: horizontal layout, table centered
  // Tablet and mobile: vertical layout, table full width
  // Desktop: limit max width to ensure table is not too wide
  // Tablet and mobile: make full use of available width
  // Behavior as flex item on desktop
  useEffect(() => {
    console.log(
      '🔄 Column building completed, starting to clean up invalid pinned columns...',
    );

    // Clean up invalid pinned columns for each category
    cleanupInvalidPinnedColumns(
      IItemSubCategoryEnum.BasicProfile,
      basicProfileColumns.map((col) => col.id as string),
    );
    cleanupInvalidPinnedColumns(
      IItemSubCategoryEnum.Development,
      developmentColumns.map((col) => col.id as string),
    );
    cleanupInvalidPinnedColumns(
      IItemSubCategoryEnum.Organization,
      organizationColumns.map((col) => col.id as string),
    );
    cleanupInvalidPinnedColumns(
      IItemSubCategoryEnum.Team,
      teamColumns.map((col) => col.id as string),
    );
    cleanupInvalidPinnedColumns(
      IItemSubCategoryEnum.Finances,
      financesColumns.map((col) => col.id as string),
    );
    cleanupInvalidPinnedColumns(
      IItemSubCategoryEnum.Token,
      tokenColumns.map((col) => col.id as string),
    );
    cleanupInvalidPinnedColumns(
      IItemSubCategoryEnum.Governance,
      governanceColumns.map((col) => col.id as string),
    );
  }, [
    basicProfileColumns,
    developmentColumns,
    organizationColumns,
    teamColumns,
    financesColumns,
    tokenColumns,
    governanceColumns,
    cleanupInvalidPinnedColumns,
  ]);

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
      {/* Main container - ensure centered on all screen sizes */}
      <div
        className={cn(
          'mx-auto w-full',
          // Desktop: maximum width limit, centered horizontally
          'lg:max-w-[1400px] pc:max-w-[1200px]',
          // Padding: desktop larger, mobile smaller
          'px-[20px] tablet:px-[15px] mobile:px-[10px]',
          // Top margin and padding
          'mt-[20px] pt-[20px]',
        )}
      >
        <div
          className={cn(
            'flex items-start gap-[40px]',
            // Desktop: horizontal layout, table centered
            'lg:justify-center pc:justify-center',
            // Tablet and mobile: vertical layout, table full width
            'tablet:flex-col tablet:gap-[20px]',
            'mobile:flex-col mobile:gap-[20px]',
          )}
        >
          {/* Left navigation menu - only show on desktop */}
          <div className="tablet:hidden mobile:hidden w-[200px] shrink-0 self-start">
            <NavigationMenu
              activeCategory={activeCategory}
              onCategoryClick={handleCategoryClick}
            />
          </div>

          {/* Table content container */}
          <div
            className={cn(
              'w-full',
              // Desktop: limit maximum width, ensure table is not too wide
              'lg:max-w-[1000px] pc:max-w-[900px]',
              // Tablet and mobile: make full use of available width
              'tablet:max-w-none mobile:max-w-none',
              // Behavior as flex item on desktop
              'flex-1',
            )}
          >
            {/* Category tables */}
            <div className="flex flex-col gap-[40px]">
              {ProjectTableFieldCategory.map((cat) => (
                <div key={cat.key} className="flex flex-col gap-[30px]">
                  <TableSectionHeader
                    title={cat.title}
                    description={cat.description}
                  />
                  {cat.subCategories.map((subCat) => (
                    <CategoryTableSection
                      key={subCat.key}
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
