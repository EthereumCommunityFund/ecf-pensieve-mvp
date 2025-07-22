'use client';

import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo } from 'react';

import { Button } from '@/components/base/button';
import { trpc } from '@/lib/trpc/client';
import { IProject } from '@/types';
import { devLog } from '@/utils/devLog';
import { formatDateWithTimeGMT } from '@/utils/formatters';

import { ProjectListWrapper } from '../project/ProjectListWrapper';

interface ISectionProps {
  title: string;
  description: string;
  buttonText?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

const SectionHeader = (props: ISectionProps) => {
  return (
    <div className="mobile:flex-col mobile:items-start flex flex-1 items-center justify-between gap-[10px] px-[10px] py-[4px]">
      <div>
        <p className="tablet:text-[18px] mobile:text-[18px] text-[24px] font-[700] leading-[1.4] text-black/80">
          {props.title}
        </p>
        {props.description && (
          <p className="mt-[5px] text-[14px] font-[400] leading-[19px] text-black/60">
            {props.description}
          </p>
        )}
      </div>
      {props.buttonText && (
        <div className="">
          <Button size="sm" onPress={props.onClick} className="font-[400]">
            {props.buttonText}
          </Button>
        </div>
      )}
    </div>
  );
};

const HomeList = () => {
  const router = useRouter();
  const limit = 5;
  const {
    data: ranksData,
    isLoading,
    refetch: refetchProjects,
  } = trpc.rank.getTopRanks.useQuery();

  const byGenesisProjects =
    ranksData?.byGenesisWeight
      ?.map((rank: any) => rank.project)
      .slice(0, limit) || [];
  const bySupportProjects = ranksData?.bySupport?.slice(0, limit) || [];

  useEffect(() => {
    if (byGenesisProjects.length > 0) {
      devLog('byGenesisProjects', byGenesisProjects);
    }
    if (bySupportProjects.length > 0) {
      devLog('bySupportProjects', bySupportProjects);
    }
  }, [byGenesisProjects, bySupportProjects]);

  // Get the latest updatedAt time from all ranks for transparent projects
  const transparentProjectsUpdatedAt = ranksData?.byGenesisWeight?.reduce(
    (latest, rank) => {
      if (!rank.updatedAt) return latest;
      if (!latest) return rank.updatedAt;
      return new Date(rank.updatedAt) > new Date(latest)
        ? rank.updatedAt
        : latest;
    },
    null as Date | null,
  );

  const displayUpdatedAtOfTransparent = useMemo(() => {
    return transparentProjectsUpdatedAt
      ? `Updated: ${formatDateWithTimeGMT(
          transparentProjectsUpdatedAt,
          'DD-MM-YYYY | HH:mm',
        )} GMT`
      : '';
  }, [transparentProjectsUpdatedAt]);

  // Get the latest updatedAt time from all projects for community-trusted projects
  const communityTrustedUpdatedAt = ranksData?.bySupport?.reduce(
    (latest, project) => {
      if (!project.updatedAt) return latest;
      if (!latest) return project.updatedAt;
      return new Date(project.updatedAt) > new Date(latest)
        ? project.updatedAt
        : latest;
    },
    null as Date | null,
  );

  const displayUpdatedAtOfTrust = useMemo(() => {
    return communityTrustedUpdatedAt
      ? `Updated: ${formatDateWithTimeGMT(
          communityTrustedUpdatedAt,
          'DD-MM-YYYY | HH:mm',
        )} GMT`
      : '';
  }, [communityTrustedUpdatedAt]);

  const handleViewTopTransparentProjects = useCallback(() => {
    router.push('/projects?type=transparent');
  }, [router]);

  const handleViewTopCommunityTrustedProjects = useCallback(() => {
    router.push('/projects?type=community-trusted');
  }, [router]);

  return (
    <div className="tablet:gap-[10px] mt-5 flex flex-col gap-[10px]">
      <div className="mobile:flex-col flex gap-[20px]">
        <div className="flex-1 rounded-[10px] border border-black/10 p-[10px]">
          <SectionHeader
            title="Top Transparent Projects"
            description={`Completion rate = sum of published items' genesis itemweight / sum of items' genesis itemweight (fixed across projects)`}
            buttonText="View All Top"
            onClick={handleViewTopTransparentProjects}
          />
          <ProjectListWrapper
            isLoading={isLoading}
            projectList={byGenesisProjects as IProject[]}
            onLoadMore={() => {}}
            isFetchingNextPage={false}
            emptyMessage="No transparent projects found"
            onSuccess={refetchProjects}
            showCreator={false}
            showUpvote={false}
            showTransparentScore={true}
          />
          <p className="text-center text-[10px] font-[400] leading-[14px] text-black/60">
            {displayUpdatedAtOfTransparent}
          </p>
        </div>
        <div className="flex-1 rounded-[10px] border border-black/10 p-[10px]">
          <SectionHeader
            title={`Top Community-trusted`}
            description={`Projects are ranked based on the total amount of staked upvotes received from users. This reflects community recognition and perceived value`}
            buttonText="View All Top"
            onClick={handleViewTopCommunityTrustedProjects}
          />
          <ProjectListWrapper
            isLoading={isLoading}
            projectList={bySupportProjects as IProject[]}
            onLoadMore={() => {}}
            isFetchingNextPage={false}
            emptyMessage="No community-trusted projects found"
            onSuccess={refetchProjects}
            showCreator={false}
            showUpvote={true}
            showTransparentScore={false}
          />
          <p className="text-center text-[10px] font-[400] leading-[14px] text-black/60">
            {displayUpdatedAtOfTrust}
          </p>
        </div>
      </div>

      <div className="flex-1 rounded-[10px] border border-black/10 py-[6px]">
        <SectionHeader
          title="Top Secure Projects"
          description="LIST COMING SOON"
        />
      </div>

      <div className="flex-1 rounded-[10px] border border-black/10 py-[6px]">
        <SectionHeader
          title="Top Accountable Projects"
          description="LIST COMING SOON"
        />
      </div>

      <div className="flex-1 rounded-[10px] border border-black/10 py-[6px]">
        <SectionHeader
          title="Top Privacy Projects"
          description="LIST COMING SOON"
        />
      </div>
    </div>
  );
};

export default HomeList;
