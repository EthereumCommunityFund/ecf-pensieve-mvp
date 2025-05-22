'use client';

import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { IRef } from '@/components/pages/project/create/types';
import { useProposalVotes } from '@/components/pages/project/proposal/detail/useProposalVotes';
import { StorageKey_DoNotShowCancelModal } from '@/constants/storage';
import { useAuth } from '@/context/AuthContext';
import { IProject, IProposal } from '@/types';
import { IItemCategoryEnum } from '@/types/item';
import { safeGetLocalStorage } from '@/utils/localStorage';

import ActionSectionHeader from './ActionSectionHeader';
import TableSectionHeader from './TableSectionHeader';
import { TableFieldCategory } from './constants';
import CancelVoteModal from './table/CancelVoteModal';
import ProposalTable from './table/ProposalTable';
import ReferenceModal from './table/ReferenceModal';
import SwitchVoteModal from './table/SwitchVoteModal';
import { createTableColumns } from './table/tableColumns';
import { CategoryHeader, prepareTableData } from './table/tableUtils';

export interface ITableProposalItem {
  key: string;
  property: string;
  input: string;
  reference: string;
  support: number;
}

export type CategoryKey = IItemCategoryEnum;

interface ProposalDetailsProps {
  proposal?: IProposal;
  proposals: IProposal[];
  project?: IProject;
  projectId: number;
  isFiltered: boolean;
  toggleFiltered: () => void;
  isPageExpanded: boolean;
  toggleExpanded: () => void;
}

const ProposalDetails = ({
  proposal,
  projectId,
  project,
  proposals,
  isPageExpanded,
  toggleExpanded,
  isFiltered,
  toggleFiltered,
}: ProposalDetailsProps) => {
  const { profile, showAuthPrompt } = useAuth();
  const [expanded, setExpanded] = useState<Record<CategoryKey, boolean>>({
    [IItemCategoryEnum.Basics]: true,
    [IItemCategoryEnum.Technicals]: true,
    [IItemCategoryEnum.Organization]: true,
    [IItemCategoryEnum.Financial]: true,
  });

  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);
  const [currentReferenceKey, setCurrentReferenceKey] = useState('');

  const [currentVoteItem, setCurrentVoteItem] =
    useState<ITableProposalItem | null>(null);
  const [sourceProposal, setSourceProposal] = useState<IProposal | null>(null);

  const [doNotShowCancelModal, setDoNotShowCancelModal] =
    useState<boolean>(false);

  const isOverallLoading = !proposal;

  const {
    userVotesOfProposalMap,
    isFetchVoteInfoLoading,
    isVoteActionPending,
    getItemVoteResult,
    onCancelVote,
    onSwitchVote,
    handleVoteAction,
    switchVoteMutation,
    cancelVoteMutation,
    inActionKeys,
  } = useProposalVotes(proposal, projectId, proposals);

  useEffect(() => {
    const savedValue = safeGetLocalStorage(StorageKey_DoNotShowCancelModal);
    setDoNotShowCancelModal(savedValue === 'true');
  }, []);

  const onVoteAction = useCallback(
    async (item: ITableProposalItem) => {
      if (!profile) {
        console.warn('not login');
        showAuthPrompt();
        return;
      }
      await handleVoteAction(item, doNotShowCancelModal, {
        setCurrentVoteItem,
        setIsCancelModalOpen,
        setIsSwitchModalOpen,
        setSourceProposal,
      });
    },
    [profile, handleVoteAction, doNotShowCancelModal, showAuthPrompt],
  );

  const handleCancelVoteConfirm = useCallback(async () => {
    try {
      if (!currentVoteItem) return;
      await onCancelVote(
        userVotesOfProposalMap[currentVoteItem!.key].id,
        currentVoteItem.key,
      );
      setIsCancelModalOpen(false);
    } catch (err) {
      // TODO toast
      console.error(err);
    }
  }, [currentVoteItem, userVotesOfProposalMap, onCancelVote]);

  const handleSwitchVoteConfirm = useCallback(async () => {
    try {
      if (!currentVoteItem) return;
      await onSwitchVote(currentVoteItem.key);
      setIsSwitchModalOpen(false);
    } catch (err) {
      // TODO toast
      console.error(err);
    }
  }, [currentVoteItem, onSwitchVote]);

  const onShowReference = useCallback((key: string) => {
    setCurrentReferenceKey(key);
    setIsReferenceModalOpen(true);
  }, []);

  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const expandableRowKeys = useMemo(() => {
    return ['name', 'mainDescription', 'projectType'];
  }, []);

  const isRowExpandable = useCallback(
    (key: string) => {
      return expandableRowKeys.includes(key);
    },
    [expandableRowKeys],
  );

  const toggleRowExpanded = useCallback((key: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const columns = useMemo(() => {
    return createTableColumns({
      isPageExpanded,
      isRowExpandable,
      expandedRows,
      toggleRowExpanded,
      onShowReference,
      project,
      proposal,
      onVoteAction,
      isFetchVoteInfoLoading,
      isVoteActionPending,
      inActionKeys,
      getItemVoteResult,
    });
  }, [
    isPageExpanded,
    isRowExpandable,
    expandedRows,
    toggleRowExpanded,
    onShowReference,
    project,
    proposal,
    onVoteAction,
    isFetchVoteInfoLoading,
    isVoteActionPending,
    inActionKeys,
    getItemVoteResult,
  ]);

  const tableData = useMemo(() => prepareTableData(proposal), [proposal]);

  const basicsTable = useReactTable<ITableProposalItem>({
    data: tableData[IItemCategoryEnum.Basics],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const technicalsTable = useReactTable<ITableProposalItem>({
    data: tableData[IItemCategoryEnum.Technicals],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const organizationTable = useReactTable<ITableProposalItem>({
    data: tableData[IItemCategoryEnum.Organization],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const financialTable = useReactTable<ITableProposalItem>({
    data: tableData[IItemCategoryEnum.Financial],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const toggleCategory = useCallback((category: CategoryKey) => {
    setExpanded((prev) => {
      const newExpanded = { ...prev };
      newExpanded[category] = !newExpanded[category];
      return newExpanded;
    });
  }, []);

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
    <div className="flex flex-col gap-[20px]">
      <ActionSectionHeader
        isExpanded={isPageExpanded}
        isFiltered={isFiltered}
        onChangeExpand={toggleExpanded}
        onChangeFilter={toggleFiltered}
      />

      <TableSectionHeader title="Project Overview" description="" />

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
              <ProposalTable
                table={
                  category === IItemCategoryEnum.Basics
                    ? basicsTable
                    : category === IItemCategoryEnum.Financial
                      ? financialTable
                      : category === IItemCategoryEnum.Technicals
                        ? technicalsTable
                        : organizationTable
                }
                isLoading={isOverallLoading}
                isPageExpanded={isPageExpanded}
                expandedRows={expandedRows}
                isRowExpandable={isRowExpandable}
              />
            </div>
          </div>
        ))}
      </div>

      <SwitchVoteModal
        isOpen={isSwitchModalOpen}
        onClose={() => setIsSwitchModalOpen(false)}
        onConfirm={handleSwitchVoteConfirm}
        isLoading={switchVoteMutation.isPending}
        proposalItem={currentVoteItem || undefined}
        sourceProposal={sourceProposal || undefined}
      />

      <CancelVoteModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelVoteConfirm}
        isLoading={cancelVoteMutation.isPending}
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
