'use client';

import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/base/button';
import { AddressValidator } from '@/lib/utils/addressValidation';

interface AdManagementHeaderProps {
  connectedAddress?: string | null;
}

export function AdManagementHeader({
  connectedAddress,
}: AdManagementHeaderProps) {
  const router = useRouter();

  const handleExit = () => {
    router.replace('/');
  };

  const displayAddress = connectedAddress
    ? AddressValidator.shortenAddress(connectedAddress)
    : 'Not connected';

  return (
    <div className="py-[10px]">
      <div className="flex h-[35px] w-full items-center gap-[16px]">
        <div className="flex items-center gap-[10px]">
          <Button
            className="h-[35px] min-w-0 border-none bg-transparent px-[10px] text-[14px] font-semibold text-black"
            startContent={<ArrowLeftIcon className="size-[20px]" />}
            onPress={handleExit}
          >
            <span className="mobile:hidden">Exit</span>
          </Button>
          <p className="font-mona mobile:text-[14px] text-[16px] font-[700] leading-[1.6] text-black">
            Ad Management
          </p>
        </div>

        <div className="mobile:hidden flex items-center gap-[5px] rounded-[5px] border border-black/10 bg-white px-[10px] py-[5px] text-[13px] leading-[15px] text-black/80">
          <span className="text-black/50">Connected Address:</span>
          <span className="font-mono text-black/80">{displayAddress}</span>
        </div>
        <div className="mobile:flex hidden items-center gap-[5px] rounded-[5px] border border-black/10 bg-white px-[10px] py-[5px] text-[13px] leading-[15px] text-black/60">
          <span className="">Address:</span>
          <span className="font-mono text-black/80">{displayAddress}</span>
        </div>
      </div>
    </div>
  );
}

export default AdManagementHeader;
