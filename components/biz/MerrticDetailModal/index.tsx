'use client';

import { FC } from 'react';

import { Button } from '@/components/base/button';
import { Modal, ModalContent } from '@/components/base/modal';
import { FileIcon, XCircleIcon } from '@/components/icons';

interface MerrticDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  metricName?: string;
  description?: string;
}

const MerrticDetailModal: FC<MerrticDetailModalProps> = ({
  isOpen,
  onClose,
  title = 'About Transparency',
  metricName = 'Transparency',
  description = `transparency_refers to making all relevant data about transactions, decisions, and activities accessible to anyone. For instance, consider an NFT (Non-Fungible Token) marketplace in a Web3 project:
Transaction Data: Every sale or purchase on the platform is recorded on a blockchain ledger, which is public and transparent. Anyone can see who bought what from whom at any given time, providing clear ownership history of NFTs.
Decision-Making Process: In decentralized communities running on Web3 protocols, governance decisions are often made through proposals submitted by community members, voted upon publicly using DAO (Decentralized Autonomous Organization) mechanisms. The voting results and the rationale behind each decision can be transparent to all participants, ensuring accountability and trust in how funds or resources are allocated.
Smart Contract Audit: Before a project launches on blockchain networks like Ethereum, it often undergoes an audit by security firms to identify potential vulnerabilities or issues. These audits are typically made public after completion, providing transparency into the security aspects of the smart contracts that govern various functionalities within the project ecosystem.`,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      classNames={{
        base: 'max-w-[auto]',
        body: 'p-0',
        backdrop: 'backdrop-blur-[20px]',
      }}
    >
      <ModalContent className="m-0 h-[400px] w-[600px] rounded-[10px] border border-[rgba(0,0,0,0.1)] bg-white p-0 shadow-none">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[rgba(0,0,0,0.1)] p-[20px]">
          <span className="font-open-sans text-[16px] font-semibold leading-[1.36181640625] text-black opacity-80">
            {title}
          </span>
          <Button
            isIconOnly
            className="size-6 min-w-0 border-none bg-transparent p-0"
            onPress={onClose}
          >
            <XCircleIcon size={24} />
          </Button>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-[10px] overflow-y-auto p-[20px]">
          {/* Metric Name Tag */}
          <div className="flex justify-start">
            <div className="rounded-[20px] bg-[#F5F5F5] px-[8px] py-[4px]">
              <span className="text-[13px] font-medium leading-[1.4615384615384615] text-[#333333]">
                {metricName}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="flex-1">
            <p className="whitespace-pre-line text-[14px] font-normal leading-[1.5999999727521623] text-black">
              {description}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[rgba(0,0,0,0.1)] bg-[#FAFAFA] px-[30px] py-[10px] pr-[20px]">
          <span className="font-open-sans text-[13px] font-normal leading-[1.36181640625] text-black opacity-50">
            Want to learn more?
          </span>
          <div className="flex items-center gap-[5px] opacity-50">
            <FileIcon size={18} color="black" />
            <span className="font-open-sans text-[14px] font-semibold leading-[1.36181640625] text-black">
              Read our docs
            </span>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default MerrticDetailModal;
