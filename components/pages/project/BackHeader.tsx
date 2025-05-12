'use client';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

import { ECFButton } from '@/components/base/button';

interface BackHeaderProps {
  children?: ReactNode;
}

const BackHeader = ({ children }: BackHeaderProps) => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="flex h-[35px] items-center justify-start gap-[10px] px-[20px] mobile:px-[10px]">
      <div className="block mobile:hidden">
        <ECFButton
          onPress={handleBack}
          className="font-open-sans h-[35px] bg-transparent px-[10px] text-[14px] font-[600] text-black"
          startContent={<ArrowLeftIcon className="size-[20px]" />}
        >
          Back
        </ECFButton>
      </div>
      <div className="hidden mobile:block">
        <ECFButton
          className="h-[35px] bg-transparent px-[10px]"
          isIconOnly={true}
          onPress={handleBack}
        >
          <ArrowLeftIcon className="size-[20px] shrink-0" />
        </ECFButton>
      </div>
      <div className="font-open-sans flex items-center justify-start gap-[10px] text-[14px] font-[400] text-black">
        {children}
      </div>
    </div>
  );
};

export default BackHeader;
