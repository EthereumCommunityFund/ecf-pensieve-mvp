'use client';

import type { IconProps } from '@phosphor-icons/react';
import type { ComponentType } from 'react';

export type IconComponent = ComponentType<IconProps>;

type MetricPillProps = {
  icon: IconComponent;
  label?: string;
  value: string;
  showLabel?: boolean;
};

export function MetricPill({
  icon: Icon,
  label,
  value,
  showLabel = true,
}: MetricPillProps) {
  const displayValue = showLabel && label ? `${label}: ${value}` : value;

  return (
    <span className="inline-flex min-h-[32px] items-center gap-2.5 rounded-[8px] bg-[#ebebeb] px-2.5 py-1.5 text-xs font-semibold text-black/60">
      <Icon className="size-[18px]" weight="bold" />
      <span className="tracking-[0.2px]">{displayValue}</span>
    </span>
  );
}
