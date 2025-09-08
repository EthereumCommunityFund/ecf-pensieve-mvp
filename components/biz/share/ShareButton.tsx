'use client';

import { useDisclosure } from '@heroui/react';
import { FC } from 'react';

import ShareModal from '@/components/biz/share/ShareModal';
import { ShareLinkIcon } from '@/components/icons';
import ProjectActionButton from '@/components/pages/project/detail/ProjectActionButton';

interface ShareButtonProps {
  shortCode: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ShareButton: FC<ShareButtonProps> = ({
  shortCode,
  className = '',
  size = 'md',
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <ProjectActionButton onPress={onOpen}>
        <ShareLinkIcon className="size-[20px]" />
      </ProjectActionButton>
      <ShareModal isOpen={isOpen} onClose={onClose} shortCode={shortCode} />
    </>
  );
};

export default ShareButton;
