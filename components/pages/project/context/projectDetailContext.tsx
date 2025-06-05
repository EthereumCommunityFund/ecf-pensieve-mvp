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

// Context 类型定义
interface ProjectDetailContextType {
  // 基础项目数据
  project?: IProject;
  proposals?: IProposal[];
  projectId: number;

  // 数据加载状态
  isProjectLoading: boolean;
  isProjectFetched: boolean;
  isProposalsLoading: boolean;
  isProposalsFetched: boolean;

  // 领先提案数据
  leadingProposals?: ILeadingProposals;
  isLeadingProposalsLoading: boolean;
  isLeadingProposalsFetched: boolean;

  // 显示数据
  displayProposalDataListOfProject?: IKeyItemDataForTable[];
  displayProposalDataOfKey?: IProjectTableRowData;
  tableDataOfDisplayed: IProjectTableRowData[];
  tableDataOfSubmissionQueue: IProjectTableRowData[];

  // 表格显示控制
  showRowOverTaken: boolean;
  showRowIsLeading: boolean;

  // 工具函数
  getItemTopWeight: (key: IPocItemKey) => number;

  // 当前选中项状态
  currentItemKey: string | null;
  setCurrentItemKey: (key: string | null) => void;

  // 按键查询的提案数据
  proposalsByProjectIdAndKey?: IProposalsByProjectIdAndKey;
  proposalHistory?: ILeadingProposalHistory;
  isProposalsByKeyLoading: boolean;
  isProposalsByKeyFetched: boolean;
  isProposalHistoryLoading: boolean;
  isProposalHistoryFetched: boolean;

  // 数据刷新操作
  refetchAll: () => Promise<void>;
  refetchProject: () => void;
  refetchLeadingProposals: () => void;
  refetchProposalsByKey: () => void;
  refetchProposalHistory: () => void;

  // 投票操作状态
  inActionKeyMap: Partial<Record<IPocItemKey, boolean>>;
  inActionItemProposalIdMap: Record<number, boolean>;

  // 投票操作
  onCreateItemProposalVote: (
    key: IPocItemKey,
    itemProposalId: number,
  ) => Promise<void>;
  onSwitchItemProposalVote: (
    key: IPocItemKey,
    itemProposalId: number,
  ) => Promise<void>;
  onCancelVote: (
    key: IPocItemKey,
    voteRecordId: number,
    itemProposalId: number,
  ) => Promise<void>;

  // 引用模态框状态
  openReferenceModal: boolean;
  currentRefValue: string | null;
  currentRefKey: IPocItemKey | null;
  currentItemReason: string;

  // 引用模态框操作
  showReferenceModal: (ref: string, key: IPocItemKey, reason: string) => void;
  closeReferenceModal: () => void;
}

// Context 默认值
const createDefaultContext = (): ProjectDetailContextType => ({
  // 基础项目数据
  project: undefined,
  proposals: undefined,
  projectId: 0,

  // 数据加载状态
  isProjectLoading: true,
  isProjectFetched: false,
  isProposalsLoading: true,
  isProposalsFetched: false,

  // 领先提案数据
  leadingProposals: undefined,
  isLeadingProposalsLoading: true,
  isLeadingProposalsFetched: false,

  // 显示数据
  displayProposalDataListOfProject: undefined,
  displayProposalDataOfKey: undefined,
  tableDataOfDisplayed: [],
  tableDataOfSubmissionQueue: [],

  // 表格显示控制
  showRowOverTaken: false,
  showRowIsLeading: false,

  // 工具函数
  getItemTopWeight: () => 0,

  // 当前选中项状态
  currentItemKey: null,
  setCurrentItemKey: () => {},

  // 按键查询的提案数据
  proposalsByProjectIdAndKey: undefined,
  proposalHistory: undefined,
  isProposalsByKeyLoading: true,
  isProposalsByKeyFetched: false,
  isProposalHistoryLoading: true,
  isProposalHistoryFetched: false,

  // 数据刷新操作
  refetchAll: () => Promise.resolve(),
  refetchProject: () => {},
  refetchLeadingProposals: () => {},
  refetchProposalsByKey: () => {},
  refetchProposalHistory: () => {},

  // 投票操作状态
  inActionKeyMap: {},
  inActionItemProposalIdMap: {},

  // 投票操作
  onCreateItemProposalVote: () => Promise.resolve(),
  onSwitchItemProposalVote: () => Promise.resolve(),
  onCancelVote: () => Promise.resolve(),

  // 引用模态框状态
  openReferenceModal: false,
  currentRefValue: null,
  currentRefKey: null,
  currentItemReason: '',

  // 引用模态框操作
  showReferenceModal: () => {},
  closeReferenceModal: () => {},
});

// 创建 Context
export const ProjectDetailContext = createContext<ProjectDetailContextType>(
  createDefaultContext(),
);

// Provider 组件接口
export interface ProjectDetailProviderProps {
  children: ReactNode;
}

// Provider 组件
export const ProjectDetailProvider = ({
  children,
}: ProjectDetailProviderProps) => {
  const { id } = useParams();
  const { profile } = useAuth();
  const projectId = Number(id);

  // 本地状态管理
  const [currentItemKey, setCurrentItemKey] = useState<string | null>(null);
  const [openReferenceModal, setOpenReferenceModal] = useState<boolean>(false);
  const [currentRefValue, setCurrentRefValue] = useState<string | null>(null);
  const [currentRefKey, setCurrentRefKey] = useState<IPocItemKey | null>(null);
  const [currentItemReason, setCurrentItemReason] = useState<string>('');
  const [inActionKeyMap, setInActionKeyMap] = useState<
    Partial<Record<IPocItemKey, boolean>>
  >({});
  const [inActionItemProposalIdMap, setInActionItemProposalIdMap] = useState<
    Record<number, boolean>
  >({});

  // 项目数据查询
  const {
    data: project,
    isLoading: isProjectLoading,
    isFetched: isProjectFetched,
    refetch: refetchProject,
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

  // 项目提案列表查询
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

  // 领先提案查询
  const {
    data: leadingItemProposalsByProject,
    isLoading: isLeadingProposalsLoading,
    isFetched: isLeadingProposalsFetched,
    refetch: refetchLeadingProposals,
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

  // 按键查询提案数据
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

  // 提案历史查询
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

  // Mutation 定义
  const createItemProposalVoteMutation =
    trpc.vote.createItemProposalVote.useMutation();
  const switchItemProposalVoteMutation =
    trpc.vote.switchItemProposalVote.useMutation();
  const cancelVoteMutation = trpc.vote.cancelVote.useMutation();

  // 工具函数：获取项目权重
  const getItemTopWeight = useCallback(
    (itemKey: IPocItemKey) => {
      return (
        (project?.itemsTopWeight as Record<IPocItemKey, number>)?.[itemKey] || 0
      );
    },
    [project?.itemsTopWeight],
  );

  // 计算显示的提案数据列表
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
        submitter: creator as IProfileCreator,
        createdAt: createdAt,
        projectId: projectId!,
        proposalId: Number(id),
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
  }, [
    leadingItemProposalsByProject,
    project?.itemsTopWeight,
    project?.hasProposalKeys,
  ]);

  // 计算当前选中键的显示数据
  const displayProposalDataOfKey = useMemo(() => {
    if (!currentItemKey || !proposalsByProjectIdAndKey) return undefined;

    const { leadingProposal } = proposalsByProjectIdAndKey;

    if (leadingProposal?.itemProposal) {
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
    proposalsByProjectIdAndKey,
    project?.hasProposalKeys,
    getItemTopWeight,
  ]);

  // 计算已显示的表格数据
  const tableDataOfDisplayed: IProjectTableRowData[] = useMemo(() => {
    if (!displayProposalDataOfKey) return [];
    return [displayProposalDataOfKey];
  }, [displayProposalDataOfKey]);

  // 计算提交队列的表格数据
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

        // 构建基础数据
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

        // 计算权重和投票者
        const sumOfWeight = voteRecords.reduce(
          (acc, vote) => acc + Number(vote.weight),
          0,
        );
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

    // 根据权重排序
    return list.sort((a, b) => b.support.count - a.support.count);
  }, [proposalsByProjectIdAndKey, getItemTopWeight, project?.hasProposalKeys]);

  // 计算是否显示被超越行
  const showRowOverTaken = useMemo(() => {
    const { leadingProposal } = proposalsByProjectIdAndKey || {};
    if (!leadingProposal) return false;
    return !!leadingProposal.isNotLeading;
  }, [proposalsByProjectIdAndKey]);

  // 计算是否显示领先行
  const showRowIsLeading = useMemo(() => {
    const { leadingProposal } = proposalsByProjectIdAndKey || {};
    if (!leadingProposal) return true;
    return showRowOverTaken;
  }, [showRowOverTaken, proposalsByProjectIdAndKey]);

  // 数据刷新函数
  const refetchAll = useCallback(async () => {
    await Promise.all([
      refetchProject(),
      refetchLeadingProposals(),
      refetchProposalsByKey(),
    ]);
  }, [refetchProject, refetchLeadingProposals, refetchProposalsByKey]);

  // 设置项目提案活动状态
  const setItemProposalActive = useCallback(
    (key: IPocItemKey, itemProposalId: number, active: boolean) => {
      setInActionKeyMap((pre) => ({ ...pre, [key]: active }));
      setInActionItemProposalIdMap((pre) => ({
        ...pre,
        [itemProposalId]: active,
      }));
    },
    [],
  );

  // 创建投票操作
  const onCreateItemProposalVote = useCallback(
    async (key: IPocItemKey, itemProposalId: number) => {
      setItemProposalActive(key, itemProposalId, true);
      createItemProposalVoteMutation.mutate(
        { itemProposalId, key },
        {
          onSuccess: async () => {
            devLog('onCreateItemProposalVote success', key, itemProposalId);
            await refetchAll();
            setItemProposalActive(key, itemProposalId, false);
          },
          onError: (error) => {
            setItemProposalActive(key, itemProposalId, false);
            devLog('onCreateItemProposalVote error', error);
          },
        },
      );
    },
    [createItemProposalVoteMutation, refetchAll, setItemProposalActive],
  );

  // 切换投票操作
  const onSwitchItemProposalVote = useCallback(
    async (key: IPocItemKey, itemProposalId: number) => {
      setItemProposalActive(key, itemProposalId, true);
      switchItemProposalVoteMutation.mutate(
        { itemProposalId, key },
        {
          onSuccess: async () => {
            await refetchAll();
            setItemProposalActive(key, itemProposalId, false);
          },
          onError: (error) => {
            setItemProposalActive(key, itemProposalId, false);
            devLog('onSwitchItemProposalVote error', error);
          },
        },
      );
    },
    [switchItemProposalVoteMutation, refetchAll, setItemProposalActive],
  );

  // 取消投票操作
  const onCancelVote = useCallback(
    async (key: IPocItemKey, voteRecordId: number, itemProposalId: number) => {
      setItemProposalActive(key, voteRecordId, true);
      cancelVoteMutation.mutate(
        { id: voteRecordId },
        {
          onSuccess: async () => {
            await Promise.all([
              refetchProject(),
              refetchProposalsByKey(),
              refetchLeadingProposals(),
            ]);
            setItemProposalActive(key, itemProposalId, false);
          },
          onError: (error) => {
            setItemProposalActive(key, itemProposalId, false);
            devLog('onCancelVote error', error);
          },
        },
      );
    },
    [
      cancelVoteMutation,
      refetchProject,
      refetchProposalsByKey,
      refetchLeadingProposals,
      setItemProposalActive,
    ],
  );

  // 显示引用模态框
  const showReferenceModal = useCallback(
    (ref: string, key: IPocItemKey, reason: string) => {
      setOpenReferenceModal(true);
      setCurrentRefValue(ref);
      setCurrentRefKey(key);
      setCurrentItemReason(reason);
    },
    [],
  );

  // 关闭引用模态框
  const closeReferenceModal = useCallback(() => {
    setOpenReferenceModal(false);
    setCurrentRefValue(null);
    setCurrentRefKey(null);
  }, []);

  // Context 值组装
  const contextValue = useMemo(
    (): ProjectDetailContextType => ({
      // 基础项目数据
      project: project as IProject,
      proposals: proposalsOfProject,
      projectId,

      // 数据加载状态
      isProjectLoading,
      isProjectFetched,
      isProposalsLoading,
      isProposalsFetched,

      // 领先提案数据
      leadingProposals: leadingItemProposalsByProject,
      isLeadingProposalsLoading,
      isLeadingProposalsFetched,

      // 显示数据
      displayProposalDataListOfProject,
      displayProposalDataOfKey,
      tableDataOfDisplayed,
      tableDataOfSubmissionQueue,

      // 表格显示控制
      showRowOverTaken,
      showRowIsLeading,

      // 工具函数
      getItemTopWeight,

      // 当前选中项状态
      currentItemKey,
      setCurrentItemKey,

      // 按键查询的提案数据
      proposalsByProjectIdAndKey,
      proposalHistory,
      isProposalsByKeyLoading,
      isProposalsByKeyFetched,
      isProposalHistoryLoading,
      isProposalHistoryFetched,

      // 数据刷新操作
      refetchAll,
      refetchProject,
      refetchLeadingProposals,
      refetchProposalsByKey,
      refetchProposalHistory,

      // 投票操作状态
      inActionKeyMap,
      inActionItemProposalIdMap,

      // 投票操作
      onCreateItemProposalVote,
      onSwitchItemProposalVote,
      onCancelVote,

      // 引用模态框状态
      openReferenceModal,
      currentRefValue,
      currentRefKey,
      currentItemReason,

      // 引用模态框操作
      showReferenceModal,
      closeReferenceModal,
    }),
    [
      // 基础项目数据依赖
      project,
      proposalsOfProject,
      projectId,

      // 数据加载状态依赖
      isProjectLoading,
      isProjectFetched,
      isProposalsLoading,
      isProposalsFetched,

      // 领先提案数据依赖
      leadingItemProposalsByProject,
      isLeadingProposalsLoading,
      isLeadingProposalsFetched,

      // 显示数据依赖
      displayProposalDataListOfProject,
      displayProposalDataOfKey,
      tableDataOfDisplayed,
      tableDataOfSubmissionQueue,

      // 表格显示控制依赖
      showRowOverTaken,
      showRowIsLeading,

      // 工具函数依赖
      getItemTopWeight,

      // 当前选中项状态依赖
      currentItemKey,
      setCurrentItemKey,

      // 按键查询的提案数据依赖
      proposalsByProjectIdAndKey,
      proposalHistory,
      isProposalsByKeyLoading,
      isProposalsByKeyFetched,
      isProposalHistoryLoading,
      isProposalHistoryFetched,

      // 数据刷新操作依赖
      refetchAll,
      refetchProject,
      refetchLeadingProposals,
      refetchProposalsByKey,
      refetchProposalHistory,

      // 投票操作状态依赖
      inActionKeyMap,
      inActionItemProposalIdMap,

      // 投票操作依赖
      onCreateItemProposalVote,
      onSwitchItemProposalVote,
      onCancelVote,

      // 引用模态框状态依赖
      openReferenceModal,
      currentRefValue,
      currentRefKey,
      currentItemReason,

      // 引用模态框操作依赖
      showReferenceModal,
      closeReferenceModal,
    ],
  );

  return (
    <ProjectDetailContext.Provider value={contextValue}>
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
