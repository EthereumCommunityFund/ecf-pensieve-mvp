'use client';

import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Spinner,
} from '@heroui/react'; // Assuming HeroUI components
import { SignOut, UserCircle } from '@phosphor-icons/react'; // Example icons
import React, { useState } from 'react';

import { useAuth } from '@/context/AuthContext'; // Adjust path
import { WalletIcon } from '@/components/icons';

// Helper to format address
const formatAddress = (address?: string | null, chars = 6): string => {
  if (!address) return '';
  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
};

const UserProfileSection: React.FC = () => {
  const {
    isAuthenticated,
    profile,
    user,
    performFullLogoutAndReload,
    showAuthPrompt,
    isCheckingInitialAuth, // Use this to show loading state initially
    fetchUserProfile, // Allow manual profile refresh?
    authStatus, // Get authStatus to differentiate between loading profile and not logged in
  } = useAuth();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); // State for potential profile edit modal

  const handleOpenProfileModal = () => setIsProfileModalOpen(true);
  const handleCloseProfileModal = () => setIsProfileModalOpen(false);

  if (
    isCheckingInitialAuth ||
    (authStatus === 'fetching_profile' && !profile)
  ) {
    // Show loading spinner during initial check or if logging in but profile not yet loaded
    return <Spinner size="sm" className="text-gray-700" />;
  }

  if (!isAuthenticated || !profile) {
    return (
      <Button
        startContent={<WalletIcon size={20} />}
        onPress={() => showAuthPrompt('connectButton')}
        // Adjusted button style for light theme
        className="h-[30px] rounded-[8px] border border-gray-300 bg-gray-100 text-[14px] font-[500] leading-[1.2] text-gray-800 hover:bg-gray-200"
      >
        Connect
      </Button>
    );
  }

  // Authenticated state: Show user dropdown
  const userAddress = profile.address || user?.user_metadata?.address;
  const displayAddress = formatAddress(userAddress);
  const avatarUrl = profile.avatarUrl || undefined;
  const usernameInitial = profile.name?.substring(0, 1).toUpperCase() || 'U';

  return (
    <>
      <Dropdown
        placement="bottom-end"
        // Removed "dark", assuming HeroUI adapts or uses light mode defaults
        // Explicitly set background and text if needed, e.g., className="text-gray-900 bg-white border border-gray-200 rounded-md shadow-lg"
        className="rounded-md border border-gray-200 bg-white text-gray-900 shadow-lg" // Example light theme dropdown styling
      >
        <DropdownTrigger>
          <Avatar
            isBordered
            as="button"
            className="border-gray-300 transition-transform" // Light border color
            color="secondary" // Keep or adjust based on theme
            size="sm"
            src={avatarUrl}
            fallback={
              // Adjusted fallback style for light theme
              <div className="flex size-full items-center justify-center bg-secondary-100 text-secondary-700">
                {usernameInitial}
              </div>
            }
          />
        </DropdownTrigger>
        {/* Adjusted DropdownMenu text/color defaults assumed to be light, or specify explicitly */}
        <DropdownMenu aria-label="Profile Actions" variant="flat">
          <DropdownItem
            key="profileInfo"
            isReadOnly
            className="h-14 gap-2 opacity-100"
            textValue={`Signed in as ${profile.name}`}
          >
            <p className="font-semibold text-gray-800">Signed in as</p>
            <p className="font-semibold text-secondary-600">
              {profile.name}
            </p>{' '}
            {/* Adjust color if needed */}
            <p className="text-xs text-gray-500">{displayAddress}</p>
          </DropdownItem>
          <DropdownItem
            key="editProfile"
            startContent={<UserCircle size={18} className="text-gray-500" />} // Icon color
            onPress={handleOpenProfileModal}
            textValue="Edit Profile"
            className="text-gray-700"
          >
            Edit Profile
          </DropdownItem>
          <DropdownItem
            key="logout"
            color="danger"
            startContent={<SignOut size={18} />} // Danger color should provide icon color
            onPress={performFullLogoutAndReload}
            textValue="Log Out"
            className="text-danger-600" // Explicit danger text color
          >
            Log Out
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      {/* Placeholder for Profile Edit Modal - Light theme */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          {/* Light theme modal background, text, border */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-gray-900 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              Edit Profile (Placeholder)
            </h2>
            <p className="text-gray-600">
              Profile editing feature coming soon.
            </p>
            {/* Ensure button has appropriate light theme styling */}
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
