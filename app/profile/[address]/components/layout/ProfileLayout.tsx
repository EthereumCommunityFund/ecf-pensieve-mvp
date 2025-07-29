'use client';

import { ArrowLeft } from '@phosphor-icons/react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { Button } from '@/components/base';

import ProfileSideBar from './ProfileSidebar';
import UserInfo from './UserInfo';

const ProfileLayout = ({ children }: { children: React.ReactNode }) => {
  const { address } = useParams();

  return (
    <div className="mobile:p-[10px] mobile:gap-[20px] flex flex-col gap-[20px] p-[20px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[10px]">
          <Link href={`/profile/${address}?tab=profile`}>
            <Button
              color="secondary"
              size="sm"
              className="border-none"
              startContent={<ArrowLeft></ArrowLeft>}
            >
              Exit
            </Button>
          </Link>
          <span className="text-[14px] leading-[1.6] text-black/60">
            My Profile / ...
          </span>
        </div>

        <div className="mobile:hidden block">
          <UserInfo />
        </div>
      </div>

      <div className="mobile:block hidden">
        <UserInfo />
      </div>

      <div className="mobile:flex-col flex flex-1 justify-center gap-[20px]">
        <ProfileSideBar />
        <div className="max-w-[810px] flex-1">{children}</div>
      </div>
    </div>
  );
};

export default ProfileLayout;
