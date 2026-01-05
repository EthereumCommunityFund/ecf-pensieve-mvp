'use client';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { cn, Skeleton } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { ReactNode, useCallback } from 'react';

import { ECFButton } from '@/components/base/button';
import { useNavigationContext } from '@/hooks/useNavigation';

interface BackHeaderProps {
  children?: ReactNode;
  className?: string;
  backHref?: string;
}

const BackHeader = ({ children, className, backHref }: BackHeaderProps) => {
  const router = useRouter();
  const { onRouterBack } = useNavigationContext();
  const handleBack = useCallback(() => {
    if (backHref) {
      router.replace(backHref);
      return;
    }
    onRouterBack();
  }, [backHref, onRouterBack, router]);

  return (
    <div
      className={cn(
        'mobile:px-[10px] flex h-[35px] items-center justify-start gap-[10px] px-[20px]',
        className,
      )}
    >
      <div className="mobile:hidden block">
        <ECFButton
          onPress={handleBack}
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

export const BackHeaderSkeleton = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        'mobile:px-[10px] flex h-[35px] items-center justify-start gap-[10px] px-[20px]',
        className,
      )}
    >
      <Skeleton className="h-[32px] w-[70px] rounded-[8px]" />
      <Skeleton className="h-[18px] w-[80px] rounded-[6px]" />
      <Skeleton className="h-[18px] w-[60px] rounded-[6px]" />
    </div>
  );
};
