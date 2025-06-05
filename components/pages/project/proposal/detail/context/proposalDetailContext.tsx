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

// 常量定义
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

// Context 类型定义
export interface ProposalDetailContextType {
  // 基础数据
  projectId: number;
  project?: IProject;
  proposal?: IProposal;
  proposals: IProposal[];

  // 加载状态
  isProjectFetched: boolean;
  isProposalFetched: boolean;
  isFetchVoteInfoLoading: boolean;
  isVoteActionPending: boolean;

  // 投票相关
  inActionKeys: Partial<Record<IPocItemKey, boolean>>;
  userVotesOfProposalMap: Partial<Record<IPocItemKey, IVote>>;
  getItemVoteResult: (IPocItemKey: string) => IVoteResultOfItem;
  onVoteAction: (item: ITableProposalItem) => Promise<void>;
  onCancelVote: (voteId: number, itemKey: IPocItemKey) => Promise<void>;
  onSwitchVote: (item: ITableProposalItem) => Promise<void>;
  switchVotePending: boolean;
  cancelVotePending: boolean;

  // 表格状态
  expandedRows: Partial<Record<IPocItemKey, boolean>>;
  metricsVisibleSubCat: Partial<Record<IItemSubCategoryEnum, boolean>>;
  toggleRowExpanded: (key: IPocItemKey) => void;
  toggleMetricsVisible: (subCat: IItemSubCategoryEnum) => void;
  setExpandedRows: Dispatch<
    SetStateAction<Partial<Record<IPocItemKey, boolean>>>
  >;

  // 模态框状态
  isSwitchModalOpen: boolean;
  isCancelModalOpen: boolean;
  isReferenceModalOpen: boolean;
  currentReferenceKey: string;
  currentVoteItem: ITableProposalItem | null;
  sourceProposal: IProposal | null;
  doNotShowCancelModal: boolean;

  // 模态框操作
  setIsSwitchModalOpen: (isOpen: boolean) => void;
  setIsCancelModalOpen: (isOpen: boolean) => void;
  setIsReferenceModalOpen: (isOpen: boolean) => void;
  setCurrentReferenceKey: (key: string) => void;
  setCurrentVoteItem: (item: ITableProposalItem | null) => void;
  setSourceProposal: (proposal: IProposal | null) => void;
  setDoNotShowCancelModal: (doNotShowCancelModal: boolean) => void;

  // 复合操作
  handleVoteAction: (
    item: ITableProposalItem,
    doNotShowCancelModal: boolean,
    options: {
      setCurrentVoteItem: (item: ITableProposalItem | null) => void;
      setIsCancelModalOpen: (isOpen: boolean) => void;
      setIsSwitchModalOpen: (isOpen: boolean) => void;
      setSourceProposal: (proposal: IProposal | null) => void;
    },
  ) => Promise<void>;
}

// Context 默认值
const createDefaultContext = (): ProposalDetailContextType => ({
  // 基础数据
  projectId: 0,
  project: undefined,
  proposal: undefined,
  proposals: [],

  // 加载状态
  isProjectFetched: false,
  isProposalFetched: false,
  isFetchVoteInfoLoading: false,
  isVoteActionPending: false,

  // 投票相关
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
  cancelVotePending: false,

  // 表格状态
  expandedRows: {},
  metricsVisibleSubCat: DEFAULT_METRICS_VISIBLE_SUB_CAT,
  toggleRowExpanded: () => {},
  toggleMetricsVisible: () => {},
  setExpandedRows: () => {},

  // 模态框状态
  isSwitchModalOpen: false,
  isCancelModalOpen: false,
  isReferenceModalOpen: false,
  currentReferenceKey: '',
  currentVoteItem: null,
  sourceProposal: null,
  doNotShowCancelModal: false,

  // 模态框操作
  setIsSwitchModalOpen: () => {},
  setIsCancelModalOpen: () => {},
  setIsReferenceModalOpen: () => {},
  setCurrentReferenceKey: () => {},
  setCurrentVoteItem: () => {},
  setSourceProposal: () => {},
  setDoNotShowCancelModal: () => {},

  // 复合操作
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

  // 模态框状态管理
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
    setSourceProposal,
    doNotShowCancelModal,
    setDoNotShowCancelModal,
  } = useProposalModalState();

  // 表格状态管理
  const {
    expandedRows,
    metricsVisibleSubCat,
    toggleRowExpanded,
    toggleMetricsVisible,
    setExpandedRows,
  } = useProposalTableStates();

  // 项目数据查询配置
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

  // 项目数据查询
  const { data: project, isFetched: isProjectFetched } =
    trpc.project.getProjectById.useQuery(
      { id: Number(projectId) },
      getProjectOptions,
    );

  // 提案数据查询配置
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

  // 提案数据查询
  const { data: proposal, isFetched: isProposalFetched } =
    trpc.proposal.getProposalById.useQuery(
      { id: Number(proposalId) },
      getProposalOptions,
    );

  // 提案列表
  const proposals = useMemo(
    () => project?.proposals || [],
    [project?.proposals],
  );

  // 投票相关 hooks
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

  // 投票操作处理
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
    [
      profile,
      handleVoteAction,
      doNotShowCancelModal,
      showAuthPrompt,
      setCurrentVoteItem,
      setIsCancelModalOpen,
      setIsSwitchModalOpen,
      setSourceProposal,
    ],
  );

  // 切换投票处理
  const onSwitchVote = useCallback(
    async (item: ITableProposalItem) => {
      await originalOnSwitchVote(item.key);
    },
    [originalOnSwitchVote],
  );

  // Context 值组装
  const contextValue = useMemo(
    () => ({
      // 基础数据
      projectId: Number(projectId),
      proposals,
      project,
      proposal,

      // 加载状态
      isProjectFetched,
      isProposalFetched,
      isFetchVoteInfoLoading,
      isVoteActionPending,

      // 投票相关
      inActionKeys,
      userVotesOfProposalMap,
      getItemVoteResult,
      onVoteAction,
      onCancelVote,
      onSwitchVote,
      switchVotePending: switchVoteMutation.isPending,
      cancelVotePending: cancelVoteMutation.isPending,
      handleVoteAction,

      // 表格状态
      expandedRows,
      metricsVisibleSubCat,
      toggleRowExpanded,
      toggleMetricsVisible,
      setExpandedRows,

      // 模态框状态
      isSwitchModalOpen,
      isCancelModalOpen,
      isReferenceModalOpen,
      currentReferenceKey,
      currentVoteItem,
      sourceProposal,
      doNotShowCancelModal,

      // 模态框操作
      setIsSwitchModalOpen,
      setIsCancelModalOpen,
      setIsReferenceModalOpen,
      setCurrentReferenceKey,
      setCurrentVoteItem,
      setSourceProposal,
      setDoNotShowCancelModal,
    }),
    [
      // 基础数据依赖
      projectId,
      proposals,
      project,
      proposal,

      // 加载状态依赖
      isProjectFetched,
      isProposalFetched,
      isFetchVoteInfoLoading,
      isVoteActionPending,

      // 投票相关依赖
      inActionKeys,
      userVotesOfProposalMap,
      getItemVoteResult,
      onVoteAction,
      onCancelVote,
      onSwitchVote,
      switchVoteMutation.isPending,
      cancelVoteMutation.isPending,
      handleVoteAction,

      // 表格状态依赖
      expandedRows,
      metricsVisibleSubCat,
      toggleRowExpanded,
      toggleMetricsVisible,
      setExpandedRows,

      // 模态框状态依赖
      isSwitchModalOpen,
      isCancelModalOpen,
      isReferenceModalOpen,
      currentReferenceKey,
      currentVoteItem,
      sourceProposal,
      doNotShowCancelModal,

      // 模态框操作依赖
      setIsSwitchModalOpen,
      setIsCancelModalOpen,
      setIsReferenceModalOpen,
      setCurrentReferenceKey,
      setCurrentVoteItem,
      setSourceProposal,
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
