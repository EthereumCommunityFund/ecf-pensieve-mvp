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
import { ArrowLeft } from '@phosphor-icons/react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import EditListModal from '@/app/profile/[address]/components/list/modals/EditListModal';
import ShareListModal from '@/app/profile/[address]/components/list/modals/ShareListModal';
import { Button } from '@/components/base';
import { addToast } from '@/components/base/toast';
import ECFTypography from '@/components/base/typography';
import {
  GearSixIcon,
  GlobeHemisphereWestIcon,
  LockKeyIcon,
  PencilSimpleIcon,
  XIcon,
} from '@/components/icons';
import LinkIcon from '@/components/icons/Link';
import ListDetailSkeleton from '@/components/pages/list/ListDetailSkeleton';
import SortableProjectCard from '@/components/pages/list/SortableProjectCard';
import ProjectCard, {
  ProjectCardSkeleton,
} from '@/components/pages/project/ProjectCard';
import { useAuth } from '@/context/AuthContext';
import { useUpvote } from '@/hooks/useUpvote';
import { trpc } from '@/lib/trpc/client';
import { IEditState, IListProjectWithOrder, IProject } from '@/types';

const ProfileListDetailPage = () => {
  const { address, slug } = useParams();
  const router = useRouter();
  const { profile } = useAuth();

  const [isEditMode, setIsEditMode] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditListModal, setShowEditListModal] = useState(false);
  const [editState, setEditState] = useState<IEditState>({
    editedItems: [],
    deletedItemIds: [],
    originalItems: [],
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
        console.log('devLog - getListBySlug response (profile page):', data);
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
      select: (data) => {
        console.log('devLog - getListProjects response (profile page):', data);
        return data;
      },
    },
  );

  const listItems = listData?.items;

  // Mutations for updating list
  const removeProjectsMutation = trpc.list.removeProjectFromList.useMutation({
    onError: (error) => {
      console.error('Failed to remove projects:', error);
    },
  });

  const updateOrderMutation = trpc.list.updateListProjectsOrder.useMutation({
    onError: (error) => {
      console.error('Failed to update order:', error);
    },
  });

  const { handleUpvote, getProjectLikeRecord, UpvoteModalComponent } =
    useUpvote({
      onSuccess: refetchListProjects,
    });

  // Initialize edit state when listItems change
  useEffect(() => {
    if (listItems && listItems.length > 0) {
      const itemsWithOrder = listItems.map((item, index) => ({
        ...item,
        order: index,
      })) as IListProjectWithOrder[];

      setEditState({
        editedItems: itemsWithOrder,
        deletedItemIds: [],
        originalItems: itemsWithOrder,
      });
    }
  }, [listItems]);

  const handleBack = () => {
    router.push(`/profile/${address}?tab=lists`);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setEditState((prevState) => {
        const oldIndex = prevState.editedItems.findIndex(
          (item) => item.id.toString() === active.id,
        );
        const newIndex = prevState.editedItems.findIndex(
          (item) => item.id.toString() === over?.id,
        );
        const newItems = arrayMove(prevState.editedItems, oldIndex, newIndex);
        // Update order property after moving
        const itemsWithUpdatedOrder = newItems.map(
          (item: IListProjectWithOrder, index: number) => ({
            ...item,
            order: index,
          }),
        );

        return {
          ...prevState,
          editedItems: itemsWithUpdatedOrder,
        };
      });
      setHasChanges(true);
    }
  };

  const handleRemoveItem = useCallback((itemId: number) => {
    setEditState((prevState) => {
      // Find the item to get its projectId
      const itemToRemove = prevState.editedItems.find(
        (item) => item.id === itemId,
      );

      if (!itemToRemove) return prevState;

      return {
        ...prevState,
        editedItems: prevState.editedItems.filter((item) => item.id !== itemId),
        deletedItemIds: [...prevState.deletedItemIds, itemToRemove.project.id],
      };
    });
    setHasChanges(true);
  }, []);

  const handleSaveChanges = async () => {
    if (!list) return;

    setIsSaving(true);

    try {
      // 1. Process deletions if any
      if (editState.deletedItemIds.length > 0) {
        await removeProjectsMutation.mutateAsync({
          listId: list.id,
          projectIds: editState.deletedItemIds,
        } as { listId: number; projectIds: number[] });
      }

      // 2. Process order updates
      const sortedItems = editState.editedItems.map((item, index) => ({
        projectId: item.project.id,
        sortOrder: (index + 1) * 10, // Use multiples of 10 for future insertion flexibility
      }));

      await updateOrderMutation.mutateAsync({
        listId: list.id,
        items: sortedItems,
      });

      // 3. Refresh data
      await refetchListProjects();

      // 4. Reset state
      setIsEditMode(false);
      setHasChanges(false);
      setEditState((prevState) => ({
        ...prevState,
        deletedItemIds: [],
      }));

      addToast({
        title: 'Changes saved successfully',
        color: 'success',
      });
    } catch (error) {
      // Error handling based on error type
      let errorMessage = 'Failed to save changes';

      if (error instanceof Error) {
        if (error.message.includes('FORBIDDEN')) {
          errorMessage = 'You do not have permission to modify this list';
        } else if (error.message.includes('NOT_FOUND')) {
          errorMessage = 'List not found or has been deleted';
        } else if (
          error.message.includes('NETWORK_ERROR') ||
          error.message.includes('fetch')
        ) {
          errorMessage = 'Network error, please try again later';
        } else if (error.message.includes('BAD_REQUEST')) {
          errorMessage =
            'Some projects have already been removed from this list';
        } else {
          errorMessage = error.message;
        }
      }

      addToast({
        title: errorMessage,
        color: 'danger',
      });

      console.error('Save changes error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    setEditState((prevState) => ({
      editedItems: [...prevState.originalItems],
      deletedItemIds: [],
      originalItems: prevState.originalItems,
    }));
    setIsEditMode(false);
    setHasChanges(false);
  };

  // Check if current user is the owner
  const isOwner =
    list && list.creator && profile
      ? list.creator.userId.toLowerCase() === profile.userId
      : false;

  // If not owner, redirect to public list page
  useEffect(() => {
    if (!isOwner && list) {
      router.push(`/list/${slug}`);
    }
  }, [isOwner, list, slug, router]);

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
    return <ListDetailSkeleton />;
  }

  if (error || !list) {
    const isForbidden = error?.data?.code === 'FORBIDDEN';

    return (
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
          color="secondary"
          startContent={<ArrowLeft />}
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-[10px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[10px]">
          <Button
            onPress={handleBack}
            color="secondary"
            size="sm"
            className="h-[30px] rounded-[5px] border-none px-[8px] text-[14px] font-semibold text-black"
            startContent={<ArrowLeft size={20} />}
          >
            Back
          </Button>
        </div>

        <div className="flex items-center gap-[10px]">
          {/* Another Share Button (as shown in Figma) */}
          <Button
            onPress={() => setShowShareModal(true)}
            endContent={<LinkIcon size={18} />}
            size="sm"
            className="flex h-[30px] items-center gap-[5px] rounded-[5px] border-none px-[8px] py-[4px] text-[14px] font-semibold text-black opacity-50 hover:opacity-100"
            isDisabled={list.privacy === 'private'}
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
                color="secondary"
                className="size-[28px] rounded-[5px] border-none p-[5px] opacity-50 hover:opacity-100"
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
                  size="sm"
                  className="flex h-[30px] items-center gap-[5px] rounded-[5px] border-none px-[8px] py-[4px] text-[14px] font-semibold text-black opacity-50 hover:opacity-100"
                  endContent={<XIcon size={20} color="#000" />}
                >
                  Discard Changes
                </Button>
                <Button
                  onPress={handleSaveChanges}
                  size="sm"
                  className="flex h-[30px] items-center gap-[5px] rounded-[5px] border-none px-[8px] py-[4px] text-[14px] font-semibold text-black opacity-50 hover:opacity-100"
                  isDisabled={!hasChanges || isSaving}
                  isLoading={isSaving}
                  endContent={
                    !isSaving && (
                      <GearSixIcon size={20} className="opacity-100" />
                    )
                  }
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            ) : (
              <Button
                onPress={() => setIsEditMode(true)}
                size="sm"
                className="flex h-[30px] items-center gap-[5px] rounded-[5px] border-none px-[8px] py-[4px] text-[14px] font-semibold text-black opacity-50 hover:opacity-100"
                endContent={<GearSixIcon size={20} className="opacity-100" />}
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
                <ProjectCardSkeleton
                  key={i}
                  showCreator={false}
                  showBorder={i < 2}
                />
              ))}
            </div>
          ) : editState.editedItems && editState.editedItems.length > 0 ? (
            isEditMode ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext
                  items={editState.editedItems.map((item) =>
                    item.id.toString(),
                  )}
                  strategy={verticalListSortingStrategy}
                >
                  {editState.editedItems.map((item) => (
                    <SortableProjectCard
                      key={item.id}
                      id={item.id.toString()}
                      project={item.project as IProject}
                      onRemove={() => handleRemoveItem(item.id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              editState.editedItems.map((item) => (
                <ProjectCard
                  key={item.id}
                  project={item.project as IProject}
                  showCreator={false}
                  showUpvote={true}
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

      {UpvoteModalComponent}
    </div>
  );
};

export default ProfileListDetailPage;
