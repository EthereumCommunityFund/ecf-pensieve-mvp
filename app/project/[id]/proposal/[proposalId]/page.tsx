'use client';

import { Skeleton } from '@heroui/react';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';

import BackHeader from '@/components/pages/project/BackHeader';
import ProposalDetailCard from '@/components/pages/project/proposal/detail/ProposalDetailCard';
import ProposalDetails from '@/components/pages/project/proposal/detail/ProposalDetails';
import { trpc } from '@/lib/trpc/client';

const ProposalPage = () => {
  const { id: projectId, proposalId } = useParams();

  const { data: project, isFetched: isProjectFetched } =
    trpc.project.getProjectById.useQuery(
      { id: Number(projectId) },
      {
        enabled: !!projectId,
      },
    );

  const {
    data: proposal,
    isLoading: isProposalLoading,
    isFetched: isProposalFetched,
  } = trpc.proposal.getProposalById.useQuery(
    { id: Number(proposalId) },
    {
      enabled: !!proposalId,
    },
  );

  const proposalName = useMemo(() => {
    if (!proposal) return '';
    const nameItem = proposal.items.find(
      (item: any) => item.key === 'projectName',
    ) as { key: string; value: string } | undefined;
    return nameItem?.value || 'Unnamed Proposal';
  }, [proposal]);

  const progressPercentage = 48;

  return (
    <div className="pb-[20px]">
      <BackHeader>
        <div className="flex justify-start gap-[10px]">
          <span>Pending Projects</span>
          <span className="font-[600]">/</span>
          {isProjectFetched ? (
            <span>{project?.name}</span>
          ) : (
            <Skeleton className="h-[20px] w-[100px]" />
          )}
          <span className="font-[600]">/</span>
          {isProposalFetched ? (
            <span>Proposal {proposalId}</span>
          ) : (
            <Skeleton className="h-[20px] w-[100px]" />
          )}
        </div>
      </BackHeader>

      <ProposalDetailCard
        proposal={proposal}
        projectId={Number(projectId)}
        isLeading={true}
        hasVoted={true}
      />

      {/* 提案详情 */}
      {proposal && (
        <div className="mobile:mx-[10px] mx-[20px] mt-[20px]">
          <ProposalDetails proposal={proposal} projectId={Number(projectId)} />
        </div>
      )}
    </div>
  );
};

export default ProposalPage;
