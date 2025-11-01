'use client';

import { Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/react';
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
      classNames={{
        base: 'max-w-[400px]',
        closeButton: 'hidden',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center justify-between border-b border-[rgba(0,0,0,0.1)] px-5 py-[10px]">
          <ECFTypography
            type="subtitle2"
            className="text-[16px] font-semibold leading-[21.82px] text-black opacity-80"
          >
            Delete List?
          </ECFTypography>
          <button
            onClick={handleClose}
            className="rounded p-[5px] transition-opacity hover:bg-[rgba(0,0,0,0.05)]"
          >
            <XIcon size={20} />
          </button>
        </ModalHeader>

        <ModalBody className="p-5">
          <div className="flex flex-col gap-[14px]">
            {/* Warning Message */}
            <ECFTypography
              type="body1"
              className="text-[14px] leading-[18px] text-black"
            >
              Deleting this list cannot be undone
            </ECFTypography>

            {/* Delete Button */}
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex h-[48px] w-full items-center justify-between rounded-[5px] border border-[rgba(205,69,59,0.4)] bg-[rgba(205,69,59,0.2)] px-[10px] py-[4px] text-[16px] font-semibold leading-[21.82px] tracking-[0.282px] text-[#CD453B] hover:bg-[rgba(205,69,59,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>Yes, Delete</span>
              {!isDeleting && (
                <TrashIcon size={18} className="text-[#CD453B]" />
              )}
            </button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default DeleteListModal;
