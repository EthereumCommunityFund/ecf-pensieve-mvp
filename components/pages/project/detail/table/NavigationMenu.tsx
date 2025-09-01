'use client';

import { cn } from '@heroui/react';
import { FC } from 'react';

import { BREAKPOINTS, STICKY_OFFSETS } from '@/constants/layoutConstants';
import { ProjectTableFieldCategory } from '@/constants/tableConfig';
import { useSticky } from '@/hooks/useSticky';
import { IItemSubCategoryEnum } from '@/types/item';

interface NavigationMenuProps {
  activeCategory?: IItemSubCategoryEnum;
  onCategoryClick: (category: IItemSubCategoryEnum) => void;
  className?: string;
}

const NavigationMenu: FC<NavigationMenuProps> = ({
  activeCategory,
  onCategoryClick,
  className,
}) => {
  // Use sticky hook for positioning
  const { refs, state, placeholderStyle, stickyStyle } = useSticky({
    desktopBreakpoint: BREAKPOINTS.desktop,
    topOffset: STICKY_OFFSETS.withPadding,
  });

  return (
    <>
      {/* Placeholder to maintain layout when menu becomes fixed */}
      <div
        ref={refs.placeholderRef}
        className={cn('w-full', state.isFixed ? 'h-auto' : 'h-0')}
        style={placeholderStyle}
      />

      <div
        ref={refs.menuRef}
        className={cn(
          'flex flex-col gap-[10px] w-[160px]',
          state.isFixed ? 'fixed z-20' : 'relative',
          className,
        )}
        style={stickyStyle}
      >
        {ProjectTableFieldCategory.map((categoryConfig) => (
          <div key={categoryConfig.key} className="flex flex-col">
            {/* Main category - use the first sub-category as the primary entry */}
            {categoryConfig.subCategories.length > 0 && (
              <div
                onClick={() =>
                  onCategoryClick(categoryConfig.subCategories[0].key)
                }
                className={cn(
                  'cursor-pointer rounded-[6px] px-[10px] py-[10px] transition-all duration-200',
                  'hover:opacity-80',
                  activeCategory === categoryConfig.subCategories[0].key
                    ? 'opacity-100 bg-black/10'
                    : 'opacity-60',
                )}
              >
                <div className="font-sans text-[14px] font-bold leading-[1.36181640625em] text-black">
                  {categoryConfig.label || categoryConfig.title}
                </div>
              </div>
            )}

            {/* Sub-categories - render all sub-categories */}
            {categoryConfig.subCategories.length && (
              <div className="mt-[10px] flex flex-col gap-[10px]">
                {categoryConfig.subCategories.map((subCategoryConfig) => {
                  const isActive = activeCategory === subCategoryConfig.key;

                  return (
                    <div
                      key={subCategoryConfig.key}
                      onClick={() => onCategoryClick(subCategoryConfig.key)}
                      className={cn(
                        'cursor-pointer rounded-[6px] px-[10px] py-[10px] transition-all duration-200',
                        'hover:opacity-80',
                        isActive ? 'opacity-100' : 'opacity-50',
                      )}
                    >
                      <div className="font-sans text-[12px] leading-[1.3] text-black">
                        {subCategoryConfig.label || subCategoryConfig.title}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default NavigationMenu;
