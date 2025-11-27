'use client';

import type { IconProps } from '@phosphor-icons/react';
import type { ComponentType } from 'react';

export type IconComponent = ComponentType<IconProps>;

type MetricPillProps = {
  icon: IconComponent;
  label: string;
  value: string;
};

export function MetricPill({ icon: Icon, label, value }: MetricPillProps) {
  const displayValue = value ? `${label}: ${value}` : label;

  return (
    <span className="inline-flex items-center gap-3 rounded-xl bg-[#ebebeb] px-3 py-2 text-[13px] font-semibold text-black/70">
      <span className="flex size-8 items-center justify-center rounded-full bg-white/60 text-black/60">
        <Icon className="size-5" weight="bold" />
      </span>
      <span className="tracking-[0.2px]">{displayValue}</span>
    </span>
  );
}
