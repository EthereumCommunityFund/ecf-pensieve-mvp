'use client';

import { FC, ReactNode } from 'react';

import { Button } from '@/components/base/button';
import { Modal, ModalContent } from '@/components/base/modal';
import { FileIcon, XCircleIcon } from '@/components/icons';

interface MerrticDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  metricName?: string;
  children?: ReactNode;
}

const MerrticDetailModal: FC<MerrticDetailModalProps> = ({
  isOpen,
  onClose,
  title,
  metricName,
  children,
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
            {title || `About ${metricName || 'Metric'}`}
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
            <div className="whitespace-pre-line text-[14px] font-normal leading-[1.5999999727521623] text-black">
              {children}
            </div>
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
