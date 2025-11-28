'use client';

import { CaretDown } from '@phosphor-icons/react';
import { useMemo } from 'react';

import { Select, SelectItem } from '@/components/base';

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

  return (
    <div className="flex w-full flex-col gap-2">
      <div>
        <p className="text-[16px] font-semibold text-black">{label}</p>
        <p className="text-sm text-black/60">{description}</p>
      </div>
      <Select
        selectedKeys={currentOption ? [currentOption.value] : []}
        onSelectionChange={(keys) => {
          const key = Array.from(keys)[0];
          const nextOption = options.find((option) => option.value === key);
          if (nextOption) {
            onChange?.(nextOption);
          }
        }}
        aria-label="Select a discussion category"
        className="w-full"
        classNames={{
          trigger:
            'flex h-10 w-full items-center justify-between rounded-[8px] border border-[#d9d5cc] bg-black/5 px-4 text-left text-[14px] text-black/80',
        }}
        selectorIcon={<CaretDown size={16} className="text-black/60" />}
      >
        {options.map((option) => (
          <SelectItem key={option.value} textValue={option.label}>
            <div className="flex items-center justify-between gap-2 text-[15px] text-black">
              <span className="flex items-center gap-2">
                {option.icon}
                {option.label}
              </span>
              {option.cpRequirement ? (
                <span className="rounded-[4px] bg-black/[0.05] px-2 py-0.5 text-xs text-black/70">
                  CP Requirement: {option.cpRequirement}
                </span>
              ) : null}
            </div>
          </SelectItem>
        ))}
      </Select>
    </div>
  );
}
