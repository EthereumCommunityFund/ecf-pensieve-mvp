import { FC } from 'react';

import {
  Button,
  CommonModalHeader,
  Modal,
  ModalBody,
  ModalContent,
} from '@/components/base';
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
        body: 'p-0 mt-[20px] flex flex-col gap-[20px] font-mona',
      }}
      isDismissable={false}
    >
      <ModalContent>
        <CommonModalHeader
          title={'Switch Vote?'}
          onClose={onClose}
          classNames={{
            title: 'text-[#E97D3A]',
          }}
        />
        <ModalBody>
          <div className="flex flex-col gap-[10px]">
            <div className="text-[14px] font-[600] leading-[20px] text-black/80">
              You already have a vote on another proposal
            </div>

            <div className="flex flex-col gap-[10px] rounded-[10px] border border-black/10 p-[10px]">
              <div className="flex flex-col gap-[5px] border-b border-black/10 pb-[10px]">
                <div className="text-[16px] font-[500] leading-[20px] text-black/80">
                  Proposal No.{sourceProposal?.id || 0}
                </div>
                <div className=" text-[14px] text-black">
                  Item: {proposalItem?.property || 'ItemName'}
                </div>
              </div>

              <div className="text-[14px] leading-[20px] text-black/80">
                You will be re-allocating your weight to another proposal's
                item.
              </div>
            </div>
          </div>
          <div className="flex justify-between gap-[10px]">
            <Button color="secondary" onPress={onClose} className="flex-1 ">
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={onConfirm}
              className="flex-1 bg-[#F47B20]"
              disabled={isLoading}
              isLoading={isLoading}
            >
              Switch
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SwitchVoteModal;
