'use client';

import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';

import { IRef } from '@/components/pages/project/create/types';
import { ProposalTableFieldCategory } from '@/constants/tableConfig';
import { useAuth } from '@/context/AuthContext';
import { IItemSubCategoryEnum, IPocItemKey } from '@/types/item';

import ActionSectionHeader from './ActionSectionHeader';
import { useProposalDetailContext } from './context/proposalDetailContext';
import CancelVoteModal from './modal/CancelVoteModal';
import ReferenceModal from './modal/ReferenceModal';
import SwitchVoteModal from './modal/SwitchVoteModal';
import CategoryHeader from './table/CategoryHeader';
import ProposalTable from './table/ProposalTable';
import { useCreateProposalTableColumns } from './table/tableColumns';
import { prepareProposalTableData } from './table/utils';
import TableSectionHeader from './TableSectionHeader';

export interface ITableProposalItem {
  key: string;
  property: string;
  input: string;
  reference: string;
  support: number;
  fieldType?: string;
  // Group information for visual grouping
  group?: string;
  groupTitle?: string;
  accountability?: string[];
  legitimacy?: string[];
}

export interface ProposalDetailsProps {
  isFiltered: boolean;
  toggleFiltered: () => void;
  isPageExpanded: boolean;
  toggleExpanded: () => void;
}

const ProposalDetails = ({
  isPageExpanded,
  toggleExpanded,
  isFiltered,
  toggleFiltered,
}: ProposalDetailsProps) => {
  const { profile, showAuthPrompt } = useAuth();

  const {
    proposal,
    projectId,
    project,
    proposals,
    expandedRows,
    setExpandedRows,
    metricsVisibleSubCat,
    toggleRowExpanded,
    toggleMetricsVisible,
    onVoteAction,
    userVotesOfProposalMap,
    onCancelVote,
    onSwitchVote,
    switchVotePending,
    cancelVotePending,

    isSwitchModalOpen,
    isCancelModalOpen,
    isReferenceModalOpen,
    currentReferenceKey,
    currentVoteItem,
    sourceProposal,
    doNotShowCancelModal,
    setIsSwitchModalOpen,
    setIsCancelModalOpen,
    setIsReferenceModalOpen,
    setCurrentReferenceKey,
    setCurrentVoteItem,
    setSourceProposal,
    setDoNotShowCancelModal,
  } = useProposalDetailContext();

  const isOverallLoading = !proposal;

  const isProposalCreator = useMemo(() => {
    if (!proposal || !proposal.creator) return false;
    if (!profile || !profile.userId) return false;
    return proposal.creator.userId === profile.userId;
  }, [proposal, profile]);

  const handleCancelVoteConfirm = useCallback(async () => {
    try {
      if (!currentVoteItem) return;
      await onCancelVote(
        Number(userVotesOfProposalMap[currentVoteItem!.key as IPocItemKey]?.id),
        currentVoteItem.key as IPocItemKey,
      );
      setIsCancelModalOpen(false);
    } catch (err) {
      // TODO toast
      console.error(err);
    }
  }, [
    currentVoteItem,
    userVotesOfProposalMap,
    onCancelVote,
    setIsCancelModalOpen,
  ]);

  const handleSwitchVoteConfirm = useCallback(async () => {
    try {
      if (!currentVoteItem) return;
      await onSwitchVote(currentVoteItem);
      setIsSwitchModalOpen(false);
    } catch (err) {
      // TODO toast
      console.error(err);
    }
  }, [currentVoteItem, onSwitchVote, setIsSwitchModalOpen]);

  const onShowReference = useCallback(
    (key: string) => {
      setCurrentReferenceKey(key);
      setIsReferenceModalOpen(true);
    },
    [setCurrentReferenceKey, setIsReferenceModalOpen],
  );

  const tableDataMap = useMemo(() => {
    return proposal
      ? prepareProposalTableData(proposal)
      : prepareProposalTableData(undefined);
  }, [proposal]);

  // 批量切换某个分类下所有行的展开状态
  const toggleAllRowsInCategory = useCallback(
    (subCat: IItemSubCategoryEnum) => {
      // 获取该分类下所有行的key
      const categoryRows = tableDataMap[subCat]?.map((row) => row.key) || [];

      setExpandedRows((prev) => {
        // 检查该分类下是否有任何行已展开
        const hasExpandedRows = categoryRows.some(
          (rowKey) => prev[rowKey as IPocItemKey],
        );

        // 如果有展开的行，则全部收起；如果都收起，则全部展开
        const newExpandedState = !hasExpandedRows;

        const newExpandedRows = { ...prev };
        categoryRows.forEach((rowKey) => {
          newExpandedRows[rowKey as IPocItemKey] = newExpandedState;
        });

        return newExpandedRows;
      });
    },
    [tableDataMap, setExpandedRows],
  );

  // 检查某个分类下是否有任何行已展开
  const hasExpandedRowsInCategory = useCallback(
    (subCat: IItemSubCategoryEnum) => {
      const categoryRows = tableDataMap[subCat]?.map((row) => row.key) || [];
      return categoryRows.some((rowKey) => expandedRows[rowKey as IPocItemKey]);
    },
    [tableDataMap, expandedRows],
  );

  // 只保留变化不频繁的稳定参数
  const coreTableMeta = useMemo(
    () => ({
      expandedRows,
      toggleRowExpanded,
      onShowReference,
      isProposalCreator,
      toggleMetricsVisible,
    }),
    [
      expandedRows,
      toggleRowExpanded,
      onShowReference,
      isProposalCreator,
      toggleMetricsVisible,
    ],
  );

  // Create column definitions for each subcategory at the top level
  const basicProfileColumns = useCreateProposalTableColumns({
    isPageExpanded,
    isProposalCreator,
    showMetrics: !!metricsVisibleSubCat[IItemSubCategoryEnum.BasicProfile],
  });

  const developmentColumns = useCreateProposalTableColumns({
    isPageExpanded,
    isProposalCreator,
    showMetrics: !!metricsVisibleSubCat[IItemSubCategoryEnum.Development],
  });

  const organizationColumns = useCreateProposalTableColumns({
    isPageExpanded,
    isProposalCreator,
    showMetrics: !!metricsVisibleSubCat[IItemSubCategoryEnum.Organization],
  });

  const teamColumns = useCreateProposalTableColumns({
    isPageExpanded,
    isProposalCreator,
    showMetrics: !!metricsVisibleSubCat[IItemSubCategoryEnum.Team],
  });

  const financesColumns = useCreateProposalTableColumns({
    isPageExpanded,
    isProposalCreator,
    showMetrics: !metricsVisibleSubCat[IItemSubCategoryEnum.Finances],
  });

  const tokenColumns = useCreateProposalTableColumns({
    isPageExpanded,
    isProposalCreator,
    showMetrics: !!metricsVisibleSubCat[IItemSubCategoryEnum.Token],
  });

  const governanceColumns = useCreateProposalTableColumns({
    isPageExpanded,
    isProposalCreator,
    showMetrics: !!metricsVisibleSubCat[IItemSubCategoryEnum.Governance],
  });

  const columnsMap = useMemo(
    () => ({
      [IItemSubCategoryEnum.BasicProfile]: basicProfileColumns,
      [IItemSubCategoryEnum.Development]: developmentColumns,
      [IItemSubCategoryEnum.Organization]: organizationColumns,
      [IItemSubCategoryEnum.Team]: teamColumns,
      [IItemSubCategoryEnum.Finances]: financesColumns,
      [IItemSubCategoryEnum.Token]: tokenColumns,
      [IItemSubCategoryEnum.Governance]: governanceColumns,
    }),
    [
      basicProfileColumns,
      developmentColumns,
      organizationColumns,
      teamColumns,
      financesColumns,
      tokenColumns,
      governanceColumns,
    ],
  );

  const basicProfileTable = useReactTable({
    data: tableDataMap[IItemSubCategoryEnum.BasicProfile],
    columns: columnsMap[IItemSubCategoryEnum.BasicProfile],
    getCoreRowModel: getCoreRowModel(),
    meta: coreTableMeta,
  });

  const technicalDevelopmentTable = useReactTable({
    data: tableDataMap[IItemSubCategoryEnum.Development],
    columns: columnsMap[IItemSubCategoryEnum.Development],
    getCoreRowModel: getCoreRowModel(),
    meta: coreTableMeta,
  });

  const organizationTable = useReactTable({
    data: tableDataMap[IItemSubCategoryEnum.Organization],
    columns: columnsMap[IItemSubCategoryEnum.Organization],
    getCoreRowModel: getCoreRowModel(),
    meta: coreTableMeta,
  });

  const teamTable = useReactTable({
    data: tableDataMap[IItemSubCategoryEnum.Team],
    columns: columnsMap[IItemSubCategoryEnum.Team],
    getCoreRowModel: getCoreRowModel(),
    meta: coreTableMeta,
  });

  const financialTable = useReactTable({
    data: tableDataMap[IItemSubCategoryEnum.Finances],
    columns: columnsMap[IItemSubCategoryEnum.Finances],
    getCoreRowModel: getCoreRowModel(),
    meta: coreTableMeta,
  });

  const tokenTable = useReactTable({
    data: tableDataMap[IItemSubCategoryEnum.Token],
    columns: columnsMap[IItemSubCategoryEnum.Token],
    getCoreRowModel: getCoreRowModel(),
    meta: coreTableMeta,
  });

  const governanceTable = useReactTable({
    data: tableDataMap[IItemSubCategoryEnum.Governance],
    columns: columnsMap[IItemSubCategoryEnum.Governance],
    getCoreRowModel: getCoreRowModel(),
    meta: coreTableMeta,
  });

  const tableInstanceMap = useMemo(() => {
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

  return (
    <div className="flex flex-col gap-[20px]">
      <ActionSectionHeader
        isExpanded={isPageExpanded}
        isFiltered={isFiltered}
        onChangeExpand={toggleExpanded}
        onChangeFilter={toggleFiltered}
      />

      <div className="flex flex-col gap-[40px]">
        {ProposalTableFieldCategory.map((cat) => (
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
                  isExpanded={hasExpandedRowsInCategory(subCat.key)}
                  onToggle={() => toggleAllRowsInCategory(subCat.key)}
                  onToggleMetrics={toggleMetricsVisible}
                />
                <div>
                  <ProposalTable
                    table={tableInstanceMap[subCat.key]}
                    isLoading={isOverallLoading}
                    expandedRows={expandedRows}
                    isPageExpanded={isPageExpanded}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <SwitchVoteModal
        isOpen={isSwitchModalOpen}
        onClose={() => setIsSwitchModalOpen(false)}
        onConfirm={handleSwitchVoteConfirm}
        isLoading={switchVotePending}
        proposalItem={currentVoteItem || undefined}
        sourceProposal={sourceProposal || undefined}
      />

      <CancelVoteModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelVoteConfirm}
        isLoading={cancelVotePending}
        proposalItem={currentVoteItem || undefined}
      />

      <ReferenceModal
        isOpen={isReferenceModalOpen}
        onClose={() => setIsReferenceModalOpen(false)}
        fieldKey={currentReferenceKey}
        refs={(proposal?.refs || []) as IRef[]}
      />
    </div>
  );
};

export default ProposalDetails;
