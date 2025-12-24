import { cn } from '@heroui/react';
import { cloneElement, isValidElement, ReactNode } from 'react';

import { discourseTopicOptions } from './topicOptions';

type TopicTagProps = {
  label: string;
  isScam?: boolean;
  className?: string;
  iconClassName?: string;
};

export function TopicTag({
  label,
  isScam = false,
  className,
  iconClassName,
}: TopicTagProps) {
  const normalizedLabel = label.trim().toLowerCase();

  const topic = discourseTopicOptions.find((option) => {
    const optionLabel = option.label.toLowerCase();
    const optionValue = option.value.toLowerCase();
    return optionLabel === normalizedLabel || optionValue === normalizedLabel;
  });

  if (!topic) {
    return null;
  }

  const baseIcon = topic.icon;
  let icon: ReactNode = baseIcon;

  if (isValidElement(baseIcon)) {
    icon = cloneElement(baseIcon, {
      className: cn(
        (baseIcon.props as { className?: string }).className,
        iconClassName,
      ),
    } as Record<string, unknown>);
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-[5px] rounded-[4px] border px-[8px] py-[4px] text-[13px] font-[600]',
        'border-black/10 bg-[#EBEBEB] text-black',
        className,
      )}
    >
      {icon}
      {topic.label || label}
    </span>
  );
}
