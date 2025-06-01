'use client';

import { FC } from 'react';
import { cn } from '@heroui/react';

import { CaretDownIcon, CaretUpIcon } from '@/components/icons';
import PencilCircleIcon from '@/components/icons/PencilCircle';
import { IItemSubCategoryEnum } from '@/types/item';

interface EmptyItemsGroupProps {
  subCategoryKey: IItemSubCategoryEnum;
  emptyItemsCount: number;
  isExpanded: boolean;
  onToggle: (category: IItemSubCategoryEnum) => void;
  colSpan: number;
}

/**
 * Component for rendering empty items group header
 * Displays a collapsible header for empty data items with count and toggle functionality
 */
export const EmptyItemsGroup: FC<EmptyItemsGroupProps> = ({
  subCategoryKey,
  emptyItemsCount,
  isExpanded,
  onToggle,
  colSpan,
}) => {
  if (emptyItemsCount === 0) {
    return null;
  }

  return (
    <tr className="cursor-pointer" onClick={() => onToggle(subCategoryKey)}>
      <td
        colSpan={colSpan}
        className={cn(
          'border-x border-b border-black/10 bg-[#F5F5F5] p-[10px_20px] hover:bg-[#F5F5F5]',
          isExpanded ? '' : 'rounded-b-[10px]',
        )}
      >
        <div className="flex items-center justify-between gap-[20px]">
          {/* 左侧内容 */}
          <div className="flex items-center gap-[10px]">
            {/* PencilCircle 图标 */}
            <div className="opacity-50">
              <PencilCircleIcon size={20} className="text-black" />
            </div>

            {/* 文本内容 */}
            <div className="flex items-center gap-[10px]">
              <span className="text-[14px] font-[600] text-black opacity-60">
                View Empty Items
              </span>
              <span className="text-[14px] font-[600] text-black opacity-30">
                ({emptyItemsCount})
              </span>
            </div>
          </div>

          {/* 右侧 CaretUp 图标 */}
          <div className="flex items-center">
            {isExpanded ? (
              <CaretUpIcon size={18} className="text-black" />
            ) : (
              <CaretDownIcon size={18} className="text-black" />
            )}
          </div>
        </div>
      </td>
    </tr>
  );
};
