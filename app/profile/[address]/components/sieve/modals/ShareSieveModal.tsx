'use client';

import {
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react';

import { Button, addToast } from '@/components/base';
import { CopyIcon } from '@/components/icons';
import { RouterOutputs } from '@/types';

type SieveRecord = RouterOutputs['sieve']['getUserSieves'][0];

interface ShareSieveModalProps {
  isOpen: boolean;
  sieve: SieveRecord | null;
  onClose: () => void;
}

const ShareSieveModal = ({ isOpen, sieve, onClose }: ShareSieveModalProps) => {
  if (!sieve) {
    return null;
  }

  const shareUrl = sieve.share.url;
  // const targetUrl = sieve.share.targetUrl ?? sieve.targetPath;
  const isPublic = sieve.share.visibility === 'public';

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      addToast({
        title: 'Link copied to clipboard',
        color: 'success',
      });
    } catch (error) {
      console.error('Clipboard copy failed', error);
      addToast({
        title: 'Failed to copy link',
        color: 'danger',
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      classNames={{
        base: 'max-w-[480px]',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-[4px] border-b border-black/10 px-5 py-[12px]">
          <span className="text-[16px] font-semibold text-black">
            Share Feed
          </span>
          <span className="text-[13px] text-black/50">
            Share your saved filters with teammates or the community.
          </span>
        </ModalHeader>
        <ModalBody className="flex flex-col gap-[14px] p-5">
          <div className="flex flex-col gap-[6px]">
            <span className="text-[12px] font-semibold text-black/70">
              Short link
            </span>
            <Input
              value={shareUrl}
              readOnly
              classNames={{
                inputWrapper:
                  'border border-black/10 bg-[rgba(0,0,0,0.03)] h-[40px] rounded-[8px] px-[10px] text-[13px]',
              }}
              endContent={
                <Button
                  size="sm"
                  isIconOnly
                  onPress={() => handleCopy(shareUrl)}
                  isDisabled={!isPublic}
                  aria-label="Copy share link"
                >
                  <CopyIcon className="size-4" />
                </Button>
              }
            />
            {!isPublic && (
              <span className="text-[11px] text-[#D14343]">
                This feed is private. Switch it to Public in edit settings to
                enable sharing.
              </span>
            )}
          </div>
        </ModalBody>
        <ModalFooter className="flex items-center justify-end gap-[10px] border-t border-black/10 px-5 py-[12px]">
          <Button color="primary" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ShareSieveModal;
