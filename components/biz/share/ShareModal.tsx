'use client';

import { addToast, Image, Skeleton } from '@heroui/react';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import { Button } from '@/components/base';
import {
  CommonModalHeader,
  Modal,
  ModalBody,
  ModalContent,
} from '@/components/base/modal';
import { CopyIcon } from '@/components/icons';
import { SHARE_CARD_HEIGHT, SHARE_CARD_WIDTH } from '@/constants/share';
import type { SharePayload } from '@/lib/services/share';
import { renderShareCard } from '@/lib/services/share/shareCardElements';
import { getAppOrigin } from '@/lib/utils/url';

const SHARE_PREVIEW_PADDING_TOP = `${(SHARE_CARD_HEIGHT / SHARE_CARD_WIDTH) * 100}%`;

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  linkTitle?: string;
  linkIntro?: string;
  linkDetails?: string;
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
  title = 'Share Project',
  linkTitle = 'Share Link',
  linkIntro = 'Copy link below to share with friends',
  linkDetails = `This link can be shared across multiple social media platforms and generates a social graph preview. (X/Twitter may need a few minutes to fetch the preview image)`,
  shareUrl,
  shareImageUrl,
  isLoading = false,
  error,
  onRefresh,
  payload,
}) => {
  const normalizedShareUrl = useMemo(() => shareUrl.trim(), [shareUrl]);
  const canCopy = !isLoading && Boolean(normalizedShareUrl);
  const showShareUrlSkeleton = isLoading || !normalizedShareUrl;
  const [loadedShareImageUrl, setLoadedShareImageUrl] = useState<string | null>(
    null,
  );
  const [failedShareImageUrl, setFailedShareImageUrl] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!isOpen) return;
    setFailedShareImageUrl(null);
  }, [isOpen]);

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
    return renderShareCard(payload, { origin, mode: 'preview' });
  }, [payload]);

  const shouldShowShareImage = Boolean(shareImageUrl);
  const showShareImageSkeleton =
    shouldShowShareImage &&
    shareImageUrl !== loadedShareImageUrl &&
    shareImageUrl !== failedShareImageUrl;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      classNames={{
        base: 'bg-white p-0 min-w-[600px] mobile:min-w-[400px]',
        header: 'py-[10px] px-[20px]',
        body: 'border-t border-black/10 p-[20px] flex flex-col gap-[14px]',
      }}
    >
      <ModalContent>
        <CommonModalHeader title={title} onClose={onClose} />
        <ModalBody>
          <div className="text-[18px] font-[600] leading-[18px] text-black">
            {linkTitle}
          </div>
          <div className="space-y-2">
            <div className="text-[14px] leading-[18px] text-black/60">
              {linkIntro}
            </div>
            <div className="text-[13px] leading-[18px] text-black/50">
              {linkDetails}
            </div>
          </div>
          <div className="flex items-center overflow-hidden rounded-[8px] border border-black/10 bg-[#F9F9F9]">
            <div className="flex h-[40px] flex-1 items-center truncate px-[10px] text-black">
              {showShareUrlSkeleton ? (
                <Skeleton className="h-[32px] w-full rounded-md" />
              ) : (
                <span className="truncate">{normalizedShareUrl}</span>
              )}
            </div>
            {canCopy ? (
              <CopyToClipboard text={normalizedShareUrl} onCopy={onCopySuccess}>
                <Button
                  isIconOnly
                  className="border-none bg-transparent p-0 hover:bg-gray-200"
                >
                  <CopyIcon width={20} height={20} />
                </Button>
              </CopyToClipboard>
            ) : (
              <Button
                isIconOnly
                isDisabled
                className="border-none bg-transparent p-0 hover:bg-gray-200"
              >
                <CopyIcon width={20} height={20} />
              </Button>
            )}
          </div>
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
                <div className="relative w-full overflow-hidden rounded-[12px] border border-black/10 bg-[#F9F9F9]">
                  <div style={{ paddingTop: SHARE_PREVIEW_PADDING_TOP }} />
                  {showShareImageSkeleton && (
                    <Skeleton className="absolute inset-0 size-full rounded-none" />
                  )}
                  {shareImageUrl && shareImageUrl !== failedShareImageUrl && (
                    <Image
                      key={shareImageUrl}
                      removeWrapper
                      disableSkeleton
                      src={shareImageUrl}
                      alt="Share preview"
                      className="absolute inset-0 size-full object-contain"
                      onLoad={() => setLoadedShareImageUrl(shareImageUrl)}
                      onError={() => setFailedShareImageUrl(shareImageUrl)}
                    />
                  )}
                </div>
              )}
              {onRefresh && !error && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="text-[13px] font-semibold text-black/30 hover:underline"
                  >
                    Refresh preview
                  </button>
                </div>
              )}
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ShareModal;
