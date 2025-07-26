'use client';

import { Button, Skeleton } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

import ECFTypography from '@/components/base/typography';
import { ArrowLeftIcon, PlusSquareIcon, SignOutIcon } from '@/components/icons';
import ProjectCard from '@/components/pages/project/ProjectCard';
import { trpc } from '@/lib/trpc/client';
import { IProject } from '@/types';

interface SharedListPageProps {
  slug: string;
}

const SharedListPage = ({ slug }: SharedListPageProps) => {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);
  const { address: currentUserAddress } = useAccount();

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
      retry: false,
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

  if (isLoading) {
    return (
      <div className="flex justify-center px-[160px] py-8">
        <div className="flex w-[810px] flex-col gap-[10px]">
          <Skeleton className="h-[30px] w-[100px] rounded-[5px]" />
          <Skeleton className="h-[120px] w-full rounded-[10px]" />
          <div className="flex flex-col gap-[10px]">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[120px] w-full rounded-[10px]" />
            ))}
          </div>
        </div>
      </div>
    );
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
    <div className="flex justify-center px-[160px] py-8">
      <div className="flex w-[810px] flex-col gap-[10px]">
        {/* Header */}
        <div className="flex items-center gap-[10px]">
          <div className="w-[440px]">
            <Button
              onPress={handleBack}
              variant="light"
              size="sm"
              className="h-[30px] rounded-[5px] bg-[#E1E1E1] px-[8px] text-[14px] font-semibold text-black"
              startContent={<ArrowLeftIcon size={20} />}
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
                className="opacity-68 text-[14px] leading-[18px]"
              >
                {list.description}
              </ECFTypography>
            )}
            <div className="flex items-center justify-between">
              <div className="flex gap-[10px]">
                {/* Created by */}
                <div className="flex items-center gap-[5px] rounded-[5px] bg-[rgba(0,0,0,0.05)] px-[10px] py-[5px]">
                  <ECFTypography
                    type="body2"
                    className="text-[14px] opacity-80"
                  >
                    by:
                  </ECFTypography>
                  {list.creator?.avatarUrl && (
                    <img
                      src={list.creator.avatarUrl}
                      alt={list.creator.name || ''}
                      className="size-[24px] rounded-full"
                    />
                  )}
                  <ECFTypography
                    type="body2"
                    className="text-[14px] opacity-80"
                  >
                    {list.creator?.name || 'Unknown'}
                  </ECFTypography>
                </div>
              </div>
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
              startContent={
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
                // TODO: Implement login flow
                console.log('Login required');
              }}
              variant="light"
              size="sm"
              className="h-[40px] rounded-[5px] border border-[rgba(0,0,0,0.1)] bg-[#EBEBEB] px-[10px] text-[14px] font-semibold text-black opacity-60 hover:opacity-100"
              startContent={<PlusSquareIcon size={24} />}
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
                <Skeleton key={i} className="h-[120px] w-full rounded-[10px]" />
              ))}
            </>
          ) : listItems && listItems.length > 0 ? (
            listItems.map((item) => (
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
    </div>
  );
};

export default SharedListPage;
