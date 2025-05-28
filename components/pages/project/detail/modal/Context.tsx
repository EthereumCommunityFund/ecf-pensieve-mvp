'use client';

import { createContext, ReactNode, useContext } from 'react';

import { trpc } from '@/lib/trpc/client';
import { ILeadingProposalHistory, IProposalsByProjectIdAndKey } from '@/types';
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
