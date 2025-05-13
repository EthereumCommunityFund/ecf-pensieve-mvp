'use client';

import { Skeleton } from '@heroui/react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

import BackHeader from '@/components/pages/project/BackHeader';
import SubmitProposalCard from '@/components/pages/project/proposal/common/SubmitProposalCard';
import ProposalDetailCard from '@/components/pages/project/proposal/detail/ProposalDetailCard';
import ProposalDetails from '@/components/pages/project/proposal/detail/ProposalDetails';
import UserWeightCard from '@/components/pages/project/proposal/detail/UserWeightCard';
import { trpc } from '@/lib/trpc/client';
import { cn } from '@/lib/utils';

const ProposalPage = () => {
  const { id: projectId, proposalId } = useParams();
  const router = useRouter();

  const [isTableExpanded, setIsTableExpanded] = useState(false);

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

  const onSubmitProposal = useCallback(() => {
    router.push(`/project/${projectId}/proposal/create`);
  }, [router, projectId]);

  return (
    <div className=" pb-[20px]">
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

      <div className="tablet:block mobile:block mx-[10px] mt-[10px] hidden">
        <UserWeightCard weight={100} />
      </div>

      <div
        className={cn(
          'mt-[20px] mx-auto flex justify-center items-start gap-[40px]',
          'tablet:flex-col tablet:gap-[20px] tablet:px-[20px] mobile:flex-col mobile:gap-[20px]',
          'tablet:px-[10px] mobile:px-[10px]',
        )}
      >
        <div className="tablet:max-w-[9999px] mobile:max-w-[9999px] w-full max-w-[820px] flex-1">
          <ProposalDetails
            project={project}
            proposal={proposal}
            projectId={Number(projectId)}
          />
        </div>

        <div className="tablet:w-full mobile:w-full flex w-[300px] flex-col gap-[20px]">
          <div className="tablet:hidden mobile:hidden">
            <UserWeightCard weight={100} />
          </div>
          <SubmitProposalCard onSubmitProposal={onSubmitProposal} />
        </div>
      </div>
    </div>
  );
};

export default ProposalPage;
