import {
  Button,
  Checkbox,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react';
import { FC, useCallback, useState } from 'react';

import { StorageKey_DoNotShowCancelModal } from '@/constants/storage';
import { safeSetLocalStorage } from '@/utils/localStorage';

import { ITableProposalItem } from '../ProposalDetails';

interface ICancelVoteModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  proposalItem?: ITableProposalItem;
}

const CancelVoteModal: FC<ICancelVoteModalProps> = ({
  isOpen = false,
  isLoading,
  onClose,
  onConfirm,
  proposalItem,
}) => {
  const [notShowAgain, setNotShowAgain] = useState(false);

  const handleConfirm = useCallback(() => {
    if (notShowAgain) {
      safeSetLocalStorage(StorageKey_DoNotShowCancelModal, 'true');
    }
    onConfirm();
  }, [notShowAgain, onConfirm]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      classNames={{
        base: 'rounded-[10px]',
        backdrop: 'bg-black/20',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 border-b border-black/10 p-[20px]">
          <div className="text-[18px] font-[700] text-black">Retract Vote?</div>
        </ModalHeader>
        <ModalBody className="p-[20px]">
          <div className="flex flex-col gap-[20px]">
            <div className="text-[14px] text-black">
              You are <span className="font-[600]">removing your vote</span> for
              an item in this proposal
            </div>

            <Checkbox
              isSelected={notShowAgain}
              onValueChange={setNotShowAgain}
              classNames={{
                base: 'data-[selected=true]:border-[#F47B20]',
                label: 'text-[14px] text-black',
              }}
            >
              Don't show this again
            </Checkbox>
          </div>
        </ModalBody>
        <ModalFooter className="flex justify-between p-[20px] pt-0">
          <Button
            color="secondary"
            onPress={onClose}
            className="flex-1 rounded-[5px]"
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleConfirm}
            className="flex-1 rounded-[5px] bg-[#F47B20]"
            disabled={isLoading}
            isLoading={isLoading}
          >
            Retract
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CancelVoteModal;
