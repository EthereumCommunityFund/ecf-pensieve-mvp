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

import { trpc } from '@/lib/trpc/client';
import {
  ILeadingProposals,
  IProposal,
  IProposalsByProjectIdAndKey,
} from '@/types';
import { IPocItemKey } from '@/types/item';
import { devLog } from '@/utils/devLog';

// Define the context type
interface ProjectLogContextType {
  leadingProposals?: ILeadingProposals;
  isLeadingProposalsLoading: boolean;
  isLeadingProposalsFetched: boolean;
  projectId: number;
  displayProposalData?: IProposal;
  proposalsByProjectIdAndKey?: IProposalsByProjectIdAndKey;
  triggerGetProposalsByProjectIdAndKey: (itemKey: IPocItemKey) => void;
}

// Create the context with default values
export const ProjectLogContext = createContext<ProjectLogContextType>({
  leadingProposals: undefined,
  isLeadingProposalsLoading: true,
  isLeadingProposalsFetched: false,
  projectId: 0,
  displayProposalData: undefined,
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

  const displayProposalData = useMemo(() => {
    if (!proposalsByProject) return null;
    const { withoutItemProposal, withItemProposal } = proposalsByProject;
    // TODO 优先取withItemProposal里的 item 的最新
    // 暂时看不到item proposal 的数据，先处理投票后再来处理这里
    const originProposal = withoutItemProposal[0].proposal as IProposal;
    return originProposal;
  }, [proposalsByProject]);

  const triggerGetProposalsByProjectIdAndKey = useCallback(
    (itemKey: IPocItemKey) => {
      setCurrentItemKey(itemKey);
      refetchProposalsByProjectIdAndKey();
    },
    [refetchProposalsByProjectIdAndKey],
  );

  // Context value
  const value: ProjectLogContextType = {
    leadingProposals: proposalsByProject,
    isLeadingProposalsLoading,
    isLeadingProposalsFetched,
    projectId,
    displayProposalData,
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
