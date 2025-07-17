'use client';

import { Input } from '@heroui/react';
import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function SearchBox({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search...',
  autoFocus = false,
}: SearchBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSubmit(value);
    }
  };

  const handleClear = () => {
    onChange('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative w-full">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        // startContent={<Search className="size-4 text-gray-400" />}
        endContent={
          value && (
            <button
              onClick={handleClear}
              className="flex size-6 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
            >
              <X className="size-4 text-gray-400" />
            </button>
          )
        }
        className="w-full"
        classNames={{
          inputWrapper:
            'bg-gray-100 border-gray-200 rounded-lg px-3 py-2 h-auto data-[focus=true]:border-gray-200 data-[hover=true]:border-gray-200',
          input: 'text-sm',
        }}
        variant="bordered"
        size="lg"
      />
    </div>
  );
}
