'use client';

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Button, Skeleton } from '@heroui/react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

import EditListModal from '@/app/profile/[address]/components/modals/EditListModal';
import ShareListModal from '@/app/profile/[address]/components/modals/ShareListModal';
import ECFTypography from '@/components/base/typography';
import {
  ArrowLeftIcon,
  GearSixIcon,
  GlobeHemisphereWestIcon,
  LockKeyIcon,
  PencilSimpleIcon,
  XIcon,
} from '@/components/icons';
import LinkIcon from '@/components/icons/Link';
import ProfileSidebar from '@/components/layout/ProfileSidebar';
import SortableProjectCard from '@/components/pages/list/SortableProjectCard';
import ProjectCard from '@/components/pages/project/ProjectCard';
import { trpc } from '@/lib/trpc/client';
import { IProject } from '@/types';
import { useAuth } from '@/context/AuthContext';

import SharedListPage from './SharedListPage';

const PublicListPage = () => {
  const { slug } = useParams();
  const router = useRouter();
  const { profile } = useAuth();

  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditListModal, setShowEditListModal] = useState(false);
  const [editedItems, setEditedItems] = useState<any[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const { address: currentUserAddress } = useAccount();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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

  // Initialize editedItems when listItems change
  useEffect(() => {
    if (listItems && listItems.length > 0) {
      setEditedItems(
        listItems.map((item, index) => ({
          ...item,
          order: index,
        })),
      );
    }
  }, [listItems]);

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setEditedItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        setHasChanges(true);
        return newItems;
      });
    }
  };

  const handleRemoveItem = useCallback((itemId: string) => {
    setEditedItems((items) => items.filter((item) => item.id !== itemId));
    setHasChanges(true);
  }, []);

  // const updateListItemsMutation = trpc.list.updateListItems.useMutation({
  //   onSuccess: () => {
  //     setIsEditMode(false);
  //     setHasChanges(false);
  //   },
  //   onError: (error) => {
  //     console.error('Failed to update list items:', error);
  //   },
  // });

  const handleSaveChanges = () => {
    if (!list) return;

    // TODO: Implement save changes logic when API is ready
    const updatedItems = editedItems.map((item, index) => ({
      id: item.id,
      order: index,
    }));

    console.log('Save changes:', { listId: list.id, items: updatedItems });

    // updateListItemsMutation.mutate({
    //   listId: list.id,
    //   items: updatedItems,
    // });

    setIsEditMode(false);
    setHasChanges(false);
  };

  const handleDiscardChanges = () => {
    if (listItems) {
      setEditedItems(
        listItems.map((item, index) => ({
          ...item,
          order: index,
        })),
      );
    }
    setIsEditMode(false);
    setHasChanges(false);
  };

  // Check if current user is the owner
  const isOwner =
    list && list.creator && profile
      ? list.creator.userId.toLowerCase() === profile.userId
      : false;

  // If not owner, render SharedListPage
  if (!isOwner && list) {
    return <SharedListPage slug={slug as string} />;
  }

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
        <div className="mx-auto flex w-full max-w-[1200px] gap-5 pb-16 pt-8">
          <div className="w-[280px]" />
          <div className="flex flex-1 flex-col gap-[10px]">
            <Skeleton className="h-[40px] w-[200px] rounded-[8px]" />
            <Skeleton className="h-[150px] w-full rounded-[10px]" />
            <div className="flex flex-col gap-[10px]">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[120px] w-full rounded-[10px]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !list) {
    const isForbidden = error?.data?.code === 'FORBIDDEN';

    return (
      <div className="mobile:px-[10px] px-[40px]">
        <div className="mx-auto flex w-full max-w-[1200px] gap-5 pb-16 pt-8">
          <div className="w-[280px]" />
          <div className="flex flex-1 flex-col items-center gap-6">
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
      </div>
    );
  }

  return (
    <div className="mobile:px-[10px] px-[40px]">
      <div className="mx-auto flex w-full max-w-[1200px] gap-5 pb-16 pt-8">
        {/* Left Sidebar */}
        <ProfileSidebar activeTab="lists" address={currentUserAddress} />

        {/* Main Content */}
        <div className="flex flex-1 flex-col gap-[10px]">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[10px]">
              {/* Back Buttons */}
              {isEditMode ? (
                <Button
                  onPress={handleBack}
                  variant="light"
                  size="sm"
                  className="h-[30px] rounded-[5px] bg-[#E1E1E1] px-[8px] text-[14px] font-semibold text-black"
                  startContent={<ArrowLeftIcon size={20} />}
                >
                  Back
                </Button>
              ) : (
                <div className="flex items-center">
                  <ECFTypography
                    type="body2"
                    className="text-[14px] font-normal leading-[20px] opacity-60"
                  >
                    My Profile
                  </ECFTypography>
                  <ECFTypography
                    type="body2"
                    className="mx-[10px] text-[14px] font-semibold leading-[20px] opacity-60"
                  >
                    /
                  </ECFTypography>
                  <ECFTypography
                    type="body2"
                    className="text-[14px] font-normal leading-[20px] opacity-60"
                  >
                    ...
                  </ECFTypography>
                </div>
              )}
            </div>

            <div className="flex items-center gap-[10px]">
              {/* Another Share Button (as shown in Figma) */}
              <Button
                onPress={() => setShowShareModal(true)}
                variant="light"
                endContent={<LinkIcon size={18} />}
                className="h-[30px] rounded-[5px] bg-[#EBEBEB] px-[8px] text-[14px] font-semibold text-black opacity-60 hover:opacity-100"
              >
                Share List
              </Button>
            </div>
          </div>

          {/* List Info */}
          <div className="flex flex-col gap-[10px] border-b border-[rgba(0,0,0,0.1)] pb-[20px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[10px]">
                <ECFTypography
                  type="subtitle1"
                  className="text-[20px] font-semibold leading-[24px]"
                >
                  {list.name}
                </ECFTypography>
                {isOwner && !isEditMode && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    className="size-[28px] rounded-[5px] bg-[#E1E1E1] p-[5px] opacity-50 hover:opacity-100"
                    onPress={() => setShowEditListModal(true)}
                  >
                    <PencilSimpleIcon size={14} className="opacity-50" />
                  </Button>
                )}
              </div>
            </div>
            {list.description && (
              <ECFTypography
                type="body1"
                className="opacity-68 text-[14px] leading-[18px]"
              >
                {list.description}
              </ECFTypography>
            )}
            <div className="flex items-center gap-[5px] opacity-60">
              {getPrivacyIcon()}
              <ECFTypography type="body2" className="text-[14px] font-semibold">
                {getPrivacyText()}
              </ECFTypography>
            </div>
          </div>

          {/* Projects Section */}
          <div className="flex flex-col gap-[10px]">
            {/* Edit Mode Controls */}
            {isOwner && (
              <div className="flex items-center justify-end">
                {isEditMode ? (
                  <div className="flex items-center gap-[20px]">
                    <Button
                      onPress={handleDiscardChanges}
                      variant="light"
                      className="flex h-[30px] items-center gap-[5px] rounded-[5px] bg-[rgba(0,0,0,0.05)] px-[8px] py-[4px] text-[14px] font-semibold text-black opacity-50 hover:opacity-100"
                      startContent={<XIcon size={20} className="opacity-100" />}
                    >
                      Discard Changes
                    </Button>
                    <Button
                      onPress={handleSaveChanges}
                      variant="light"
                      className="flex h-[30px] items-center gap-[5px] rounded-[5px] bg-[rgba(0,0,0,0.05)] px-[8px] py-[4px] text-[14px] font-semibold text-black opacity-50 hover:opacity-100"
                      isDisabled={!hasChanges}
                      endContent={
                        <GearSixIcon size={20} className="opacity-100" />
                      }
                    >
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <Button
                    onPress={() => setIsEditMode(true)}
                    variant="light"
                    className="flex h-[30px] items-center gap-[5px] rounded-[5px] bg-[rgba(0,0,0,0.05)] px-[8px] py-[4px] text-[14px] font-semibold text-black opacity-50 hover:opacity-100"
                    endContent={
                      <GearSixIcon size={20} className="opacity-100" />
                    }
                  >
                    Organize List
                  </Button>
                )}
              </div>
            )}

            {/* Projects List */}
            <div className="flex flex-col gap-[10px]">
              {itemsLoading ? (
                <div className="flex flex-col gap-[10px]">
                  {[1, 2, 3].map((i) => (
                    <Skeleton
                      key={i}
                      className="h-[120px] w-full rounded-[10px]"
                    />
                  ))}
                </div>
              ) : editedItems && editedItems.length > 0 ? (
                isEditMode ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToVerticalAxis]}
                  >
                    <SortableContext
                      items={editedItems.map((item) => item.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {editedItems.map((item) => (
                        <SortableProjectCard
                          key={item.id}
                          id={item.id}
                          project={item.project as IProject}
                          onRemove={() => handleRemoveItem(item.id)}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                ) : (
                  editedItems.map((item) => (
                    <ProjectCard
                      key={item.id}
                      project={item.project as IProject}
                      showCreator={false}
                    />
                  ))
                )
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
                    This list is private and can only be accessed by the owner
                    or through direct sharing.
                  </ECFTypography>
                </div>
              </div>
            </div>
          )}

          {/* Share Modal */}
          {list && (
            <ShareListModal
              isOpen={showShareModal}
              onClose={() => setShowShareModal(false)}
              list={list}
            />
          )}

          {/* Edit List Modal */}
          {list && (
            <EditListModal
              isOpen={showEditListModal}
              onClose={() => setShowEditListModal(false)}
              list={list}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicListPage;
