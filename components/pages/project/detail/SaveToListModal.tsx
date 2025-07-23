'use client';

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from '@heroui/react';
import { Plus, X } from '@phosphor-icons/react';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { addToast } from '@/components/base/toast';
import { trpc } from '@/lib/trpc/client';
import { BookmarkList } from '@/types/bookmark';

import BookmarkListItem from './BookmarkListItem';
import CreateNewListModal from './CreateNewListModal';

interface SaveToListModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
}

const SaveToListModal: FC<SaveToListModalProps> = ({
  isOpen,
  onClose,
  projectId,
}) => {
  const [selectedListIds, setSelectedListIds] = useState<number[]>([]);

  const {
    isOpen: isCreateModalOpen,
    onOpen: onCreateModalOpen,
    onClose: onCreateModalClose,
  } = useDisclosure();

  // Get all user lists
  const { data: userLists, isLoading: isLoadingLists } =
    trpc.list.getUserLists.useQuery();

  // Query project data for each list to check if the current project is in the list
  const listProjectQueries = trpc.useQueries((t) =>
    (userLists || []).map((list) =>
      t.list.getListProjects(
        {
          listId: list.id,
          limit: 100, // Large enough number to check if project exists
        },
        {
          enabled: !!list.id && isOpen, // Only query when modal is open
        },
      ),
    ),
  );

  // Handle add/remove project mutations
  const utils = trpc.useUtils();
  const addToListMutation = trpc.list.addProjectToList.useMutation({
    onSuccess: () => {
      // Invalidate related queries after success
      utils.list.getUserLists.invalidate();
      utils.list.getListProjects.invalidate();
    },
    onError: (error) => {
      if (error.data?.code === 'BAD_REQUEST') {
        addToast({ title: 'Project is already in this list', color: 'danger' });
      } else {
        addToast({ title: 'Failed to add project to list', color: 'danger' });
      }
    },
  });

  const removeFromListMutation = trpc.list.removeProjectFromList.useMutation({
    onSuccess: () => {
      // Invalidate related queries after success
      utils.list.getUserLists.invalidate();
      utils.list.getListProjects.invalidate();
    },
    onError: () => {
      addToast({
        title: 'Failed to remove project from list',
        color: 'danger',
      });
    },
  });

  // Calculate enhanced list data (including isProjectInList status)
  const listsWithProjectStatus = useMemo(() => {
    if (!userLists) return [];

    return userLists.map((list, index) => {
      const query = listProjectQueries[index];
      const isProjectInList =
        query.data?.items.some((item) => item.projectId === projectId) || false;

      return {
        ...list,
        isProjectInList,
      } as BookmarkList;
    });
  }, [userLists, listProjectQueries, projectId]);

  // Initialize selected state when modal opens
  useEffect(() => {
    if (!isOpen) {
      setSelectedListIds([]);
      return;
    }

    // Skip if no lists
    if (!userLists || userLists.length === 0) {
      return;
    }

    // Check if all queries are loaded
    const allQueriesLoaded = listProjectQueries.every(
      (query) => !query.isLoading,
    );
    if (!allQueriesLoaded) {
      return;
    }

    // Calculate already selected lists
    const alreadySelectedIds: number[] = [];
    userLists.forEach((list, index) => {
      const query = listProjectQueries[index];
      if (query.data?.items.some((item) => item.projectId === projectId)) {
        alreadySelectedIds.push(list.id);
      }
    });

    setSelectedListIds(alreadySelectedIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, userLists?.length, projectId]); // Use userLists?.length to avoid dependency array size changes

  const handleListToggle = useCallback(
    async (listId: number) => {
      const isCurrentlySelected = selectedListIds.includes(listId);

      // Optimistic update: update UI immediately
      if (isCurrentlySelected) {
        setSelectedListIds((prev) => prev.filter((id) => id !== listId));
      } else {
        setSelectedListIds((prev) => [...prev, listId]);
      }

      try {
        if (isCurrentlySelected) {
          // Remove from list
          await removeFromListMutation.mutateAsync({ listId, projectId });
        } else {
          // Add to list
          await addToListMutation.mutateAsync({ listId, projectId });
        }
      } catch (error) {
        // Revert optimistic update on error
        if (isCurrentlySelected) {
          setSelectedListIds((prev) => [...prev, listId]);
        } else {
          setSelectedListIds((prev) => prev.filter((id) => id !== listId));
        }
        // Error handling is already done in mutation onError
        console.error('Failed to toggle list:', error);
      }
    },
    [selectedListIds, projectId, addToListMutation, removeFromListMutation],
  );

  const handleCreateNewList = useCallback((newList: BookmarkList) => {
    // Auto-select the new list after creation
    setSelectedListIds((prev) => [...prev, newList.id]);
  }, []);

  const handleClose = () => {
    setSelectedListIds([]);
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        placement="center"
        hideCloseButton={true}
        classNames={{
          base: 'w-[400px] max-w-[400px] min-h-[185px] max-h-[447px]',
          backdrop: 'bg-black/50',
        }}
      >
        <ModalContent className="rounded-[10px] border border-black/10">
          <ModalHeader className="flex items-center justify-between border-b border-black/10 px-5 py-[10px]">
            <h3 className="text-[16px] font-[600] text-black opacity-80">
              Save to List
            </h3>
            <button
              onClick={handleClose}
              className="flex size-[30px] items-center justify-center rounded-[4px] p-[5px] hover:bg-black/5"
            >
              <X className="size-5 text-black" strokeWidth={1.5} />
            </button>
          </ModalHeader>
          <ModalBody className="flex flex-col justify-between gap-[10px] p-5">
            <div className="flex max-h-[300px] flex-col gap-2 overflow-y-auto">
              {isLoadingLists ? (
                <div className="flex justify-center p-4">
                  <div className="text-[14px] text-[#666]">
                    Loading lists...
                  </div>
                </div>
              ) : listsWithProjectStatus.length === 0 ? (
                <div className="flex justify-center p-4">
                  <div className="text-[14px] text-[#666]">No lists found</div>
                </div>
              ) : (
                listsWithProjectStatus.map((list) => (
                  <BookmarkListItem
                    key={list.id}
                    list={list}
                    isSelected={selectedListIds.includes(list.id)}
                    onToggle={handleListToggle}
                  />
                ))
              )}
            </div>

            <button
              onClick={onCreateModalOpen}
              className="flex items-center justify-between rounded-[8px] bg-black/5 px-[14px] py-2 hover:bg-black/10"
            >
              <span className="text-[14px] font-[600] text-black">
                Create New List
              </span>
              <Plus className="size-5 text-black" strokeWidth={1.5} />
            </button>
          </ModalBody>
        </ModalContent>
      </Modal>

      <CreateNewListModal
        isOpen={isCreateModalOpen}
        onClose={onCreateModalClose}
        projectId={projectId}
        onSuccess={handleCreateNewList}
      />
    </>
  );
};

export default SaveToListModal;
