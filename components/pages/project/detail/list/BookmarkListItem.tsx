'use client';

import { Globe, Lock, Square } from '@phosphor-icons/react';
import { FC } from 'react';

import CheckSquareIcon from '@/components/icons/CheckSquare';
import { BookmarkList } from '@/types/bookmark';

interface BookmarkListItemProps {
  list: BookmarkList;
  isSelected: boolean;
  onToggle: (listId: number) => void;
}

const BookmarkListItem: FC<BookmarkListItemProps> = ({
  list,
  isSelected,
  onToggle,
}) => {
  return (
    <button
      className="flex w-full cursor-pointer items-center justify-between gap-[10px] rounded-[12px] px-2 py-1 hover:bg-[#EEEEEE]"
      style={{
        border: 'none',
        boxShadow: 'none',
        outline: 'none',
        WebkitBoxShadow: 'none',
        MozBoxShadow: 'none',
      }}
      onClick={() => onToggle(list.id)}
      aria-pressed={isSelected}
      aria-label={`${isSelected ? 'Remove from' : 'Add to'} ${list.name} list`}
    >
      <div className="flex items-center gap-[10px]">
        <div className="flex size-[28px] items-center justify-center">
          {isSelected ? (
            <CheckSquareIcon className="size-[20px] text-black" />
          ) : (
            <Square
              className="size-[19.25px] text-black"
              strokeWidth={2}
              weight="regular"
            />
          )}
        </div>
        <span className="text-[16px] font-[500] leading-[1.1875em] text-[#333333]">
          {list.name}
        </span>
      </div>
      <div className="flex size-[24px] items-center justify-center">
        {list.privacy === 'private' ? (
          <Lock className="size-6 text-black" strokeWidth={1.5} />
        ) : (
          <Globe className="size-6 text-black" strokeWidth={1.5} />
        )}
      </div>
    </button>
  );
};

export default BookmarkListItem;
