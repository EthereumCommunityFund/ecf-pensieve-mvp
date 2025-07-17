'use client';

import { Kbd } from '@heroui/react';
import { Search } from 'lucide-react';

interface StaticSearchBoxProps {
  onClick: () => void;
}

export default function StaticSearchBox({ onClick }: StaticSearchBoxProps) {
  return (
    <button
      onClick={onClick}
      className="mobile:w-8 mobile:justify-center flex h-8 w-[191px] items-center justify-between rounded-lg bg-gray-100 px-2.5 transition-colors hover:bg-gray-200"
      title="Search (Cmd+K)"
    >
      <div className="mobile:gap-0 flex items-center gap-2">
        <Search className="size-5 text-black opacity-30" strokeWidth={1.67} />
        <span className="mobile:hidden whitespace-nowrap text-sm font-semibold text-black opacity-30">
          Search projects
        </span>
      </div>

      <div className="mobile:hidden">
        <Kbd className="bg-gray-200 text-xs font-semibold text-black opacity-40">
          ⌘K
        </Kbd>
      </div>
    </button>
  );
}
