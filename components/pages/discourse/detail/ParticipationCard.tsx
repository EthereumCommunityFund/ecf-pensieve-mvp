'use client';

import { BookBookmark, Lightning } from '@phosphor-icons/react';

type ParticipationCardProps = {
  supportSteps: string[];
  counterSteps: string[];
  isScam: boolean;
};

export function ParticipationCard({
  supportSteps,
  counterSteps,
  isScam,
}: ParticipationCardProps) {
  return (
    <div className="rounded-[16px] border border-[#e6dfd5] bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-black/70">How to participate</p>
      <div className="mt-4 space-y-4">
        <div>
          <div className="flex items-center gap-2 text-[13px] font-semibold text-black">
            <Lightning size={18} weight="fill" className="text-[#f78f1e]" />
            {isScam ? 'Support Main Claim' : 'Support Answer'}
          </div>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-black/70">
            {supportSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>
        <div className="border-t border-dashed border-black/10 pt-4">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-black">
            <BookBookmark size={18} weight="fill" className="text-[#4c6ef5]" />
            {isScam ? 'Counter Claim' : 'Add Discussion'}
          </div>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-black/70">
            {counterSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
