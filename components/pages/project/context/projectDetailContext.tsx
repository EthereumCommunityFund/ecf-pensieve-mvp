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
  ILeadingProposals,
  ILeadingProposalsTyped,
  IProject,
  IProposal,
} from '@/types';
import { IPocItemKey } from '@/types/item';
import { devLog } from '@/utils/devLog';
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
  inActionKeyMap: Partial<Record<IPocItemKey, boolean>>;
  onCreateVote: (key: IPocItemKey, proposalId: number) => Promise<void>;
  onSwitchVote: (key: IPocItemKey, proposalId: number) => Promise<void>;
  onCancelVote: (key: IPocItemKey, voteRecordId: number) => Promise<void>;
  getItemTopWeight: (key: IPocItemKey) => number;
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
  inActionKeyMap: {},
  onCreateVote: async () => {},
  onSwitchVote: async () => {},
  onCancelVote: async () => {},
  getItemTopWeight: () => 0,
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

  const [inActionKeyMap, setInActionKeyMap] = useState<
    Partial<Record<IPocItemKey, boolean>>
  >({});

  const createVoteMutation = trpc.vote.createVote.useMutation();
  const switchVoteMutation = trpc.vote.switchVote.useMutation();
  const cancelVoteMutation = trpc.vote.cancelVote.useMutation();

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

  const getItemTopWeight = useCallback(
    (itemKey: IPocItemKey) => {
      return (
        (project?.itemsTopWeight as Record<IPocItemKey, number>)?.[
          itemKey as IPocItemKey
        ] || 0
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
    // 1. 优先取withItemProposal里的item proposal数据
    // 2. 其次取withoutItemProposal里的proposal维度(leading proposal)的item数据
    // TODO  暂时看不到item proposal 的数据，先处理投票后再来处理这里
    const DataMap = new Map<string, IProjectDataItem>();
    withoutItemProposal.forEach((project) => {
      project.proposal.items.forEach((item) => {
        const row = {
          key: item.key,
          property: item.key,
          input: item.value,
          reference:
            project.proposal.refs?.find((ref) => ref.key === item.key) || null,
          submitter: project.proposal.creator,
          createdAt: project.proposal.createdAt,
          projectId: project.proposal.projectId,
          proposalId: project.proposal.id,
          itemTopWeight: itemsTopWeight[item.key as IPocItemKey] || 0,
        };
        DataMap.set(item.key, row);
      });
    });
    const proposal = withItemProposal?.[0]?.proposal;
    if (proposal) {
      proposal.items.forEach((item) => {
        if (DataMap.has(item.key)) return;
        const row: IProjectDataItem = {
          key: item.key,
          property: item.key,
          input: item.value,
          reference: proposal.refs?.find((ref) => ref.key === item.key) || null,
          submitter: proposal.creator,
          createdAt: proposal.createdAt,
          projectId: proposal.projectId,
          proposalId: proposal.id,
          itemTopWeight: itemsTopWeight[item.key as IPocItemKey] || 0,
        };
        DataMap.set(item.key, row);
      });
    }
    devLog('displayProposalData', Array.from(DataMap.values()));
    return Array.from(DataMap.values());
  }, [proposalsByProject, project]);

  const setKeyActive = (key: IPocItemKey, active: boolean) => {
    setInActionKeyMap((pre) => ({
      ...pre,
      [key]: active,
    }));
  };

  const onCreateVote = useCallback(
    async (key: IPocItemKey, proposalId: number) => {
      setKeyActive(key, true);
      console.log('onCreateVote', key, proposalId);
      createVoteMutation.mutate(
        { proposalId, key },
        {
          onSuccess: async (data) => {
            // TODO refetch proposal and votes
            setKeyActive(key, false);
          },
          onError: (error) => {
            setKeyActive(key, false);
            devLog('onVote error', error);
          },
        },
      );
    },
    [createVoteMutation],
  );

  const onSwitchVote = useCallback(
    async (key: IPocItemKey, proposalId: number) => {
      setKeyActive(key, true);
      console.log('onSwitchVote', key, proposalId);
      switchVoteMutation.mutate(
        { proposalId, key },
        {
          onSuccess: async (data) => {
            // TODO refetch proposal and votes
            setKeyActive(key, false);
          },
          onError: (error) => {
            setKeyActive(key, false);
            // devLog('onSwitchVote error', error);
          },
        },
      );
    },
    [switchVoteMutation],
  );

  const onCancelVote = useCallback(
    async (key: IPocItemKey, voteRecordId: number) => {
      setKeyActive(key, true);
      console.log('onCancelVote', key, voteRecordId);
      cancelVoteMutation.mutate(
        { id: voteRecordId },
        {
          onSuccess: async (data) => {
            // TODO refetch proposal and votes
            setKeyActive(key, false);
          },
          onError: (error) => {
            setKeyActive(key, false);
          },
        },
      );
    },
    [cancelVoteMutation],
  );

  // Context value
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
    inActionKeyMap,
    onCreateVote,
    onSwitchVote,
    onCancelVote,
    getItemTopWeight,
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
      'useProjectDetail must be used within a ProjectDetailProvider',
    );
  }
  return context;
};
