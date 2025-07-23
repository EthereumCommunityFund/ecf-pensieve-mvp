'use client';

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react';
import { useState } from 'react';

import ECFTypography from '@/components/base/typography';
import { TrashIcon, XIcon } from '@/components/icons';
import { trpc } from '@/lib/trpc/client';
import { RouterOutputs } from '@/types';

interface DeleteListModalProps {
  isOpen: boolean;
  onClose: () => void;
  list: RouterOutputs['list']['getUserLists'][0];
}

const DeleteListModal = ({ isOpen, onClose, list }: DeleteListModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const utils = trpc.useUtils();

  const deleteListMutation = trpc.list.deleteList.useMutation({
    onSuccess: (data) => {
      console.log('devLog - deleteList success:', data);
      utils.list.getUserLists.invalidate();
      handleClose();
    },
    onError: (error) => {
      console.log('devLog - deleteList error:', error);
      console.error('Failed to delete list:', error);
      setIsDeleting(false);
    },
  });

  const handleClose = () => {
    setIsDeleting(false);
    onClose();
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteListMutation.mutateAsync({
        id: list.id,
      });
    } catch (error) {
      // Error handling is done in onError callback
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      placement="center"
      backdrop="blur"
      classNames={{
        base: 'max-w-[400px]',
        closeButton: 'hidden',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center justify-between p-6 pb-4">
          <ECFTypography
            type="subtitle2"
            className="text-[20px] font-semibold leading-[32px]"
          >
            Delete List?
          </ECFTypography>
          <button
            onClick={handleClose}
            className="flex size-8 items-center justify-center rounded-[5px] opacity-60 transition-opacity hover:opacity-100"
          >
            <XIcon size={20} />
          </button>
        </ModalHeader>

        <ModalBody className="px-6 py-0">
          <div className="flex flex-col gap-4">
            {/* Warning Message */}
            <ECFTypography
              type="body1"
              className="text-[16px] leading-[25.6px] opacity-80"
            >
              Deleting this list cannot be undone
            </ECFTypography>

            {/* List Info */}
            <div className="rounded-[8px] bg-[rgba(0,0,0,0.05)] p-4">
              <ECFTypography
                type="body1"
                className="text-[16px] font-semibold leading-[25.6px]"
              >
                "{list.name}"
              </ECFTypography>
              {list.description && (
                <ECFTypography
                  type="body2"
                  className="mt-1 text-[14px] leading-[22.4px] opacity-60"
                >
                  {list.description}
                </ECFTypography>
              )}
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="flex justify-end gap-3 p-6 pt-4">
          <Button
            variant="light"
            onPress={handleClose}
            isDisabled={isDeleting}
            className="h-[48px] rounded-[8px] bg-[rgba(0,0,0,0.05)] px-6 text-[16px] font-semibold leading-[25.6px] text-black hover:bg-[rgba(0,0,0,0.1)]"
          >
            Cancel
          </Button>
          <Button
            color="danger"
            onPress={handleDelete}
            isLoading={isDeleting}
            isDisabled={isDeleting}
            startContent={!isDeleting ? <TrashIcon size={18} /> : undefined}
            className="h-[48px] rounded-[8px] bg-red-600 px-6 text-[16px] font-semibold leading-[25.6px] text-white hover:bg-red-700"
          >
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteListModal;
