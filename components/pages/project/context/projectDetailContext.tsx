'use client';

import { useParams } from 'next/navigation';
import { createContext, ReactNode, useContext, useMemo } from 'react';

import { IProjectDataItem } from '@/components/pages/project/detail/table/Column';
import { trpc } from '@/lib/trpc/client';
import {
  ILeadingProposals,
  ILeadingProposalsTyped,
  IProject,
  IProposal,
} from '@/types';
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
  // Leading proposals data from projectLog
  leadingProposals?: ILeadingProposals;
  isLeadingProposalsLoading: boolean;
  isLeadingProposalsFetched: boolean;
  displayProposalData?: IProjectDataItem[];
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
  displayProposalData: undefined,
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

  // Calculate displayProposalData from leading proposals
  const displayProposalData = useMemo(() => {
    if (!proposalsByProject) return undefined;
    const { withoutItemProposal, withItemProposal } =
      proposalsByProject as ILeadingProposalsTyped;
    // TODO 优先取withItemProposal里的 item 的最新
    // 暂时看不到item proposal 的数据，先处理投票后再来处理这里
    const DataMap = new Map<string, IProjectDataItem>();
    withoutItemProposal.forEach((project) => {
      project.proposal.items.forEach((item) => {
        const row = {
          key: item.key,
          property: item.key,
          input: item.value,
          reference:
            project.proposal.refs?.find((ref) => ref.key === item.key) || null,
          submitter: project.proposal.creator,
          createdAt: project.proposal.createdAt,
          projectId: project.proposal.projectId,
          proposalId: project.proposal.id,
        };
        DataMap.set(item.key, row);
      });
    });
    const proposal = withItemProposal?.[0]?.proposal;
    if (proposal) {
      proposal.items.forEach((item) => {
        if (DataMap.has(item.key)) return;
        const row: IProjectDataItem = {
          key: item.key,
          property: item.key,
          input: item.value,
          reference: proposal.refs?.find((ref) => ref.key === item.key) || null,
          submitter: proposal.creator,
          createdAt: proposal.createdAt,
          projectId: proposal.projectId,
          proposalId: proposal.id,
        };
        DataMap.set(item.key, row);
      });
    }
    devLog('displayProposalData', Array.from(DataMap.values()));
    return Array.from(DataMap.values());
  }, [proposalsByProject]);

  // Context value
  const value: ProjectDetailContextType = {
    project: project as IProject,
    proposals,
    isProjectLoading,
    isProjectFetched,
    isProposalsLoading,
    isProposalsFetched,
    projectId,
    leadingProposals: proposalsByProject,
    isLeadingProposalsLoading,
    isLeadingProposalsFetched,
    displayProposalData,
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
