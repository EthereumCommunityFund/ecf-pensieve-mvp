'use client';

import type { ComponentType, SVGProps } from 'react';

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

type MetricPillProps = {
  icon: IconComponent;
  label: string;
  value: string;
};

export function MetricPill({ icon: Icon, label, value }: MetricPillProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-lg bg-[#ebebeb] px-3 py-2 text-xs font-semibold text-black/80">
      <Icon className="size-4 text-black/60" />
      {label}: {value}
    </span>
  );
}
