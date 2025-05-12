'use client';

import { cn, Skeleton } from '@heroui/react';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';

import ECFTypography from '@/components/base/typography';
import BackHeader from '@/components/pages/project/BackHeader';
import ProposalDetails from '@/components/pages/project/proposal/ProposalDetails';
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

      <div
        className={cn(
          'mt-[10px] mx-[20px] mobile:mx-[10px]',
          'p-[20px] mobile:p-[14px]',
          'bg-white border border-black/10 rounded-[10px]',
        )}
      >
        {isProposalLoading ? (
          <div className="flex flex-col gap-[15px]">
            <div className="flex items-center gap-[10px]">
              <Skeleton className="h-[28px] w-[150px] rounded-[5px]" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-[34px] w-[200px] rounded-[5px]" />
            </div>
            <Skeleton className="h-[8px] w-full rounded-full" />
            <div className="grid grid-cols-3 gap-[10px]">
              <div>
                <Skeleton className="h-[20px] w-[100px] rounded-[5px]" />
                <Skeleton className="mt-[5px] h-[20px] w-[80px] rounded-[5px]" />
              </div>
              <div>
                <Skeleton className="h-[20px] w-[100px] rounded-[5px]" />
                <Skeleton className="mt-[5px] h-[20px] w-[80px] rounded-[5px]" />
              </div>
              <div>
                <Skeleton className="h-[20px] w-[100px] rounded-[5px]" />
                <Skeleton className="mt-[5px] h-[20px] w-[80px] rounded-[5px]" />
              </div>
            </div>
            <Skeleton className="h-[20px] w-[200px] rounded-[5px]" />
          </div>
        ) : proposal ? (
          <div className="flex flex-col gap-[15px]">
            {/* 标签 */}
            <div className="flex items-center gap-[10px]">
              <div className="flex items-center gap-[5px] rounded-[5px] bg-[#E8F9F3] px-[10px] py-[5px] text-[14px] font-[500] text-[var(--primary-green)]">
                Leading Proposal
                <span className="ml-[2px] inline-flex size-[16px] items-center justify-center rounded-full border border-[var(--primary-green)]">
                  i
                </span>
              </div>
            </div>

            {/* 标题 */}
            <div className="flex items-center justify-between">
              <h1 className="text-[24px] font-[700] leading-[34px] text-black">
                {proposalName}
              </h1>
            </div>

            {/* 进度条 */}
            <div>
              <div className="mb-[5px] flex items-center justify-between">
                <span className="text-[18px] font-[700] leading-[25px] text-black">
                  {progressPercentage}%
                </span>
              </div>
              <div className="h-[8px] w-full overflow-hidden rounded-full bg-black/10">
                <div
                  className="h-full rounded-full bg-black"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* 投票信息 */}
            <div className="grid grid-cols-3 gap-[10px]">
              <div>
                <div className="text-[14px] font-[600] leading-[20px] text-black">
                  Points Needed
                </div>
                <div className="text-[14px] font-[400] leading-[20px] text-black/60">
                  00/00
                </div>
              </div>
              <div>
                <div className="text-[14px] font-[600] leading-[20px] text-black">
                  Supported
                </div>
                <div className="text-[14px] font-[400] leading-[20px] text-black/60">
                  82
                </div>
              </div>
              <div>
                <div className="text-[14px] font-[600] leading-[20px] text-black">
                  Quorum
                </div>
                <div className="text-[14px] font-[400] leading-[20px] text-black/60">
                  00/00
                </div>
              </div>
            </div>

            {/* 创建者信息 */}
            <div className="flex items-center text-[14px] leading-[20px]">
              <span className="text-black/60">by: </span>
              <span className="ml-[5px] font-[600] text-black">
                @{proposal.creator?.name || 'username'}
              </span>
              <span className="ml-[5px] text-black/60">
                {proposal.creator?.address
                  ? `${proposal.creator.address.substring(0, 6)}...${proposal.creator.address.substring(
                      proposal.creator.address.length - 6,
                    )}`
                  : '0x000...00000'}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex h-[200px] items-center justify-center">
            <ECFTypography type="body1">Proposal Not Found</ECFTypography>
          </div>
        )}
      </div>

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
