'use client';

import {
  cn,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/react';
import { useRouter } from 'next/navigation';

import {
  DotsThreeVerticalIcon,
  GlobeHemisphereWestIcon,
  LockKeyIcon,
  PencilSimpleIcon,
  ShareIcon,
  TrashIcon,
} from '@/components/icons';
import { RouterOutputs } from '@/types';

interface CommonListCardProps {
  list: RouterOutputs['list']['getUserLists'][0];
  showBorderBottom?: boolean;
  onEdit: () => void;
  onShare: () => void;
  onDelete: () => void;
  profileAddress?: string; // Optional address for profile context
}

const CommonListCard = ({
  list,
  showBorderBottom,
  onEdit,
  onShare,
  onDelete,
  profileAddress,
}: CommonListCardProps) => {
  const router = useRouter();

  const handleCardClick = () => {
    // If profileAddress is provided, use profile route; otherwise use public route
    const targetRoute = profileAddress
      ? `/profile/${profileAddress}/list/${list.slug}`
      : `/list/${list.slug}`;
    router.push(targetRoute);
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
    <div
      className={cn(
        'relative flex w-full pb-[10px]',
        showBorderBottom ? 'border-b border-black/10' : '',
      )}
    >
      <div
        onClick={handleCardClick}
        className="flex flex-1 cursor-pointer items-center justify-between rounded-[10px] p-[10px] transition-all hover:bg-[rgba(0,0,0,0.02)]"
      >
        <div>
          <p className="text-[16px] font-semibold leading-[15px]">
            {list.name}
          </p>

          {list.description && (
            <p className="mt-[6px] text-[14px] leading-[18px] opacity-60">
              {list.description}
            </p>
          )}

          <div className="mt-[10px] flex items-center gap-[5px] opacity-60">
            {getPrivacyIcon()}
            <p className="text-[14px] font-semibold leading-[14px]">
              {getPrivacyText()}
            </p>
          </div>
        </div>

        <Dropdown>
          <DropdownTrigger>
            <button
              onClick={(e) => e.stopPropagation()}
              className="flex size-[40px] items-center justify-center rounded-[5px] bg-[#E1E1E1] transition-all hover:bg-[#D1D1D1]"
            >
              <DotsThreeVerticalIcon size={32} />
            </button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="List actions"
            className="min-w-[171px] rounded-[10px] p-[10px] shadow-lg"
            itemClasses={{
              base: 'rounded-[5px] px-[10px] py-[4px] gap-[10px] data-[hover=true]:bg-[#EBEBEB]',
              title:
                "text-[16px] font-semibold leading-[1.36] tracking-[0.018em] font-['Open_Sans']",
            }}
          >
            <DropdownItem
              key="edit"
              onPress={onEdit}
              endContent={<PencilSimpleIcon size={18} />}
              className="bg-[#EBEBEB]"
            >
              Edit List
            </DropdownItem>
            <DropdownItem
              key="share"
              onPress={onShare}
              endContent={<ShareIcon size={18} />}
            >
              Share List
            </DropdownItem>
            <DropdownItem
              key="delete"
              onPress={onDelete}
              endContent={<TrashIcon size={18} />}
              className="text-[#CD453B]"
            >
              Delete
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
};

export default CommonListCard;
