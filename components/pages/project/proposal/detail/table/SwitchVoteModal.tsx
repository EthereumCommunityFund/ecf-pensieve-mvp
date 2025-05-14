import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react';
import { FC } from 'react';

import { IProposal } from '@/types';

import { ITableProposalItem } from '../ProposalDetails';

interface ISwitchVoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
  proposalItem?: ITableProposalItem;
  sourceProposal?: IProposal;
}

const SwitchVoteModal: FC<ISwitchVoteModalProps> = ({
  isOpen = false,
  isLoading,
  onClose,
  onConfirm,
  proposalItem,
  sourceProposal,
}) => {
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
          <div className="text-[18px] font-[700] text-black">Switch Votes?</div>
        </ModalHeader>
        <ModalBody className="p-[20px]">
          <div className="flex flex-col gap-[20px]">
            <div className="text-[14px] text-black">
              You already have a vote on another proposal
            </div>

            <div className="rounded-[5px] border border-black/10 p-[15px]">
              <div className="text-[14px] font-[600] text-black">
                Proposal No.{sourceProposal?.id || 0}
              </div>
              <div className="text-[14px] text-black">
                Item: {proposalItem?.property || 'ItemName'}
              </div>
              <div className="mt-[10px] text-[14px] text-black">
                You will be re-allocating your weight to another proposal's
                item.
              </div>
            </div>
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
            onPress={onConfirm}
            className="flex-1 rounded-[5px] bg-[#F47B20]"
            disabled={isLoading}
            isLoading={isLoading}
          >
            Switch
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SwitchVoteModal;
