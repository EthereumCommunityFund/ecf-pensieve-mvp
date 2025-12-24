'use client';

import { ChatCenteredDots } from '@phosphor-icons/react';

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-[16px] border border-dashed border-black/15 bg-white px-6 py-10 text-center text-black/60">
      <ChatCenteredDots size={28} className="mx-auto text-black/30" />
      <p className="mt-3 text-sm font-semibold text-black">{title}</p>
      <p className="mt-1 text-sm text-black/60">{description}</p>
    </div>
  );
}
