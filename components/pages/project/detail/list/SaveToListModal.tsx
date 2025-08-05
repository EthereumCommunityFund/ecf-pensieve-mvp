'use client';

import {
  Button,
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

import BookmarkListItem from './BookmarkListItem';
import CreateNewListModal from './CreateNewListModal';
import SaveToListSkeleton from './SaveToListSkeleton';
import { useBookmark } from './useBookmark';

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

  // Only query when modal is open
  const { data: listsWithProjectStatus, isLoading: isLoadingLists } =
    getUserListsWithProjectStatus(projectId, isOpen);

  // State management for tracking changes
  const [originalCheckedState, setOriginalCheckedState] = useState<
    Record<string, boolean>
  >({});
  const [currentCheckedState, setCurrentCheckedState] = useState<
    Record<string, boolean>
  >({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // Initialize state when data loads
  useEffect(() => {
    if (listsWithProjectStatus && isOpen) {
      const initialState: Record<string, boolean> = {};
      listsWithProjectStatus.forEach((list) => {
        initialState[list.id.toString()] = list.isProjectInList;
      });
      setOriginalCheckedState(initialState);
      setCurrentCheckedState(initialState);
      setHasChanges(false);
    }
  }, [listsWithProjectStatus, isOpen]);

  // Check for changes
  useEffect(() => {
    const hasChanges =
      JSON.stringify(originalCheckedState) !==
      JSON.stringify(currentCheckedState);
    setHasChanges(hasChanges);
  }, [originalCheckedState, currentCheckedState]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setOriginalCheckedState({});
      setCurrentCheckedState({});
      setHasChanges(false);
    }
  }, [isOpen]);

  const handleListToggle = useCallback((listId: number) => {
    setCurrentCheckedState((prev) => ({
      ...prev,
      [listId.toString()]: !prev[listId.toString()],
    }));
  }, []);

  const handleConfirm = useCallback(async () => {
    // Find changes
    const toAdd: number[] = [];
    const toRemove: number[] = [];

    Object.keys(currentCheckedState).forEach((listId) => {
      const original = originalCheckedState[listId];
      const current = currentCheckedState[listId];

      if (original !== current) {
        if (current) {
          toAdd.push(Number(listId));
        } else {
          toRemove.push(Number(listId));
        }
      }
    });

    // Early return if no changes
    if (toAdd.length === 0 && toRemove.length === 0) {
      return;
    }

    setIsConfirming(true);

    try {
      // Execute all changes
      const promises = [];

      for (const listId of toAdd) {
        promises.push(
          addProjectToListMutation.mutateAsync({ listId, projectId }),
        );
      }

      for (const listId of toRemove) {
        promises.push(
          removeProjectFromListMutation.mutateAsync({ listId, projectId }),
        );
      }

      await Promise.allSettled(promises).then((results) => {
        const failed = results.filter((result) => result.status === 'rejected');
        if (failed.length > 0) {
          throw new Error(`Failed to update ${failed.length} list(s)`);
        }
      });

      // Update original state to current state after successful save
      setOriginalCheckedState(currentCheckedState);
      setHasChanges(false);

      const changeCount = toAdd.length + toRemove.length;
      addToast({
        title: `Updated ${changeCount} list${changeCount > 1 ? 's' : ''}`,
        color: 'success',
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update lists';
      addToast({ title: errorMessage, color: 'danger' });
      console.error('Failed to update lists:', error);
    } finally {
      setIsConfirming(false);
    }
  }, [
    currentCheckedState,
    originalCheckedState,
    projectId,
    addProjectToListMutation,
    removeProjectFromListMutation,
  ]);

  const handleCreateNewList = useCallback((newList: BookmarkList) => {
    // Auto-select the new list after creation
    setCurrentCheckedState((prev) => ({
      ...prev,
      [newList.id.toString()]: true,
    }));
  }, []);

  const handleClose = () => {
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
            <div className="relative flex-1 overflow-hidden">
              <div className="custom-scrollbar flex max-h-[300px] flex-col gap-2 overflow-y-auto pr-1">
                {isLoadingLists ? (
                  <SaveToListSkeleton />
                ) : !listsWithProjectStatus ||
                  listsWithProjectStatus.length === 0 ? (
                  <div className="flex justify-center p-4">
                    <div className="text-[14px] text-[#666]">
                      No lists found
                    </div>
                  </div>
                ) : (
                  listsWithProjectStatus
                    .sort((a, b) => {
                      // Sort by creation date (newer first)
                      return (
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                      );
                    })
                    .map((list) => (
                      <BookmarkListItem
                        key={list.id}
                        list={list}
                        isSelected={
                          currentCheckedState[list.id.toString()] || false
                        }
                        onToggle={handleListToggle}
                      />
                    ))
                )}
              </div>
              {/* Gradient fade overlay at bottom when content overflows */}
              {listsWithProjectStatus && listsWithProjectStatus.length > 5 && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-white to-transparent" />
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

            {hasChanges && (
              <Button
                onPress={handleConfirm}
                isLoading={isConfirming}
                isDisabled={isConfirming}
                className="flex items-center justify-center rounded-[5px] bg-[rgb(60,60,60)] px-[30px] py-[10px] text-[14px] font-[600] text-white hover:bg-[rgb(80,80,80)] disabled:opacity-50"
                style={{ fontFamily: 'Open Sans' }}
              >
                Confirm
              </Button>
            )}
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
