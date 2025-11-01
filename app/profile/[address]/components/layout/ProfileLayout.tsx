'use client';

import { Skeleton } from '@heroui/react';
import { ArrowLeft } from '@phosphor-icons/react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { Button } from '@/components/base';
import { AddressDisplay } from '@/components/base/AddressDisplay';
import { useProfileTab } from '@/hooks/useProfileTab';

import { useProfileData } from '../dataContext';

import ProfileSideBar from './ProfileSidebar';

const ProfileLayout = ({ children }: { children: React.ReactNode }) => {
  const { address } = useParams();
  const { currentTabLabel } = useProfileTab();
  const { user } = useProfileData();

  return (
    <div className="mobile:gap-[20px] mobile:p-[10px] flex flex-col gap-[20px] p-[20px] lg:px-[100px]">
      {/* Top navigation bar following Figma design */}
      <div className="flex items-center justify-between">
        <div className="flex w-full items-center gap-[10px]">
          {/* Exit button - always visible as per Figma design */}
          <Link href="/">
            <Button
              color="secondary"
              size="sm"
              className="mobile:h-[30px] mobile:px-[8px] mobile:py-[3px] mobile:text-[12px] h-[35px] rounded-[5px] border-none px-[10px] py-[4px] font-semibold"
              startContent={
                <ArrowLeft size={20} className="mobile:size-[16px]" />
              }
            >
              Exit
            </Button>
          </Link>

          {/* User info cards - responsive design */}
          <div className="mobile:flex-1 mobile:flex-col flex gap-[10px] opacity-80">
            {/* Connected Address card */}
            <div className="mobile:w-full flex h-[28px] items-center gap-[5px] rounded-[5px] border border-black/10 bg-white px-[10px] py-[5px]">
              <span className="mobile:text-[12px] text-[13px] font-normal leading-[18px] text-black">
                Connected Address:
              </span>
              <AddressDisplay
                address={address as string}
                className="mobile:text-[12px] text-[13px] font-normal leading-[15px] text-black"
                showCopy={false}
                startLength={4}
                endLength={4}
              />
            </div>

            {/* Contribution Points card */}
            <div className="mobile:w-full flex h-[28px] items-center gap-[5px] rounded-[5px]  border border-black/10 bg-white px-[10px] py-[5px]">
              <span className="mobile:text-[12px] text-[13px] font-normal leading-[18px] text-black">
                Your Contribution Points:
              </span>
              <Skeleton isLoaded={!!user} className="rounded-[2px]">
                <span className="mobile:text-[12px] font-mono text-[13px] font-semibold leading-[15px] text-black">
                  {user?.weight ?? 100}
                </span>
              </Skeleton>
            </div>
          </div>
        </div>
      </div>

      <div className="mobile:flex-col flex flex-1 justify-center gap-[20px]">
        <ProfileSideBar />
        <div className="max-w-[810px] flex-1">{children}</div>
      </div>
    </div>
  );
};

export default ProfileLayout;
