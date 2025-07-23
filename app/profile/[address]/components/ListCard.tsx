'use client';

import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import ECFTypography from '@/components/base/typography';
import {
  DotsThreeVerticalIcon,
  GlobeHemisphereWestIcon,
  LockKeyIcon,
  PencilSimpleIcon,
  ShareIcon,
  TrashIcon,
} from '@/components/icons';
import { RouterOutputs } from '@/types';

import DeleteListModal from './modals/DeleteListModal';
import EditListModal from './modals/EditListModal';
import ShareListModal from './modals/ShareListModal';

interface ListCardProps {
  list: RouterOutputs['list']['getUserLists'][0];
  showManagement: boolean; // Whether to show management options (for user's own lists)
}

const ListCard = ({ list, showManagement }: ListCardProps) => {
  const router = useRouter();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleCardClick = () => {
    // Navigate to list detail page
    router.push(`/list/${list.slug}`);
  };

  const getPrivacyIcon = () => {
    switch (list.privacy) {
      case 'private':
        return <LockKeyIcon size={20} className="opacity-60" />;
      case 'public':
        return <GlobeHemisphereWestIcon size={20} className="opacity-60" />;
      default:
        return <LockKeyIcon size={20} className="opacity-60" />;
    }
  };

  const getPrivacyText = () => {
    switch (list.privacy) {
      case 'private':
        return 'Private';
      case 'public':
        return 'Public';
      default:
        return 'Private';
    }
  };

  return (
    <div className="relative flex w-full rounded-[10px] bg-[rgba(0,0,0,0.05)] p-[10px] transition-all hover:bg-[rgba(0,0,0,0.08)]">
      {/* Main Content */}
      <div className="flex flex-1 flex-col gap-[10px]">
        {/* Card Content */}
        <div
          onClick={handleCardClick}
          className="flex cursor-pointer flex-col gap-[10px]"
        >
          {/* Title Row */}
          <div className="flex items-center gap-[10px]">
            <div className="flex-1">
              <ECFTypography
                type="body1"
                className="text-[16px] font-semibold leading-[15px]"
              >
                {list.name}
              </ECFTypography>
            </div>
            {showManagement && (
              <div className="flex items-center gap-[10px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEditModal(true);
                  }}
                  className="opacity-50 transition-opacity hover:opacity-100"
                >
                  <PencilSimpleIcon size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEditModal(true);
                  }}
                  className="rounded-[5px] bg-[#E1E1E1] p-[5px] opacity-50 transition-opacity hover:opacity-100"
                >
                  <PencilSimpleIcon size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          {list.description && (
            <ECFTypography
              type="body2"
              className="text-[14px] leading-[18px] opacity-60"
            >
              {list.description}
            </ECFTypography>
          )}

          {/* Privacy Status */}
          <div className="flex items-center gap-[5px] opacity-60">
            {getPrivacyIcon()}
            <ECFTypography
              type="caption"
              className="text-[14px] font-semibold leading-[14px]"
            >
              {getPrivacyText()}
            </ECFTypography>
          </div>

          {/* For followed lists, show creator info */}
          {!showManagement && (
            <div className="flex items-center gap-[5px] rounded-[5px] bg-[rgba(0,0,0,0.05)] p-[5px]">
              <ECFTypography
                type="caption"
                className="text-[14px] leading-[19px] opacity-80"
              >
                by:
              </ECFTypography>
              <div className="size-6 rounded-full bg-gray-300" />
              <ECFTypography
                type="caption"
                className="text-[14px] leading-[19px] opacity-80"
              >
                {list.creator.slice(0, 8)}...
              </ECFTypography>
            </div>
          )}
        </div>
      </div>

      {/* Management Menu - Only for user's lists */}
      {showManagement && (
        <div className="absolute right-[10px] top-[10px]">
          <Dropdown>
            <DropdownTrigger>
              <button
                onClick={(e) => e.stopPropagation()}
                className="flex size-[40px] items-center justify-center rounded-[5px] bg-[#E1E1E1] transition-all hover:bg-[#D1D1D1]"
              >
                <DotsThreeVerticalIcon size={32} />
              </button>
            </DropdownTrigger>
            <DropdownMenu aria-label="List actions">
              <DropdownItem
                key="edit"
                onPress={() => setShowEditModal(true)}
                startContent={<PencilSimpleIcon size={18} />}
              >
                Edit List
              </DropdownItem>
              <DropdownItem
                key="share"
                onPress={() => setShowShareModal(true)}
                startContent={<ShareIcon size={18} />}
              >
                Share List
              </DropdownItem>
              <DropdownItem
                key="delete"
                onPress={() => setShowDeleteModal(true)}
                startContent={<TrashIcon size={18} />}
                className="text-danger"
                color="danger"
              >
                Delete
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      )}

      {/* For followed lists, show Leave List option */}
      {!showManagement && (
        <div className="absolute right-[10px] top-[10px]">
          <Dropdown>
            <DropdownTrigger>
              <button
                onClick={(e) => e.stopPropagation()}
                className="flex size-[40px] items-center justify-center rounded-[5px] bg-[#E1E1E1] transition-all hover:bg-[#D1D1D1]"
              >
                <DotsThreeVerticalIcon size={32} />
              </button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Follow actions">
              <DropdownItem
                key="leave"
                onPress={() => {
                  // TODO: Implement unfollow functionality
                  console.log('Unfollow list:', list.id);
                }}
                startContent={<TrashIcon size={18} />}
                className="text-danger"
                color="danger"
              >
                Leave List
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      )}

      {/* Modals */}
      <EditListModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        list={list}
      />

      <DeleteListModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        list={list}
      />

      <ShareListModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        list={list}
      />
    </div>
  );
};

export default ListCard;
