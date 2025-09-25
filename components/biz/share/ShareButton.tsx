'use client';

import { cn, useDisclosure } from '@heroui/react';
import { FC, useCallback } from 'react';

import ShareModal from '@/components/biz/share/ShareModal';
import { ShareLinkIcon } from '@/components/icons';
import ProjectActionButton from '@/components/pages/project/detail/ProjectActionButton';
import type { SharePayload } from '@/lib/services/share';

interface ShareButtonProps {
  className?: string;
  shareUrl: string;
  shareImageUrl?: string | null;
  isLoading?: boolean;
  error?: string | null;
  onEnsure?: () => Promise<unknown> | void;
  onRefresh?: () => Promise<unknown> | void;
  payload?: SharePayload | null;
}

const ShareButton: FC<ShareButtonProps> = ({
  className = '',
  shareUrl,
  shareImageUrl,
  isLoading,
  error,
  onEnsure,
  onRefresh,
  payload,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleOpen = useCallback(() => {
    onOpen();
    if (onEnsure) {
      void onEnsure();
    }
  }, [onEnsure, onOpen]);

  return (
    <>
      <ProjectActionButton onPress={handleOpen}>
        <ShareLinkIcon className={cn('size-[20px]', className)} />
      </ProjectActionButton>
      <ShareModal
        isOpen={isOpen}
        onClose={onClose}
        shareUrl={shareUrl}
        shareImageUrl={shareImageUrl}
        isLoading={isLoading}
        error={error}
        onRefresh={onRefresh}
        payload={payload}
      />
    </>
  );
};

export default ShareButton;
