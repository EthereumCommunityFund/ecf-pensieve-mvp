'use client';

import { Button } from '@heroui/react';
import { Plus } from '@phosphor-icons/react';

interface SearchEmptyStateProps {
  query: string;
  onProposeClick: (query: string) => void;
}

export default function SearchEmptyState({
  query,
  onProposeClick,
}: SearchEmptyStateProps) {
  return (
    <div className="space-y-2.5 p-4">
      {/* Empty State Message */}
      <div className="flex items-stretch gap-3.5">
        <div className="flex-1">
          <div className="rounded-lg bg-white">
            <p className="text-sm text-black opacity-70">
              This project doesn't exist on Pensieve.
            </p>
          </div>
        </div>
      </div>

      {/* Propose Button */}
      <Button
        className="w-full justify-start rounded-md bg-gray-100 px-2.5 py-2 text-sm font-semibold text-black opacity-80 hover:bg-gray-200"
        startContent={<Plus className="size-6" strokeWidth={1.5} />}
        onPress={() => onProposeClick(query)}
      >
        Propose a Project
      </Button>
    </div>
  );
}
