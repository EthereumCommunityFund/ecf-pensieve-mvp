'use client';

import { CaretDown } from '@phosphor-icons/react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { DiscourseTopicOption, discourseTopicOptions } from './topicOptions';

type CategorySelectorProps = {
  label?: string;
  description?: string;
  value?: string;
  onChange?: (category: DiscourseTopicOption) => void;
  options?: DiscourseTopicOption[];
};

export function CategorySelector({
  label = 'Category',
  description = 'select a category this issue falls under',
  value,
  onChange,
  options = discourseTopicOptions,
}: CategorySelectorProps) {
  const currentOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="flex w-full flex-col gap-2" ref={containerRef}>
      <div>
        <p className="text-[16px] font-semibold text-black">{label}</p>
        <p className="text-sm text-black/60">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-10 w-full items-center justify-between rounded-[8px] border border-black/10 bg-black/5 px-3 text-left text-[14px] text-black/70"
      >
        <span>{currentOption ? currentOption.label : 'Select'}</span>
        <CaretDown
          className={`transition ${open ? 'rotate-180' : ''}`}
          size={16}
        />
      </button>
      {open ? (
        <div className="mt-2 max-h-[320px] w-full overflow-y-auto rounded-[10px] border border-black/10 bg-white p-2 shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange?.(option);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-[6px] px-2 py-1.5 text-left text-[15px] ${
                option.value === currentOption?.value
                  ? 'bg-black/[0.04] text-black'
                  : 'text-black/80 hover:bg-black/[0.04]'
              }`}
            >
              <span className="flex items-center gap-2 text-[15px]">
                {option.icon}
                {option.label}
              </span>
              {option.cpRequirement ? (
                <span className="rounded-[4px] bg-black/[0.05] px-2 py-0.5 text-xs text-black/70">
                  CP Requirement: {option.cpRequirement}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
