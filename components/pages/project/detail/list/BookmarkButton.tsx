'use client';

import { cn, useDisclosure } from '@heroui/react';
import { FC } from 'react';

import { Button } from '@/components/base';
import { BookmarkSimple } from '@/components/icons';

import SaveToListModal from './SaveToListModal';
import { useBookmark } from './useBookmark';

interface BookmarkButtonProps {
  projectId: number;
  className?: string;
}

const BookmarkButton: FC<BookmarkButtonProps> = ({
  projectId,
  className = '',
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isProjectBookmarked } = useBookmark();

  // Check if the project is bookmarked
  const { data: bookmarkStatus, isLoading } = isProjectBookmarked(projectId);

  const isBookmarked = bookmarkStatus?.isBookmarked ?? false;

  return (
    <>
      <Button
        isIconOnly
        className={cn(
          'rounded-[5px] bg-[#F5F5F5] hover:bg-[#EBEBEB] size-[40px] p-[8px] mobile:size-[32px] mobile:p-[6px]',
          className,
        )}
        onPress={onOpen}
        disabled={isLoading} // Disable button while loading
      >
        <BookmarkSimple
          className="mobile:size-[20px] size-[24px] text-black"
          weight={isBookmarked ? 'fill' : 'regular'}
        />
      </Button>
      <SaveToListModal
        isOpen={isOpen}
        onClose={onClose}
        projectId={projectId}
      />
    </>
  );
};

export default BookmarkButton;
