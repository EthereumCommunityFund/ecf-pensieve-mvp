'use client';

import { cn, useDisclosure } from '@heroui/react';
import { FC } from 'react';

import { Button } from '@/components/base';
import ShareModal from '@/components/biz/share/ShareModal';
import { ShareLinkIcon } from '@/components/icons';

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
      <Button
        isIconOnly
        className={cn(
          'rounded-[4px] bg-black/5 hover:bg-black/10 size-[40px] p-[8px] mobile:size-[32px] mobile:p-[6px]',
          className,
        )}
        onPress={onOpen}
      >
        <ShareLinkIcon className="mobile:size-[20px] size-[24px]" />
      </Button>
      <ShareModal isOpen={isOpen} onClose={onClose} shortCode={shortCode} />
    </>
  );
};

export default ShareButton;
