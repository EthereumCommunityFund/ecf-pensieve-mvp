'use client';

import { ArrowSquareOut, UserCircle } from '@phosphor-icons/react';

import { Button } from '@/components/base';

import { QuickAction } from '../common/threadData';

type QuickActionsCardProps = {
  actions: QuickAction[];
};

export function QuickActionsCard({ actions }: QuickActionsCardProps) {
  if (!actions?.length) return null;

  return (
    <div className="rounded-[16px] border border-[#e6dfd5] bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-black/70">Quick actions</p>
      <div className="mt-4 space-y-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            className="flex w-full items-center gap-3 rounded-[12px] border border-black/10 px-4 py-3 text-left transition hover:-translate-y-0.5 hover:bg-black/5"
          >
            <UserCircle size={20} className="text-black/60" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-black">{action.label}</p>
              <p className="text-xs text-black/60">{action.helper}</p>
            </div>
            <ArrowSquareOut size={16} className="text-black/40" />
          </Button>
        ))}
      </div>
    </div>
  );
}
