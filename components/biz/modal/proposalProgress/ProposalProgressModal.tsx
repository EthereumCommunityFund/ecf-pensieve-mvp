import { X } from '@phosphor-icons/react';
import Link from 'next/link';
import { FC, memo } from 'react';

import { Modal, ModalContent } from '@/components/base';

interface IProposalProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 提案进度说明模态框组件
 * 显示关于提案进度验证的详细说明信息
 *
 * @param isOpen - 模态框是否打开
 * @param onClose - 关闭模态框的回调函数
 */
const ProposalProgressModal: FC<IProposalProgressModalProps> = memo(
  ({ isOpen, onClose }) => {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        classNames={{
          base: 'w-[480px] m-0 p-0 rounded-[10px] border border-black/10 bg-white',
          header: 'p-0',
        }}
        closeButton={<></>} // 使用自定义关闭按钮
      >
        <ModalContent className="flex flex-col items-center overflow-hidden rounded-[10px] bg-white">
          {/* Header */}
          <div className="flex items-center justify-between gap-[5px] self-stretch border-b border-black/10 px-[20px] py-[10px]">
            <h2 className="text-[16px] font-[600] leading-[1.36] text-black/80">
              About: Proposal Progress
            </h2>
            <div className="flex items-center gap-[10px] p-[5px]">
              <div className="size-[20px]">
                <button
                  onClick={onClose}
                  className="flex size-full items-center justify-center transition-opacity hover:opacity-70"
                  aria-label="Close modal"
                >
                  <X size={20} weight="bold" className="text-black" />
                </button>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-col gap-[20px] self-stretch p-[20px]">
            {/* Introduction */}
            <p className="self-stretch text-[14px] font-[400] leading-[1.43] text-black/80">
              This percentage displays the current progress of community
              validation for a given proposal. Here is an overview:
            </p>

            {/* Minimum Points */}
            <div className="flex flex-col gap-[10px] self-stretch">
              <p className="self-stretch text-[14px] font-[400] leading-[1.43] text-black/80">
                <span className="font-[600]">Minimum Points:</span> e.g. 800 (80
                supported)
              </p>
              <p className="self-stretch text-[14px] font-[400] leading-[1.43] text-black/80">
                Each item has a success threshold that requires the collected
                support weight to exceeds the Item Weight.
              </p>
            </div>

            {/* Minimum Participants */}
            <div className="flex flex-col gap-[10px] self-stretch">
              <p className="self-stretch text-[14px] font-[400] leading-[1.43] text-black/80">
                <span className="font-[600]">Minimum Participants:</span> e.g.
                300 (20 voted)
              </p>
              <p className="self-stretch text-[14px] font-[400] leading-[1.43] text-black/80">
                Proposals require a minimum of 3 voters per item as a threshold
                to pass verification.
              </p>
            </div>

            {/* Total Points Supported */}
            <div className="flex flex-col gap-[10px] self-stretch">
              <p className="self-stretch text-[14px] font-[400] leading-[1.43] text-black/80">
                <span className="font-[600]">Total Points Supported:</span>{' '}
                (e.g. 80)
              </p>
              <p className="self-stretch text-[14px] font-[400] leading-[1.43] text-black/80">
                This is the total sum of Contribution Points that has voted
                within a given proposal.
              </p>
              <p className="self-stretch text-[14px] font-[400] leading-[1.43] text-black/80">
                This allows users to gauge the strength of a proposal's
                supporters.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-[10px] self-stretch px-[20px] pb-[20px] pt-[10px]">
            <p className="flex-1 text-center text-[13px] font-[400] leading-[1.36] text-black/50">
              You can learn more about ECF mechanisms{' '}
              <Link
                href="/"
                className="font-[400] text-black/50 underline transition-colors hover:text-black/70"
              >
                here
              </Link>
            </p>
          </div>
        </ModalContent>
      </Modal>
    );
  },
);

ProposalProgressModal.displayName = 'ProposalProgressModal';

export default ProposalProgressModal;
