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
  error?: string;
};

export function CategorySelector({
  label = 'Category',
  description = 'select a category this issue falls under',
  value,
  onChange,
  options = discourseTopicOptions,
  error,
}: CategorySelectorProps) {
  const currentOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const formatRequirement = (cp?: number) =>
    typeof cp === 'number' ? `${cp.toLocaleString()} CP` : undefined;

  const renderSelectedValue = (items: { textValue?: string }[]) => {
    if (!items.length || !currentOption) return null;
    return (
      <div className="flex items-center gap-2 text-[15px] text-black">
        {currentOption.icon}
        <span className="truncate">
          {items[0]?.textValue || currentOption.label}
        </span>
      </div>
    );
  };

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
        placeholder="Select a category"
        className="w-full"
        classNames={{
          trigger:
            'flex h-10 w-full items-center justify-between rounded-[8px] border border-[#d9d5cc] bg-black/5 px-4 text-left text-[14px] text-black/80',
        }}
        selectorIcon={<CaretDown size={16} className="text-black/60" />}
        renderValue={renderSelectedValue}
      >
        {options.map((option) => (
          <SelectItem
            key={option.value}
            textValue={option.label}
            className="hover:bg-[#F5F5F5]"
          >
            <div className="flex items-center justify-between gap-2 text-[15px] text-black">
              <span className="flex items-center gap-2">
                {option.icon}
                {option.label}
              </span>
              {option.cpRequirement !== undefined ? (
                <span className="rounded-[5px] bg-[#F5F5F5] px-[4px] py-[2px] text-[13px] text-black/80">
                  CP Requirement: {formatRequirement(option.cpRequirement)}
                </span>
              ) : null}
            </div>
          </SelectItem>
        ))}
      </Select>
      {error ? <p className="text-xs text-[#d14343]">{error}</p> : null}
    </div>
  );
}
