'use client';

import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Image,
} from '@heroui/react';
import { GitCommit } from '@phosphor-icons/react';
import React, { useState } from 'react';

import { Button } from '@/components/base';
import Copy from '@/components/biz/common/Copy';
import { WalletIcon } from '@/components/icons';
import ArrowSquareUpIcon from '@/components/icons/ArrowSquareUp';
import BookmarksWhiteIcon from '@/components/icons/BookmarksWhite';
import LogoutIcon from '@/components/icons/Logout';
import UserProfileIcon from '@/components/icons/UserProfile';
import { useAuth } from '@/context/AuthContext';
import { formatWeight } from '@/utils/weight';

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
  const { profile, performFullLogoutAndReload, showAuthPrompt } = useAuth();

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
        className="rounded-[10px] border border-black/10 bg-white text-gray-900 shadow-sm"
      >
        <DropdownTrigger>
          <Button
            size="sm"
            className="shrink-0 border-none bg-[rgba(0,0,0,0.05)] px-[10px] py-[4px]"
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
        <DropdownMenu
          aria-label="Profile Actions"
          variant="flat"
          className="p-[10px]"
          itemClasses={{
            base: 'mb-[10px] last:mb-0',
          }}
        >
          <DropdownItem
            key="profileInfo"
            className="cursor-default p-0  hover:bg-transparent focus:bg-transparent data-[hover=true]:bg-transparent"
            isReadOnly
          >
            <Copy
              text={profile?.address}
              message={'Wallet address copied'}
              useCustomChildren={true}
            >
              <div className="flex w-full items-center gap-[10px] rounded-[5px] border-b border-black/10 p-[10px] transition-all duration-200">
                <Avatar
                  src={profile?.avatarUrl ?? '/images/user/avatar_p.png'}
                  alt="avatar"
                  className="size-[34px] shrink-0 rounded-full border border-white"
                />
                <div className="flex flex-col">
                  <p className="text-[14px] font-[500] leading-[17px] text-black">
                    {formattedName}
                  </p>
                  <p className="font-mono text-[13px] leading-[18px] text-black/60">
                    {formatAddress(profile.address)}
                  </p>
                </div>
              </div>
            </Copy>
          </DropdownItem>
          <DropdownItem
            key="contribution"
            className="cursor-default p-0 hover:bg-transparent focus:bg-transparent data-[hover=true]:bg-transparent"
            isReadOnly
          >
            <div className="flex w-full flex-col items-start rounded-[5px] border border-black/10 px-[8px] py-[6px]">
              <div className="text-[13px] font-[400] text-black/70">
                Contribution Points:
              </div>
              <div className="ml-[5px] font-mono text-[13px] font-semibold text-black">
                {formatWeight(profile?.weight ?? 100)}
              </div>
            </div>
          </DropdownItem>
          <DropdownItem
            key="profile"
            startContent={<UserProfileIcon size={24} />}
            textValue="My Profile"
            className="gap-[7px] rounded-[5px] px-[10px] py-[4px] text-[14px] font-[600] text-black transition-all duration-200 hover:bg-black/[0.05]"
            href={`/profile/${profile?.address}?tab=profile`}
          >
            My Profile
          </DropdownItem>
          <DropdownItem
            key="contributions"
            startContent={<GitCommit size={24} />}
            textValue="My Contributions"
            className="gap-[7px] rounded-[5px] px-[10px] py-[4px] text-[14px] font-[600] text-black transition-all duration-200 hover:bg-black/[0.05]"
            href={`/profile/${profile?.address}?tab=contributions`}
          >
            My Contributions
          </DropdownItem>
          <DropdownItem
            key="upvotes"
            startContent={<ArrowSquareUpIcon size={24} />}
            textValue="My Upvotes"
            className="gap-[7px] rounded-[5px] px-[10px] py-[4px] text-[14px] font-[600] text-black transition-all duration-200 hover:bg-black/[0.05]"
            href={`/profile/${profile?.address}?tab=upvotes`}
          >
            My Upvotes
          </DropdownItem>
          <DropdownItem
            key="lists"
            startContent={<BookmarksWhiteIcon size={24} />}
            textValue="My Lists"
            className="gap-[7px] rounded-[5px] px-[10px] py-[4px] text-[14px] font-[600] text-black transition-all duration-200 hover:bg-black/[0.05]"
            href={`/profile/${profile?.address}?tab=lists`}
          >
            My Lists
          </DropdownItem>
          <DropdownItem
            key="logout"
            startContent={<LogoutIcon size={24} className="text-[#CD453B]" />}
            onPress={performFullLogoutAndReload}
            textValue="Logout"
            className="gap-[7px] rounded-[5px] px-[10px] py-[4px] text-[14px] font-[600] text-[#CD453B] transition-all duration-200 hover:bg-red-50"
          >
            Logout
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
