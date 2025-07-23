'use client';

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react';
import { useEffect, useState } from 'react';

import ECFTypography from '@/components/base/typography';
import { CheckCircleIcon, CopyIcon, XIcon } from '@/components/icons';
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
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/list/${list.slug}`;
      setShareUrl(url);
    }
  }, [isOpen, list]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
      backdrop="blur"
      classNames={{
        base: 'max-w-[500px]',
        closeButton: 'hidden',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center justify-between p-6 pb-4">
          <ECFTypography
            type="subtitle2"
            className="text-[20px] font-semibold leading-[32px]"
          >
            Share List
          </ECFTypography>
          <button
            onClick={handleClose}
            className="flex size-8 items-center justify-center rounded-[5px] opacity-60 transition-opacity hover:opacity-100"
          >
            <XIcon size={20} />
          </button>
        </ModalHeader>

        <ModalBody className="px-6 py-0">
          <div className="flex flex-col gap-4">
            {/* List Info */}
            <div className="rounded-[8px] bg-[rgba(0,0,0,0.05)] p-4">
              <ECFTypography
                type="body1"
                className="text-[16px] font-semibold leading-[25.6px]"
              >
                {list.name}
              </ECFTypography>
              {list.description && (
                <ECFTypography
                  type="body2"
                  className="mt-1 text-[14px] leading-[22.4px] opacity-60"
                >
                  {list.description}
                </ECFTypography>
              )}
              <div className="mt-2 flex items-center gap-2">
                <ECFTypography
                  type="caption"
                  className="text-[12px] leading-[19.2px] opacity-50"
                >
                  Privacy:
                </ECFTypography>
                <ECFTypography
                  type="caption"
                  className="text-[12px] font-semibold leading-[19.2px]"
                >
                  {list.privacy === 'public' ? 'Public' : 'Private'}
                </ECFTypography>
              </div>
            </div>

            {/* Privacy Warning for Private Lists */}
            {list.privacy === 'private' && (
              <div className="rounded-[8px] border border-orange-200 bg-orange-50 p-4">
                <ECFTypography
                  type="body2"
                  className="text-[14px] leading-[22.4px] text-orange-800"
                >
                  This is a private list. Only you can access it with this link.
                </ECFTypography>
              </div>
            )}

            {/* Share URL */}
            <div className="flex flex-col gap-2">
              <ECFTypography
                type="body1"
                className="text-[16px] font-semibold leading-[25.6px]"
              >
                Share Link
              </ECFTypography>
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  classNames={{
                    inputWrapper:
                      'border border-[rgba(0,0,0,0.1)] bg-[rgba(0,0,0,0.02)] h-[48px]',
                    input: 'text-[14px] leading-[22.4px]',
                  }}
                />
                <Button
                  onPress={handleCopyUrl}
                  isIconOnly
                  variant="light"
                  className="size-[48px] shrink-0 border border-[rgba(0,0,0,0.1)] bg-white hover:bg-[rgba(0,0,0,0.05)]"
                >
                  {copied ? (
                    <CheckCircleIcon size={18} className="text-green-600" />
                  ) : (
                    <CopyIcon width={18} height={18} />
                  )}
                </Button>
              </div>
              {copied && (
                <ECFTypography
                  type="caption"
                  className="text-[12px] leading-[19.2px] text-green-600"
                >
                  Link copied to clipboard!
                </ECFTypography>
              )}
            </div>

            {/* Share Instructions */}
            <div className="rounded-[8px] bg-[rgba(0,0,0,0.02)] p-4">
              <ECFTypography
                type="body2"
                className="text-[14px] leading-[22.4px] opacity-80"
              >
                Share this link with others to let them view your list.
                {list.privacy === 'public'
                  ? ' Anyone with the link can access it.'
                  : ' Only you can access it, even with the link.'}
              </ECFTypography>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="flex justify-end gap-3 p-6 pt-4">
          <Button
            onPress={handleClose}
            className="h-[48px] rounded-[8px] bg-black px-6 text-[16px] font-semibold leading-[25.6px] text-white hover:bg-[rgba(0,0,0,0.8)]"
          >
            Done
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ShareListModal;
