'use client';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { ReactNode } from 'react';
import { cn } from '@heroui/react';

import { ECFButton } from '@/components/base/button';
import { useNavigationContext } from '@/hooks/useNavigation';

interface BackHeaderProps {
  children?: ReactNode;
  className?: string;
}

const BackHeader = ({ children, className }: BackHeaderProps) => {
  const { onRouterBack } = useNavigationContext();

  return (
    <div
      className={cn(
        'mobile:px-[10px] flex h-[35px] items-center justify-start gap-[10px] px-[20px]',
        className,
      )}
    >
      <div className="mobile:hidden block">
        <ECFButton
          onPress={onRouterBack}
          className="font-open-sans h-[35px] bg-transparent px-[10px] text-[14px] font-[600] text-black"
          startContent={<ArrowLeftIcon className="size-[20px]" />}
        >
          Back
        </ECFButton>
      </div>
      <div className="mobile:block hidden">
        <ECFButton
          className="h-[35px] bg-transparent px-[10px]"
          isIconOnly={true}
          onPress={onRouterBack}
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
