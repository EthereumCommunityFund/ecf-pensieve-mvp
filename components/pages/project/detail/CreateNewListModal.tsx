'use client';

import {
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Select,
  SelectItem,
} from '@heroui/react';
import { CaretDown, Info, X } from '@phosphor-icons/react';
import { FC, useState } from 'react';

import { Button } from '@/components/base';
import { addToast } from '@/components/base/toast';
import { trpc } from '@/lib/trpc/client';
import { BookmarkList, CreateListRequest } from '@/types/bookmark';

interface CreateNewListModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  onSuccess: (newList: BookmarkList) => void;
}

const CreateNewListModal: FC<CreateNewListModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<CreateListRequest>({
    name: '',
    privacy: 'private',
  });

  const utils = trpc.useUtils();

  // Create list mutation
  const createListMutation = trpc.list.createList.useMutation({
    onSuccess: async (newList) => {
      // After successful creation, automatically add the current project to the new list
      try {
        await addToListMutation.mutateAsync({
          listId: newList.id,
          projectId,
        });

        // Refresh related queries
        utils.list.getUserLists.invalidate();
        utils.list.getListProjects.invalidate();

        addToast({ title: 'List created successfully', color: 'success' });
        onSuccess({
          ...newList,
          isProjectInList: true,
        } as BookmarkList);
        handleClose();
      } catch (error) {
        console.error('Failed to add project to new list:', error);
        // Still refresh queries even if adding project failed
        utils.list.getUserLists.invalidate();

        addToast({
          title: 'List created but failed to add project',
          color: 'warning',
        });
        // Don't call onSuccess if adding project failed - this prevents parent from incorrectly updating state
        handleClose();
      }
    },
    onError: (error) => {
      if (error.data?.code === 'BAD_REQUEST') {
        addToast({ title: 'Invalid list data', color: 'danger' });
      } else {
        addToast({ title: 'Failed to create list', color: 'danger' });
      }
    },
  });

  // Add project to list mutation
  const addToListMutation = trpc.list.addProjectToList.useMutation();

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    createListMutation.mutate({
      name: formData.name.trim(),
      privacy: formData.privacy,
    });
  };

  const handleClose = () => {
    setFormData({ name: '', privacy: 'private' });
    onClose();
  };

  const isFormValid =
    formData.name.trim().length > 0 && formData.name.length <= 150;

  const isCreating =
    createListMutation.isPending || addToListMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      placement="center"
      hideCloseButton={true}
      classNames={{
        base: 'w-[400px] max-w-[400px]',
        backdrop: 'bg-black/50',
      }}
    >
      <ModalContent className="rounded-[10px] border border-black/10">
        <ModalHeader className="flex items-center justify-between border-b border-black/10 px-5 py-[10px]">
          <h3 className="text-[16px] font-[600] text-black opacity-80">
            Create New List
          </h3>
          <button
            onClick={handleClose}
            className="flex size-[30px] items-center justify-center rounded-[4px] p-[5px] hover:bg-black/5"
          >
            <X className="size-5 text-black" strokeWidth={1.5} />
          </button>
        </ModalHeader>
        <ModalBody className="flex flex-col gap-5 p-5">
          <div className="flex flex-col gap-[20px] pb-5">
            <div className="flex flex-col gap-[10px]">
              <div className="flex flex-col gap-[5px]">
                <label className="text-[16px] font-[600] leading-[1.6em] text-black">
                  List Name
                </label>
              </div>
              <div className="flex flex-col gap-[10px]">
                <div className="flex items-stretch rounded-[8px] border border-black/10 bg-black/5 px-[10px]">
                  <Input
                    placeholder="type a name for this list"
                    value={formData.name}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, name: value }))
                    }
                    classNames={{
                      base: 'flex-1',
                      mainWrapper: 'h-auto',
                      inputWrapper:
                        'bg-transparent border-none shadow-none px-0 py-2 min-h-0 h-auto hover:bg-transparent focus-within:bg-transparent data-[hover=true]:bg-transparent data-[focus=true]:bg-transparent',
                      input:
                        'text-[14px] leading-[1.428em] text-black placeholder:text-black placeholder:opacity-50',
                    }}
                  />
                </div>
                <div className="text-right">
                  <span className="text-[11px] leading-[1.36em] text-black opacity-80">
                    {formData.name.length} / 150
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-[10px]">
              <div className="flex flex-col gap-[5px]">
                <div className="flex items-center gap-[5px]">
                  <label className="text-[16px] font-[600] leading-[1.6em] text-black">
                    List Privacy
                  </label>
                  <Info
                    className="size-5 text-black opacity-50"
                    strokeWidth={1.5}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-[8px] border border-black/10 bg-black/5 px-[10px] py-2">
                <Select
                  selectedKeys={[formData.privacy]}
                  onSelectionChange={(keys) => {
                    const privacy = Array.from(keys)[0] as 'private' | 'public';
                    setFormData((prev) => ({ ...prev, privacy }));
                  }}
                  classNames={{
                    base: 'flex-1',
                    mainWrapper: 'h-auto',
                    trigger:
                      'bg-transparent border-none shadow-none px-0 py-0 min-h-0 h-auto hover:bg-transparent focus:bg-transparent data-[hover=true]:bg-transparent data-[focus=true]:bg-transparent data-[open=true]:bg-transparent',
                    value: 'text-[14px] leading-[1.428em] text-black',
                    selectorIcon: 'hidden',
                  }}
                >
                  <SelectItem key="private">Private</SelectItem>
                  <SelectItem key="public">Public</SelectItem>
                </Select>
                <CaretDown
                  className="size-4 text-black opacity-50"
                  weight="bold"
                />
              </div>
            </div>
          </div>

          <div className="flex items-stretch gap-[10px]">
            <Button
              variant="solid"
              onPress={handleClose}
              className="h-[39px] flex-1 rounded-[5px] border border-black/10 px-[30px] py-[10px] text-[14px] font-[600] leading-[1.36em] text-black"
              isDisabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              onPress={handleSubmit}
              className={`h-[39px] flex-1 rounded-[5px] border border-black/10 px-[30px] py-[10px] text-[14px] font-[600] leading-[1.36em] text-white ${
                isFormValid && !isCreating
                  ? 'bg-[#64C0A5]' // Green color when enabled
                  : 'bg-[#3C3C3C] opacity-20' // Dark with opacity when disabled
              }`}
              isDisabled={!isFormValid || isCreating}
              isLoading={isCreating}
            >
              Create
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CreateNewListModal;
