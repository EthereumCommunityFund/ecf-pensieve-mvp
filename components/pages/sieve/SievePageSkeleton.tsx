'use client';

const SievePageSkeleton = () => {
  return (
    <div className="flex flex-col gap-[16px]">
      <div className="h-[160px] animate-pulse rounded-[12px] bg-black/5" />
      <div className="h-[220px] animate-pulse rounded-[12px] bg-black/5" />
      <div className="flex flex-col gap-[10px]">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-[120px] animate-pulse rounded-[12px] bg-black/5"
          />
        ))}
      </div>
    </div>
  );
};

export default SievePageSkeleton;
