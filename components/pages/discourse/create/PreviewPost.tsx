'use client';

import { CaretCircleUpIcon, ChartBarIcon } from '@phosphor-icons/react';
import { ReactNode } from 'react';

import { Button } from '@/components/base';
import MdEditor from '@/components/base/MdEditor';

import { TopicTag } from '../common/TopicTag';

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
  return (
    <article className="flex flex-col gap-[20px] rounded-[16px]">
      <TopicTag
        label={categoryLabel}
        className="inline-flex w-fit bg-[#EBEBEB]"
      />
      <div className="flex flex-col gap-[14px]">
        <h1 className="leading-1 text-[20px] font-[500] text-black">{title}</h1>
        <div className=" flex items-center gap-[10px] text-[12px] text-black">
          <span className="text-black/50">BY:</span>
          <div className="flex items-center gap-[5px]">
            <span className="size-[24px] rounded-full bg-[#D9D9D9]"></span>
            <span className="text-[14px]">{author}</span>
          </div>
          <span className=" text-black/60">{timeAgo}</span>
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
      <div className="flex flex-wrap items-center gap-[10px] text-[14px] text-black/60">
        <span className="font-semibold text-black/50">Tags:</span>
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-[6px] bg-black/5 px-[10px] py-[5px] text-xs font-[600] text-black"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="flex gap-[10px] border-t border-black/10 pt-4 ">
        <div className="inline-flex items-center gap-[10px] rounded-[8px] bg-[#EBEBEB] px-[8px] py-[4px]">
          <ChartBarIcon size={30} className="opacity-30" />
          <span className="text-[12px] font-semibold text-black/60">000</span>
        </div>
        <div className="inline-flex items-center gap-[10px] rounded-[8px] bg-[#EBEBEB] px-[8px] py-[4px]">
          <CaretCircleUpIcon size={30} className="opacity-30" />
          <span className="text-[12px] font-semibold text-black/60">000</span>
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
        <span className="font-inter inline-flex h-[42px] flex-1 items-center justify-center rounded-[5px] border border-black/10 px-[10px] text-[16px] font-[500] text-black">
          You are previewing your post
        </span>
      </div>

      <PreviewPostCard {...cardProps} />
    </div>
  );
}
