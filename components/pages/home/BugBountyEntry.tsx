'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@heroui/react';
import { Bug, X } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const BugBountyEntry = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

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

  const handleOpenGrantAnnouncement = () => {
    setIsOpen(false);
    const url = `https://medium.com/@EthereumECF/official-announcement-perennial-grant-experiment-epoch-1-8383dc15b0dd`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleNavigateToCreateProject = () => {
    setIsOpen(false);
    router.push('/project/create');
  };

  const handleOpenPensieveOverview = () => {
    setIsOpen(false);
    const url = `https://ecf.wiki/s/ae77a12f-106c-429e-a7ed-8cca218bf20b`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="mobile:bottom-[100px] mobile:right-[12px] fixed bottom-[100px] right-[24px] z-[60]">
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
                Perennial Grant Experiment Epoch 1
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
                    Perennial Grant Experiment Epoch 1
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                  }}
                  className="flex size-[32px] items-center justify-center rounded-[5px] border border-black/10 bg-white/40 text-black/60 transition-colors hover:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/30"
                  aria-label="Close grant experiment announcement"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>

              <p className="font-mona mt-[10px] text-[14px] leading-normal text-black">
                {`Rewarding Integrity, Not Noise.`}
                <br />
                {`The `}
                <span className="font-bold">Perennial Grant Experiment</span>
                {` is an open, evolving grant campaign, designed to make funding transparent, accountable, and community-owned from the ground up.`}
              </p>

              <div className="font-mona mt-[10px] border-t border-black/10 pt-[10px] text-[14px] leading-normal text-black">
                Campaign Pool: $800 USD per week,{' '}
                <span className="font-bold">for 10 weeks</span>
                <br />
                Starts: 12 PM CET, October 14th
                <br />
                Ends: 12 PM CET, December 23rd
              </div>

              <p className="font-mona mt-[10px] text-[10px] font-[500] leading-[1.4] tracking-[0.08em] text-black/30">
                Weekly 1 Awards-{' '}
                <span className="font-bold">Top Transparent Projects</span>:
                $400
                <br />
                <span className="font-bold">Top Accountable Projects</span>:
                $400
              </p>

              <button
                type="button"
                onClick={handleOpenGrantAnnouncement}
                className="font-mona mt-[12px] flex h-[42px] w-full items-center justify-center rounded-[5px] border border-black/10 bg-white/40 text-[14px] font-[600] leading-[1.6] text-black transition-colors hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Read the Full Breakdown
              </button>
              <button
                type="button"
                onClick={handleNavigateToCreateProject}
                className="font-mona mt-[12px] flex h-[42px] w-full items-center justify-center rounded-[5px] border border-black/10 bg-white/40 text-[14px] font-[600] leading-[1.6] text-black transition-colors hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Propose a Project
              </button>
              <button
                type="button"
                onClick={handleOpenPensieveOverview}
                className="font-mona mt-[12px] flex h-[42px] w-full items-center justify-center rounded-[5px] border border-black/10 bg-white/40 text-[14px] font-[600] leading-[1.6] text-black transition-colors hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-50"
              >
                What is Pensieve?
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default BugBountyEntry;
