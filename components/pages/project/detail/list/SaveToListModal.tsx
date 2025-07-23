'use client';

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from '@heroui/react';
import { Plus, X } from '@phosphor-icons/react';
import { FC, useCallback, useEffect, useState } from 'react';

import { addToast } from '@/components/base/toast';
import { BookmarkList } from '@/types/bookmark';

import { useBookmark } from './useBookmark';
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
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const {
    isOpen: isCreateModalOpen,
    onOpen: onCreateModalOpen,
    onClose: onCreateModalClose,
  } = useDisclosure();

  const {
    getUserListsWithProjectStatus,
    addProjectToListMutation,
    removeProjectFromListMutation,
  } = useBookmark();

  // Get all user lists with project status
  const { data: listsWithProjectStatus, isLoading: isLoadingLists } =
    getUserListsWithProjectStatus(projectId, isOpen);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedListIds([]);
      setInitialLoadComplete(false);
    }
  }, [isOpen]);

  // Initialize selected state based on loaded data
  useEffect(() => {
    // Skip if modal is closed or already initialized
    if (!isOpen || initialLoadComplete || isLoadingLists) {
      return;
    }

    // Skip if no lists
    if (!listsWithProjectStatus || listsWithProjectStatus.length === 0) {
      setInitialLoadComplete(true);
      return;
    }

    // Calculate the selected lists
    const alreadySelectedIds = listsWithProjectStatus
      .filter((list) => list.isProjectInList)
      .map((list) => list.id);

    setSelectedListIds(alreadySelectedIds);
    setInitialLoadComplete(true);
  }, [isOpen, initialLoadComplete, isLoadingLists, listsWithProjectStatus]);

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
          await removeProjectFromListMutation.mutateAsync({
            listId,
            projectId,
          });
        } else {
          // Add to list
          await addProjectToListMutation.mutateAsync({ listId, projectId });
        }
      } catch (error) {
        // Revert optimistic update on error
        if (isCurrentlySelected) {
          setSelectedListIds((prev) => [...prev, listId]);
        } else {
          setSelectedListIds((prev) => prev.filter((id) => id !== listId));
        }
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to toggle list';
        addToast({ title: errorMessage, color: 'danger' });
        console.error('Failed to toggle list:', error);
      }
    },
    [
      selectedListIds,
      projectId,
      addProjectToListMutation,
      removeProjectFromListMutation,
    ],
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
              ) : !listsWithProjectStatus ||
                listsWithProjectStatus.length === 0 ? (
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
