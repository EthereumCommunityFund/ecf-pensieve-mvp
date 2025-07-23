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

  // 获取用户所有列表
  const { data: userLists, isLoading: isLoadingLists } =
    trpc.list.getUserLists.useQuery();

  // 为每个列表查询项目数据，检查当前项目是否在列表中
  const listProjectQueries = trpc.useQueries((t) =>
    (userLists || []).map((list) =>
      t.list.getListProjects(
        {
          listId: list.id,
          limit: 100, // 足够大的数字来检查项目是否存在
        },
        {
          enabled: !!list.id && isOpen, // 只在modal打开时查询
        },
      ),
    ),
  );

  // 处理添加/移除项目的mutations
  const utils = trpc.useUtils();
  const addToListMutation = trpc.list.addProjectToList.useMutation({
    onSuccess: () => {
      // 成功后invalidate相关查询
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
      // 成功后invalidate相关查询
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

  // 计算增强的列表数据（包含isProjectInList状态）
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

  // 当modal打开时，初始化选中状态
  useEffect(() => {
    if (!isOpen) {
      setSelectedListIds([]);
      return;
    }

    if (listsWithProjectStatus.length > 0) {
      const alreadySelectedIds = listsWithProjectStatus
        .filter((list) => list.isProjectInList)
        .map((list) => list.id);

      setSelectedListIds(alreadySelectedIds);
    }
  }, [isOpen]); // 只在modal打开/关闭时执行

  const handleListToggle = useCallback(
    async (listId: number) => {
      const isCurrentlySelected = selectedListIds.includes(listId);

      try {
        if (isCurrentlySelected) {
          // Remove from list
          await removeFromListMutation.mutateAsync({ listId, projectId });
          setSelectedListIds((prev) => prev.filter((id) => id !== listId));
        } else {
          // Add to list
          await addToListMutation.mutateAsync({ listId, projectId });
          setSelectedListIds((prev) => [...prev, listId]);
        }
      } catch (error) {
        // Error handling is already done in mutation onError
        console.error('Failed to toggle list:', error);
      }
    },
    [selectedListIds, projectId, addToListMutation, removeFromListMutation],
  );

  const handleCreateNewList = useCallback((newList: BookmarkList) => {
    // 新建列表后自动选中
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
