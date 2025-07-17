'use client';

import { Button } from '@heroui/react';
import { Clock, X } from 'lucide-react';

interface SearchHistoryProps {
  history: string[];
  onHistoryClick: (query: string) => void;
  onClearHistory: () => void;
}

export default function SearchHistory({
  history,
  onHistoryClick,
  onClearHistory,
}: SearchHistoryProps) {
  return (
    <div className="space-y-1">
      {history.map((query, index) => (
        <div
          key={index}
          className="group flex cursor-pointer items-center justify-between rounded-lg p-2 hover:bg-gray-50"
          onClick={() => onHistoryClick(query)}
        >
          <div className="flex items-center gap-3">
            <Clock className="size-4 text-gray-400" />
            <span className="text-gray-700">{query}</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            isIconOnly
            className="opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              // Remove this item from history
              const newHistory = history.filter((_, i) => i !== index);
              localStorage.setItem('searchHistory', JSON.stringify(newHistory));
              window.location.reload(); // Simple refresh to update state
            }}
          >
            <X className="size-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}
