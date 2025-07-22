'use client';

import { addToast } from '@heroui/react';
import { FC, useCallback } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import { Button } from '@/components/base';
import {
  CommonModalHeader,
  Modal,
  ModalBody,
  ModalContent,
} from '@/components/base/modal';
import { CopyIcon } from '@/components/icons';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortCode: string;
}

const ShareModal: FC<ShareModalProps> = ({ isOpen, onClose, shortCode }) => {
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/p/${shortCode}`;

  const onCopySuccess = useCallback(() => {
    addToast({
      title: 'Success',
      description: 'Share link copied to clipboard!',
      color: 'success',
    });
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      classNames={{
        base: 'bg-white p-0',
        header: 'py-[10px] px-[20px]',
        body: 'border-t border-black/10 p-[20px] flex flex-col gap-[14px]',
      }}
    >
      <ModalContent>
        <CommonModalHeader title="Share Project" onClose={onClose} />
        <ModalBody>
          <div className="text-[18px] font-[600] leading-[18px] text-black">
            Share Link
          </div>
          <div className="text-[14px] leading-[18px] text-black/60">
            Copy link below to share to friends
          </div>
          <div className="flex items-center overflow-hidden rounded-[8px] border border-black/10 bg-[#F9F9F9]">
            <div className="flex h-[40px] flex-1 items-center truncate px-[10px] text-black">
              <span className="truncate">{shareUrl}</span>
            </div>
            <CopyToClipboard text={shareUrl} onCopy={onCopySuccess}>
              <Button
                isIconOnly
                className="border-none bg-transparent p-0 hover:bg-gray-200"
              >
                <CopyIcon width={20} height={20} />
              </Button>
            </CopyToClipboard>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ShareModal;
