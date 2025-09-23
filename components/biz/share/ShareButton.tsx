'use client';

import { cn, useDisclosure } from '@heroui/react';
import { FC } from 'react';

import ShareModal from '@/components/biz/share/ShareModal';
import { ShareLinkIcon } from '@/components/icons';
import ProjectActionButton from '@/components/pages/project/detail/ProjectActionButton';

interface ShareButtonProps {
  className?: string;
  shareUrl: string;
}

const ShareButton: FC<ShareButtonProps> = ({ className = '', shareUrl }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <ProjectActionButton onPress={onOpen}>
        <ShareLinkIcon className={cn('size-[20px]', className)} />
      </ProjectActionButton>
      <ShareModal isOpen={isOpen} onClose={onClose} shareUrl={shareUrl} />
    </>
  );
};

export default ShareButton;
