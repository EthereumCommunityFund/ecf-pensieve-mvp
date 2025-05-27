'use client';

import { useParams } from 'next/navigation';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';

import { trpc } from '@/lib/trpc/client';
import { ILeadingProposals, IProposalsByProjectIdAndKey } from '@/types';
import { IPocItemKey } from '@/types/item';
import { devLog } from '@/utils/devLog';

// Define the context type
interface ProjectLogContextType {
  leadingProposals?: ILeadingProposals;
  isLeadingProposalsLoading: boolean;
  isLeadingProposalsFetched: boolean;
  projectId: number;
  proposalsByProjectIdAndKey?: IProposalsByProjectIdAndKey;
  triggerGetProposalsByProjectIdAndKey: (itemKey: IPocItemKey) => void;
}

// Create the context with default values
export const ProjectLogContext = createContext<ProjectLogContextType>({
  leadingProposals: undefined,
  isLeadingProposalsLoading: true,
  isLeadingProposalsFetched: false,
  projectId: 0,
  proposalsByProjectIdAndKey: undefined,
  triggerGetProposalsByProjectIdAndKey: () => {},
});

// Provider component
export const ProjectLogProvider = ({ children }: { children: ReactNode }) => {
  const { id } = useParams();
  const projectId = Number(id);

  const [currentItemKey, setCurrentItemKey] = useState<IPocItemKey | null>(
    null,
  );

  // Fetch leading proposals data
  const {
    data: leadingProposals,
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
    refetch: refetchProposalsByProjectIdAndKey,
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

  const triggerGetProposalsByProjectIdAndKey = useCallback(
    (itemKey: IPocItemKey) => {
      setCurrentItemKey(itemKey);
      refetchProposalsByProjectIdAndKey();
    },
    [refetchProposalsByProjectIdAndKey],
  );

  // Context value
  const value: ProjectLogContextType = {
    leadingProposals,
    isLeadingProposalsLoading,
    isLeadingProposalsFetched,
    projectId,
    proposalsByProjectIdAndKey,
    triggerGetProposalsByProjectIdAndKey,
  };

  return (
    <ProjectLogContext.Provider value={value}>
      {children}
    </ProjectLogContext.Provider>
  );
};

// Custom hook to use the context
export const useProjectLogContext = () => {
  const context = useContext(ProjectLogContext);
  if (context === undefined) {
    throw new Error('useProjectLog must be used within a ProjectLogProvider');
  }
  return context;
};
