'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';

import { trpc } from '@/lib/trpc/client';
import { ILeadingProposalHistory, IProposalsByProjectIdAndKey } from '@/types';
import { IPocItemKey } from '@/types/item';
import { devLog } from '@/utils/devLog';

// Define the context type
interface ModalContextType {
  proposalsByKey?: IProposalsByProjectIdAndKey;
  proposalHistory?: ILeadingProposalHistory;
  isProposalsByKeyLoading: boolean;
  isProposalsByKeyFetched: boolean;
  isProposalHistoryLoading: boolean;
  isProposalHistoryFetched: boolean;
  projectId: number;
  itemKey: string;
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
}

// Create the context with default values
export const ModalContext = createContext<ModalContextType>({
  proposalsByKey: undefined,
  proposalHistory: undefined,
  isProposalsByKeyLoading: true,
  isProposalsByKeyFetched: false,
  isProposalHistoryLoading: true,
  isProposalHistoryFetched: false,
  projectId: 0,
  itemKey: '',
  refetchProposalsByKey: () => {},
  refetchProposalHistory: () => {},
  inActionKeyMap: {},
  onCreateItemProposalVote: () => Promise.resolve(),
  onSwitchItemProposalVote: () => Promise.resolve(),
  onCancelVote: () => Promise.resolve(),
});

// Provider component
export const ModalProvider = ({
  children,
  projectId,
  itemKey,
}: {
  children: ReactNode;
  projectId: number;
  itemKey: string;
}) => {
  const {
    data: proposalsByKey,
    isLoading: isProposalsByKeyLoading,
    isFetched: isProposalsByKeyFetched,
    refetch: refetchProposalsByKey,
  } = trpc.projectLog.getProposalsByProjectIdAndKey.useQuery(
    { projectId, key: itemKey },
    {
      enabled: !!projectId && !!itemKey,
      select: (data) => {
        devLog('getProposalsByProjectIdAndKey', itemKey, data);
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
    { projectId, key: itemKey },
    {
      enabled: !!projectId && !!itemKey,
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
      console.log('onCreateItemProposalVote', key, itemProposalId);
      createItemProposalVoteMutation.mutate(
        { itemProposalId, key },
        {
          onSuccess: async (data) => {
            refetchProposalsByKey();
            setKeyActive(key, false);
          },
          onError: (error) => {
            setKeyActive(key, false);
            devLog('onVote error', error);
          },
        },
      );
    },
    [createItemProposalVoteMutation, refetchProposalsByKey],
  );

  const onSwitchItemProposalVote = useCallback(
    async (key: IPocItemKey, itemProposalId: number) => {
      setKeyActive(key, true);
      console.log('onSwitchItemProposalVote', key, itemProposalId);
      switchItemProposalVoteMutation.mutate(
        { itemProposalId, key },
        {
          onSuccess: async (data) => {
            refetchProposalsByKey();
            setKeyActive(key, false);
          },
          onError: (error) => {
            setKeyActive(key, false);
            // devLog('onSwitchVote error', error);
          },
        },
      );
    },
    [switchItemProposalVoteMutation, refetchProposalsByKey],
  );

  const onCancelVote = useCallback(
    async (key: IPocItemKey, voteRecordId: number) => {
      setKeyActive(key, true);
      console.log('onCancelVote', key, voteRecordId);
      cancelVoteMutation.mutate(
        { id: voteRecordId },
        {
          onSuccess: async (data) => {
            refetchProposalsByKey();
            setKeyActive(key, false);
          },
          onError: (error) => {
            setKeyActive(key, false);
          },
        },
      );
    },
    [cancelVoteMutation, refetchProposalsByKey],
  );

  // Context value
  const value: ModalContextType = {
    proposalsByKey,
    proposalHistory,
    isProposalsByKeyLoading,
    isProposalsByKeyFetched,
    isProposalHistoryLoading,
    isProposalHistoryFetched,
    projectId,
    itemKey,
    refetchProposalsByKey,
    refetchProposalHistory,
    inActionKeyMap,
    onCreateItemProposalVote,
    onSwitchItemProposalVote,
    onCancelVote,
  };

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
};

// Custom hook to use the context
export const useModalContext = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModalContext must be used within a ModalProvider');
  }
  return context;
};
