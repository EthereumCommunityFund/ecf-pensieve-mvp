'use client';

import { cn } from '@heroui/react';
import { ArrowSquareUp, GitCommit, UserSquare } from '@phosphor-icons/react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import ECFTypography from '@/components/base/typography';
import FunnelSimpleIcon from '@/components/icons/FunnelSimple';
import ListsIcon from '@/components/icons/Lists';
import { BREAKPOINTS, STICKY_OFFSETS } from '@/constants/layoutConstants';
import { ITabKey, useProfileTab } from '@/hooks/useProfileTab';
import { useSticky } from '@/hooks/useSticky';

const tabItemsWithIcons = [
  {
    key: 'profile',
    label: 'Profile Settings',
    icon: <UserSquare size={28} weight="fill" />,
  },
  {
    key: 'contributions',
    label: 'My Contributions',
    icon: <GitCommit size={28} weight="fill" />,
  },
  {
    key: 'upvotes',
    label: 'My Upvotes',
    icon: <ArrowSquareUp size={28} />,
  },
  {
    key: 'lists',
    label: 'My Lists',
    icon: <ListsIcon size={28} />,
  },
  {
    key: 'sieve',
    label: 'My Sieve',
    icon: <FunnelSimpleIcon width={28} height={28} />,
  },
];

const ProfileSideBar = () => {
  const { address } = useParams();
  const router = useRouter();
  const { currentTabKey } = useProfileTab();
  const [activeTab, setActiveTab] = useState<ITabKey>(
    currentTabKey || 'profile',
  );

  // Use sticky hook for positioning
  const { refs, state, placeholderStyle, stickyStyle } = useSticky({
    desktopBreakpoint: BREAKPOINTS.desktop,
    topOffset: STICKY_OFFSETS.withPadding,
  });

  useEffect(() => {
    if (currentTabKey) {
      setActiveTab(currentTabKey);
    }
  }, [currentTabKey]);

  return (
    <>
      {/* Placeholder to maintain layout when menu becomes fixed */}
      <div
        ref={refs.placeholderRef}
        className={cn('mobile:hidden', state.isFixed ? 'h-auto' : 'h-0')}
        style={placeholderStyle}
      />

      {/* Left Sidebar Navigation */}
      <div
        ref={refs.menuRef}
        className={cn(
          'mobile:hidden flex w-[220px] flex-col gap-5',
          state.isFixed ? 'fixed z-20' : 'relative',
        )}
        style={stickyStyle}
      >
        {/* Navigation Menu */}
        <div className="flex flex-col gap-2">
          {tabItemsWithIcons.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => {
                const newTab = key as ITabKey;
                setActiveTab(newTab);
                router.push(`/profile/${address}?tab=${newTab}`, {
                  scroll: false,
                });
              }}
              className={cn(
                'flex items-center gap-3 rounded-[10px] p-[6px_10px] transition-all duration-200',
                activeTab === key
                  ? 'bg-[#EBEBEB] opacity-100'
                  : 'bg-transparent opacity-60 hover:bg-[rgba(0,0,0,0.05)] hover:opacity-80',
              )}
            >
              <div className="text-black">{icon}</div>
              <ECFTypography
                type="body1"
                className={cn(
                  'font-semibold',
                  activeTab === key ? 'opacity-100' : 'opacity-100',
                )}
              >
                {label}
              </ECFTypography>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Top Header - Only visible on mobile */}
      <div className="mobile:flex hidden w-full flex-col gap-5">
        {/* Mobile Navigation - Horizontal Scroll */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabItemsWithIcons.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => {
                const newTab = key as ITabKey;
                setActiveTab(newTab);
                router.push(`/profile/${address}?tab=${newTab}`, {
                  scroll: false,
                });
              }}
              className={cn(
                'flex min-w-max items-center gap-2 rounded-[10px] p-[6px_12px] transition-all duration-200',
                activeTab === key
                  ? 'bg-[#EBEBEB] opacity-100'
                  : 'bg-transparent opacity-60 hover:bg-[rgba(0,0,0,0.05)] hover:opacity-80',
              )}
            >
              <div className="text-black">{icon}</div>
              <ECFTypography
                type="caption"
                className="whitespace-nowrap font-semibold"
              >
                {label}
              </ECFTypography>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default ProfileSideBar;
