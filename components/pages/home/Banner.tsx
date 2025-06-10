import { cn } from '@heroui/react';
import Link from 'next/link';

const Banner = () => {
  return (
    <div
      className={cn(
        'w-full min-h-[167px] mobile:h-[auto] overflow-hidden bg-white rounded-[10px] border border-[rgba(0,0,0,0.1)] p-5 relative ',
        'bg-[url(/images/home/BannerBg.png)] bg-no-repeat bg-right bg-[length:auto_100%]',
        'mobile:bg-none',
      )}
    >
      <div className="z-10 size-full">
        <div className="flex h-[25px]">
          <p className="flex h-[25px] items-center justify-end rounded-[6px] border border-[rgba(0,0,0,0.2)] bg-[rgba(0,0,0,0.1)] px-2.5 py-1">
            <span className="text-[14px] font-semibold leading-[17px] tracking-[1.4]">
              ALPHA 0.1.0
            </span>
          </p>
        </div>

        <p className="font-mona mobile:text-[30px] mt-[10px] text-[38px] font-[600] leading-[1.4]">
          Welcome to{' '}
          <span className="font-[800] text-[#64C0A5]">ECF Pensieve</span>{' '}
        </p>

        <p className="font-mona mobile:text-[16px] mt-[10px] text-[18px] font-[500] leading-[1.6]">
          A community-curated and governend platform based on{' '}
          <Link
            href="https://ethereum-community-fund.gitbook.io/the-ecf-pensieve-decentralised-social-consensus"
            target="_blank"
            className="font-[700] hover:underline"
          >
            ECF Pensieve
          </Link>{' '}
          for discovering accountable web3 projects and organisations.
        </p>
      </div>

      <div
        className={cn(
          'lg:hidden pc:hidden tablet:hidden',
          'absolute top-[28px] left-[178px] bottom-0 right-0 opacity-40',
          'bg-[url(/images/home/Cube.png)] bg-repeat mobile:bg-[length:100px_100px] mix-blend-luminosity',
        )}
      />
    </div>
  );
};

export default Banner;
