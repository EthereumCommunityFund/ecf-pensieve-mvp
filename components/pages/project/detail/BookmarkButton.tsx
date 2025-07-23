'use client';

import { cn, useDisclosure } from '@heroui/react';
import { Bookmark } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';

import { Button } from '@/components/base';
import { trpc } from '@/lib/trpc/client';

import SaveToListModal from './SaveToListModal';

interface BookmarkButtonProps {
  projectId: number;
  className?: string;
}

const BookmarkButton: FC<BookmarkButtonProps> = ({
  projectId,
  className = '',
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Get all user lists
  const { data: userLists } = trpc.list.getUserLists.useQuery();

  // Check if the project is in any list
  const listProjectQueries = trpc.useQueries((t) =>
    (userLists || []).map((list) =>
      t.list.getListProjects({
        listId: list.id,
        limit: 100, // Large enough number to check if project exists
      }),
    ),
  );

  const isBookmarked = useMemo(() => {
    // Return false if still loading or no data
    if (!userLists || listProjectQueries.some((query) => query.isLoading)) {
      return false;
    }

    // Check if project is in any list
    return listProjectQueries.some((query) => {
      if (!query.data) return false;
      return query.data.items.some((item) => item.projectId === projectId);
    });
  }, [userLists, listProjectQueries, projectId]);

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
        <Bookmark
          className="mobile:size-[20px] size-[24px]"
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
