'use client';

import { useParams } from 'next/navigation';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { IProjectDataItem } from '@/components/pages/project/detail/table/Column';
import { useAuth } from '@/context/AuthContext';
import { trpc } from '@/lib/trpc/client';
import {
  ILeadingProposalHistory,
  ILeadingProposals,
  ILeadingProposalsTyped,
  IProject,
  IProposal,
  IProposalsByProjectIdAndKey,
} from '@/types';
import { IPocItemKey } from '@/types/item';
import { devLog } from '@/utils/devLog';
import ProposalVoteUtils, { IVoteResultOfProposal } from '@/utils/proposal';

// Define the context type
interface ProjectDetailContextType {
  project?: IProject;
  proposals?: IProposal[];
  isProjectLoading: boolean;
  isProjectFetched: boolean;
  isProposalsLoading: boolean;
  isProposalsFetched: boolean;
  projectId: number;
  leadingProposals?: ILeadingProposals;
  isLeadingProposalsLoading: boolean;
  isLeadingProposalsFetched: boolean;
  displayProposalData?: IProjectDataItem[];
  getItemTopWeight: (key: IPocItemKey) => number;

  // Merged from ModalContextType
  currentItemKey: string | null;
  setCurrentItemKey: (key: string | null) => void;
  proposalsByKey?: IProposalsByProjectIdAndKey;
  proposalHistory?: ILeadingProposalHistory;
  isProposalsByKeyLoading: boolean;
  isProposalsByKeyFetched: boolean;
  isProposalHistoryLoading: boolean;
  isProposalHistoryFetched: boolean;
  refetchProposalsByKey: () => void;
  refetchProposalHistory: () => void;
  inActionKeyMap: Partial<Record<IPocItemKey, boolean>>;
  onCreateItemProposalVote: (
    key: IPocItemKey,
    itemProposalId: number,
  ) => Promise<void>;
  onSwitchItemProposalVote: (
    key: IPocItemKey,
    itemProposalId: number,
  ) => Promise<void>;
  onCancelVote: (key: IPocItemKey, voteRecordId: number) => Promise<void>;

  voteResultOfLeadingProposal?: IVoteResultOfProposal;
}

// Create the context with default values
export const ProjectDetailContext = createContext<ProjectDetailContextType>({
  project: undefined,
  proposals: undefined,
  isProjectLoading: true,
  isProjectFetched: false,
  isProposalsLoading: true,
  isProposalsFetched: false,
  projectId: 0,
  leadingProposals: undefined,
  isLeadingProposalsLoading: true,
  isLeadingProposalsFetched: false,
  displayProposalData: undefined,
  getItemTopWeight: () => 0,

  // Merged defaults
  currentItemKey: null,
  setCurrentItemKey: () => {},
  proposalsByKey: undefined,
  proposalHistory: undefined,
  isProposalsByKeyLoading: true,
  isProposalsByKeyFetched: false,
  isProposalHistoryLoading: true,
  isProposalHistoryFetched: false,
  refetchProposalsByKey: () => {},
  refetchProposalHistory: () => {},
  inActionKeyMap: {},
  onCreateItemProposalVote: () => Promise.resolve(),
  onSwitchItemProposalVote: () => Promise.resolve(),
  onCancelVote: () => Promise.resolve(),

  voteResultOfLeadingProposal: undefined,
});

// Provider component
export const ProjectDetailProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { id } = useParams();
  const { profile } = useAuth();
  const projectId = Number(id);

  const [currentItemKey, setCurrentItemKey] = useState<string | null>(null);

  const {
    data: project,
    isLoading: isProjectLoading,
    isFetched: isProjectFetched,
  } = trpc.project.getProjectById.useQuery(
    { id: projectId },
    {
      enabled: !!projectId,
      select: (data) => {
        devLog('getProjectById', data);
        return data;
      },
    },
  );

  const {
    data: proposals,
    isLoading: isProposalsLoading,
    isFetched: isProposalsFetched,
  } = trpc.proposal.getProposalsByProjectId.useQuery(
    { projectId },
    {
      enabled: !!projectId,
      select: (data) => {
        devLog('getProposalsByProjectId', data);
        return data;
      },
    },
  );

  // TODO 如果 project detail 里的 voteRecords 的 creator 是IProfile 类型，那就不用重复请求这里了
  const {
    data: votesOfProject,
    isLoading: isVotesOfProjectLoading,
    isFetched: isVotesOfProjectFetched,
    isFetching: isVotesOfProjectFetching,
    refetch: refetchVotesOfProject,
  } = trpc.vote.getVotesByProjectId.useQuery(
    { projectId: Number(projectId) },
    {
      enabled: !!projectId,
      select: (data) => {
        devLog('getVotesByProjectId', data);
        return data;
      },
    },
  );

  const {
    data: proposalsByProject,
    isLoading: isLeadingProposalsLoading,
    isFetched: isLeadingProposalsFetched,
  } = trpc.projectLog.getLeadingProposalsByProjectId.useQuery(
    { projectId },
    {
      enabled: !!projectId,
      select: (data) => {
        devLog('getLeadingProposalsByProjectId', data);
        return data;
      },
    },
  );

  const voteResultOfLeadingProposal = useMemo(() => {
    const leadingProposalId =
      proposalsByProject?.withoutItemProposal[0]?.proposalId;
    if (!leadingProposalId) return undefined; // 理论上这不会出现
    const leadingProposal = project?.proposals?.find(
      (p) => p.id === leadingProposalId,
    );
    if (!leadingProposal) return undefined;

    const votesOfLeadingProposal = ProposalVoteUtils.groupVotesByProposalId(
      votesOfProject || [],
    )[leadingProposalId];
    return ProposalVoteUtils.getVoteResultOfProposal({
      proposalId: leadingProposalId,
      votesOfProposal: votesOfLeadingProposal,
      userId: profile?.userId,
    });
  }, [project, proposals, profile?.userId, proposalsByProject]);

  const {
    data: proposalsByKey,
    isLoading: isProposalsByKeyLoading,
    isFetched: isProposalsByKeyFetched,
    refetch: refetchProposalsByKey,
  } = trpc.projectLog.getProposalsByProjectIdAndKey.useQuery(
    { projectId, key: currentItemKey! },
    {
      enabled: !!projectId && !!currentItemKey,
      select: (data) => {
        devLog('getProposalsByProjectIdAndKey', currentItemKey, data);
        return data;
      },
    },
  );

  const {
    data: proposalHistory,
    isLoading: isProposalHistoryLoading,
    isFetched: isProposalHistoryFetched,
    refetch: refetchProposalHistory,
  } = trpc.projectLog.getLeadingProposalHistoryByProjectIdAndKey.useQuery(
    { projectId, key: currentItemKey! },
    {
      enabled: !!projectId && !!currentItemKey,
      select: (data) => {
        // devLog('getLeadingProposalHistoryByProjectIdAndKey', data);
        return data;
      },
    },
  );

  const [inActionKeyMap, setInActionKeyMap] = useState<
    Partial<Record<IPocItemKey, boolean>>
  >({});

  const createItemProposalVoteMutation =
    trpc.vote.createItemProposalVote.useMutation();
  const switchItemProposalVoteMutation =
    trpc.vote.switchItemProposalVote.useMutation();
  const cancelVoteMutation = trpc.vote.cancelVote.useMutation();

  const setKeyActive = (key: IPocItemKey, active: boolean) => {
    setInActionKeyMap((pre) => ({
      ...pre,
      [key]: active,
    }));
  };

  const onCreateItemProposalVote = useCallback(
    async (key: IPocItemKey, itemProposalId: number) => {
      setKeyActive(key, true);
      createItemProposalVoteMutation.mutate(
        { itemProposalId, key },
        {
          onSuccess: async () => {
            refetchProposalsByKey();
            setKeyActive(key, false);
          },
          onError: (error) => {
            setKeyActive(key, false);
            devLog('onCreateItemProposalVote error', error);
          },
        },
      );
    },
    [createItemProposalVoteMutation, refetchProposalsByKey],
  );

  const onSwitchItemProposalVote = useCallback(
    async (key: IPocItemKey, itemProposalId: number) => {
      setKeyActive(key, true);
      switchItemProposalVoteMutation.mutate(
        { itemProposalId, key },
        {
          onSuccess: async () => {
            refetchProposalsByKey();
            setKeyActive(key, false);
          },
          onError: (error) => {
            setKeyActive(key, false);
            devLog('onSwitchItemProposalVote error', error);
          },
        },
      );
    },
    [switchItemProposalVoteMutation, refetchProposalsByKey],
  );

  const onCancelVote = useCallback(
    async (key: IPocItemKey, voteRecordId: number) => {
      setKeyActive(key, true);
      cancelVoteMutation.mutate(
        { id: voteRecordId },
        {
          onSuccess: async () => {
            refetchProposalsByKey();
            setKeyActive(key, false);
          },
          onError: (error) => {
            setKeyActive(key, false);
            devLog('onCancelVote error', error);
          },
        },
      );
    },
    [cancelVoteMutation, refetchProposalsByKey],
  );
  // Logic from ModalProvider ends here

  const getItemTopWeight = useCallback(
    (itemKey: IPocItemKey) => {
      return (
        (project?.itemsTopWeight as Record<IPocItemKey, number>)?.[itemKey] || 0
      );
    },
    [project],
  );

  const displayProposalData = useMemo(() => {
    if (!proposalsByProject) return undefined;
    const itemsTopWeight = (project?.itemsTopWeight || {}) as Record<
      IPocItemKey,
      number
    >;
    const { withoutItemProposal, withItemProposal } =
      proposalsByProject as ILeadingProposalsTyped;
    const DataMap = new Map<string, IProjectDataItem>();
    withoutItemProposal.forEach((p) => {
      p.proposal.items.forEach((item) => {
        const row = {
          key: item.key,
          property: item.key,
          input: item.value,
          reference:
            p.proposal.refs?.find((ref) => ref.key === item.key) || null,
          submitter: p.proposal.creator,
          createdAt: p.proposal.createdAt,
          projectId: p.proposal.projectId,
          proposalId: p.proposal.id,
          itemTopWeight: itemsTopWeight[item.key as IPocItemKey] || 0,
        };
        DataMap.set(item.key, row);
      });
    });
    const proposalData = withItemProposal?.[0]?.proposal;
    if (proposalData) {
      proposalData.items.forEach((item) => {
        if (DataMap.has(item.key)) return;
        const row: IProjectDataItem = {
          key: item.key,
          property: item.key,
          input: item.value,
          reference:
            proposalData.refs?.find((ref) => ref.key === item.key) || null,
          submitter: proposalData.creator,
          createdAt: proposalData.createdAt,
          projectId: proposalData.projectId,
          proposalId: proposalData.id,
          itemTopWeight: itemsTopWeight[item.key as IPocItemKey] || 0,
        };
        DataMap.set(item.key, row);
      });
    }
    devLog('displayProposalData', Array.from(DataMap.values()));
    return Array.from(DataMap.values());
  }, [proposalsByProject, project]);

  const value: ProjectDetailContextType = {
    project: project as IProject,
    proposals,
    isProjectLoading,
    isProjectFetched,
    isProposalsLoading,
    isProposalsFetched,
    projectId,
    leadingProposals: proposalsByProject,
    isLeadingProposalsLoading,
    isLeadingProposalsFetched,
    displayProposalData,
    getItemTopWeight,

    // Merged values
    currentItemKey,
    setCurrentItemKey,
    proposalsByKey,
    proposalHistory,
    isProposalsByKeyLoading,
    isProposalsByKeyFetched,
    isProposalHistoryLoading,
    isProposalHistoryFetched,
    refetchProposalsByKey,
    refetchProposalHistory,
    inActionKeyMap,
    onCreateItemProposalVote,
    onSwitchItemProposalVote,
    onCancelVote,
    voteResultOfLeadingProposal,
  };

  return (
    <ProjectDetailContext.Provider value={value}>
      {children}
    </ProjectDetailContext.Provider>
  );
};

// Custom hook to use the context
export const useProjectDetailContext = () => {
  const context = useContext(ProjectDetailContext);
  if (context === undefined) {
    throw new Error(
      'useProjectDetailContext must be used within a ProjectDetailProvider',
    );
  }
  return context;
};
