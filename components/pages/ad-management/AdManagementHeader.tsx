'use client';

import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

import { Button, ECFButton } from '@/components/base/button';
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
      <div className="h-[35px] flex w-full items-center gap-[16px]">
        <div className="flex items-center gap-[10px]">
          <Button
            className="h-[35px] border-none bg-transparent px-[10px] text-[14px] font-semibold text-black min-w-0"
            startContent={<ArrowLeftIcon className="size-[20px]" />}
            onPress={handleExit}
          >
            <span className="mobile:hidden">Exit</span>
          </Button>
          <p className="text-[16px] mobile:text-[14px] font-[700] font-mona leading-[1.6] text-black">
            Ad Management
          </p>
        </div>

        <div className="bg-white border border-black/10 px-[10px] py-[5px] text-[13px] leading-[15px] text-black/80 mobile:hidden rounded-[5px] flex items-center gap-[5px]">
          <span className="text-black/50">Connected Address:</span>
          <span className="font-mono text-black/80">{displayAddress}</span>
        </div>
        <div className="hidden bg-white border border-black/10 px-[10px] py-[5px] text-[13px] leading-[15px] rounded-[5px] text-black/60 mobile:flex flex items-center gap-[5px]">
          <span className="">Address:</span>
          <span className="font-mono text-black/80">{displayAddress}</span>
        </div>
      </div>
    </div>
  );
}

export default AdManagementHeader;
