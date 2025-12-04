'use client';

import type { ReactNode } from 'react';

import { Button } from '@/components/base';
import { CircleXIcon, FunnelSimpleIcon, SearchIcon } from '@/components/icons';
import { CustomCheckbox } from '@/components/pages/project/filterAndSort/CustomCheckbox';

import type { DiscourseTopicOption } from '../common/topicOptions';

type TopicsSidebarProps = {
  title?: string;
  searchPlaceholder?: string;
  topics: DiscourseTopicOption[];
  selectedTopics?: string[];
  onTopicToggle?: (topic: string, selected: boolean) => void;
  onClear?: () => void;
  onCreateThread?: () => void;
  footer?: ReactNode;
};

export function TopicsSidebar({
  title = 'Topics',
  searchPlaceholder = 'Search threads',
  topics,
  selectedTopics = [],
  onTopicToggle,
  onClear,
  onCreateThread,
  footer,
}: TopicsSidebarProps) {
  const hasSelectedTopics = selectedTopics.length > 0;
  const webkitScrollbarClass = 'custom-scrollbar';
  const scrollbarStyles = {
    scrollbarWidth: 'thin' as const,
    scrollbarColor: '#E1E1E1 transparent',
  };

  return (
    <div className="flex w-full flex-col gap-4 rounded-[10px] px-[10px]">
      <div className="relative h-[32px]">
        <SearchIcon
          width={18}
          height={18}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/30"
        />
        <input
          placeholder={searchPlaceholder}
          className="size-full rounded-[8px] bg-black/5 pl-9 pr-3 text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-1 focus:ring-black/20"
        />
      </div>

      <Button
        onPress={() => onCreateThread?.()}
        className="h-10 w-full rounded-[5px] bg-black text-[13px] font-semibold text-white transition hover:bg-black/90"
      >
        Create a Thread
      </Button>

      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-black/10 pb-2">
          <div className="flex items-center gap-1.5">
            <FunnelSimpleIcon
              width={18}
              height={18}
              className="text-black/60"
            />
            <span className="text-[14px] font-semibold text-black/60">
              {title}
            </span>
            {hasSelectedTopics ? (
              <span className="flex h-[18px] min-w-[20px] items-center justify-center rounded-[2px] bg-[#1E1E1E] px-1.5 text-[13px] font-semibold text-white">
                {selectedTopics.length}
              </span>
            ) : null}
          </div>
          {hasSelectedTopics ? (
            <Button
              className="inline-flex h-[20px] items-center gap-1.5 border-none bg-transparent p-0 text-[13px] text-black/50 hover:bg-transparent"
              onPress={() => onClear?.()}
            >
              Clear this filter
              <CircleXIcon width={18} height={18} className="text-black" />
            </Button>
          ) : null}
        </div>

        <div className="relative">
          <div
            className={`max-h-[420px] space-y-[5px] overflow-y-auto pr-2 ${webkitScrollbarClass}`}
            style={scrollbarStyles}
          >
            {topics.map((topic) => {
              const isSelected = selectedTopics.includes(topic.value);
              return (
                <Button
                  key={topic.value}
                  onPress={() => onTopicToggle?.(topic.value, !isSelected)}
                  className="flex h-[34px] w-full items-center justify-between rounded-[5px] border-none px-2 text-left hover:bg-[#EBEBEB]/60"
                >
                  <span className="flex items-center gap-3 text-[14px] text-black/70">
                    {topic.icon ?? null}
                    {topic.label}
                  </span>
                  <CustomCheckbox checked={isSelected} size={20} />
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {footer}
    </div>
  );
}
