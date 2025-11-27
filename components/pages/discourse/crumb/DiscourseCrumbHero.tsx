'use client';

import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { Avatar } from '@heroui/react';
import type { ReactNode } from 'react';

import { MetricPill, type IconComponent } from './MetricPill';

export type HeroMetric = {
  icon: IconComponent;
  label: string;
  value: string;
};

export type DiscourseCrumbHeroProps = {
  badgeLabel: string;
  title: string;
  body: string[];
  tags: string[];
  author: {
    name: string;
    initial: string;
    timeAgo: string;
  };
  metrics: HeroMetric[];
  primaryActionLabel: string;
  secondaryActionLabel: string;
  titleAddon?: ReactNode;
};

export function DiscourseCrumbHero({
  badgeLabel,
  title,
  body,
  tags,
  author,
  metrics,
  primaryActionLabel,
  secondaryActionLabel,
  titleAddon,
}: DiscourseCrumbHeroProps) {
  return (
    <div className="rounded-2xl border border-[#e7e4df] bg-white px-7 py-6 shadow-[0_20px_45px_rgba(15,23,42,0.06)]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-md border border-black/10 bg-[#ebebeb] px-3 py-1 text-xs font-semibold text-black">
          <QuestionMarkCircleIcon className="size-4" />
          {badgeLabel}
        </span>
        {titleAddon ? (
          <div className="text-xs text-black/60">{titleAddon}</div>
        ) : null}
      </div>
      <div className="mt-4 space-y-4">
        <h1 className="text-2xl font-semibold text-[#202023]">{title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-black/60">
          <div className="flex items-center gap-1 uppercase">
            <span>BY:</span>
            <div className="flex items-center gap-2 text-sm font-normal normal-case text-black">
              <Avatar
                name={author.name}
                showFallback
                getInitials={() => author.initial}
                classNames={{
                  base: 'size-6 min-w-6 rounded-full bg-black/5 text-[11px] font-semibold text-black',
                  fallback: 'text-[11px] font-semibold text-black',
                }}
              />
              {author.name}
            </div>
          </div>
          <span>{author.timeAgo}</span>
        </div>
        <div className="space-y-4 text-[15px] text-black/80">
          {body.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-md bg-black/5 px-3 py-1 text-xs font-semibold text-black"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 border-t border-black/10 pt-4 text-xs font-semibold text-black/60">
          {metrics.map((metric) => (
            <MetricPill key={metric.label} {...metric} />
          ))}
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <button className="h-11 min-w-[180px] flex-1 rounded-md bg-black text-sm font-semibold text-white hover:bg-black/85">
            {primaryActionLabel}
          </button>
          <button className="h-11 min-w-[180px] flex-1 rounded-md border border-black/70 text-sm font-semibold text-black hover:bg-black/5">
            {secondaryActionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
