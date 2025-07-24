'use client';

import { Avatar, Button, Skeleton } from '@heroui/react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import ECFTypography from '@/components/base/typography';
import {
  ArrowLeftIcon,
  BookmarksIcon,
  GlobeHemisphereWestIcon,
  LockKeyIcon,
} from '@/components/icons';
import ProjectCard from '@/components/pages/project/ProjectCard';
import { trpc } from '@/lib/trpc/client';
import { IProject } from '@/types';

const PublicListPage = () => {
  const { slug } = useParams();
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);

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
        console.log('devLog - getListBySlug response (public page):', data);
        return data;
      },
    },
  );

  // Fetch list items (projects)
  const { data: listData, isLoading: itemsLoading } =
    trpc.list.getListProjects.useQuery(
      {
        slug: slug as string,
      },
      {
        enabled: !!list?.id && !error,
        select: (data) => {
          console.log('devLog - getListProjects response (public page):', data);
          return data;
        },
      },
    );

  const listItems = listData?.items;

  // Follow/unfollow mutations
  const followMutation = trpc.list.followList.useMutation({
    onSuccess: (data) => {
      console.log('devLog - followList success:', data);
      setIsFollowing(true);
    },
    onError: (error) => {
      console.log('devLog - followList error:', error);
    },
  });

  const unfollowMutation = trpc.list.unfollowList.useMutation({
    onSuccess: (data) => {
      console.log('devLog - unfollowList success:', data);
      setIsFollowing(false);
    },
    onError: (error) => {
      console.log('devLog - unfollowList error:', error);
    },
  });

  // Update isFollowing state when list data is loaded
  useEffect(() => {
    if (list && 'isFollowing' in list) {
      setIsFollowing(list.isFollowing);
    }
  }, [list]);

  const handleBack = () => {
    router.back();
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

  if (isLoading) {
    return (
      <div className="mobile:px-[10px] px-[40px]">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 pb-16 pt-8">
          <Skeleton className="h-[40px] w-[200px] rounded-[8px]" />
          <Skeleton className="h-[150px] w-full rounded-[10px]" />
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[80px] w-full rounded-[10px]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !list) {
    const isForbidden = error?.data?.code === 'FORBIDDEN';
    const isNotFound = error?.data?.code === 'NOT_FOUND';

    return (
      <div className="mobile:px-[10px] px-[40px]">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-6 pb-16 pt-8">
          <ECFTypography type="subtitle1">
            {isForbidden ? 'Access Denied' : 'List not found'}
          </ECFTypography>
          <ECFTypography type="body1" className="text-center opacity-60">
            {isForbidden
              ? "This is a private list and you don't have permission to view it."
              : "This list may be private or doesn't exist."}
          </ECFTypography>
          <Button
            onPress={handleBack}
            variant="light"
            startContent={<ArrowLeftIcon size={20} />}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile:px-[10px] px-[40px]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 pb-16 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            onPress={handleBack}
            variant="light"
            startContent={<ArrowLeftIcon size={20} />}
            className="h-[48px] rounded-[8px] px-6 text-[16px] font-semibold leading-[25.6px] text-black hover:bg-[rgba(0,0,0,0.05)]"
          >
            Back
          </Button>

          {/* Follow Button - Only show for public lists */}
          {list.privacy === 'public' && (
            <Button
              onPress={handleFollow}
              isLoading={followMutation.isPending || unfollowMutation.isPending}
              startContent={<BookmarksIcon size={20} />}
              className={
                isFollowing
                  ? 'h-[48px] rounded-[8px] bg-red-100 px-6 text-[16px] font-semibold leading-[25.6px] text-red-600 hover:bg-red-200'
                  : 'h-[48px] rounded-[8px] bg-blue-100 px-6 text-[16px] font-semibold leading-[25.6px] text-blue-600 hover:bg-blue-200'
              }
              variant="light"
            >
              {isFollowing ? 'Following' : 'Follow List'}
            </Button>
          )}
        </div>

        {/* List Info */}
        <div className="flex flex-col gap-4 rounded-[10px] bg-[rgba(0,0,0,0.03)] p-6">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-3">
              <ECFTypography
                type="subtitle1"
                className="text-[24px] font-semibold leading-[38.4px]"
              >
                {list.name}
              </ECFTypography>
              {list.description && (
                <ECFTypography
                  type="body1"
                  className="text-[16px] leading-[25.6px] opacity-80"
                >
                  {list.description}
                </ECFTypography>
              )}

              {/* Creator Info */}
              <div className="flex items-center gap-3">
                <Avatar
                  size="sm"
                  name={list.creator?.name || 'Unknown'}
                  src={list.creator?.avatarUrl || undefined}
                  className="size-8"
                />
                <div className="flex flex-col gap-1">
                  <ECFTypography
                    type="body2"
                    className="text-[14px] leading-[22.4px] opacity-60"
                  >
                    Created by:
                  </ECFTypography>
                  <ECFTypography
                    type="body2"
                    className="text-[14px] font-semibold leading-[22.4px]"
                  >
                    {list.creator?.name ||
                      `${list.creator || 'Unknown'}`.slice(0, 8) + '...'}
                  </ECFTypography>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Status and Stats */}
          <div className="flex items-center justify-between border-t border-[rgba(0,0,0,0.1)] pt-4">
            <div className="flex items-center gap-2">
              {getPrivacyIcon()}
              <ECFTypography
                type="body2"
                className="text-[14px] font-semibold leading-[22.4px] opacity-60"
              >
                {getPrivacyText()}
              </ECFTypography>
            </div>
            <div className="flex items-center gap-4">
              <ECFTypography
                type="body2"
                className="text-[14px] leading-[22.4px] opacity-60"
              >
                {listItems?.length || 0} projects
              </ECFTypography>
              <ECFTypography
                type="body2"
                className="text-[14px] leading-[22.4px] opacity-60"
              >
                Created {new Date(list.createdAt).toLocaleDateString()}
              </ECFTypography>
              {list.followCount && list.followCount > 0 && (
                <ECFTypography
                  type="body2"
                  className="text-[14px] leading-[22.4px] opacity-60"
                >
                  {list.followCount} followers
                </ECFTypography>
              )}
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="flex flex-col gap-4">
          <ECFTypography
            type="subtitle2"
            className="text-[18px] font-medium leading-[28.8px] opacity-60"
          >
            Projects in this list:
          </ECFTypography>

          {/* Projects List */}
          <div className="flex flex-col gap-3">
            {itemsLoading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton
                    key={i}
                    className="h-[80px] w-full rounded-[10px]"
                  />
                ))}
              </div>
            ) : listItems && listItems.length > 0 ? (
              listItems.map((item, index) => (
                <ProjectCard
                  key={item.id}
                  project={item.project as IProject}
                  showCreator={false}
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

        {/* Additional Info for Private Lists */}
        {list.privacy === 'private' && (
          <div className="rounded-[10px] border border-orange-200 bg-orange-50 p-4">
            <div className="flex items-center gap-3">
              <LockKeyIcon size={20} className="text-orange-600" />
              <div className="flex flex-col gap-1">
                <ECFTypography
                  type="body2"
                  className="text-[14px] font-semibold leading-[22.4px] text-orange-800"
                >
                  Private List
                </ECFTypography>
                <ECFTypography
                  type="caption"
                  className="text-[12px] leading-[19.2px] text-orange-600"
                >
                  This list is private and can only be accessed by the owner or
                  through direct sharing.
                </ECFTypography>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicListPage;
