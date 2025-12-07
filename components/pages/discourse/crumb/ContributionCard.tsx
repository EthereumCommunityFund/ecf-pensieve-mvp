'use client';

import { CaretCircleUp } from '@phosphor-icons/react';

import { REDRESSED_SUPPORT_THRESHOLD } from '@/constants/discourse';

type ContributionCardProps = {
  voteCount: number;
};

export function ContributionCard({ voteCount }: ContributionCardProps) {
  return (
    <div className="space-y-[14px] rounded-[10px] border border-black/10 bg-white p-[14px]">
      <div className="flex items-center gap-2 text-sm font-semibold text-black/80">
        <CaretCircleUp className="size-5 text-black/70" />
        Contribution Point Votes
      </div>
      <p className="text-[18px] font-semibold text-black/60">{voteCount}</p>
      <div className="border-t border-black/10 pt-[10px] text-black">
        <p className="text-[13px] font-semibold text-black/80">
          Redressed Threshold:
        </p>
        <div className="mt-1 flex items-baseline gap-1 font-semibold text-black/80">
          <span className="text-[14px]">{REDRESSED_SUPPORT_THRESHOLD}</span>
          <span className="text-[10px] uppercase tracking-[0.08em]">CP</span>
        </div>
        <p className="mt-2 text-[11px] font-medium text-black/50">
          Required amount of CP support for an answer to be considered
          redressed.
        </p>
      </div>
    </div>
  );
}
