'use client';

import {
  ArrowSquareUp,
  Funnel,
  GitCommit,
  UserSquare,
} from '@phosphor-icons/react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import BookmarksIcon from '@/components/icons/Bookmarks';

import Contributions from './components/contributions';
import MyLists from './components/list/myLists';
import Setting from './components/setting';
import MySieve from './components/sieve/MySieve';
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
  {
    key: 'sieve',
    label: 'My Sieve',
    icon: <Funnel width={28} height={28} />,
  },
];

const ProfileSettingsPage = () => {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab');
  const { address } = useParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    'profile' | 'contributions' | 'upvotes' | 'lists' | 'sieve'
  >(
    initialTab === 'contributions'
      ? 'contributions'
      : initialTab === 'upvotes'
        ? 'upvotes'
        : initialTab === 'lists'
          ? 'lists'
          : initialTab === 'sieve'
            ? 'sieve'
            : 'profile',
  );

  useEffect(() => {
    const currentTab = searchParams.get('tab');
    if (
      currentTab &&
      (currentTab === 'profile' ||
        currentTab === 'contributions' ||
        currentTab === 'upvotes' ||
        currentTab === 'lists' ||
        currentTab === 'sieve')
    ) {
      setActiveTab(
        currentTab as
          | 'profile'
          | 'contributions'
          | 'upvotes'
          | 'lists'
          | 'sieve',
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
          {activeTab === 'sieve' && (
            <MySieve profileAddress={address as string} />
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
          {activeTab === 'sieve' && (
            <MySieve profileAddress={address as string} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
