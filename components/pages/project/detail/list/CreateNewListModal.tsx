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
import { CaretDown, Globe, Info, Link, Lock, X } from '@phosphor-icons/react';
import { FC, useState } from 'react';

import { Button } from '@/components/base';
import { addToast } from '@/components/base/toast';
import ECFTypography from '@/components/base/typography';
import { BookmarkList, CreateListRequest } from '@/types/bookmark';

import { useBookmark } from './useBookmark';

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

  const { createListMutation, addProjectToListMutation } = useBookmark();

  const handleCreateSuccess = async (newList: BookmarkList) => {
    // After successful creation, automatically add the current project to the new list
    try {
      await addProjectToListMutation.mutateAsync({
        listId: newList.id,
        projectId,
      });

      addToast({ title: 'List created successfully', color: 'success' });
      onSuccess({
        ...newList,
        isProjectInList: true,
      } as BookmarkList);
      handleClose();
    } catch (error) {
      console.error('Failed to add project to new list:', error);

      addToast({
        title: 'List created but failed to add project',
        color: 'warning',
      });
      handleClose();
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    try {
      const newList = await createListMutation.mutateAsync({
        name: formData.name.trim(),
        privacy: formData.privacy,
      });
      await handleCreateSuccess(newList);
    } catch (error) {
      console.error('Failed to create list:', error);
      addToast({ title: 'Failed to create list', color: 'danger' });
    }
  };

  const handleClose = () => {
    setFormData({ name: '', privacy: 'private' });
    onClose();
  };

  const isFormValid =
    formData.name.trim().length > 0 && formData.name.length <= 150;

  const isCreating =
    createListMutation.isPending || addProjectToListMutation.isPending;

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
          <ECFTypography
            type="subtitle2"
            className="text-[16px] font-semibold leading-[21.82px] text-black opacity-80"
          >
            Create New List
          </ECFTypography>
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
                <ECFTypography
                  type="body1"
                  className="text-[16px] font-semibold leading-[25.6px]"
                >
                  List Name
                </ECFTypography>
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
                  <ECFTypography
                    type="caption"
                    className="text-[11px] leading-[15px] text-black opacity-80"
                  >
                    {formData.name.length} / 150
                  </ECFTypography>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-[10px]">
              <div className="flex flex-col gap-[5px]">
                <div className="flex items-center gap-[5px]">
                  <ECFTypography
                    type="body1"
                    className="text-[16px] font-semibold leading-[25.6px]"
                  >
                    List Privacy
                  </ECFTypography>
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
                  <SelectItem
                    key="public"
                    textValue="Public"
                    className="rounded-[5px] px-[10px] py-[4px]"
                  >
                    <div className="flex items-center justify-between gap-[10px]">
                      <div className="flex flex-col gap-[5px]">
                        <ECFTypography
                          type="body1"
                          className="text-[16px] font-semibold leading-[25.6px]"
                        >
                          Public
                        </ECFTypography>
                        <ECFTypography
                          type="caption"
                          className="text-[13px] leading-[17.7px] tracking-[0.282px] opacity-80"
                        >
                          Anyone can view
                        </ECFTypography>
                      </div>
                      <Globe
                        className="size-5 text-black opacity-50"
                        weight="bold"
                      />
                    </div>
                  </SelectItem>
                  <SelectItem
                    key="private"
                    textValue="Private"
                    className="rounded-[5px] px-[10px] py-[4px]"
                  >
                    <div className="flex items-center justify-between gap-[10px]">
                      <div className="flex flex-col gap-[5px]">
                        <ECFTypography
                          type="body1"
                          className="text-[16px] font-semibold leading-[25.6px]"
                        >
                          Private
                        </ECFTypography>
                        <ECFTypography
                          type="caption"
                          className="text-[13px] leading-[17.7px] tracking-[0.282px] opacity-80"
                        >
                          Only you can view
                        </ECFTypography>
                      </div>
                      <Lock
                        className="size-5 text-black opacity-50"
                        weight="bold"
                      />
                    </div>
                  </SelectItem>
                  <SelectItem
                    key="share-only"
                    textValue="Share-only"
                    isReadOnly
                    className="rounded-[5px] px-[10px] py-[4px] opacity-20"
                  >
                    <div className="flex items-center justify-between gap-[10px]">
                      <div className="flex flex-col gap-[5px]">
                        <ECFTypography
                          type="body1"
                          className="text-[16px] font-semibold leading-[25.6px]"
                        >
                          Share-only
                        </ECFTypography>
                        <ECFTypography
                          type="caption"
                          className="text-[13px] leading-[17.7px] tracking-[0.282px] opacity-80"
                        >
                          Anyone with link can view
                        </ECFTypography>
                      </div>
                      <Link
                        className="size-5 text-black opacity-50"
                        weight="bold"
                      />
                    </div>
                  </SelectItem>
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
                  ? 'bg-[#64C0A5] hover:bg-[#64C0A5]' // Green color when enabled, maintain on hover
                  : 'bg-[#3C3C3C] opacity-20 hover:bg-[#3C3C3C]' // Dark with opacity when disabled, maintain on hover
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
