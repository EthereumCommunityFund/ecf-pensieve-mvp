import { Skeleton } from '@heroui/react';

export function ThreadDetailSkeleton() {
  return (
    <div className="flex items-start justify-center gap-[40px] pt-[20px]">
      <section className="w-[700px] space-y-6">
        <div className="rounded-[10px] border border-black/10 bg-white p-[14px]">
          <div className="flex items-center gap-2">
            <Skeleton className="h-[16px] w-[100px] rounded-[6px]" />
            <Skeleton className="h-[16px] w-[80px] rounded-[6px]" />
          </div>
          <Skeleton className="mt-[10px] h-[26px] w-[360px] rounded-[6px]" />
          <div className="mt-[8px] space-y-2">
            <Skeleton className="h-[14px] w-[220px] rounded-[4px]" />
            <Skeleton className="h-[14px] w-[180px] rounded-[4px]" />
          </div>
          <div className="mt-[12px] space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-[16px] w-full rounded-[4px]" />
            ))}
          </div>
          <div className="mt-[16px] flex gap-3">
            <Skeleton className="h-[34px] w-[120px] rounded-[8px]" />
            <Skeleton className="h-[34px] w-[140px] rounded-[8px]" />
          </div>
        </div>

        <div className="rounded-[10px] border border-black/10 bg-white px-[14px] py-[10px]">
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-[30px] w-[90px] rounded-[8px]" />
            <Skeleton className="h-[30px] w-[90px] rounded-[8px]" />
            <Skeleton className="h-[30px] w-[90px] rounded-[8px]" />
            <Skeleton className="h-[30px] w-[120px] rounded-[8px]" />
          </div>
        </div>

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <article
              key={index}
              className="rounded-[10px] border border-black/10 bg-white p-[10px]"
            >
              <div className="flex gap-3">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-[16px] w-[120px] rounded-[4px]" />
                    <Skeleton className="h-[16px] w-[80px] rounded-[4px]" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-[16px] w-full rounded-[4px]" />
                    <Skeleton className="h-[16px] w-4/5 rounded-[4px]" />
                    <Skeleton className="h-[16px] w-3/5 rounded-[4px]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-[28px] w-[70px] rounded-[6px]" />
                    <Skeleton className="h-[28px] w-[80px] rounded-[6px]" />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="w-[300px] space-y-[20px]">
        <Skeleton className="h-[120px] w-full rounded-[12px]" />
        <Skeleton className="h-[160px] w-full rounded-[12px]" />
        <Skeleton className="h-[120px] w-full rounded-[12px]" />
      </div>
    </div>
  );
}

export function ScamThreadSkeleton() {
  return (
    <div className="flex justify-center px-[20px] pb-16 pt-4">
      <div className="flex w-full max-w-[1200px] gap-[40px]">
        <section className="w-[700px] space-y-[20px]">
          <Skeleton className="h-[20px] w-[120px] rounded-[6px]" />
          <Skeleton className="h-[26px] w-[420px] rounded-[6px]" />
          <div className="space-y-2">
            <Skeleton className="h-[16px] w-[260px] rounded-[4px]" />
            <Skeleton className="h-[16px] w-[200px] rounded-[4px]" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-[16px] w-full rounded-[4px]" />
            ))}
          </div>
          <Skeleton className="h-[38px] w-full rounded-[8px]" />
          <div className="flex gap-3">
            <Skeleton className="h-[38px] w-[160px] rounded-[8px]" />
            <Skeleton className="h-[38px] w-[160px] rounded-[8px]" />
          </div>
          <div className="rounded-[10px] border border-black/10 bg-white px-[14px] py-[10px]">
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="h-[30px] w-[90px] rounded-[8px]" />
              <Skeleton className="h-[30px] w-[90px] rounded-[8px]" />
              <Skeleton className="h-[30px] w-[90px] rounded-[8px]" />
              <Skeleton className="h-[30px] w-[120px] rounded-[8px]" />
            </div>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-[180px] w-full rounded-[12px]"
              />
            ))}
          </div>
        </section>
        <aside className="w-[300px] space-y-[20px]">
          <Skeleton className="h-[100px] w-full rounded-[10px]" />
          <Skeleton className="h-[160px] w-full rounded-[10px]" />
          <Skeleton className="h-[180px] w-full rounded-[10px]" />
        </aside>
      </div>
    </div>
  );
}
