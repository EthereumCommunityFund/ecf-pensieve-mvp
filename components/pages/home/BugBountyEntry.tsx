'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@heroui/react';
import { Bug, X } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';

const BugBountyEntry = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateIsMobile = () => {
      if (typeof window === 'undefined') {
        return;
      }
      setIsMobile(window.innerWidth <= 809);
    };

    updateIsMobile();
    window.addEventListener('resize', updateIsMobile);

    return () => {
      window.removeEventListener('resize', updateIsMobile);
    };
  }, []);

  const handleNavigate = () => {
    const url = `https://medium.com/@EthereumECF/official-announcement-perennial-grant-experiment-epoch-1-8383dc15b0dd`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="mobile:right-[12px] fixed bottom-[24px] right-[24px] z-[60]">
      <Popover
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        placement={isMobile ? 'top-end' : 'left-end'}
        offset={12}
        showArrow={false}
        disableAnimation
        classNames={{
          trigger:
            'transition-none data-[open=true]:scale-100 data-[pressed=true]:scale-100',
          content:
            '!transform-none !transition-none motion-reduce:!transform-none motion-reduce:!transition-none border-none bg-transparent p-0',
        }}
      >
        <PopoverTrigger>
          <button
            type="button"
            className="mobile:w-full flex w-[320px] items-center justify-between gap-[10px] rounded-[10px] border border-black/10 bg-white/60 px-[14px] py-[12px] text-left text-black shadow-[0_20px_40px_rgba(22,19,1,0.08)] backdrop-blur-[10px] transition-colors hover:bg-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/40 data-[open=true]:bg-white/60"
          >
            <div className="flex items-center gap-[10px]">
              <div className="flex size-[32px] items-center justify-center rounded-full bg-black/5">
                <Bug size={20} weight="fill" className="text-black/80" />
              </div>
              <span className="font-mona text-[16px] font-[600] leading-[1.6] text-black/80">
                Pensieve Bug Bounty
              </span>
            </div>
            <span className="font-mona rounded-[5px] border border-black/10 bg-white/40 px-[10px] py-[6px] text-[14px] font-[600] leading-[1.6] text-black transition-colors">
              View
            </span>
          </button>
        </PopoverTrigger>

        <PopoverContent>
          {(close) => (
            <div className="mobile:w-[calc(100vw-48px)] w-[340px] max-w-[340px] rounded-[10px] border border-black/10 bg-white/60 p-[14px] text-black shadow-[0_24px_48px_rgba(22,19,1,0.1)] backdrop-blur-[10px]">
              <div className="flex items-center justify-between gap-[10px]">
                <div className="flex items-center gap-[10px]">
                  <div className="flex size-[32px] items-center justify-center rounded-full bg-black/5">
                    <Bug size={20} weight="fill" className="text-black/80" />
                  </div>
                  <span className="font-mona text-[16px] font-[600] leading-[1.6] text-black/80">
                    Pensieve Bug Bounty
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                  }}
                  className="flex size-[32px] items-center justify-center rounded-[5px] border border-black/10 bg-white/40 text-black/60 transition-colors hover:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/30"
                  aria-label="Close bug bounty announcement"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>

              <p className="font-mona mt-[10px] text-[14px] leading-normal text-black">
                {`We're building the memory layer of Ethereum`}
                <br />
                {`—but before we go further, we need your help to test its brain.`}
                <br />
                {`We're launching the Pensieve Bug Bounty Campaign, and you're invited to join, test, break, and earn.`}
              </p>

              <div className="font-mona mt-[10px] border-t border-black/10 pt-[10px] text-[14px] leading-normal text-black">
                Total rewards: $1,000
                <br />
                Duration: 1 month
                <br />
                Rewards: $10 to $200 per bug
              </div>

              <p className="font-mona mt-[10px] text-[10px] font-[500] leading-[1.4] tracking-[0.08em] text-black/30">
                Starting: 10, 14, 2025
              </p>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  handleNavigate();
                }}
                className="font-mona mt-[12px] flex h-[42px] w-full items-center justify-center rounded-[5px] border border-black/10 bg-white/40 text-[14px] font-[600] leading-[1.6] text-black transition-colors hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Enter Bounty
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default BugBountyEntry;
