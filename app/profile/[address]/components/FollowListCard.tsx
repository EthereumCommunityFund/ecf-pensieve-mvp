'use client';

import {
  cn,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Image,
} from '@heroui/react';
import { useRouter } from 'next/navigation';

import {
  DotsThreeVerticalIcon,
  GlobeHemisphereWestIcon,
  LockKeyIcon,
  SignOutIcon,
} from '@/components/icons';
import { trpc } from '@/lib/trpc/client';
import { RouterOutputs } from '@/types';

interface FollowListCardProps {
  list: RouterOutputs['list']['getUserFollowedLists'][0] & {
    creator?: {
      name?: string;
      avatarUrl?: string | null;
    };
  };
  showBorderBottom?: boolean;
  profileAddress?: string; // Optional address for profile context
}

const FollowListCard = ({
  list,
  showBorderBottom,
  profileAddress,
}: FollowListCardProps) => {
  const router = useRouter();
  const utils = trpc.useContext();

  const unfollowMutation = trpc.list.unfollowList.useMutation({
    onSuccess: () => {
      utils.list.getUserFollowedLists.invalidate();
    },
  });

  const handleCardClick = () => {
    router.push(`/list/${list.slug}`);
  };

  const handleUnfollow = () => {
    unfollowMutation.mutate({ listId: list.id });
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
        className="flex flex-1 cursor-pointer flex-col gap-[10px] rounded-[10px] p-[10px] transition-all hover:bg-[rgba(0,0,0,0.02)]"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
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
            <DropdownMenu aria-label="Follow actions">
              <DropdownItem
                key="leave"
                onPress={handleUnfollow}
                endContent={<SignOutIcon size={18} color="#CD453B" />}
                className="text-danger"
                color="danger"
              >
                Leave List
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>

        <div className="flex w-fit items-center gap-[5px]  p-[5px]">
          <p className="text-[14px] leading-[19px] opacity-80">by:</p>
          <Image
            src={list.creator?.avatarUrl || '/images/user/avatar_p.png'}
            alt={list.creator?.name || 'User'}
            className="size-6 rounded-full object-cover"
          />
          <p className="text-[14px] leading-[19px] opacity-80">
            {list.creator?.name || 'Unknown'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FollowListCard;
