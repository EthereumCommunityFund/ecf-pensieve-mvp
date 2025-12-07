import { Button } from './button';
import {
  CommonModalHeader,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
} from './modal';

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  open,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={open}
      onClose={onCancel}
      isDismissable={!isLoading}
      hideCloseButton
    >
      <ModalContent>
        <CommonModalHeader
          title={title}
          onClose={onCancel}
          isDisabled={isLoading}
        />
        <ModalBody className="mt-[10px] p-0">
          {description ? (
            <p className="text-[14px] leading-[20px] text-black/70">
              {description}
            </p>
          ) : null}
        </ModalBody>
        <ModalFooter className="gap-3">
          <Button
            className="flex-1 rounded-[8px] border border-black/10 bg-white text-[14px] font-semibold text-black/80"
            onPress={onCancel}
            isDisabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            className="flex-1 rounded-[8px] bg-black text-[14px] font-semibold text-white"
            onPress={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
