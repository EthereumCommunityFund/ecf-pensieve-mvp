'use client';

import { Avatar } from '@heroui/react';
import { Question } from '@phosphor-icons/react';
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
    <div className="rounded-2xl border border-[#e7e4df] bg-white px-6 py-5 shadow-[0_20px_45px_rgba(15,23,42,0.06)]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-md border border-black/10 bg-[#ebebeb] px-3 py-1 text-xs font-semibold text-black">
          <Question className="size-4 text-black/70" weight="bold" />
          {badgeLabel}
        </span>
        {titleAddon ? (
          <div className="ml-auto text-xs font-medium text-black/60">
            {titleAddon}
          </div>
        ) : null}
      </div>
      <div className="mt-5 space-y-5">
        <h1 className="text-[20px] font-medium leading-6 text-[#202023]">
          {title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-[0.25px] text-black/50">
          <div className="flex items-center gap-2">
            <span>BY:</span>
            <div className="flex items-center gap-2 text-sm font-normal normal-case tracking-normal text-black">
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
          <span className="text-[12px] font-semibold text-black/60">
            {author.timeAgo}
          </span>
        </div>
        <div className="space-y-3 text-[16px] leading-5 text-black/80">
          {body.map((paragraph, index) => (
            <p key={index} className="leading-5">
              {paragraph}
            </p>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-black/60">Tags:</span>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md bg-black/5 px-3 py-1 text-xs font-semibold text-black"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-3 border-t border-black/10 pt-4 text-xs font-semibold text-black/60">
          {metrics.map((metric) => (
            <MetricPill key={metric.label} {...metric} />
          ))}
        </div>
        <div className="grid gap-3 border-t border-black/10 pt-4 sm:grid-cols-2">
          <button
            type="button"
            className="h-11 rounded-md bg-[#202223] text-sm font-semibold text-white transition hover:bg-[#202223]/85"
          >
            {primaryActionLabel}
          </button>
          <button
            type="button"
            className="h-11 rounded-md border border-black/20 text-sm font-semibold text-black transition hover:bg-black/5"
          >
            {secondaryActionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
