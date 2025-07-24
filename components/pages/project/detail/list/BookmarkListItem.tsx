'use client';

import { Check, Globe, Lock, Square } from '@phosphor-icons/react';
import { FC } from 'react';

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
    <div
      className="flex cursor-pointer items-center justify-between gap-[10px] rounded-[12px] px-2 py-1 hover:bg-[#EEEEEE]"
      style={{
        border: 'none',
        boxShadow: 'none',
        outline: 'none',
        WebkitBoxShadow: 'none',
        MozBoxShadow: 'none',
      }}
      onClick={() => onToggle(list.id)}
    >
      <div className="flex items-center gap-[10px]">
        <div className="relative flex size-[28px] items-center justify-center">
          <Square
            className="size-[19.25px] text-black"
            strokeWidth={2}
            weight="regular"
          />
          {isSelected && (
            <Check
              className="absolute size-[14px] text-black"
              strokeWidth={2}
              weight="bold"
            />
          )}
        </div>
        <span className="text-[16px] font-[500] leading-[1.1875em] text-[#333333]">
          {list.name}
        </span>
      </div>
      <div className="flex size-[24px] items-center justify-center">
        {list.privacy === 'private' || list.privacy === 'default' ? (
          <Lock className="size-6 text-black" strokeWidth={1.5} />
        ) : (
          <Globe className="size-6 text-black" strokeWidth={1.5} />
        )}
      </div>
    </div>
  );
};

export default BookmarkListItem;
