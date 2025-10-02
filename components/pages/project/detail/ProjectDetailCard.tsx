'use client';

import { cn, Image, Skeleton } from '@heroui/react';
import { FC, useCallback, useMemo } from 'react';

import ShareButton from '@/components/biz/share/ShareButton';
import useShareLink from '@/hooks/useShareLink';
import { IProject } from '@/types';

import { useProjectDetailContext } from '../context/projectDetailContext';

import BookmarkButton from './list/BookmarkButton';
import UpvoteButton from './UpvoteButton';

interface ProjectDetailCardProps {
  project?: IProject;
  getLeadingProjectName?: () => string;
  getLeadingTagline?: () => string;
  getLeadingCategories?: () => string[];
  getLeadingLogoUrl?: () => string;
}

const ProjectDetailCard: FC<ProjectDetailCardProps> = ({
  project,
  getLeadingProjectName,
  getLeadingTagline,
  getLeadingCategories,
  getLeadingLogoUrl,
}) => {
  const { refetchProject } = useProjectDetailContext();

  const handleVoteSuccess = useCallback(async () => {
    console.log(
      '[ProjectDetailCard] Refetching project data after vote...',
      project?.id,
    );
    await refetchProject();
    console.log('[ProjectDetailCard] Project refetched');
  }, [refetchProject, project?.id]);

  const fallbackSharePath = useMemo(() => {
    if (!project) {
      return '';
    }
    return `/project/${project.id}`;
  }, [project]);

  const {
    shareUrl,
    shareImageUrl,
    payload: sharePayload,
    loading: shareLinkLoading,
    error: shareLinkError,
    ensure: ensureShareLink,
  } = useShareLink({
    entityType: 'project',
    entityId: project?.id,
    fallbackUrl: fallbackSharePath,
    enabled: !!project?.id,
  });

  if (!project) {
    return <ProjectDetailCardSkeleton />;
  }
  return (
    <div
      className={cn(
        'mt-[10px] mx-[20px] mobile:mx-[10px]',
        'p-[20px] mobile:p-[14px] pr-[200px] mobile:pb-[52px]',
        'bg-white border border-black/10 rounded-[10px]',
        'flex justify-start items-start gap-[20px] relative',
      )}
    >
      <Image
        src={getLeadingLogoUrl ? getLeadingLogoUrl() : project.logoUrl}
        alt={getLeadingProjectName ? getLeadingProjectName() : project.name}
        width={100}
        height={100}
        className="size-[100px] shrink-0 overflow-hidden rounded-[10px] border border-black/10 object-cover"
      />
      <div className="flex flex-1 flex-col gap-[10px]">
        <p className="text-[20px] font-[700] leading-tight text-[#202023]">
          {getLeadingProjectName ? getLeadingProjectName() : project.name}
        </p>
        <p className="text-[14px] font-[400] leading-[1.66] text-[#202023]">
          {getLeadingTagline ? getLeadingTagline() : project.tagline}
        </p>
        <div className="flex flex-wrap gap-[8px]">
          {(getLeadingCategories
            ? getLeadingCategories()
            : project.categories
          ).map((category) => {
            return (
              <span
                key={category}
                className="flex h-[22px] items-center rounded-[6px] bg-black/5 px-[12px] text-[12px] font-[600] leading-none text-black"
              >
                {category}
              </span>
            );
          })}
        </div>
      </div>

      <div className="mobile:bottom-[14px] mobile:right-[14px] absolute bottom-[20px] right-[20px] flex gap-[8px]">
        <UpvoteButton
          projectId={project.id}
          project={project}
          onVoteSuccess={handleVoteSuccess}
        />
        <BookmarkButton projectId={project.id} />
        <ShareButton
          shareUrl={shareUrl}
          shareImageUrl={shareImageUrl}
          className="size-[40px]"
          isLoading={shareLinkLoading}
          error={shareLinkError}
          onEnsure={ensureShareLink}
          onRefresh={ensureShareLink}
          payload={sharePayload}
        />
      </div>
    </div>
  );
};

export default ProjectDetailCard;

const ProjectDetailCardSkeleton = () => {
  return (
    <div
      className={cn(
        'mt-[10px] mx-[20px] mobile:mx-[10px]',
        'p-[20px] mobile:p-[14px]',
        'bg-white border border-black/10 rounded-[10px]',
        'flex justify-start items-start gap-[20px] relative',
      )}
    >
      <Skeleton className="size-[100px] overflow-hidden rounded-[10px] border border-black/10" />

      <div className="flex flex-col gap-[10px]">
        <Skeleton className="mobile:w-[150px] h-[25px] w-[180px]" />
        <Skeleton className="h-[23px] w-full" />

        <div className="flex flex-wrap gap-[8px]">
          {[1, 2, 3].map((index) => {
            return (
              <Skeleton
                key={index}
                className="h-[22px] w-[60px] rounded-[6px]"
              />
            );
          })}
        </div>
      </div>

      {/* BookmarkButton and ShareButton skeleton */}
      <div className="mobile:bottom-[14px] mobile:right-[14px] absolute bottom-[20px] right-[20px] flex gap-[8px]">
        <Skeleton className="mobile:size-[32px] h-[40px] w-[100px] rounded-[6px] border border-black/10" />
        <Skeleton className="mobile:size-[32px] size-[40px] rounded-[6px] border border-black/10" />
        <Skeleton className="mobile:size-[32px] size-[40px] rounded-[6px] border border-black/10" />
      </div>
    </div>
  );
};
