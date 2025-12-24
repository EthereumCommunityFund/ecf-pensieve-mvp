'use client';

import { ReactNode } from 'react';

import { Button } from '@/components/base';

import PostDetailCard, { PostDetailCardProps } from '../detail/PostDetailCard';

type PreviewPostProps = PostDetailCardProps & {
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

      <PostDetailCard {...cardProps} isPreviewMode={true} />
    </div>
  );
}
