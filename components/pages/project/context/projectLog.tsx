'use client';

import { useParams } from 'next/navigation';
import { createContext, ReactNode, useContext } from 'react';

import { trpc } from '@/lib/trpc/client';
import { ILeadingProposals } from '@/types';
import { devLog } from '@/utils/devLog';

// Define the context type
interface ProjectLogContextType {
  leadingProposals?: ILeadingProposals;
  isLeadingProposalsLoading: boolean;
  isLeadingProposalsFetched: boolean;
  projectId: number;
}

// Create the context with default values
export const ProjectLogContext = createContext<ProjectLogContextType>({
  leadingProposals: undefined,
  isLeadingProposalsLoading: true,
  isLeadingProposalsFetched: false,
  projectId: 0,
});

// Provider component
export const ProjectLogProvider = ({ children }: { children: ReactNode }) => {
  const { id } = useParams();
  const projectId = Number(id);

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

  // Context value
  const value: ProjectLogContextType = {
    leadingProposals,
    isLeadingProposalsLoading,
    isLeadingProposalsFetched,
    projectId,
  };

  return (
    <ProjectLogContext.Provider value={value}>
      {children}
    </ProjectLogContext.Provider>
  );
};

// Custom hook to use the context
export const useProjectLog = () => {
  const context = useContext(ProjectLogContext);
  if (context === undefined) {
    throw new Error('useProjectLog must be used within a ProjectLogProvider');
  }
  return context;
};
