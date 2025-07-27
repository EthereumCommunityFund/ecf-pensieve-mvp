'use client';

import { ArrowSquareUp, GitCommit, UserSquare } from '@phosphor-icons/react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import BookmarksIcon from '@/components/icons/Bookmarks';

import Contributions from './components/contributions';
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
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab');
  const { address } = useParams();
  const router = useRouter();

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
    <div className="mobile:px-[10px]">
      <div className="mx-auto flex w-full max-w-[1200px] gap-5 pb-16">
        {/* Main Content Area */}
        <div className="mobile:hidden flex-1">
          {activeTab === 'profile' && <Setting />}
          {activeTab === 'contributions' && <Contributions />}
          {activeTab === 'upvotes' && <Upvotes />}
          {activeTab === 'lists' && (
            <MyLists profileAddress={address as string} />
          )}
        </div>

        {/* Mobile Content - Full width */}
        <div className="mobile:flex hidden w-full">
          {activeTab === 'profile' && <Setting />}
          {activeTab === 'contributions' && <Contributions />}
          {activeTab === 'upvotes' && <Upvotes />}
          {activeTab === 'lists' && (
            <MyLists profileAddress={address as string} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
