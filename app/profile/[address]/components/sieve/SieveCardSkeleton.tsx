'use client';

const chipClasses =
  'inline-flex h-[26px] min-w-[80px] items-center rounded-[8px] bg-[#F5F5F5] px-[10px] text-[12px] text-transparent';

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
    <div className="mobile:w-auto flex w-full max-w-[800px] flex-col gap-[16px] rounded-[12px] border border-black/[0.08] bg-white p-[16px] shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
      <div className="flex items-start justify-between gap-[12px]">
        <div className="flex flex-col gap-[8px]">
          <div className="flex flex-wrap items-center gap-[10px]">
            {bar('h-[18px]', 'w-[160px]')}
            <span className="flex h-[24px] w-[74px] animate-pulse items-center justify-center rounded-full bg-black/[0.05] text-transparent">
              &nbsp;
            </span>
          </div>
          {bar('h-[14px]', 'w-[220px]')}
          {bar('h-[12px]', 'w-[150px]')}
        </div>
        <span className="size-[38px] animate-pulse rounded-[8px] bg-black/[0.05] text-transparent">
          &nbsp;
        </span>
      </div>

      <div className="flex flex-col gap-[14px]">
        <div className="flex items-center gap-[10px]">
          {bar('h-[14px]', 'w-[42px]')}
          <span className="inline-flex h-[24px] w-[130px] animate-pulse items-center rounded-[6px] bg-[#F1F1F1] px-[10px] text-transparent">
            &nbsp;
          </span>
        </div>

        <div className="flex flex-col gap-[10px]">
          {bar('h-[14px]', 'w-[120px]')}
          <div className="flex flex-wrap gap-[10px]">
            {['1', '2', '3'].map((key) => chip(`sub-${key}`))}
          </div>
        </div>

        <div className="flex flex-col gap-[10px]">
          {bar('h-[14px]', 'w-[140px]')}
          <div className="flex flex-wrap items-center gap-[14px]">
            <div className="flex items-center gap-[6px]">
              {bar('h-[12px]', 'w-[30px]')}
              {chip('cond-1')}
            </div>
            <div className="flex items-center gap-[6px]">
              {bar('h-[12px]', 'w-[30px]')}
              {chip('cond-2')}
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full justify-end gap-[8px]">
        <span className="inline-flex h-[34px] w-[120px] animate-pulse items-center justify-center rounded-[8px] border border-black/[0.15] bg-black/[0.05] text-transparent">
          &nbsp;
        </span>
        <span className="inline-flex h-[34px] w-[120px] animate-pulse items-center justify-center rounded-[8px] bg-black/[0.1] text-transparent">
          &nbsp;
        </span>
      </div>
    </div>
  );
};

export default SieveCardSkeleton;
