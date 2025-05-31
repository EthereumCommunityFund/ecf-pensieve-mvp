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

import { IKeyItemDataForTable } from '@/components/pages/project/detail/table/ProjectDetailTableColumns';
import { useAuth } from '@/context/AuthContext';
import { trpc } from '@/lib/trpc/client';
import {
  ILeadingProposalHistory,
  ILeadingProposals,
  IProfileCreator,
  IProject,
  IProposal,
  IProposalsByProjectIdAndKey,
} from '@/types';
import { IPocItemKey } from '@/types/item';
import { devLog } from '@/utils/devLog';

import { IProjectTableRowData } from '../detail/types';

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
  displayProposalDataListOfProject?: IKeyItemDataForTable[];
  getItemTopWeight: (key: IPocItemKey) => number;
  displayProposalDataOfKey?: IProjectTableRowData;

  // Merged from ModalContextType
  currentItemKey: string | null;
  setCurrentItemKey: (key: string | null) => void;
  proposalsByProjectIdAndKey?: IProposalsByProjectIdAndKey;
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

  // utils
  openReferenceModal: boolean;
  showReferenceModal: (ref: string, key: IPocItemKey) => void;
  closeReferenceModal: () => void;
  currentRefValue: string | null;
  currentRefKey: IPocItemKey | null;
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
  displayProposalDataListOfProject: undefined,
  getItemTopWeight: () => 0,
  displayProposalDataOfKey: undefined,

  // Merged defaults
  currentItemKey: null,
  setCurrentItemKey: () => {},
  proposalsByProjectIdAndKey: undefined,
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

  openReferenceModal: false,
  showReferenceModal: () => {},
  currentRefValue: null,
  closeReferenceModal: () => {},
  currentRefKey: null,
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
  const [openReferenceModal, setOpenReferenceModal] = useState<boolean>(false);
  const [currentRefValue, setCurrentRefValue] = useState<string | null>(null);
  const [currentRefKey, setCurrentRefKey] = useState<IPocItemKey | null>(null);

  const [inActionKeyMap, setInActionKeyMap] = useState<
    Partial<Record<IPocItemKey, boolean>>
  >({});

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
    data: proposalsOfProject,
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
    data: leadingItemProposalsByProject,
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

  const {
    data: proposalsByProjectIdAndKey,
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
        devLog('getLeadingProposalHistoryByProjectIdAndKey', data);
        return data;
      },
    },
  );

  const getItemTopWeight = useCallback(
    (itemKey: IPocItemKey) => {
      return (
        (project?.itemsTopWeight as Record<IPocItemKey, number>)?.[itemKey] || 0
      );
    },
    [project],
  );

  const displayProposalDataListOfProject = useMemo(() => {
    if (!leadingItemProposalsByProject) return [];
    const itemsTopWeight = (project?.itemsTopWeight || {}) as Record<
      IPocItemKey,
      number
    >;
    const DataMap = new Map<string, IKeyItemDataForTable>();

    leadingItemProposalsByProject.forEach((proposal) => {
      const { projectId, itemProposal, isNotLeading } = proposal;
      const { key, createdAt, value, ref, creator, id } = itemProposal!;
      const row: IKeyItemDataForTable = {
        key: key!,
        property: key!,
        input: value,
        reference: ref ? { key, value: ref } : null,
        submitter: creator as IProfileCreator, // TODO: 这里的 creator 少字段
        createdAt: createdAt,
        projectId: projectId!,
        proposalId: Number(id), // 这个是 itemProposal 的 proposalId
        itemTopWeight: itemsTopWeight[key as IPocItemKey] || 0,
        isNotLeading: isNotLeading,
      };
      DataMap.set(key, row);
    });
    devLog('displayProposalDataListOfProject', Array.from(DataMap.values()));
    return Array.from(DataMap.values());
  }, [leadingItemProposalsByProject, project]);

  // 当前 itemKey 的 leading proposal 数据
  const displayProposalDataOfKey = useMemo(() => {
    if (!currentItemKey) return undefined;
    if (!proposalsByProjectIdAndKey) return undefined;

    const { leadingProposal } = proposalsByProjectIdAndKey;
    // 1、如果 leadingProposal 存在，则取 leadingProposal 的数据
    if (leadingProposal && leadingProposal.itemProposal) {
      const { key, value, ref, creator, createdAt, projectId, id } =
        leadingProposal.itemProposal;
      const weight = leadingProposal.itemProposal.voteRecords.reduce(
        (acc, vote) => acc + Number(vote.weight),
        0,
      );
      const voterMemberCount = leadingProposal.itemProposal.voteRecords.length;
      return {
        key,
        property: key,
        input: value,
        reference: ref ? { key, value: ref } : null,
        submitter: creator,
        createdAt: createdAt,
        projectId: projectId,
        proposalId: id,
        itemTopWeight: getItemTopWeight(key as IPocItemKey),
        support: {
          count: weight,
          voters: voterMemberCount,
        },
      };
    }
    // 2. 没有 item proposal 胜出, 取 allItemProposals 的数据
    const proposalItem = (
      proposalsByProjectIdAndKey.allItemProposals || []
    ).find((item) => item.key === currentItemKey);

    if (!proposalItem) {
      return undefined; // 没有找到对应 itemKey 的数据 -> non essential item (完全是新的)
    }

    const votesOfKey =
      proposalsByProjectIdAndKey?.allItemProposals.flatMap(
        (item) => item.voteRecords,
      ) || [];

    const sumOfWeight =
      votesOfKey?.reduce((acc, vote) => {
        return acc + Number(vote.weight);
      }, 0) || 0;
    const voterMemberCount = votesOfKey?.length || 0; // 每人只能投一票

    return {
      ...proposalItem,
      property: proposalItem.key,
      input: proposalItem.value,
      reference: proposalItem.ref
        ? { key: proposalItem.key, value: proposalItem.ref }
        : null,
      submitter: proposalItem.creator,
      proposalId: proposalItem.id,
      itemTopWeight: getItemTopWeight(proposalItem.key as IPocItemKey),
      support: {
        count: sumOfWeight,
        voters: voterMemberCount,
      },
    };
  }, [
    displayProposalDataListOfProject,
    currentItemKey,
    getItemTopWeight,
    proposalsByProjectIdAndKey,
  ]);

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

  const showReferenceModal = useCallback((ref: string, key: IPocItemKey) => {
    setOpenReferenceModal(true);
    setCurrentRefValue(ref);
    setCurrentRefKey(key);
  }, []);

  const closeReferenceModal = useCallback(() => {
    setOpenReferenceModal(false);
    setCurrentRefValue(null);
    setCurrentRefKey(null);
  }, []);

  const value: ProjectDetailContextType = {
    project: project as IProject,
    proposals: proposalsOfProject,
    isProjectLoading,
    isProjectFetched,
    isProposalsLoading,
    isProposalsFetched,
    projectId,
    leadingProposals: leadingItemProposalsByProject,
    isLeadingProposalsLoading,
    isLeadingProposalsFetched,
    displayProposalDataListOfProject,
    displayProposalDataOfKey,
    getItemTopWeight,

    currentItemKey,
    setCurrentItemKey,
    proposalsByProjectIdAndKey,
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

    // utils
    openReferenceModal,
    showReferenceModal,
    currentRefValue,
    currentRefKey: currentRefKey,
    closeReferenceModal,
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
