'use client';

import { cn } from '@heroui/react';
import { FC } from 'react';

import { ProjectTableFieldCategory } from '@/constants/tableConfig';
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
  return (
    <div className={cn('flex flex-col gap-[10px]', className)}>
      {ProjectTableFieldCategory.map((categoryConfig) => (
        <div key={categoryConfig.key} className="flex flex-col">
          {/* 主分类 - 显示第一个子分类作为主分类入口 */}
          {categoryConfig.subCategories.length > 0 && (
            <div
              onClick={() =>
                onCategoryClick(categoryConfig.subCategories[0].key)
              }
              className={cn(
                'cursor-pointer rounded-[6px] px-[10px] py-[10px] transition-all duration-200',
                'hover:opacity-80',
                activeCategory === categoryConfig.subCategories[0].key
                  ? 'opacity-100'
                  : 'opacity-60',
              )}
            >
              <div className="font-sans text-[14px] font-bold leading-[1.36181640625em] text-black">
                {categoryConfig.title}
              </div>
            </div>
          )}

          {/* 子分类 - 显示除第一个之外的其他子分类 */}
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
                    <div className="font-sans text-[12px] leading-[1.36181640625em] text-black">
                      {subCategoryConfig.title}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default NavigationMenu;
