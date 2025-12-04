'use client';

import { Button } from '@/components/base';

import {
  defaultSentimentDisplay,
  sentimentDefinitions,
} from '../common/setiment/sentimentConfig';
import { CommentItem } from '../common/threadData';

type CommentCardProps = {
  comment: CommentItem;
};

export function CommentCard({ comment }: CommentCardProps) {
  const sentimentDefinition =
    sentimentDefinitions[comment.sentimentLabel] || defaultSentimentDisplay;

  return (
    <article className="rounded-[16px] border border-black/10 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-black/5 text-sm font-semibold text-black/70">
            {comment.author[0]}
          </div>
          <div>
            <p className="text-[15px] font-semibold text-black">
              {comment.author}
            </p>
            <p className="text-xs uppercase tracking-[0.18em] text-black/50">
              {comment.role}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-black/60">
          <span>{comment.createdAt}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2 py-1 text-black/70">
            <sentimentDefinition.Icon
              size={14}
              weight="fill"
              style={{ color: sentimentDefinition.color }}
            />
            {sentimentDefinition.label}
          </span>
        </div>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-black/80">
        {comment.body}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-black/60">
        <Button className="rounded-full border border-black/15 px-4 py-1.5 font-semibold text-black">
          React
        </Button>
        <Button className="rounded-full border border-black/15 px-4 py-1.5 font-semibold text-black">
          Reply
        </Button>
      </div>
    </article>
  );
}
