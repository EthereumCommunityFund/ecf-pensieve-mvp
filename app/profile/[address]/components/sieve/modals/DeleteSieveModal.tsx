'use client';

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react';

import { Button, addToast } from '@/components/base';
import { WarningCircleIcon } from '@/components/icons';
import { trpc } from '@/lib/trpc/client';
import { RouterOutputs } from '@/types';

type SieveRecord = RouterOutputs['sieve']['getUserSieves'][0];

interface DeleteSieveModalProps {
  isOpen: boolean;
  sieve: SieveRecord | null;
  onClose: () => void;
  onDeleted: () => void;
}

const DeleteSieveModal = ({
  isOpen,
  sieve,
  onClose,
  onDeleted,
}: DeleteSieveModalProps) => {
  const deleteMutation = trpc.sieve.deleteSieve.useMutation({
    onSuccess: () => {
      addToast({
        title: 'Sieve deleted',
        color: 'success',
      });
      onDeleted();
      onClose();
    },
    onError: (error) => {
      addToast({
        title: error.message || 'Failed to delete sieve',
        color: 'danger',
      });
    },
  });

  if (!sieve) {
    return null;
  }

  const handleDelete = () => {
    deleteMutation.mutate({ id: sieve.id });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      classNames={{
        base: 'max-w-[420px]',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-[10px] border-b border-black/10 px-5 py-[12px]">
          <WarningCircleIcon size={24} className="text-[#D14343]" />
          <span className="text-[16px] font-semibold text-black">
            Delete Sieve
          </span>
        </ModalHeader>
        <ModalBody className="flex flex-col gap-[12px] p-5">
          <p className="text-[14px] leading-[20px] text-black/70">
            Are you sure you want to delete <strong>{sieve.name}</strong>? This
            action cannot be undone and the associated short link will stop
            working.
          </p>
        </ModalBody>
        <ModalFooter className="flex items-center justify-end gap-[10px] border-t border-black/10 px-5 py-[12px]">
          <Button onPress={onClose} isDisabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button
            color="primary"
            className="bg-[#D14343] text-white hover:bg-[#b33a3a]"
            onPress={handleDelete}
            isLoading={deleteMutation.isPending}
          >
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteSieveModal;
