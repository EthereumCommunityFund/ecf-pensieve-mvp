'use client';

const chipClasses =
  'inline-flex h-[24px] min-w-[100px] items-center justify-center rounded-[8px] bg-[#F5F5F5] px-[10px] text-[12px] text-transparent';

const bar = (className: string, widthClass: string) => (
  <span
    className={`block rounded bg-black/[0.08] ${widthClass} ${className} animate-pulse`}
  />
);

const chip = (key: string) => (
  <span key={key} className={`${chipClasses} animate-pulse`}>
    &nbsp;
  </span>
);

const SieveCardSkeleton = () => {
  return (
    <div className="mobile:w-auto flex w-full max-w-[800px] flex-col gap-[12px] rounded-[12px] border border-black/[0.08] bg-white p-[16px] shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
      <div className="flex items-start justify-between gap-[12px]">
        <div className="flex flex-col gap-[6px]">
          <div className="flex flex-wrap items-center gap-[8px]">
            {bar('h-[20px]', 'w-[90px]')}
            <span className="inline-flex h-[24px] w-[70px] animate-pulse items-center justify-center rounded-full bg-black/[0.05] text-transparent">
              &nbsp;
            </span>
          </div>
          {bar('h-[14px]', 'w-[140px]')}
          {bar('h-[12px]', 'w-[160px]')}
        </div>
        <span className="flex size-[34px] animate-pulse items-center justify-center rounded-[8px] bg-black/[0.05] text-transparent">
          &nbsp;
        </span>
      </div>

      <div className="flex flex-col gap-[12px]">
        <div className="flex items-center gap-[8px]">
          {bar('h-[14px]', 'w-[48px]')}
          <span className="inline-flex h-[24px] w-[118px] animate-pulse items-center justify-center rounded-[6px] bg-black/[0.05] text-transparent">
            &nbsp;
          </span>
        </div>

        <div className="flex flex-col gap-[8px]">
          {bar('h-[14px]', 'w-[120px]')}
          <div className="flex flex-wrap gap-[8px]">{chip('sub-1')}</div>
        </div>

        <div className="flex flex-col gap-[8px]">
          {bar('h-[14px]', 'w-[150px]')}
          <div className="flex flex-wrap items-center gap-[10px]">
            <span className="inline-flex h-[12px] w-[32px] animate-pulse rounded bg-black/[0.08] text-transparent">
              &nbsp;
            </span>
            {chip('cond-1')}
          </div>
        </div>
      </div>

      <div className="flex w-full justify-end">
        <span className="inline-flex h-[34px] w-[130px] animate-pulse items-center justify-center rounded-[8px] bg-black/[0.12] text-transparent">
          &nbsp;
        </span>
      </div>
    </div>
  );
};

export default SieveCardSkeleton;
