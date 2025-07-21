import { cn } from '@heroui/react';

const Banner = () => {
  return (
    <div
      className={cn(
        'w-full min-h-[152px] mobile:h-[auto] overflow-hidden bg-white rounded-[10px] border border-[rgba(0,0,0,0.1)] p-5 relative',
        'bg-[url(/images/home/BannerBg.png)] bg-no-repeat bg-right bg-[length:auto_100%]',
        'tablet:bg-[length:50%_100%] mobile:bg-[length:30%_100%]',
        // 'mobile:bg-none',
      )}
    >
      <div className="z-10 flex size-full flex-col gap-[10px]">
        <div className="flex h-[25px]">
          <p className="flex h-[25px] items-center justify-end rounded-[6px] border border-[rgba(0,0,0,0.2)] px-2.5 py-1">
            <span className="text-[14px] font-semibold leading-[17px] tracking-[1.4]">
              ALPHA 0.1.0
            </span>
          </p>
        </div>

        <p
          className={cn(
            'flex justify-start items-center gap-[10px] mobile:flex-col mobile:items-start mobile:gap-[5px] ',
            'font-mona text-[38px] font-[600] leading-[1]',
            'tablet:text-[34px] mobile:text-[28px]',
          )}
        >
          <span>Welcome to</span>
          <span className="font-[800] text-[#64C0A5]">Pensieve.ecf</span>{' '}
        </p>

        <p className="font-mona mobile:text-[14px] text-[18px] font-[500] leading-[1.6]">
          A decentralized, community-powered knowledge base for Web3 projects.
        </p>
      </div>
    </div>
  );
};

export default Banner;
