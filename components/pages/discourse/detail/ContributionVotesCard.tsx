'use client';

import { CaretCircleUpIcon } from '@phosphor-icons/react';

type ContributionVotesCardProps = {
  current: number;
  target: number;
  label: string;
  helper: string;
  status: string;
  isScam: boolean;
};

export function ContributionVotesCard({
  current,
  target,
  label,
  helper,
  status,
  isScam,
}: ContributionVotesCardProps) {
  const accentClass = isScam ? 'text-[#c64b13]' : 'text-black/70';
  const thresholdLabel = status ? `${status} Threshold` : 'Threshold';

  return (
    <section className="rounded-[10px] border border-black/10 bg-white p-[14px] shadow-sm">
      <header className="flex items-center gap-[10px] text-[14px] font-semibold text-black/80">
        <CaretCircleUpIcon size={20} weight="fill" className={accentClass} />
        <span className="leading-[1.2]">Contribution Point Votes</span>
      </header>
      <p className="mt-[6px] text-[18px] font-semibold leading-none text-black/60">
        {current.toLocaleString()}
      </p>

      <div className="mt-[10px] border-t border-black/10 pt-[10px]">
        <p className="text-[14px] font-semibold text-black/80">
          {thresholdLabel}:
        </p>
        {helper ? (
          <p className="mt-[2px] text-[12px] leading-[1.3] text-black/60">
            {helper}
          </p>
        ) : null}
        <p className="mt-[6px] text-[14px] font-semibold text-black">
          {target.toLocaleString()}{' '}
          <span className="text-[10px] uppercase tracking-[0.15em] text-black/60">
            CP
          </span>
        </p>
      </div>
    </section>
  );
}
