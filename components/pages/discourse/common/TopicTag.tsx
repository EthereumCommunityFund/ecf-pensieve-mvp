import { cn } from '@heroui/react';
import { Question } from '@phosphor-icons/react';
import { cloneElement, isValidElement, ReactNode } from 'react';

import { discourseTopicOptions } from './topicOptions';

type TopicTagProps = {
  label: string;
  isScam?: boolean;
  className?: string;
};

export function TopicTag({ label, isScam = false, className }: TopicTagProps) {
  const normalizedLabel = label.trim().toLowerCase();
  const topic = discourseTopicOptions.find((option) => {
    const optionLabel = option.label.toLowerCase();
    const optionValue = option.value.toLowerCase();
    return optionLabel === normalizedLabel || optionValue === normalizedLabel;
  });

  const fallbackIcon = (
    <Question size={18} weight="fill" className="text-black/60" />
  );

  const baseIcon = topic?.icon ?? fallbackIcon;
  let icon: ReactNode = baseIcon;

  if (isValidElement(baseIcon)) {
    icon = cloneElement(baseIcon, {
      className: cn((baseIcon.props as { className?: string }).className),
    } as Record<string, unknown>);
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-[5px] rounded-[4px] border px-[8px] py-[4px] text-[13px] font-[600]',
        'border-black/10 bg-[#f5f5f5] text-black',
        className,
      )}
    >
      {icon}
      {label}
    </span>
  );
}
