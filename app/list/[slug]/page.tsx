'use client';

import { Image } from '@heroui/react';
import { ArrowLeft } from '@phosphor-icons/react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

import { Button } from '@/components/base';
import ECFTypography from '@/components/base/typography';
import {
  GlobeHemisphereWestIcon,
  LockKeyIcon,
  PlusSquareIcon,
  SignOutIcon,
} from '@/components/icons';
import SharedListSkeleton from '@/components/pages/list/SharedListSkeleton';
import ProjectCard, {
  ProjectCardSkeleton,
} from '@/components/pages/project/ProjectCard';
import { useAuth } from '@/context/AuthContext';
import { useNavigationContext } from '@/hooks/useNavigation';
import { useUpvote } from '@/hooks/useUpvote';
import { trpc } from '@/lib/trpc/client';
import { IProject } from '@/types';
import { devLog } from '@/utils/devLog';

const PublicListPage = () => {
  const { slug } = useParams();
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);
  const { address: currentUserAddress } = useAccount();
  const { profile, showAuthPrompt } = useAuth();
  const { onRouterBack } = useNavigationContext();

  // Fetch list details
  const {
    data: list,
    isLoading,
    error,
  } = trpc.list.getListBySlug.useQuery(
    {
      slug: slug as string,
    },
    {
      retry: false, // Don't retry on 403
      select: (data) => {
        devLog('getListBySlug', slug, data);
        return data;
      },
    },
  );

  // Fetch list items (projects)
  const {
    data: listData,
    isLoading: itemsLoading,
    refetch: refetchListProjects,
  } = trpc.list.getListProjects.useQuery(
    {
      slug: slug as string,
    },
    {
      enabled: !!list?.id && !error,
    },
  );

  const listItems = listData?.items;

  // Follow/unfollow mutations
  const followMutation = trpc.list.followList.useMutation({
    onSuccess: () => {
      setIsFollowing(true);
    },
  });

  const unfollowMutation = trpc.list.unfollowList.useMutation({
    onSuccess: () => {
      setIsFollowing(false);
    },
  });

  // Update isFollowing state when list data is loaded
  useEffect(() => {
    if (list && 'isFollowing' in list) {
      setIsFollowing(list.isFollowing);
    }
  }, [list]);

  const handleBack = () => {
    onRouterBack();
  };

  const handleFollow = () => {
    if (!list) return;

    if (isFollowing) {
      unfollowMutation.mutate({ listId: list.id });
    } else {
      followMutation.mutate({ listId: list.id });
    }
  };

  const getPrivacyIcon = () => {
    if (!list) return null;
    return list.privacy === 'private' ? (
      <LockKeyIcon size={20} className="opacity-60" />
    ) : (
      <GlobeHemisphereWestIcon size={20} className="opacity-60" />
    );
  };

  const getPrivacyText = () => {
    if (!list) return '';
    return list.privacy === 'private' ? 'Private' : 'Public';
  };

  const { handleUpvote, getProjectLikeRecord, UpvoteModalComponent } =
    useUpvote({
      onSuccess: refetchListProjects,
    });

  if (isLoading) {
    return <SharedListSkeleton />;
  }

  if (error || !list) {
    const isForbidden = error?.data?.code === 'FORBIDDEN';

    return (
      <div className="flex justify-center px-[160px] py-8">
        <div className="flex w-[810px] flex-col items-center gap-6 pt-16">
          <ECFTypography type="subtitle1">
            {isForbidden ? 'Access Denied' : 'List not found'}
          </ECFTypography>
          <ECFTypography type="body1" className="text-center opacity-60">
            {isForbidden
              ? "This is a private list and you don't have permission to view it."
              : "This list may be private or doesn't exist."}
          </ECFTypography>
          <Button
            onPress={onRouterBack}
            variant="light"
            startContent={<ArrowLeft />}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center px-[160px] py-8">
      <div className="flex w-[810px] flex-col gap-[10px]">
        {/* Header */}
        <div className="flex items-center gap-[10px]">
          <div className="w-[440px]">
            <Button
              onPress={handleBack}
              color="secondary"
              size="sm"
              className="h-[30px] rounded-[5px] border-none px-[8px] text-[14px] font-semibold text-black"
              startContent={<ArrowLeft />}
            >
              Back
            </Button>
          </div>
        </div>

        {/* List Info Card */}
        <div className="flex flex-col gap-[10px] border-b border-[rgba(0,0,0,0.1)] pb-[20px]">
          <div className="flex flex-col gap-[10px]">
            <div className="flex items-center gap-[10px]">
              <ECFTypography
                type="subtitle1"
                className="text-[20px] font-semibold leading-[24px]"
              >
                {list.name}
              </ECFTypography>
            </div>
            {list.description && (
              <ECFTypography
                type="body1"
                className="text-[14px] leading-[18px] opacity-60"
              >
                {list.description}
              </ECFTypography>
            )}
            <div className="flex items-center justify-between">
              <div className="flex gap-[10px]">
                {/* Created by */}
                <div className="flex items-center gap-[5px] rounded-[5px] px-0 py-[5px]">
                  <ECFTypography
                    type="body2"
                    className="text-[14px] opacity-80"
                  >
                    by:
                  </ECFTypography>
                  <Image
                    src={list.creator?.avatarUrl || '/images/user/avatar_p.png'}
                    className="size-[24px] rounded-full object-cover"
                  />
                  <ECFTypography
                    type="body2"
                    className="text-[14px] opacity-80"
                  >
                    {list.creator?.name || 'Unknown'}
                  </ECFTypography>
                </div>
              </div>
              <p className="text-[14px] text-black/80">
                Followers: {list.followCount}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-[10px]">
          {currentUserAddress ? (
            <Button
              onPress={handleFollow}
              variant={isFollowing ? 'light' : 'light'}
              size="sm"
              className={`h-[40px] rounded-[5px] border px-[10px] text-[14px] font-semibold ${
                isFollowing
                  ? 'border-[rgba(0,0,0,0.1)] bg-[#EBEBEB] text-[#CD453B]'
                  : 'border-[rgba(0,0,0,0.1)] bg-[#EBEBEB] text-black opacity-60 hover:opacity-100'
              }`}
              endContent={
                isFollowing ? (
                  <SignOutIcon size={24} color="#CD453B" />
                ) : (
                  <PlusSquareIcon size={24} />
                )
              }
              isLoading={followMutation.isPending || unfollowMutation.isPending}
            >
              {isFollowing ? 'Unfollow' : 'Follow This List'}
            </Button>
          ) : (
            <Button
              onPress={() => {
                showAuthPrompt();
              }}
              color="secondary"
              size="sm"
              className="h-[40px] rounded-[5px] bg-[#EBEBEB] px-[10px] text-[14px] font-semibold text-black opacity-60 hover:opacity-100"
              endContent={<PlusSquareIcon size={24} />}
            >
              Follow This List
            </Button>
          )}
        </div>

        {/* Projects List */}
        <div className="flex flex-col gap-[10px]">
          {itemsLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <ProjectCardSkeleton key={i} showCreator={false} />
              ))}
            </>
          ) : listItems && listItems.length > 0 ? (
            listItems.map((item) => (
              <ProjectCard
                key={item.id}
                project={item.project as IProject}
                showCreator={false}
                onUpvote={handleUpvote}
                userLikeRecord={
                  getProjectLikeRecord(item.project.id)
                    ? {
                        id: item.project.id,
                        weight:
                          getProjectLikeRecord(item.project.id)?.weight || 0,
                      }
                    : null
                }
              />
            ))
          ) : (
            <div className="flex flex-col items-center gap-4 py-12">
              <ECFTypography
                type="body1"
                className="text-center text-[16px] leading-[25.6px] opacity-50"
              >
                This list is empty
              </ECFTypography>
              <ECFTypography
                type="body2"
                className="text-center text-[14px] leading-[22.4px] opacity-40"
              >
                No projects have been added to this list yet.
              </ECFTypography>
            </div>
          )}
        </div>
      </div>

      {UpvoteModalComponent}
    </div>
  );
};

export default PublicListPage;
