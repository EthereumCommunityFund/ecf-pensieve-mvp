'use client';

import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { IRef } from '@/components/pages/project/create/types';
import { useProposalVotes as useProposalVotesHook } from '@/components/pages/project/proposal/detail/useProposalVotes';
import { StorageKey_DoNotShowCancelModal } from '@/constants/storage';
import { useAuth } from '@/context/AuthContext';
import { IProject, IProposal } from '@/types';
import { IItemSubCategoryEnum } from '@/types/item';
import { safeGetLocalStorage } from '@/utils/localStorage';

import ActionSectionHeader from './ActionSectionHeader';
import { TableFieldCategory } from './constants';
import CancelVoteModal from './table/CancelVoteModal';
import CategoryHeader from './table/CategoryHeader';
import ProposalTable from './table/ProposalTable';
import ReferenceModal from './table/ReferenceModal';
import SwitchVoteModal from './table/SwitchVoteModal';
import { createTableColumns } from './table/tableColumns';
import { prepareTableData } from './table/utils';
import TableSectionHeader from './TableSectionHeader';

export interface ITableProposalItem {
  key: string;
  property: string;
  input: string;
  reference: string;
  support: number;
  fieldType?: string;
}

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
  const [expandedSubCat, setExpandedSubCat] = useState<
    Record<IItemSubCategoryEnum, boolean>
  >({
    [IItemSubCategoryEnum.Organization]: true,
    [IItemSubCategoryEnum.Team]: true,
    [IItemSubCategoryEnum.BasicProfile]: true,
    [IItemSubCategoryEnum.Development]: true,
    [IItemSubCategoryEnum.Finances]: true,
    [IItemSubCategoryEnum.Token]: true,
    [IItemSubCategoryEnum.Governance]: true,
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

  const isProposalCreator = useMemo(() => {
    if (!proposal || !proposal.creator) return false;
    if (!profile || !profile.userId) return false;
    return proposal.creator.userId === profile.userId;
  }, [proposal, profile]);

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
  } = useProposalVotesHook(proposal, projectId, proposals);

  useEffect(() => {
    const savedValue = safeGetLocalStorage(StorageKey_DoNotShowCancelModal);
    setDoNotShowCancelModal(savedValue === 'true');
  }, []);

  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRowExpanded = useCallback((key: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const onVoteAction = useCallback(
    async (item: ITableProposalItem) => {
      if (!profile) {
        console.warn('not login');
        showAuthPrompt();
        return;
      }
      if (isProposalCreator) {
        console.warn(
          'is proposal creator, cannot vote/switch vote/cancel vote',
        );
        return;
      }
      await handleVoteAction(item, doNotShowCancelModal, {
        setCurrentVoteItem,
        setIsCancelModalOpen,
        setIsSwitchModalOpen,
        setSourceProposal,
      });
    },
    [
      profile,
      handleVoteAction,
      doNotShowCancelModal,
      showAuthPrompt,
      isProposalCreator,
    ],
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

  const tableData = useMemo(() => prepareTableData(proposal), [proposal]);

  const coreTableMeta = useMemo(
    () => ({
      expandedRows,
      toggleRowExpanded,
      onShowReference,
      project,
      proposal,
      onVoteAction,
      isProposalCreator,
      isFetchVoteInfoLoading,
      isVoteActionPending,
      inActionKeys,
      getItemVoteResult,
    }),
    [
      expandedRows,
      toggleRowExpanded,
      onShowReference,
      project,
      proposal,
      onVoteAction,
      isProposalCreator,
      isFetchVoteInfoLoading,
      isVoteActionPending,
      inActionKeys,
      getItemVoteResult,
    ],
  );

  const columns = useMemo(() => {
    return createTableColumns({ isPageExpanded, isProposalCreator });
  }, [isPageExpanded, isProposalCreator]);

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

  const toggleCategory = useCallback((category: IItemSubCategoryEnum) => {
    setExpandedSubCat((prev) => {
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

      <div className="flex flex-col gap-[40px]">
        {TableFieldCategory.map((cat) => (
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
                  isExpanded={expandedSubCat[subCat.key]}
                  onToggle={() => toggleCategory(subCat.key)}
                />
                <div style={getAnimationStyle(expandedSubCat[subCat.key])}>
                  <ProposalTable
                    table={tables[subCat.key]}
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
