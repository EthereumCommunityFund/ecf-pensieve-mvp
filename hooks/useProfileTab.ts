'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

const tabItems = [
  {
    key: 'profile',
    label: 'Profile Settings',
  },
  {
    key: 'contributions',
    label: 'My Contributions',
  },
  {
    key: 'upvotes',
    label: 'My Upvotes',
  },
  {
    key: 'lists',
    label: 'My Lists',
  },
] as const;

export type ITabKey = 'profile' | 'contributions' | 'upvotes' | 'lists';

export const useProfileTab = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab');

  const currentTab = useMemo(() => {
    if (pathname.includes(`/list/`)) {
      return tabItems.find((item) => item.key === 'lists');
    }
    if (initialTab === 'contributions')
      return tabItems.find((item) => item.key === 'contributions');
    if (initialTab === 'upvotes')
      return tabItems.find((item) => item.key === 'upvotes');
    if (initialTab === 'lists')
      return tabItems.find((item) => item.key === 'lists');
    return tabItems.find((item) => item.key === 'profile');
  }, [pathname, initialTab]);

  return {
    currentTab,
    currentTabKey: currentTab?.key as ITabKey | undefined,
    currentTabLabel: currentTab?.label || '',
    tabItems,
  };
};
