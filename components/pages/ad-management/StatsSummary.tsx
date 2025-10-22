'use client';

import { cn } from '@heroui/react';

export interface StatsSummaryItem {
  id: string;
  label: string;
  value: string;
}

export interface StatsSummaryProps {
  items: StatsSummaryItem[];
  className?: string;
}

export default function StatsSummary({ items, className }: StatsSummaryProps) {
  return (
    <div
      className={cn('flex justify-start items-center gap-[20px]', className)}
    >
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            'bg-white border border-black/10 rounded-[5px] px-[20px] py-[16px] transition-shadow duration-200 flex flex-col gap-[5px]',
          )}
        >
          <p className="text-[16px] leading-[19px] text-black/60">
            {item.label}
          </p>

          <p className="text-[18px] font-[600] leading-[22px] text-black/80">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
