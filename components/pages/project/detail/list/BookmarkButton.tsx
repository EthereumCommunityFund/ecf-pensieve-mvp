'use client';

import { useDisclosure } from '@heroui/react';
import { FC } from 'react';

import { BookmarkSimple } from '@/components/icons';

import ProjectActionButton from '../ProjectActionButton';

import SaveToListModal from './SaveToListModal';
import { useBookmark } from './useBookmark';

interface BookmarkButtonProps {
  projectId: number;
  className?: string;
}

const BookmarkButton: FC<BookmarkButtonProps> = ({ projectId, className }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isProjectBookmarked } = useBookmark();

  // Check if the project is bookmarked
  const { data: bookmarkStatus, isLoading } = isProjectBookmarked(projectId);

  const isBookmarked = bookmarkStatus?.isBookmarked ?? false;

  return (
    <>
      <ProjectActionButton onPress={onOpen} disabled={isLoading}>
        <BookmarkSimple
          className="size-[20px] text-black"
          weight={isBookmarked ? 'fill' : 'regular'}
        />
      </ProjectActionButton>
      <SaveToListModal
        isOpen={isOpen}
        onClose={onClose}
        projectId={projectId}
      />
    </>
  );
};

export default BookmarkButton;
