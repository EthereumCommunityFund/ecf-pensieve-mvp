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

  // Derive selected lists directly from query data
  const initialSelectedListIds = useMemo(
    () =>
      listsWithProjectStatus
        ?.filter((list) => list.isProjectInList)
        .map((list) => list.id) || [],
    [listsWithProjectStatus],
  );

  // Local state for optimistic updates
  const [localSelectedChanges, setLocalSelectedChanges] = useState<{
    added: Set<number>;
    removed: Set<number>;
  }>({ added: new Set(), removed: new Set() });

  // Compute final selected list IDs
  const selectedListIds = useMemo(
    () => [
      ...initialSelectedListIds.filter(
        (id) => !localSelectedChanges.removed.has(id),
      ),
      ...Array.from(localSelectedChanges.added),
    ],
    [initialSelectedListIds, localSelectedChanges],
  );

  // Reset local changes when modal closes
  useEffect(() => {
    if (!isOpen) {
      setLocalSelectedChanges({ added: new Set(), removed: new Set() });
    }
  }, [isOpen]);

  const handleListToggle = useCallback(
    async (listId: number) => {
      const isCurrentlySelected = selectedListIds.includes(listId);
      const wasInitiallySelected = initialSelectedListIds.includes(listId);

      // Optimistic update
      setLocalSelectedChanges((prev) => {
        const newAdded = new Set(prev.added);
        const newRemoved = new Set(prev.removed);

        if (isCurrentlySelected) {
          // Removing
          if (wasInitiallySelected) {
            newRemoved.add(listId);
          } else {
            newAdded.delete(listId);
          }
        } else {
          // Adding
          if (wasInitiallySelected) {
            newRemoved.delete(listId);
          } else {
            newAdded.add(listId);
          }
        }

        return { added: newAdded, removed: newRemoved };
      });

      try {
        if (isCurrentlySelected) {
          await removeProjectFromListMutation.mutateAsync({
            listId,
            projectId,
          });
          addToast({ title: 'Removed from list', color: 'success' });
        } else {
          await addProjectToListMutation.mutateAsync({ listId, projectId });
          addToast({ title: 'Added to list', color: 'success' });
        }
      } catch (error) {
        // Revert optimistic update on error
        setLocalSelectedChanges((prev) => {
          const newAdded = new Set(prev.added);
          const newRemoved = new Set(prev.removed);

          if (isCurrentlySelected) {
            // Was trying to remove, revert
            if (wasInitiallySelected) {
              newRemoved.delete(listId);
            } else {
              newAdded.add(listId);
            }
          } else {
            // Was trying to add, revert
            if (wasInitiallySelected) {
              newRemoved.add(listId);
            } else {
              newAdded.delete(listId);
            }
          }

          return { added: newAdded, removed: newRemoved };
        });

        const errorMessage =
          error instanceof Error ? error.message : 'Failed to toggle list';
        addToast({ title: errorMessage, color: 'danger' });
        console.error('Failed to toggle list:', error);
      }
    },
    [
      selectedListIds,
      initialSelectedListIds,
      projectId,
      addProjectToListMutation,
      removeProjectFromListMutation,
    ],
  );

  const handleCreateNewList = useCallback((newList: BookmarkList) => {
    // Auto-select the new list after creation
    setLocalSelectedChanges((prev) => {
      const newAdded = new Set(prev.added);
      newAdded.add(newList.id);
      return { ...prev, added: newAdded };
    });
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
            <div className="relative">
              <div className="flex max-h-[300px] flex-col gap-2 overflow-y-auto">
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
                        isSelected={selectedListIds.includes(list.id)}
                        onToggle={handleListToggle}
                      />
                    ))
                )}
              </div>
              {/* Gradient fade overlay at bottom when content overflows */}
              {listsWithProjectStatus && listsWithProjectStatus.length > 6 && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white/100 via-white/90 to-white/20" />
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
