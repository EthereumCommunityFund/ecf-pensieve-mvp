'use client';

import { Skeleton, cn } from '@heroui/react';
import { ArrowSquareUp, GitCommit, UserSquare } from '@phosphor-icons/react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import ECFTypography from '@/components/base/typography';
import BookmarksIcon from '@/components/icons/Bookmarks';

import Contributions from './components/contributions';
import { useProfileData } from './components/dataContext';
import MyLists from './components/myLists';
import Setting from './components/setting';
import Upvotes from './components/upvotes';

const tabItems = [
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
    icon: <BookmarksIcon size={28} />,
  },
];

const ProfileSettingsPage = () => {
  const { address } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useProfileData();
  const initialTab = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState<
    'profile' | 'contributions' | 'upvotes' | 'lists'
  >(
    initialTab === 'contributions'
      ? 'contributions'
      : initialTab === 'upvotes'
        ? 'upvotes'
        : initialTab === 'lists'
          ? 'lists'
          : 'profile',
  );

  useEffect(() => {
    const currentTab = searchParams.get('tab');
    if (
      currentTab &&
      (currentTab === 'profile' ||
        currentTab === 'contributions' ||
        currentTab === 'upvotes' ||
        currentTab === 'lists')
    ) {
      setActiveTab(
        currentTab as 'profile' | 'contributions' | 'upvotes' | 'lists',
      );
    } else if (!currentTab) {
      router.push(`/profile/${address}?tab=profile`, { scroll: false });
    }
  }, [searchParams, address, router]);

  return (
    <div className="mobile:px-[10px] px-[40px]">
      <div className="mx-auto flex w-full max-w-[1200px] gap-5 pb-16 pt-8">
        {/* Left Sidebar Navigation */}
        <div className="mobile:hidden flex w-[280px] flex-col gap-5">
          {/* User Info */}
          {/* <div className="flex flex-col gap-[10px]">
            <div className="flex flex-col gap-[5px] rounded-[10px] border border-[rgba(0,0,0,0.1)] p-[5px_10px]">
              <ECFTypography type="caption" className="opacity-50">
                Connected Address:
              </ECFTypography>
              <ECFTypography type="caption" className="opacity-80">
                {address}
              </ECFTypography>
            </div>

            <div className="flex flex-col gap-[5px] rounded-[10px] border border-[rgba(0,0,0,0.1)] p-[5px_10px]">
              <ECFTypography type="caption" className="opacity-50">
                Contribution Points:
              </ECFTypography>
              <Skeleton isLoaded={!!user}>
                <ECFTypography type="caption" className="opacity-80">
                  {user?.weight ?? 100}
                </ECFTypography>
              </Skeleton>
            </div>
          </div> */}

          {/* Navigation Menu */}
          <div className="flex flex-col gap-2">
            {tabItems.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => {
                  const newTab = key as
                    | 'profile'
                    | 'contributions'
                    | 'upvotes'
                    | 'lists';
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
          <div className="flex flex-col gap-[10px]">
            <div className="flex flex-col gap-[5px] rounded-[10px] border border-[rgba(0,0,0,0.1)] p-[5px_10px]">
              <ECFTypography type="caption" className="opacity-50">
                Connected Address:
              </ECFTypography>
              <ECFTypography type="caption" className="opacity-80">
                {address}
              </ECFTypography>
            </div>

            <div className="flex gap-[5px] rounded-[10px] border border-[rgba(0,0,0,0.1)] p-[5px_10px]">
              <ECFTypography type="caption" className="opacity-50">
                Contribution Points:
              </ECFTypography>
              <Skeleton isLoaded={!!user}>
                <ECFTypography type="caption" className="opacity-80">
                  {user?.weight ?? 100}
                </ECFTypography>
              </Skeleton>
            </div>
          </div>

          {/* Mobile Navigation - Horizontal Scroll */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabItems.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => {
                  const newTab = key as
                    | 'profile'
                    | 'contributions'
                    | 'upvotes'
                    | 'lists';
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

        {/* Main Content Area */}
        <div className="mobile:hidden flex-1">
          {activeTab === 'profile' && <Setting />}
          {activeTab === 'contributions' && <Contributions />}
          {activeTab === 'upvotes' && <Upvotes />}
          {activeTab === 'lists' && <MyLists />}
        </div>

        {/* Mobile Content - Full width */}
        <div className="mobile:flex hidden w-full">
          {activeTab === 'profile' && <Setting />}
          {activeTab === 'contributions' && <Contributions />}
          {activeTab === 'upvotes' && <Upvotes />}
          {activeTab === 'lists' && <MyLists />}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
