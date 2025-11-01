'use client';

import { cn } from '@heroui/react';
import { ArrowSquareUp, GitCommit, UserSquare } from '@phosphor-icons/react';
import { useParams, useRouter } from 'next/navigation';

import ECFTypography from '@/components/base/typography';
import BookmarksIcon from '@/components/icons/Bookmarks';

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

interface ProfileSidebarProps {
  activeTab?: 'profile' | 'contributions' | 'upvotes' | 'lists';
  address?: string;
  isListPage?: boolean;
}

const ProfileSidebar = ({
  activeTab = 'lists',
  address,
}: ProfileSidebarProps) => {
  const router = useRouter();
  const params = useParams();
  const userAddress = address || params.address;

  return (
    <div className="mobile:hidden flex w-[280px] flex-col gap-5">
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
              router.push(`/profile/${userAddress}?tab=${newTab}`, {
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
  );
};

export default ProfileSidebar;
