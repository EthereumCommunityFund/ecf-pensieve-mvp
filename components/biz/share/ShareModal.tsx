'use client';

import { addToast, Image } from '@heroui/react';
import { FC, useCallback, useMemo } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import { Button } from '@/components/base';
import {
  CommonModalHeader,
  Modal,
  ModalBody,
  ModalContent,
} from '@/components/base/modal';
import { CopyIcon } from '@/components/icons';
import type { SharePayload } from '@/lib/services/share';
import { renderShareCardForPreview } from '@/lib/services/share/shareCardElements';
import { getAppOrigin } from '@/lib/utils/url';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  shareImageUrl?: string | null;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => Promise<unknown> | void;
  payload?: SharePayload | null;
}

const ShareModal: FC<ShareModalProps> = ({
  isOpen,
  onClose,
  shareUrl,
  shareImageUrl,
  isLoading = false,
  error,
  onRefresh,
  payload,
}) => {
  const onCopySuccess = useCallback(() => {
    addToast({
      title: 'Success',
      description: 'Share link copied to clipboard!',
      color: 'success',
    });
  }, []);

  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      void onRefresh();
    }
  }, [onRefresh]);

  const previewCard = useMemo(() => {
    if (!payload) {
      return null;
    }
    const origin =
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : getAppOrigin();
    return renderShareCardForPreview(payload, origin);
  }, [payload]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      classNames={{
        base: 'bg-white p-0 min-w-[540px] mobile:min-w-[400px]',
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
          {isLoading ? (
            <div className="flex items-center justify-between rounded-[8px] border border-black/10 bg-[#F9F9F9] px-[12px] py-[10px] text-[14px] text-black/60">
              Generating share link...
            </div>
          ) : (
            <div className="flex items-center overflow-hidden rounded-[8px] border border-black/10 bg-[#F9F9F9]">
              <div className="flex h-[40px] flex-1 items-center truncate px-[10px] text-black">
                <span className="truncate">{shareUrl}</span>
              </div>
              <CopyToClipboard text={shareUrl} onCopy={onCopySuccess}>
                <Button
                  isIconOnly
                  isDisabled={isLoading}
                  className="border-none bg-transparent p-0 hover:bg-gray-200"
                >
                  <CopyIcon width={20} height={20} />
                </Button>
              </CopyToClipboard>
            </div>
          )}
          {error && (
            <div className="flex items-start justify-between rounded-[8px] border border-red-200 bg-red-50 px-[12px] py-[10px] text-[13px] text-red-600">
              <span className="pr-4">{error}</span>
              {onRefresh && (
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="shrink-0 text-[13px] font-semibold text-emerald-600 hover:underline"
                >
                  Retry
                </button>
              )}
            </div>
          )}
          {!isLoading && (previewCard || shareImageUrl) && (
            <div className="flex flex-col gap-[10px]">
              {previewCard ? (
                <div className="flex justify-center">{previewCard}</div>
              ) : (
                <Image
                  src={shareImageUrl ?? ''}
                  alt="Share preview"
                  className="h-auto w-full rounded-[12px] border border-black/10 bg-[#F9F9F9]"
                />
              )}
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ShareModal;
