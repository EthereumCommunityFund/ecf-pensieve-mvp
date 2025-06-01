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
import { AllItemConfig } from '@/constants/itemConfig';
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
import { calculateItemStatusFields } from '@/utils/item';

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
  tableDataOfDisplayed: IProjectTableRowData[];
  tableDataOfSubmissionQueue: IProjectTableRowData[];
  showRowOverTaken: boolean;
  showRowIsLeading: boolean;

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
  showReferenceModal: (ref: string, key: IPocItemKey, reason: string) => void;
  closeReferenceModal: () => void;
  currentRefValue: string | null;
  currentRefKey: IPocItemKey | null;
  currentItemReason: string;
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
  tableDataOfDisplayed: [],
  tableDataOfSubmissionQueue: [],
  showRowOverTaken: false,
  showRowIsLeading: false,

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
  currentItemReason: '',
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
  const [currentItemReason, setCurrentItemReason] = useState<string>('');

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
      const { key, createdAt, value, ref, creator, id, reason } = itemProposal!;

      // 计算状态字段
      const hasProposal = (project?.hasProposalKeys || []).includes(
        key as IPocItemKey,
      );
      const statusFields = calculateItemStatusFields(key, hasProposal, {
        input: value,
      });

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
        reason: reason || undefined,
        isNotLeading: isNotLeading,
        accountability: AllItemConfig[key as IPocItemKey]?.accountability || [],
        legitimacy: AllItemConfig[key as IPocItemKey]?.legitimacy || [],
        ...statusFields,
      };
      DataMap.set(key, row);
    });
    devLog('displayProposalDataListOfProject', Array.from(DataMap.values()));
    return Array.from(DataMap.values());
  }, [leadingItemProposalsByProject, project]);

  const displayProposalDataOfKey = useMemo(() => {
    if (!currentItemKey) return undefined;
    if (!proposalsByProjectIdAndKey) return undefined;

    const { leadingProposal } = proposalsByProjectIdAndKey;
    // 1、如果 leadingProposal 存在，则取 leadingProposal 的数据
    if (leadingProposal && leadingProposal.itemProposal) {
      const { key, value, ref, creator, createdAt, projectId, id, reason } =
        leadingProposal.itemProposal;
      const weight = leadingProposal.itemProposal.voteRecords.reduce(
        (acc, vote) => acc + Number(vote.weight),
        0,
      );
      const voterMemberCount = leadingProposal.itemProposal.voteRecords.length;

      // 计算状态字段
      const hasProposal = (project?.hasProposalKeys || []).includes(
        key as IPocItemKey,
      );
      const statusFields = calculateItemStatusFields(key, hasProposal, {
        input: value,
      });

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
        accountability: AllItemConfig[key as IPocItemKey]?.accountability || [],
        legitimacy: AllItemConfig[key as IPocItemKey]?.legitimacy || [],
        support: {
          count: weight,
          voters: voterMemberCount,
        },
        reason: reason || undefined,
        ...statusFields,
      };
    }
    return undefined;
  }, [
    currentItemKey,
    getItemTopWeight,
    proposalsByProjectIdAndKey,
    project?.hasProposalKeys,
  ]);

  const tableDataOfDisplayed: IProjectTableRowData[] = useMemo(() => {
    if (!displayProposalDataOfKey) return [];
    return [displayProposalDataOfKey];
  }, [displayProposalDataOfKey]);

  const tableDataOfSubmissionQueue: IProjectTableRowData[] = useMemo(() => {
    if (!proposalsByProjectIdAndKey) return [];
    const { allItemProposals, leadingProposal } = proposalsByProjectIdAndKey;

    const list: IProjectTableRowData[] = allItemProposals
      .filter(
        (itemProposal) => itemProposal.id !== leadingProposal?.itemProposalId,
      )
      .map((itemProposal) => {
        const {
          creator,
          key,
          value = '',
          projectId,
          createdAt,
          id,
          voteRecords = [],
          ref = '',
        } = itemProposal;

        // 构建符合 IProjectDataItem 结构的数据
        const baseData = {
          key,
          property: key,
          input: value,
          reference: ref ? { key, value: ref } : null,
          submitter: creator,
          createdAt: createdAt,
          projectId: projectId,
          proposalId: id,
          itemTopWeight: getItemTopWeight(key as IPocItemKey),
        };

        // 对于单个item，每人只能投一票, 不需要根据用户去重
        const sumOfWeight = voteRecords.reduce((acc, vote) => {
          return acc + Number(vote.weight);
        }, 0);

        const voterMap = new Map<string, number>();

        voteRecords.forEach((voteRecord) => {
          const userId =
            typeof voteRecord.creator === 'string'
              ? voteRecord.creator
              : (voteRecord.creator as IProfileCreator).userId;
          voterMap.set(
            userId,
            (voterMap.get(userId) || 0) + Number(voteRecord.weight),
          );
        });

        return {
          ...baseData,
          reason: itemProposal.reason || undefined,
          support: {
            count: sumOfWeight,
            voters: voterMap.size,
          },
          accountability:
            AllItemConfig[key as IPocItemKey]?.accountability || [],
          legitimacy: AllItemConfig[key as IPocItemKey]?.legitimacy || [],
          ...calculateItemStatusFields(
            key,
            (project?.hasProposalKeys || []).includes(key as IPocItemKey),
            { input: value },
          ),
        };
      });

    // 根据 weight 排序
    return list.sort((a, b) => {
      return b.support.count - a.support.count;
    });
  }, [proposalsByProjectIdAndKey, getItemTopWeight, project?.hasProposalKeys]);

  const showRowOverTaken = useMemo(() => {
    // 原来有validated的leading item proposal,由于voter switch 投票，导致它的 weight不再是最高(后端已计算到 isNotLeading 字段)
    // 比 submission queue某一条的 weight(已排序，最高的 weight) 要低
    const { leadingProposal } = proposalsByProjectIdAndKey || {};
    if (!leadingProposal) return false;
    return !leadingProposal.isNotLeading;
  }, [proposalsByProjectIdAndKey]);

  const showRowIsLeading = useMemo(() => {
    const { leadingProposal } = proposalsByProjectIdAndKey || {};
    // 1、没有validated的 leading item proposal(仅限not essential item)
    if (!leadingProposal) return true;
    // 2、要展示showRowOverTaken时也需要展示showRowIsLeading
    return showRowOverTaken;
  }, [showRowOverTaken, proposalsByProjectIdAndKey]);

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

  const showReferenceModal = useCallback(
    (ref: string, key: IPocItemKey, reason: string) => {
      setOpenReferenceModal(true);
      setCurrentRefValue(ref);
      setCurrentRefKey(key);
      setCurrentItemReason(reason);
    },
    [],
  );

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
    tableDataOfDisplayed,
    tableDataOfSubmissionQueue,
    showRowOverTaken,
    showRowIsLeading,

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
    currentItemReason,
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
