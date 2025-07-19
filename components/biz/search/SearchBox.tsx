'use client';

import { Input } from '@heroui/react';
import { X } from '@phosphor-icons/react';
import { useEffect, useRef } from 'react';

import { Button } from '@/components/base';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onClose?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function SearchBox({
  value,
  onChange,
  onSubmit,
  onClose,
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
    } else if (e.key === 'Escape') {
      onClose?.();
    }
  };

  const handleClear = () => {
    onChange('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleEscape = () => {
    onClose?.();
  };

  return (
    <div className="relative w-full">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        endContent={
          <div className="flex items-center gap-2">
            {value && (
              <button
                onClick={handleClear}
                className="flex size-6 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
              >
                <X className="size-4 text-gray-400" />
              </button>
            )}
            <Button
              onClick={handleEscape}
              className="h-[22px] min-w-0 rounded-[5px] border-none bg-[#F5F5F5] px-[8px] text-[12px] text-black/40"
            >
              Esc
            </Button>
          </div>
        }
        variant="flat"
        size="lg"
        classNames={{
          base: 'bg-transparent border-none',
          inputWrapper:
            'bg-transparent shadow-none group-data-[focus-visible=true]:ring-0 group-data-[focus-visible=true]:ring-offset-0 group-data-[hover=true]:bg-transparent group-data-[focus=true]:bg-transparent data-[hover=true]:bg-transparent data-[focus=true]:bg-transparent',
          input: 'bg-transparent',
        }}
      />
    </div>
  );
}
