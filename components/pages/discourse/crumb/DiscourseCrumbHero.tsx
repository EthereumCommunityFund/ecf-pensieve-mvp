'use client';

import { Avatar } from '@heroui/react';
import { Question } from '@phosphor-icons/react';
import type { ReactNode } from 'react';

import { Button } from '@/components/base';
import MdEditor from '@/components/base/MdEditor';

import { serializeEditorValue } from '../detail/PostDetailCard';

import { MetricPill, type IconComponent } from './MetricPill';

export type HeroMetric = {
  icon: IconComponent;
  label?: string;
  value: string;
  showLabel?: boolean;
};

export type HeroActionConfig = {
  label: string;
  onClick?: () => void;
  isDisabled?: boolean;
};

export type HeroBadgeProps = {
  label: string;
  icon?: IconComponent;
  tone?: 'neutral' | 'brand';
  className?: string;
};

export type HeroAuthorMetaProps = {
  author: {
    name: string;
    initial: string;
    timeAgo: string;
    avatarUrl?: string;
  };
};

export type HeroTagListProps = {
  tags: string[];
  label?: string;
};

export type HeroMetricListProps = {
  metrics: HeroMetric[];
};

export type HeroActionButtonsProps = {
  primary: HeroActionConfig;
  secondary?: HeroActionConfig;
};

export type DiscourseCrumbHeroProps = {
  badgeLabel: string;
  badgeIcon?: IconComponent;
  badgeTone?: HeroBadgeProps['tone'];
  title: string;
  body: string;
  tags: string[];
  author: HeroAuthorMetaProps['author'];
  metrics: HeroMetric[];
  primaryAction: HeroActionConfig;
  secondaryAction?: HeroActionConfig;
  titleAddon?: ReactNode;
};

export function DiscourseCrumbHero({
  badgeLabel,
  badgeIcon = Question,
  badgeTone = 'neutral',
  title,
  body,
  tags,
  author,
  metrics,
  primaryAction,
  secondaryAction,
  titleAddon,
}: DiscourseCrumbHeroProps) {
  return (
    <section className="rounded-2xl border border-[#e7e4df] bg-white p-6 shadow-[0_25px_65px_rgba(15,23,42,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <HeroBadge label={badgeLabel} icon={badgeIcon} tone={badgeTone} />
        {titleAddon ? (
          <div className="text-xs font-medium text-black/60">{titleAddon}</div>
        ) : null}
      </div>
      <div className="mt-5 space-y-5">
        <header className="space-y-3">
          <h1 className="text-[20px] font-semibold leading-6 text-[#202023]">
            {title}
          </h1>
          <HeroAuthorMeta author={author} />
        </header>
        <MdEditor
          value={serializeEditorValue(body)}
          mode="readonly"
          hideMenuBar
          className={{
            base: 'border-none bg-transparent p-0',
            editorWrapper: 'p-0',
            editor:
              'prose prose-base max-w-none text-[16px] leading-6 text-black/80',
          }}
        />
        <HeroTagList tags={tags} />
        <HeroMetricList metrics={metrics} />
        <HeroActionButtons
          primary={primaryAction}
          secondary={secondaryAction}
        />
      </div>
    </section>
  );
}

export function HeroBadge({
  label,
  icon: Icon = Question,
  tone = 'neutral',
  className = '',
}: HeroBadgeProps) {
  const toneStyles =
    tone === 'brand'
      ? 'border-[#cfe8dd] bg-[#f4fcf8] text-[#1b9573]'
      : 'border-black/10 bg-[#ebebeb] text-black';

  return (
    <span
      className={`inline-flex min-h-[32px] items-center gap-2 rounded-md border px-3 py-1 text-xs font-semibold ${toneStyles} ${className}`}
    >
      {Icon ? <Icon className="size-4 text-current" weight="bold" /> : null}
      {label}
    </span>
  );
}

export function HeroAuthorMeta({ author }: HeroAuthorMetaProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-[0.25px] text-black/50">
      <div className="flex items-center gap-2">
        <span>BY:</span>
        <div className="flex items-center gap-2 text-sm font-normal normal-case tracking-normal text-black">
          <Avatar
            name={author.name}
            src={author.avatarUrl}
            showFallback
            getInitials={() => author.initial}
            classNames={{
              base: 'size-6 min-w-6 rounded-full bg-black/5 text-[11px] font-semibold text-black',
              fallback: 'text-[11px] font-semibold text-black',
              img: 'object-cover',
            }}
          />
          {author.name}
        </div>
      </div>
      <span className="text-[12px] font-semibold text-black/60">
        {author.timeAgo}
      </span>
    </div>
  );
}

export function HeroTagList({ tags, label = 'Tags:' }: HeroTagListProps) {
  if (!tags.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {label ? (
        <span className="text-sm font-medium text-black/60">{label}</span>
      ) : null}
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
  );
}

export function HeroMetricList({ metrics }: HeroMetricListProps) {
  if (!metrics.length) return null;

  return (
    <div className="flex flex-wrap gap-3 border-t border-black/10 pt-4 text-xs font-semibold text-black/60">
      {metrics.map((metric, index) => (
        <MetricPill
          key={`${metric.label ?? metric.value}-${index}`}
          icon={metric.icon}
          label={metric.label}
          value={metric.value}
          showLabel={metric.showLabel}
        />
      ))}
    </div>
  );
}

export function HeroActionButtons({
  primary,
  secondary,
}: HeroActionButtonsProps) {
  if (!primary?.label && !secondary?.label) {
    return null;
  }

  return (
    <div
      className={`grid gap-3 border-t border-black/10 pt-4 ${
        secondary ? 'sm:grid-cols-2' : 'sm:grid-cols-1'
      }`}
    >
      {primary?.label ? (
        <Button
          className="h-11 rounded-md bg-[#202223] text-sm font-semibold text-white transition hover:bg-[#202223]/85"
          onClick={primary.onClick}
          isDisabled={primary.isDisabled}
          type="button"
        >
          {primary.label}
        </Button>
      ) : null}
      {secondary?.label ? (
        <Button
          className="h-11 rounded-md border border-black/20 text-sm font-semibold text-black transition hover:bg-black/5"
          onClick={secondary.onClick}
          isDisabled={secondary.isDisabled}
          type="button"
        >
          {secondary.label}
        </Button>
      ) : null}
    </div>
  );
}
