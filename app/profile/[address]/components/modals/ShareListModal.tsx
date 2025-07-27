'use client';

import { Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/react';
import { useEffect, useState } from 'react';

import { addToast } from '@/components/base';
import ECFTypography from '@/components/base/typography';
import { CopyIcon, XIcon } from '@/components/icons';
import { RouterOutputs } from '@/types';

interface ShareListModalProps {
  isOpen: boolean;
  onClose: () => void;
  list: RouterOutputs['list']['getUserLists'][0];
}

const ShareListModal = ({ isOpen, onClose, list }: ShareListModalProps) => {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // Generate share URL when modal opens
  useEffect(() => {
    if (isOpen && list) {
      // Using the format from Figma: pensive.ecf.network/u/12380/list/32088
      // For now, using slug-based URL as numeric IDs might not be available
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/list/${list.slug}`;
      setShareUrl(url);
    }
  }, [isOpen, list]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      addToast({
        title: 'Copied Successfully',
        color: 'success',
      });
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const handleClose = () => {
    setCopied(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      placement="center"
      classNames={{
        base: 'max-w-[400px]',
        closeButton: 'hidden',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center justify-between border-b border-[rgba(0,0,0,0.1)] px-[14px] py-[10px]">
          <ECFTypography
            type="subtitle2"
            className="text-center text-[16px] font-semibold leading-[21.82px] text-black opacity-80"
          >
            Share List
          </ECFTypography>
          <button
            onClick={handleClose}
            className="rounded p-[5px] transition-opacity hover:bg-[rgba(0,0,0,0.05)]"
          >
            <XIcon size={20} />
          </button>
        </ModalHeader>

        <ModalBody className="p-[14px]">
          <div className="flex flex-col gap-[14px]">
            {/* You are sharing section */}
            <div className="flex flex-col gap-[10px]">
              <ECFTypography
                type="body1"
                className="text-[14px] font-semibold leading-[19.12px]"
              >
                You are sharing:
              </ECFTypography>
              <ECFTypography
                type="body1"
                className="text-[14px] leading-[20px] opacity-80"
              >
                {list.name}
              </ECFTypography>
            </div>

            {/* Share URL Input */}
            <div className="flex flex-col gap-[10px] bg-[#F5F5F5]">
              <div className="flex h-[40px] items-center rounded-[8px] border border-[rgba(0,0,0,0.1)] bg-[rgba(0,0,0,0.05)] px-[10px]">
                <div className="flex flex-1 items-center gap-[5px]">
                  <div className="flex h-full items-center justify-center rounded-l-[10px] bg-[#E1E1E1] px-0">
                    <ECFTypography
                      type="body1"
                      className="p-[10px] text-[14px] font-semibold leading-[19.12px] opacity-50"
                    >
                      https://
                    </ECFTypography>
                  </div>
                  <ECFTypography
                    type="body1"
                    className="text-[14px] leading-[20px]"
                  >
                    {shareUrl.replace(/^https?:\/\//, '')}
                  </ECFTypography>
                </div>
                <button
                  onClick={handleCopyUrl}
                  className="transition-opacity hover:opacity-70"
                >
                  <CopyIcon
                    width={20}
                    height={20}
                    className={copied ? 'text-green-600' : 'opacity-50'}
                  />
                </button>
              </div>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ShareListModal;
