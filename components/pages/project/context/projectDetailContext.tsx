'use client';

import { useParams } from 'next/navigation';
import { createContext, ReactNode, useContext } from 'react';

import { trpc } from '@/lib/trpc/client';
import { IProject, IProposal } from '@/types';
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
});

// Provider component
export const ProjectDetailProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { id } = useParams();
  const projectId = Number(id);

  // Fetch project data
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

  // Fetch proposals data
  const {
    data: proposals,
    isLoading: isProposalsLoading,
    isFetched: isProposalsFetched,
  } = trpc.proposal.getProposalsByProjectId.useQuery(
    { projectId },
    {
      enabled: !!projectId,
      select: (data) => {
        // devLog('getProposalsByProjectId', data);
        return data;
      },
    },
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
