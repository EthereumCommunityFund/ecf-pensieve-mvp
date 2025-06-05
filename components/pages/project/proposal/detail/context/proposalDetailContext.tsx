'use client';

import { useParams } from 'next/navigation';
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useMemo,
} from 'react';

import { useProposalVotes as useProposalVotesHook } from '@/components/pages/project/proposal/detail/useProposalVotes';
import { useAuth } from '@/context/AuthContext';
import { trpc } from '@/lib/trpc/client';
import { IProject, IProposal, IVote } from '@/types';
import { IItemSubCategoryEnum, IPocItemKey } from '@/types/item';
import { devLog } from '@/utils/devLog';
import { IVoteResultOfItem } from '@/utils/proposal';

import { ITableProposalItem } from '../ProposalDetails';
import { useProposalModalState } from '../hooks/useProposalModalState';
import { useProposalTableStates } from '../hooks/useProposalTableStates';

const DefaultMetricsVisibleSubCat: Record<IItemSubCategoryEnum, boolean> = {
  [IItemSubCategoryEnum.Organization]: false,
  [IItemSubCategoryEnum.Team]: false,
  [IItemSubCategoryEnum.BasicProfile]: false,
  [IItemSubCategoryEnum.Development]: false,
  [IItemSubCategoryEnum.Finances]: false,
  [IItemSubCategoryEnum.Token]: false,
  [IItemSubCategoryEnum.Governance]: false,
};

export interface ProposalDetailContextType {
  projectId: number;
  project?: IProject;
  proposal?: IProposal;
  proposals: IProposal[];
  isProjectFetched: boolean;
  isProposalFetched: boolean;
  isFetchVoteInfoLoading: boolean;
  isVoteActionPending: boolean;
  inActionKeys: Partial<Record<IPocItemKey, boolean>>;
  getItemVoteResult: (IPocItemKey: string) => IVoteResultOfItem;

  onVoteAction: (item: ITableProposalItem) => Promise<void>;

  expandedRows: Partial<Record<IPocItemKey, boolean>>;
  metricsVisibleSubCat: Partial<Record<IItemSubCategoryEnum, boolean>>;
  toggleRowExpanded: (key: IPocItemKey) => void;
  toggleMetricsVisible: (subCat: IItemSubCategoryEnum) => void;
  setExpandedRows: Dispatch<
    SetStateAction<Partial<Record<IPocItemKey, boolean>>>
  >;

  userVotesOfProposalMap: Partial<Record<IPocItemKey, IVote>>;
  onCancelVote: (voteId: number, itemKey: IPocItemKey) => Promise<void>;
  onSwitchVote: (item: ITableProposalItem) => Promise<void>;
  switchVotePending: boolean;
  cancelVotePending: boolean;
  handleVoteAction: (
    item: ITableProposalItem,
    doNotShowCancelModal: boolean,
    options: {
      setCurrentVoteItem: (item: ITableProposalItem | null) => void;
      setIsCancelModalOpen: (isOpen: boolean) => void;
      setIsSwitchModalOpen: (isOpen: boolean) => void;
      setSourceProposalInfo: (
        proposal: IProposal | null,
        index: number,
      ) => void;
    },
  ) => Promise<void>;

  isSwitchModalOpen: boolean;
  isCancelModalOpen: boolean;
  isReferenceModalOpen: boolean;
  currentReferenceKey: string;
  currentVoteItem: ITableProposalItem | null;
  sourceProposal: IProposal | null;
  sourceProposalIndex: number;
  doNotShowCancelModal: boolean;
  setIsSwitchModalOpen: (isOpen: boolean) => void;
  setIsCancelModalOpen: (isOpen: boolean) => void;
  setIsReferenceModalOpen: (isOpen: boolean) => void;
  setCurrentReferenceKey: (key: string) => void;
  setCurrentVoteItem: (item: ITableProposalItem | null) => void;
  setSourceProposalInfo: (proposal: IProposal | null, index: number) => void;
  setDoNotShowCancelModal: (doNotShowCancelModal: boolean) => void;
}

const ProposalDetailContext = createContext<ProposalDetailContextType>({
  projectId: 0,
  project: undefined,
  proposal: undefined,
  proposals: [],
  isProjectFetched: false,
  isProposalFetched: false,
  isFetchVoteInfoLoading: false,
  isVoteActionPending: false,
  inActionKeys: {},
  getItemVoteResult: (key: string) => ({
    proposalId: 0,
    key: key,
    itemVotedMemberCount: 0,
    itemPoints: 0,
    itemPointsNeeded: 0,
    isItemReachPointsNeeded: false,
    isItemReachQuorum: false,
    isItemValidated: false,
    isUserVotedInItem: false,
  }),
  onVoteAction: async (item: ITableProposalItem) => {},
  expandedRows: {},
  metricsVisibleSubCat: {},
  toggleRowExpanded: () => {},
  toggleMetricsVisible: () => {},
  setExpandedRows: () => {},

  userVotesOfProposalMap: {},
  onCancelVote: async (voteId: number, itemKey: IPocItemKey) => {},
  onSwitchVote: async (item: ITableProposalItem) => {},
  switchVotePending: false,
  cancelVotePending: false,
  handleVoteAction: async (
    item: ITableProposalItem,
    doNotShowCancelModal: boolean,
    options: {
      setCurrentVoteItem: (item: ITableProposalItem | null) => void;
      setIsCancelModalOpen: (isOpen: boolean) => void;
      setIsSwitchModalOpen: (isOpen: boolean) => void;
      setSourceProposalInfo: (
        proposal: IProposal | null,
        index: number,
      ) => void;
    },
  ) => {},

  isSwitchModalOpen: false,
  isCancelModalOpen: false,
  isReferenceModalOpen: false,
  currentReferenceKey: '',
  currentVoteItem: null,
  sourceProposal: null,
  sourceProposalIndex: 0,
  doNotShowCancelModal: false,
  setIsSwitchModalOpen: () => {},
  setIsCancelModalOpen: () => {},
  setIsReferenceModalOpen: () => {},
  setCurrentReferenceKey: () => {},
  setCurrentVoteItem: () => {},
  setSourceProposalInfo: () => {},
  setDoNotShowCancelModal: () => {},
});
export interface ProposalDetailProviderProps {
  children: ReactNode;
}

export const ProposalDetailProvider = ({
  children,
}: ProposalDetailProviderProps) => {
  const { profile, showAuthPrompt } = useAuth();
  const { id: projectId, proposalId } = useParams();

  const {
    isSwitchModalOpen,
    setIsSwitchModalOpen,
    isCancelModalOpen,
    setIsCancelModalOpen,
    isReferenceModalOpen,
    setIsReferenceModalOpen,
    currentReferenceKey,
    setCurrentReferenceKey,
    currentVoteItem,
    setCurrentVoteItem,
    sourceProposal,
    sourceProposalIndex,
    setSourceProposalInfo,
    doNotShowCancelModal,
    setDoNotShowCancelModal,
  } = useProposalModalState();

  const {
    expandedRows,
    metricsVisibleSubCat,
    toggleRowExpanded,
    toggleMetricsVisible,
    setExpandedRows,
  } = useProposalTableStates();

  const getProjectOptions = useMemo(() => {
    return {
      enabled: !!projectId,
      select: (data: IProject) => {
        devLog('project', data);
        return data;
      },
    };
  }, [projectId]);

  const { data: project, isFetched: isProjectFetched } =
    trpc.project.getProjectById.useQuery(
      { id: Number(projectId) },
      getProjectOptions,
    );

  const getProposalOptions = useMemo(() => {
    return {
      enabled: !!proposalId,
      select: (data: IProposal) => {
        devLog('proposal', data);
        return data;
      },
    };
  }, [proposalId]);

  const { data: proposal, isFetched: isProposalFetched } =
    trpc.proposal.getProposalById.useQuery(
      { id: Number(proposalId) },
      getProposalOptions,
    );

  const proposals = useMemo(() => {
    return project?.proposals || [];
  }, [project?.proposals]);

  const {
    userVotesOfProposalMap,
    isFetchVoteInfoLoading,
    isVoteActionPending,
    getItemVoteResult,
    onCancelVote,
    onSwitchVote: originalOnSwitchVote,
    handleVoteAction,
    switchVoteMutation,
    cancelVoteMutation,
    inActionKeys,
  } = useProposalVotesHook(proposal, Number(projectId), proposals);

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
        setSourceProposalInfo,
      });
    },
    [
      profile,
      handleVoteAction,
      doNotShowCancelModal,
      showAuthPrompt,
      setCurrentVoteItem,
      setIsCancelModalOpen,
      setIsSwitchModalOpen,
      setSourceProposalInfo,
    ],
  );

  const onSwitchVote = useCallback(
    async (item: ITableProposalItem) => {
      await originalOnSwitchVote(item.key);
    },
    [originalOnSwitchVote],
  );

  const value = useMemo(
    () => ({
      projectId: Number(projectId),
      proposals,
      project,
      proposal,
      isProjectFetched,
      isProposalFetched,
      isFetchVoteInfoLoading,
      isVoteActionPending,
      inActionKeys,
      getItemVoteResult,
      expandedRows,
      metricsVisibleSubCat,
      toggleRowExpanded,
      toggleMetricsVisible,
      onVoteAction,
      setExpandedRows,

      userVotesOfProposalMap,
      onCancelVote,
      onSwitchVote,
      switchVotePending: switchVoteMutation.isPending,
      cancelVotePending: cancelVoteMutation.isPending,
      handleVoteAction,

      isSwitchModalOpen,
      isCancelModalOpen,
      isReferenceModalOpen,
      currentReferenceKey,
      currentVoteItem,
      sourceProposal,
      sourceProposalIndex,
      doNotShowCancelModal,

      setIsSwitchModalOpen,
      setIsCancelModalOpen,
      setIsReferenceModalOpen,
      setCurrentReferenceKey,
      setCurrentVoteItem,
      setSourceProposalInfo,
      setDoNotShowCancelModal,
    }),
    [
      projectId,
      proposals,
      project,
      proposal,
      isProjectFetched,
      isProposalFetched,
      getItemVoteResult,
      isVoteActionPending,
      isFetchVoteInfoLoading,
      expandedRows,
      metricsVisibleSubCat,
      toggleRowExpanded,
      toggleMetricsVisible,
      setExpandedRows,
      inActionKeys,
      onVoteAction,
      userVotesOfProposalMap,
      onCancelVote,
      onSwitchVote,
      handleVoteAction,
      isSwitchModalOpen,
      isCancelModalOpen,
      isReferenceModalOpen,
      currentReferenceKey,
      cancelVoteMutation.isPending,
      switchVoteMutation.isPending,
      currentVoteItem,
      sourceProposal,
      sourceProposalIndex,
      doNotShowCancelModal,
      setIsSwitchModalOpen,
      setIsCancelModalOpen,
      setIsReferenceModalOpen,
      setCurrentReferenceKey,
      setCurrentVoteItem,
      setSourceProposalInfo,
      setDoNotShowCancelModal,
    ],
  );

  return (
    <ProposalDetailContext.Provider value={value}>
      {children}
    </ProposalDetailContext.Provider>
  );
};

export const useProposalDetailContext = () => {
  const context = useContext(ProposalDetailContext);
  if (context === undefined) {
    throw new Error(
      'useProposalDetailContext must be used within a ProposalDetailProvider',
    );
  }
  return context;
};
