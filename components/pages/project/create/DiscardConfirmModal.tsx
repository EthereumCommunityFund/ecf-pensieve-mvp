'use client';

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react';
import React from 'react';

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
        <ModalHeader>放弃更改？</ModalHeader>
        <ModalBody>
          <p>您确定要放弃所有更改并退出吗？此操作无法撤销。</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            取消
          </Button>
          <Button color="danger" onPress={onConfirm}>
            确认放弃
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DiscardConfirmModal;
