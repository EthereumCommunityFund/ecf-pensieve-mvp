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

// Constant definitions
const DEFAULT_METRICS_VISIBLE_SUB_CAT: Record<IItemSubCategoryEnum, boolean> = {
  [IItemSubCategoryEnum.Organization]: false,
  [IItemSubCategoryEnum.Team]: false,
  [IItemSubCategoryEnum.BasicProfile]: false,
  [IItemSubCategoryEnum.Development]: false,
  [IItemSubCategoryEnum.Finances]: false,
  [IItemSubCategoryEnum.Token]: false,
  [IItemSubCategoryEnum.Governance]: false,
};

const DEFAULT_VOTE_RESULT: IVoteResultOfItem = {
  proposalId: 0,
  key: '',
  itemVotedMemberCount: 0,
  itemPoints: 0,
  itemPointsNeeded: 0,
  isItemReachPointsNeeded: false,
  isItemReachQuorum: false,
  isItemValidated: false,
  isUserVotedInItem: false,
};

// Context type definition
export interface ProposalDetailContextType {
  // Basic data
  projectId: number;
  project?: IProject;
  proposal?: IProposal;
  proposals: IProposal[];

  // Loading states
  isProjectFetched: boolean;
  isProposalFetched: boolean;
  isFetchVoteInfoLoading: boolean;
  isVoteActionPending: boolean;

  // Vote related
  inActionKeys: Partial<Record<IPocItemKey, boolean>>;
  userVotesOfProposalMap: Partial<Record<IPocItemKey, IVote>>;
  getItemVoteResult: (IPocItemKey: string) => IVoteResultOfItem;
  onVoteAction: (item: ITableProposalItem) => Promise<void>;
  onCancelVote: (voteId: number, itemKey: IPocItemKey) => Promise<void>;
  onSwitchVote: (item: ITableProposalItem) => Promise<void>;
  switchVotePending: boolean;

  // Table states
  expandedRows: Partial<Record<IPocItemKey, boolean>>;
  metricsVisibleSubCat: Partial<Record<IItemSubCategoryEnum, boolean>>;
  toggleRowExpanded: (key: IPocItemKey) => void;
  toggleMetricsVisible: (subCat: IItemSubCategoryEnum) => void;
  setExpandedRows: Dispatch<
    SetStateAction<Partial<Record<IPocItemKey, boolean>>>
  >;

  // Modal states
  isSwitchModalOpen: boolean;
  isCancelModalOpen: boolean;
  isReferenceModalOpen: boolean;
  currentReferenceKey: string;
  currentVoteItem: ITableProposalItem | null;
  sourceProposal: IProposal | null;
  sourceProposalIndex: number;
  doNotShowCancelModal: boolean;

  // Modal operations
  setIsSwitchModalOpen: (isOpen: boolean) => void;
  setIsCancelModalOpen: (isOpen: boolean) => void;
  setIsReferenceModalOpen: (isOpen: boolean) => void;
  setCurrentReferenceKey: (key: string) => void;
  setCurrentVoteItem: (item: ITableProposalItem | null) => void;
  setSourceProposalInfo: (proposal: IProposal | null, index: number) => void;
  setDoNotShowCancelModal: (doNotShowCancelModal: boolean) => void;

  // Compound operations
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
}

// Context default values
const createDefaultContext = (): ProposalDetailContextType => ({
  // Basic data
  projectId: 0,
  project: undefined,
  proposal: undefined,
  proposals: [],

  // Loading states
  isProjectFetched: false,
  isProposalFetched: false,
  isFetchVoteInfoLoading: false,
  isVoteActionPending: false,

  // Vote related
  inActionKeys: {},
  userVotesOfProposalMap: {},
  getItemVoteResult: (key: string) => ({
    ...DEFAULT_VOTE_RESULT,
    key,
  }),
  onVoteAction: async () => {},
  onCancelVote: async () => {},
  onSwitchVote: async () => {},
  switchVotePending: false,

  // Table states
  expandedRows: {},
  metricsVisibleSubCat: DEFAULT_METRICS_VISIBLE_SUB_CAT,
  toggleRowExpanded: () => {},
  toggleMetricsVisible: () => {},
  setExpandedRows: () => {},

  // Modal states
  isSwitchModalOpen: false,
  isCancelModalOpen: false,
  isReferenceModalOpen: false,
  currentReferenceKey: '',
  currentVoteItem: null,
  sourceProposal: null,
  sourceProposalIndex: 0,
  doNotShowCancelModal: false,

  // Modal operations
  setIsSwitchModalOpen: () => {},
  setIsCancelModalOpen: () => {},
  setIsReferenceModalOpen: () => {},
  setCurrentReferenceKey: () => {},
  setCurrentVoteItem: () => {},
  setSourceProposalInfo: () => {},
  setDoNotShowCancelModal: () => {},

  // Compound operations
  handleVoteAction: async () => {},
});

const ProposalDetailContext = createContext<ProposalDetailContextType>(
  createDefaultContext(),
);

export interface ProposalDetailProviderProps {
  children: ReactNode;
}

export const ProposalDetailProvider = ({
  children,
}: ProposalDetailProviderProps) => {
  const { profile, showAuthPrompt } = useAuth();
  const { id: projectId, proposalId } = useParams();

  // Modal state management
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

  // Table state management
  const {
    expandedRows,
    metricsVisibleSubCat,
    toggleRowExpanded,
    toggleMetricsVisible,
    setExpandedRows,
  } = useProposalTableStates();

  // Project data query configuration
  const getProjectOptions = useMemo(
    () => ({
      enabled: !!projectId,
      select: (data: IProject) => {
        devLog('project', data);
        return data;
      },
    }),
    [projectId],
  );

  // Project data query
  const { data: project, isFetched: isProjectFetched } =
    trpc.project.getProjectById.useQuery(
      { id: Number(projectId) },
      getProjectOptions,
    );

  // Proposal data query configuration
  const getProposalOptions = useMemo(
    () => ({
      enabled: !!proposalId,
      select: (data: IProposal) => {
        devLog('proposal', data);
        return data;
      },
    }),
    [proposalId],
  );

  // Proposal data query
  const { data: proposal, isFetched: isProposalFetched } =
    trpc.proposal.getProposalById.useQuery(
      { id: Number(proposalId) },
      getProposalOptions,
    );

  // Proposal list
  const proposals = useMemo(
    () => project?.proposals || [],
    [project?.proposals],
  );

  // Vote related hooks
  const {
    userVotesOfProposalMap,
    isFetchVoteInfoLoading,
    isVoteActionPending,
    getItemVoteResult,
    onCancelVote,
    onSwitchVote: originalOnSwitchVote,
    handleVoteAction,
    switchVoteMutation,
    inActionKeys,
  } = useProposalVotesHook(proposal, Number(projectId), proposals);

  // Vote action handling
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

  // Switch vote handling
  const onSwitchVote = useCallback(
    async (item: ITableProposalItem) => {
      await originalOnSwitchVote(item.key);
    },
    [originalOnSwitchVote],
  );

  // Context value assembly
  const contextValue = useMemo(
    () => ({
      // Basic data
      projectId: Number(projectId),
      proposals,
      project,
      proposal,

      // Loading states
      isProjectFetched,
      isProposalFetched,
      isFetchVoteInfoLoading,
      isVoteActionPending,

      // Vote related
      inActionKeys,
      userVotesOfProposalMap,
      getItemVoteResult,
      onVoteAction,
      onCancelVote,
      onSwitchVote,
      switchVotePending: switchVoteMutation.isPending,
      handleVoteAction,

      // Table states
      expandedRows,
      metricsVisibleSubCat,
      toggleRowExpanded,
      toggleMetricsVisible,
      setExpandedRows,

      // Modal states
      isSwitchModalOpen,
      isCancelModalOpen,
      isReferenceModalOpen,
      currentReferenceKey,
      currentVoteItem,
      sourceProposal,
      sourceProposalIndex,
      doNotShowCancelModal,

      // Modal operations
      setIsSwitchModalOpen,
      setIsCancelModalOpen,
      setIsReferenceModalOpen,
      setCurrentReferenceKey,
      setCurrentVoteItem,
      setSourceProposalInfo,
      setDoNotShowCancelModal,
    }),
    [
      // Basic data dependencies
      projectId,
      proposals,
      project,
      proposal,

      // Loading state dependencies
      isProjectFetched,
      isProposalFetched,
      isFetchVoteInfoLoading,
      isVoteActionPending,

      // Vote related dependencies
      inActionKeys,
      userVotesOfProposalMap,
      getItemVoteResult,
      onVoteAction,
      onCancelVote,
      onSwitchVote,
      switchVoteMutation.isPending,
      handleVoteAction,

      // Table state dependencies
      expandedRows,
      metricsVisibleSubCat,
      toggleRowExpanded,
      toggleMetricsVisible,
      setExpandedRows,

      // Modal state dependencies
      isSwitchModalOpen,
      isCancelModalOpen,
      isReferenceModalOpen,
      currentReferenceKey,
      currentVoteItem,
      sourceProposal,
      sourceProposalIndex,
      doNotShowCancelModal,

      // Modal operation dependencies
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
    <ProposalDetailContext.Provider value={contextValue}>
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
