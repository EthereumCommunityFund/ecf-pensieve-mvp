'use client';

import { ReactNode } from 'react';

import MdEditor from '@/components/base/MdEditor';

import { discourseTopicOptions } from './topicOptions';

type PreviewPostCardProps = {
  title: string;
  author: string;
  timeAgo: string;
  contentHtml: string;
  tags: string[];
  categoryLabel: string;
};

const serializeEditorValue = (html: string) =>
  JSON.stringify({ content: html, type: 'doc', isEmpty: !html.trim() });

export function PreviewPostCard({
  title,
  author,
  timeAgo,
  contentHtml,
  tags,
  categoryLabel,
}: PreviewPostCardProps) {
  const topic =
    discourseTopicOptions.find((option) => option.label === categoryLabel) ||
    discourseTopicOptions[0];

  return (
    <article className="flex flex-col gap-4 rounded-[16px] border border-black/10 bg-white p-6 shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
      <div className="inline-flex w-fit items-center gap-2 rounded-[6px] border border-black/10 bg-black/[0.05] px-3 py-1 text-[12px] font-semibold text-black">
        {topic.icon}
        {categoryLabel}
      </div>
      <div>
        <h1 className="text-[22px] font-semibold text-[#1b1b1f]">{title}</h1>
        <div className="mt-2 text-sm uppercase tracking-[0.12em] text-black/50">
          <span className="font-semibold text-black">BY:</span>
          <span className="ml-2 text-black">{author}</span>
          <span className="ml-3 text-black/60">{timeAgo}</span>
        </div>
      </div>
      <MdEditor
        value={serializeEditorValue(contentHtml)}
        isEdit={false}
        hideMenuBar
        className={{
          base: 'border-none bg-transparent',
          editorWrapper: 'p-0',
          editor: 'prose prose-base max-w-none text-black/80',
        }}
      />
      <div className="flex flex-wrap items-center gap-2 text-sm text-black/60">
        <span className="font-semibold text-black">Tags:</span>
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-[6px] bg-black/10 px-2 py-1 text-xs text-black"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="flex gap-3 border-t border-black/10 pt-4 text-xs font-semibold text-black/60">
        <div className="inline-flex items-center gap-2 rounded-[8px] bg-black/10 px-3 py-2">
          <span>000</span>
          <span>CP</span>
        </div>
        <div className="inline-flex items-center gap-2 rounded-[8px] bg-black/10 px-3 py-2">
          <span>000</span>
          <span>Votes</span>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <button
          className="w-full rounded-[6px] bg-black/80 px-4 py-3 text-sm font-semibold text-white"
          disabled
        >
          Answer This Question (Earn CP)
        </button>
        <button
          className="w-full rounded-[6px] border border-black/10 px-4 py-3 text-sm font-semibold text-black/70"
          disabled
        >
          Leave a Comment
        </button>
      </div>
    </article>
  );
}

type PreviewPostProps = PreviewPostCardProps & {
  onBack?: () => void;
  backLabel?: string;
  headerLabel?: string;
  headerNote?: string;
  actions?: ReactNode;
};

export function PreviewPost({
  onBack,
  backLabel = 'Back',
  headerLabel = 'Preview',
  headerNote,
  actions,
  ...cardProps
}: PreviewPostProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      {(onBack || headerLabel || headerNote) && (
        <div className="flex flex-wrap items-center gap-3 text-sm text-black/60">
          {onBack ? (
            <button
              onClick={onBack}
              className="flex items-center gap-2 rounded-md px-2 py-1 font-semibold text-black transition hover:bg-black/5"
            >
              ← {backLabel}
            </button>
          ) : null}
          {headerLabel ? (
            <span className="font-semibold text-black">{headerLabel}</span>
          ) : null}
          {headerNote ? <span>{headerNote}</span> : null}
        </div>
      )}

      <PreviewPostCard {...cardProps} />

      {actions ? (
        <div className="flex flex-wrap items-center gap-3">{actions}</div>
      ) : null}
    </div>
  );
}
