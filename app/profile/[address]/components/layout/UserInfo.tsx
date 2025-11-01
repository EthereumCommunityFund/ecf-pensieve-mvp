import { Skeleton } from '@heroui/react';
import { useParams } from 'next/navigation';

import { AddressDisplay } from '@/components/base/AddressDisplay';

import { useProfileData } from '../dataContext';

const UserInfo = () => {
  const { address } = useParams();
  const { user } = useProfileData();

  return (
    <div className="flex gap-[10px]">
      {/* Connected Address card - Figma design */}
      <div className="flex h-[28px] items-center gap-[5px] rounded-[5px] border border-black bg-white px-[10px] py-[5px]">
        <span className="text-[13px] font-normal leading-[18px] text-black">
          Connected Address:
        </span>
        <AddressDisplay
          address={address as string}
          className="text-[13px] font-normal leading-[15px] text-black"
          showCopy={false}
        />
      </div>

      {/* Contribution Points card - Figma design */}
      <div className="flex h-[28px] items-center gap-[5px] rounded-[5px] border border-black bg-white px-[10px] py-[5px]">
        <span className="text-[13px] font-normal leading-[18px] text-black">
          Your Contribution Points:
        </span>
        <Skeleton isLoaded={!!user} className="rounded-[2px]">
          <span className="font-mono text-[13px] font-semibold leading-[15px] text-black">
            {user?.weight ?? 100}
          </span>
        </Skeleton>
      </div>
    </div>
  );
};

export default UserInfo;
