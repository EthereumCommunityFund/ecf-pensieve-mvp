'use client';

import { Button } from '@/components/base';

export type ParticipationStep = {
  title: string;
  description: string;
  actions: string[];
};

type ParticipationCardProps = {
  steps: ParticipationStep[];
};

export function ParticipationCard({ steps }: ParticipationCardProps) {
  return (
    <div className="rounded-[10px] border border-black/10 bg-white p-3.5">
      <p className="text-sm font-semibold text-black">How to participate?</p>
      <div className="mt-3.5 space-y-3.5">
        {steps.map((step) => (
          <div key={step.title} className="space-y-2.5">
            <div>
              <p className="text-[12px] font-semibold text-black/80">
                {step.title}:
              </p>
              <p className="mt-1 text-[13px] text-black/60">
                {step.description}
              </p>
            </div>
            <div className="space-y-2">
              {step.actions.map((action) => (
                <Button
                  key={action}
                  type="button"
                  className="w-full rounded-[5px] border border-black/10 px-2.5 py-1.5 text-[13px] font-medium text-[#222] shadow-none hover:bg-black/5"
                >
                  {action}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
