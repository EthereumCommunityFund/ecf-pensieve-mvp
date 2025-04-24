'use client';
import React from 'react';

import {
  Button,
  CommonModalHeader,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
} from '@/components/base';

interface DiscardConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DiscardConfirmModal: React.FC<DiscardConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="sm">
      <ModalContent>
        <CommonModalHeader
          title="Confirm Exit?"
          onClose={onClose}
          classNames={{
            title: 'text-[#D75454]',
          }}
        />
        <ModalBody className="mt-[10px] p-0 mobile:p-0">
          <p className="text-[16px] leading-[20px] text-black opacity-80">
            You are trying to leave this page. Doing so will lose your inputs.
          </p>
        </ModalBody>

        <ModalFooter>
          <Button
            color="secondary"
            size="md"
            className="flex-1"
            onPress={onConfirm}
          >
            Yes, Leave
          </Button>
          <Button
            color="primary"
            size="md"
            className="flex-1"
            onPress={onClose}
          >
            No, Stay
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DiscardConfirmModal;
