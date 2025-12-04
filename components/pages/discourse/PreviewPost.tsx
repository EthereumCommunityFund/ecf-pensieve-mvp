'use client';

import { ReactNode } from 'react';

import { Button } from '@/components/base';
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
    <article className="flex flex-col gap-4 rounded-[16px]">
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
        <Button
          className="w-full rounded-[6px] bg-black/80 px-4 py-3 text-sm font-semibold text-white"
          isDisabled
        >
          Answer This Question
        </Button>
        <Button
          className="w-full rounded-[6px] border border-black/10 px-4 py-3 text-sm font-semibold text-black/70"
          isDisabled
        >
          Leave a Comment
        </Button>
      </div>
    </article>
  );
}

type PreviewPostProps = PreviewPostCardProps & {
  onBack?: () => void;
  actions?: ReactNode;
};

export function PreviewPost({
  onBack,
  actions,
  ...cardProps
}: PreviewPostProps) {
  return (
    <div className="tablet:max-a-auto mobile:max-w-auto mx-auto flex w-full max-w-[700px] flex-col gap-[20px] px-[10px]">
      <div className="flex items-center gap-3">
        <Button
          size={'md'}
          onPress={onBack}
          className="bg-black px-[30px] font-semibold text-white hover:bg-black/80"
        >
          Back
        </Button>
        <span className="inline-flex h-[42px] flex-1 items-center justify-center rounded-[5px] border border-black/10 px-[10px] text-sm font-medium text-black">
          You are previewing your post
        </span>
      </div>

      <PreviewPostCard {...cardProps} />
    </div>
  );
}
