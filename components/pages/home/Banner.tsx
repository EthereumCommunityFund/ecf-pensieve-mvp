import { cn } from '@heroui/react';

const Banner = () => {
  return (
    <div>
      <div
        className={cn(
          'w-full rounded-[10px] border border-black/10 bg-[#222222] p-[20px] text-white',
          'tablet:p-[14px] mobile: p-[10px]',
          'flex flex-col gap-[10px]',
        )}
      >
        <h1
          className={cn(
            'font-mona text-[34px] font-[600] leading-[1] tracking-[-0.75px]',
            'tablet:text-[30px] mobile:text-[26px]',
          )}
        >
          Transparency is the new coordination.
        </h1>
        <p
          className={cn(
            'font-mona text-[18px] font-[500] leading-[1.6] text-white/60',
            'tablet:text-[16px] mobile:text-[14px]',
          )}
        >
          For projects that grow with honesty, accountability, and purpose — in
          full view of the community.
        </p>
      </div>
      <p
        className={cn(
          'mt-[10px] font-roboto text-[11px] mobile:text-[10px] uppercase leading-[1.2] text-black/30',
        )}
      >
        {`Pensieve.ecf (v0.5.0) — a decentralized, immutable, community-powered knowledge base for Web3 projects.`}
      </p>
    </div>
  );
};

export default Banner;
