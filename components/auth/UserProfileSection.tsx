'use client';

import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Image,
} from '@heroui/react';
import { ArrowSquareUp, GitCommit, SignOut, User } from '@phosphor-icons/react';
import React, { useState } from 'react';

import { Button } from '@/components/base';
import Copy from '@/components/biz/common/Copy';
import { WalletIcon } from '@/components/icons';
import BookmarksIcon from '@/components/icons/Bookmarks';
import { useAuth } from '@/context/AuthContext';

const formatAddress = (address?: string | null, chars = 6): string => {
  if (!address) return '';
  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
};

const formatUserName = (name?: string) => {
  if (!name) return '';
  if (name.length > 20) {
    return `${name.slice(0, 6)}...${name.slice(-6)}`;
  }
  return name;
};

export interface IUserProfileSection {
  avatarSize?: number;
}

const UserProfileSection: React.FC<IUserProfileSection> = ({
  avatarSize = 24,
}) => {
  const {
    isAuthenticated,
    profile,
    user,
    performFullLogoutAndReload,
    showAuthPrompt,
    isCheckingInitialAuth,
    fetchUserProfile,
    authStatus,
  } = useAuth();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleCloseProfileModal = () => setIsProfileModalOpen(false);

  const formattedName = formatUserName(profile?.name);

  if (!profile) {
    return (
      <Button
        startContent={<WalletIcon size={20} />}
        onPress={() => showAuthPrompt('connectButton')}
        className="h-[30px] rounded-[8px] border border-gray-300 bg-gray-100 text-[14px] font-[500] leading-[1.2] text-gray-800 hover:bg-gray-200"
      >
        Connect
      </Button>
    );
  }

  return (
    <>
      <Dropdown
        placement="bottom-end"
        className="rounded-md border border-gray-200 bg-white text-gray-900 shadow-lg" // Example light theme dropdown styling
      >
        <DropdownTrigger>
          <Button
            size="sm"
            className="border-none bg-[rgba(0,0,0,0.05)] px-[10px] py-[4px]"
          >
            <Image
              src={profile?.avatarUrl ?? '/images/user/avatar_p.png'}
              alt="avatar"
              height={avatarSize}
              width={avatarSize}
              className="object-cover"
            />
            <span className="text-[16px] font-[600] leading-[1.2] text-gray-800">
              {formattedName}
            </span>
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Profile Actions" variant="flat">
          <DropdownItem key="profileInfo">
            <Copy
              text={profile?.address}
              message={'Wallet address copied'}
              useCustomChildren={true}
            >
              <div className="flex w-[full] items-center gap-[10px] rounded-[8px] p-[5px] hover:bg-[rgba(255,255,255,0.05)]">
                <Avatar
                  src={profile?.avatarUrl ?? '/images/user/avatar_p.png'}
                  alt="avatar"
                  className="size-[40px] shrink-0"
                />
                <div className="w-[128px]">
                  <p className="truncate text-[16px] font-[500] leading-[1.2] text-black">
                    {formattedName}
                  </p>
                  <p className="mt-[5px] text-[13px] leading-[1.4] text-black opacity-70">
                    {formatAddress(profile.address)}
                  </p>
                </div>
              </div>
            </Copy>
          </DropdownItem>
          <DropdownItem
            key="profile"
            startContent={<User size={18} />}
            textValue="My Profile"
            className="mt-[10px]"
            href={`/profile/${profile?.address}?tab=profile`}
          >
            My Profile
          </DropdownItem>
          <DropdownItem
            key="contributions"
            startContent={<GitCommit size={18} />}
            textValue="My Contributions"
            className="mt-[10px]"
            href={`/profile/${profile?.address}?tab=contributions`}
          >
            My Contributions
          </DropdownItem>
          <DropdownItem
            key="upvotes"
            startContent={<ArrowSquareUp size={18} />}
            textValue="My Upvotes"
            className="mt-[10px]"
            href={`/profile/${profile?.address}?tab=upvotes`}
          >
            My Upvotes
          </DropdownItem>
          <DropdownItem
            key="lists"
            startContent={<BookmarksIcon size={18} />}
            textValue="My Lists"
            className="mt-[10px]"
            href={`/profile/${profile?.address}?tab=lists`}
          >
            My Lists
          </DropdownItem>
          <DropdownItem
            key="logout"
            color="danger"
            startContent={<SignOut size={18} />}
            onPress={performFullLogoutAndReload}
            textValue="Log Out"
            className="text-danger mt-[10px]"
          >
            Log Out
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-gray-900 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              Edit Profile (Placeholder)
            </h2>
            <p className="text-gray-600">
              Profile editing feature coming soon.
            </p>
            <Button
              onPress={handleCloseProfileModal}
              className="mt-4 bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default UserProfileSection;
