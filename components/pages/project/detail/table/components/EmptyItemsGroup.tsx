'use client';

import { cn } from '@heroui/react';
import { Table } from '@tanstack/react-table';
import { FC } from 'react';

import { CaretDownIcon } from '@/components/icons';
import PencilCircleIcon from '@/components/icons/PencilCircle';
import { IItemSubCategoryEnum } from '@/types/item';

import { IKeyItemDataForTable } from '../ProjectDetailTableColumns';

interface EmptyItemsGroupProps {
  subCategoryKey: IItemSubCategoryEnum;
  emptyItemsCount: number;
  isExpanded: boolean;
  onToggle: (category: IItemSubCategoryEnum) => void;
  table: Table<IKeyItemDataForTable>;
}

/**
 * Component for rendering empty items group header
 * Displays a collapsible header for empty data items with count and toggle functionality
 * Supports column pinning to maintain consistency with table structure during horizontal scrolling
 */
export const EmptyItemsGroup: FC<EmptyItemsGroupProps> = ({
  subCategoryKey,
  emptyItemsCount,
  isExpanded,
  onToggle,
  table,
}) => {
  if (emptyItemsCount === 0) {
    return null;
  }

  const columns = table.getAllColumns();

  return (
    <tr className="cursor-pointer" onClick={() => onToggle(subCategoryKey)}>
      {columns.map((column: any, index: number) => {
        const isPinned = column.getIsPinned();
        const pinnedPosition =
          isPinned === 'left'
            ? column.getStart('left')
            : isPinned === 'right'
              ? column.getAfter('right')
              : undefined;
        const isFirstColumn = index === 0;
        const isLastColumn = index === columns.length - 1;

        return (
          <td
            key={column.id}
            className={cn(
              'border-b border-black/10 bg-[#F5F5F5] hover:bg-[#F5F5F5]',
              // No left/right borders since container provides them
              // Apply rounded corners only to last row when collapsed
              !isExpanded && isFirstColumn && 'rounded-bl-[10px]',
              !isExpanded && isLastColumn && 'rounded-br-[10px]',
              // Pinned column styles
              isPinned && 'sticky z-10 bg-[#F5F5F5]',
              // Padding for first column (content) and last column (icon)
              isFirstColumn
                ? 'p-[10px_20px] pr-[0px]'
                : isLastColumn
                  ? 'p-0'
                  : 'p-0',
            )}
            style={{
              width: `${column.getSize()}px`,
              ...(isPinned === 'left' && { left: pinnedPosition }),
              ...(isPinned === 'right' && { right: pinnedPosition }),
            }}
          >
            {/* Render content based on column position */}
            {isFirstColumn && (
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
            )}

            {/* Render CaretUp/CaretDown icon in the last column */}
            {isLastColumn && (
              <div className="flex items-center justify-end p-[10px_20px]">
                <div
                  className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                >
                  <CaretDownIcon size={18} className="text-black" />
                </div>
              </div>
            )}
          </td>
        );
      })}
    </tr>
  );
};
