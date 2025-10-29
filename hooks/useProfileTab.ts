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
  {
    key: 'sieve',
    label: 'My Sieve',
  },
] as const;

export type ITabKey =
  | 'profile'
  | 'contributions'
  | 'upvotes'
  | 'lists'
  | 'sieve';

export const useProfileTab = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab');

  const currentTab = useMemo(() => {
    if (pathname.includes(`/list/`)) {
      return tabItems.find((item) => item.key === 'lists');
    }
    if (!initialTab) {
      return tabItems.find((item) => item.key === 'profile');
    }

    const matched = tabItems.find((item) => item.key === initialTab);
    return matched ?? tabItems.find((item) => item.key === 'profile');
  }, [pathname, initialTab]);

  return {
    currentTab,
    currentTabKey: currentTab?.key as ITabKey | undefined,
    currentTabLabel: currentTab?.label || '',
    tabItems,
  };
};
