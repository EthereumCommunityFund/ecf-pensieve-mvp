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
  IProject,
  IProposal,
  IProposalsByProjectIdAndKey,
} from '@/types';
import { IPocItemKey } from '@/types/item';
import { devLog } from '@/utils/devLog';
import { calculateItemStatusFields } from '@/utils/item';

import { IProjectTableRowData, IProposalCreator } from '../detail/types';

// Context type definition
interface ProjectDetailContextType {
  // Basic project data
  project?: IProject;
  proposals?: IProposal[];
  projectId: number;

  // Data loading states
  isProjectLoading: boolean;
  isProjectFetched: boolean;
  isProposalsLoading: boolean;
  isProposalsFetched: boolean;

  // Leading proposal data
  leadingProposals?: ILeadingProposals;
  isLeadingProposalsLoading: boolean;
  isLeadingProposalsFetched: boolean;

  // Display data
  displayProposalDataListOfProject?: IKeyItemDataForTable[];
  displayProposalDataOfKey?: IProjectTableRowData;
  tableDataOfDisplayed: IProjectTableRowData[];
  tableDataOfSubmissionQueue: IProjectTableRowData[];

  isLeadingProposalNotLeading: boolean;
  // Table display control
  showRowOverTaken: boolean;
  showRowIsLeading: boolean;

  // Utility functions
  getItemTopWeight: (key: IPocItemKey) => number;
  getLeadingProjectName: () => string;
  getLeadingTagline: () => string;
  getLeadingCategories: () => string[];
  getLeadingLogoUrl: () => string;

  // Current selected item state
  currentItemKey: string | null;
  setCurrentItemKey: (key: string | null) => void;

  // Proposal data queried by key
  proposalsByProjectIdAndKey?: IProposalsByProjectIdAndKey;
  proposalHistory?: ILeadingProposalHistory;
  isProposalsByKeyLoading: boolean;
  isProposalsByKeyFetched: boolean;
  isProposalHistoryLoading: boolean;
  isProposalHistoryFetched: boolean;

  // Data refresh operations
  refetchAll: () => Promise<void>;
  refetchProject: () => void;
  refetchLeadingProposals: () => void;
  refetchProposalsByKey: () => void;
  refetchProposalHistory: () => void;

  // Vote operation states
  inActionKeyMap: Partial<Record<IPocItemKey, boolean>>;
  inActionItemProposalIdMap: Record<number, boolean>;

  // Vote operations
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

  // Reference modal states
  openReferenceModal: boolean;
  currentRefValue: string | null;
  currentRefKey: IPocItemKey | null;
  currentItemReason: string;

  // SubmitterModal state management
  isSubmitterModalOpen: boolean;
  selectedSubmitter: IProposalCreator | null;
  selectedValidatedAt: Date | null;

  // Reference modal operations
  showReferenceModal: (ref: string, key: IPocItemKey, reason: string) => void;
  closeReferenceModal: () => void;

  // SubmitterModal operations
  showSubmitterModal: (submitter: IProposalCreator, validatedAt: Date) => void;
  closeSubmitterModal: () => void;
}

// Context default values
const createDefaultContext = (): ProjectDetailContextType => ({
  // Basic project data
  project: undefined,
  proposals: undefined,
  projectId: 0,

  // Data loading states
  isProjectLoading: true,
  isProjectFetched: false,
  isProposalsLoading: true,
  isProposalsFetched: false,

  // Leading proposal data
  leadingProposals: undefined,
  isLeadingProposalsLoading: true,
  isLeadingProposalsFetched: false,

  // Display data
  displayProposalDataListOfProject: undefined,
  displayProposalDataOfKey: undefined,
  tableDataOfDisplayed: [],
  tableDataOfSubmissionQueue: [],

  isLeadingProposalNotLeading: false,
  // Table display control
  showRowOverTaken: false,
  showRowIsLeading: false,

  // Utility functions
  getItemTopWeight: () => 0,
  getLeadingProjectName: () => '',
  getLeadingTagline: () => '',
  getLeadingCategories: () => [],
  getLeadingLogoUrl: () => '',

  // Current selected item state
  currentItemKey: null,
  setCurrentItemKey: () => {},

  // Proposal data queried by key
  proposalsByProjectIdAndKey: undefined,
  proposalHistory: undefined,
  isProposalsByKeyLoading: true,
  isProposalsByKeyFetched: false,
  isProposalHistoryLoading: true,
  isProposalHistoryFetched: false,

  // Data refresh operations
  refetchAll: () => Promise.resolve(),
  refetchProject: () => {},
  refetchLeadingProposals: () => {},
  refetchProposalsByKey: () => {},
  refetchProposalHistory: () => {},

  // Vote operation states
  inActionKeyMap: {},
  inActionItemProposalIdMap: {},

  // Vote operations
  onCreateItemProposalVote: () => Promise.resolve(),
  onSwitchItemProposalVote: () => Promise.resolve(),
  onCancelVote: () => Promise.resolve(),

  // Reference modal states
  openReferenceModal: false,
  currentRefValue: null,
  currentRefKey: null,
  currentItemReason: '',

  // SubmitterModal state management
  isSubmitterModalOpen: false,
  selectedSubmitter: null,
  selectedValidatedAt: null,

  // Reference modal operations
  showReferenceModal: () => {},
  closeReferenceModal: () => {},

  // SubmitterModal operations
  showSubmitterModal: () => {},
  closeSubmitterModal: () => {},
});

// Create Context
export const ProjectDetailContext = createContext<ProjectDetailContextType>(
  createDefaultContext(),
);

// Provider component interface
export interface ProjectDetailProviderProps {
  children: ReactNode;
}

// Provider component
export const ProjectDetailProvider = ({
  children,
}: ProjectDetailProviderProps) => {
  const { id } = useParams();
  const { profile } = useAuth();
  const projectId = Number(id);

  // Local state management
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

  // SubmitterModal state management
  const [isSubmitterModalOpen, setIsSubmitterModalOpen] = useState(false);
  const [selectedSubmitter, setSelectedSubmitter] =
    useState<IProposalCreator | null>(null);
  const [selectedValidatedAt, setSelectedValidatedAt] = useState<Date | null>(
    null,
  );

  // Project data query
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

  // Project proposal list query
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

  // Leading proposal query
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

  // Query proposal data by key
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

  // Proposal history query
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

  // Mutation definitions
  const createItemProposalVoteMutation =
    trpc.vote.createItemProposalVote.useMutation();
  const switchItemProposalVoteMutation =
    trpc.vote.switchItemProposalVote.useMutation();

  // Utility function: Get item top weight
  const getItemTopWeight = useCallback(
    (itemKey: IPocItemKey) => {
      return (
        (project?.itemsTopWeight as Record<IPocItemKey, number>)?.[itemKey] || 0
      );
    },
    [project?.itemsTopWeight],
  );

  // Calculate displayed proposal data list
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

      // Calculate status fields
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
        submitter: creator as IProposalCreator,
        createdAt: createdAt,
        projectId: projectId!,
        proposalId: Number(id),
        itemTopWeight: itemsTopWeight[key as IPocItemKey] || 0,
        reason: reason || undefined,
        isNotLeading: isNotLeading,
        accountability: AllItemConfig[key as IPocItemKey]?.accountability || [],
        legitimacy: AllItemConfig[key as IPocItemKey]?.legitimacy || [],
        accountabilityMetrics:
          AllItemConfig[key as IPocItemKey]?.accountability || [],
        legitimacyMetrics: AllItemConfig[key as IPocItemKey]?.legitimacy || [],
        ...statusFields,
      };
      DataMap.set(key, row);
    });

    const result = Array.from(DataMap.values());
    devLog(
      'displayProposalDataListOfProject - calculated',
      result.length,
      'items',
    );

    return result;
  }, [
    leadingItemProposalsByProject,
    project?.itemsTopWeight,
    project?.hasProposalKeys,
  ]);

  // Utility function: Get leading project name
  const getLeadingProjectName = useCallback(() => {
    // Try to get the leading name from proposals
    const nameProposal = displayProposalDataListOfProject?.find(
      (item) => item.key === 'name',
    );

    // If we have a leading name proposal that's not marked as "not leading", use it
    if (nameProposal && !nameProposal.isNotLeading && nameProposal.input) {
      return nameProposal.input as string;
    }

    // Otherwise, fallback to the basic project name
    return project?.name || '';
  }, [displayProposalDataListOfProject, project?.name]);

  // Utility function: Get leading project tagline
  const getLeadingTagline = useCallback(() => {
    // Try to get the leading tagline from proposals
    const taglineProposal = displayProposalDataListOfProject?.find(
      (item) => item.key === 'tagline',
    );

    // If we have a leading tagline proposal that's not marked as "not leading", use it
    if (
      taglineProposal &&
      !taglineProposal.isNotLeading &&
      taglineProposal.input
    ) {
      return taglineProposal.input as string;
    }

    // Otherwise, fallback to the basic project tagline
    return project?.tagline || '';
  }, [displayProposalDataListOfProject, project?.tagline]);

  // Utility function: Get leading project categories
  const getLeadingCategories = useCallback(() => {
    // Try to get the leading categories from proposals
    const categoriesProposal = displayProposalDataListOfProject?.find(
      (item) => item.key === 'categories',
    );

    // If we have a leading categories proposal that's not marked as "not leading", use it
    if (
      categoriesProposal &&
      !categoriesProposal.isNotLeading &&
      categoriesProposal.input
    ) {
      return categoriesProposal.input as string[];
    }

    // Otherwise, fallback to the basic project categories
    return project?.categories || [];
  }, [displayProposalDataListOfProject, project?.categories]);

  // Utility function: Get leading project logo URL
  const getLeadingLogoUrl = useCallback(() => {
    // Try to get the leading logo URL from proposals
    const logoUrlProposal = displayProposalDataListOfProject?.find(
      (item) => item.key === 'logoUrl',
    );

    // If we have a leading logo URL proposal that's not marked as "not leading", use it
    if (
      logoUrlProposal &&
      !logoUrlProposal.isNotLeading &&
      logoUrlProposal.input
    ) {
      return logoUrlProposal.input as string;
    }

    // Otherwise, fallback to the basic project logo URL
    return project?.logoUrl || '';
  }, [displayProposalDataListOfProject, project?.logoUrl]);

  // Calculate display data for current selected key
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

      // Calculate status fields
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
        accountabilityMetrics:
          AllItemConfig[key as IPocItemKey]?.accountability || [],
        legitimacyMetrics: AllItemConfig[key as IPocItemKey]?.legitimacy || [],
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

  // Calculate displayed table data
  const tableDataOfDisplayed: IProjectTableRowData[] = useMemo(() => {
    if (!displayProposalDataOfKey) return [];
    return [displayProposalDataOfKey];
  }, [displayProposalDataOfKey]);

  // Calculate submission queue table data
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

        // Build base data
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

        // Calculate weight and voters
        const sumOfWeight = voteRecords.reduce(
          (acc, vote) => acc + Number(vote.weight),
          0,
        );
        const voterMap = new Map<string, number>();

        voteRecords.forEach((voteRecord) => {
          const userId =
            typeof voteRecord.creator === 'string'
              ? voteRecord.creator
              : (voteRecord.creator as IProposalCreator).userId;
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
          accountabilityMetrics:
            AllItemConfig[key as IPocItemKey]?.accountability || [],
          legitimacyMetrics:
            AllItemConfig[key as IPocItemKey]?.legitimacy || [],
          ...calculateItemStatusFields(
            key,
            (project?.hasProposalKeys || []).includes(key as IPocItemKey),
            { input: value },
          ),
        };
      });

    // Sort by weight
    return list.sort((a, b) => b.support.count - a.support.count);
  }, [proposalsByProjectIdAndKey, getItemTopWeight, project?.hasProposalKeys]);

  const isLeadingProposalNotLeading = useMemo(() => {
    const { leadingProposal } = proposalsByProjectIdAndKey || {};
    if (!leadingProposal) return false;
    return !!leadingProposal.isNotLeading;
  }, [proposalsByProjectIdAndKey]);

  // Calculate whether to show overtaken row
  const showRowOverTaken = useMemo(() => {
    const { leadingProposal } = proposalsByProjectIdAndKey || {};
    if (!leadingProposal) return false;
    const leadingProposalWeight =
      leadingProposal.itemProposal?.voteRecords.reduce(
        (acc, vote) => acc + Number(vote.weight),
        0,
      ) || 0;
    const weightOfFirstProposalInQueue =
      tableDataOfSubmissionQueue[0]?.support.count || 0;
    if (
      !!leadingProposal.isNotLeading &&
      weightOfFirstProposalInQueue > leadingProposalWeight
    ) {
      return true;
    }
    return false;
  }, [proposalsByProjectIdAndKey, tableDataOfSubmissionQueue]);

  // Calculate whether to show leading row
  const showRowIsLeading = useMemo(() => {
    const { leadingProposal } = proposalsByProjectIdAndKey || {};
    if (!leadingProposal) return true;
    return showRowOverTaken;
  }, [showRowOverTaken, proposalsByProjectIdAndKey]);

  // Data refresh function
  const refetchAll = useCallback(async () => {
    // First refetch project data to get updated itemsTopWeight
    await refetchProject();

    // Then refetch leading proposals and current key proposals
    await Promise.all([refetchLeadingProposals(), refetchProposalsByKey()]);
  }, [refetchProject, refetchLeadingProposals, refetchProposalsByKey]);

  // Set item proposal active state
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

  // Create vote operation
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

  // Switch vote operation
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

  const onCancelVote = useCallback(
    async (key: IPocItemKey, voteRecordId: number, itemProposalId: number) => {
      devLog('no onCancelVote', key, voteRecordId, itemProposalId);
    },
    [],
  );

  // Show reference modal
  const showReferenceModal = useCallback(
    (ref: string, key: IPocItemKey, reason: string) => {
      setOpenReferenceModal(true);
      setCurrentRefValue(ref);
      setCurrentRefKey(key);
      setCurrentItemReason(reason);
    },
    [],
  );

  const showSubmitterModal = useCallback(
    (submitter: IProposalCreator, validatedAt: Date) => {
      setSelectedSubmitter(submitter);
      setSelectedValidatedAt(validatedAt);
      setIsSubmitterModalOpen(true);
    },
    [],
  );

  const closeSubmitterModal = useCallback(() => {
    setSelectedSubmitter(null);
    setSelectedValidatedAt(null);
    setIsSubmitterModalOpen(false);
  }, []);

  // Close reference modal
  const closeReferenceModal = useCallback(() => {
    setOpenReferenceModal(false);
    setCurrentRefValue(null);
    setCurrentRefKey(null);
  }, []);

  // Context value assembly
  const contextValue = useMemo(
    (): ProjectDetailContextType => ({
      // Basic project data
      project: project as IProject,
      proposals: proposalsOfProject,
      projectId,

      // Data loading states
      isProjectLoading,
      isProjectFetched,
      isProposalsLoading,
      isProposalsFetched,

      // Leading proposal data
      leadingProposals: leadingItemProposalsByProject,
      isLeadingProposalsLoading,
      isLeadingProposalsFetched,

      // Display data
      displayProposalDataListOfProject,
      displayProposalDataOfKey,
      tableDataOfDisplayed,
      tableDataOfSubmissionQueue,

      isLeadingProposalNotLeading,
      // Table display control
      showRowOverTaken,
      showRowIsLeading,

      // Utility functions
      getItemTopWeight,
      getLeadingProjectName,
      getLeadingTagline,
      getLeadingCategories,
      getLeadingLogoUrl,

      // Current selected item state
      currentItemKey,
      setCurrentItemKey,

      // Proposal data queried by key
      proposalsByProjectIdAndKey,
      proposalHistory,
      isProposalsByKeyLoading,
      isProposalsByKeyFetched,
      isProposalHistoryLoading,
      isProposalHistoryFetched,

      // Data refresh operations
      refetchAll,
      refetchProject,
      refetchLeadingProposals,
      refetchProposalsByKey,
      refetchProposalHistory,

      // Vote operation states
      inActionKeyMap,
      inActionItemProposalIdMap,

      // Vote operations
      onCreateItemProposalVote,
      onSwitchItemProposalVote,
      onCancelVote,

      // Reference modal states
      openReferenceModal,
      currentRefValue,
      currentRefKey,
      currentItemReason,

      // SubmitterModal state management
      isSubmitterModalOpen,
      selectedSubmitter,
      selectedValidatedAt,

      // Reference modal operations
      showReferenceModal,
      closeReferenceModal,

      // SubmitterModal operations
      showSubmitterModal,
      closeSubmitterModal,
    }),
    [
      // Basic project data dependencies
      project,
      proposalsOfProject,
      projectId,

      // Data loading state dependencies
      isProjectLoading,
      isProjectFetched,
      isProposalsLoading,
      isProposalsFetched,

      // Leading proposal data dependencies
      leadingItemProposalsByProject,
      isLeadingProposalsLoading,
      isLeadingProposalsFetched,

      // Display data dependencies
      displayProposalDataListOfProject,
      displayProposalDataOfKey,
      tableDataOfDisplayed,
      tableDataOfSubmissionQueue,

      isLeadingProposalNotLeading,
      // Table display control dependencies
      showRowOverTaken,
      showRowIsLeading,

      // Utility function dependencies
      getItemTopWeight,
      getLeadingProjectName,
      getLeadingTagline,
      getLeadingCategories,
      getLeadingLogoUrl,

      // Current selected item state dependencies
      currentItemKey,
      setCurrentItemKey,

      // Proposal data queried by key dependencies
      proposalsByProjectIdAndKey,
      proposalHistory,
      isProposalsByKeyLoading,
      isProposalsByKeyFetched,
      isProposalHistoryLoading,
      isProposalHistoryFetched,

      // Data refresh operation dependencies
      refetchAll,
      refetchProject,
      refetchLeadingProposals,
      refetchProposalsByKey,
      refetchProposalHistory,

      // Vote operation state dependencies
      inActionKeyMap,
      inActionItemProposalIdMap,

      // Vote operation dependencies
      onCreateItemProposalVote,
      onSwitchItemProposalVote,
      onCancelVote,

      // Reference modal state dependencies
      openReferenceModal,
      currentRefValue,
      currentRefKey,
      currentItemReason,

      // SubmitterModal state management dependencies
      isSubmitterModalOpen,
      selectedSubmitter,
      selectedValidatedAt,

      // Reference modal operation dependencies
      showReferenceModal,
      closeReferenceModal,

      // SubmitterModal operation dependencies
      showSubmitterModal,
      closeSubmitterModal,
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
