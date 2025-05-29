'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { IItemSubCategoryEnum } from '@/types/item';

/**
 * Hook for managing table navigation and scrolling
 * Handles category navigation, scroll tracking, and active category detection
 */
export const useTableNavigation = () => {
  // 当前激活的分类
  const [activeCategory, setActiveCategory] = useState<IItemSubCategoryEnum>(
    IItemSubCategoryEnum.BasicProfile,
  );

  // 分类引用，用于滚动定位
  const categoryRefs = useRef<
    Record<IItemSubCategoryEnum, HTMLDivElement | null>
  >({
    [IItemSubCategoryEnum.BasicProfile]: null,
    [IItemSubCategoryEnum.Development]: null,
    [IItemSubCategoryEnum.Organization]: null,
    [IItemSubCategoryEnum.Team]: null,
    [IItemSubCategoryEnum.Finances]: null,
    [IItemSubCategoryEnum.Token]: null,
    [IItemSubCategoryEnum.Governance]: null, // 保留以防将来启用
  });

  // 处理导航菜单点击，滚动到对应分类
  const handleCategoryClick = useCallback((category: IItemSubCategoryEnum) => {
    const targetElement = categoryRefs.current[category];
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      setActiveCategory(category);
    }
  }, []);

  // 监听滚动，更新当前激活的分类
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100; // 添加偏移量

      // 找到当前可见的分类
      let currentCategory = IItemSubCategoryEnum.BasicProfile;

      Object.entries(categoryRefs.current).forEach(([key, element]) => {
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;

          if (scrollPosition >= elementTop) {
            currentCategory = key as IItemSubCategoryEnum;
          }
        }
      });

      setActiveCategory(currentCategory);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return {
    activeCategory,
    categoryRefs,
    handleCategoryClick,
  };
};
