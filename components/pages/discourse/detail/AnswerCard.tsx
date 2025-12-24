'use client';

import { CheckCircle } from '@phosphor-icons/react';

import { Button } from '@/components/base';

import { UserAvatar } from '../common/UserAvatar';
import { SentimentSelector } from '../common/sentiment/SentimentSelector';
import {
  defaultSentimentDisplay,
  sentimentDefinitions,
} from '../common/sentiment/sentimentConfig';
import { AnswerItem } from '../common/threadData';
import { SENTIMENT_KEYS } from '../utils/threadTransforms';

type AnswerCardProps = {
  answer: AnswerItem;
  isScam: boolean;
  onSupport: (answerId: number) => void;
  onWithdraw: (answerId: number) => void;
  onSentimentChange: (answerId: number, value: string) => void;
  supportPending?: boolean;
  withdrawPending?: boolean;
};

export function AnswerCard({
  answer,
  isScam,
  onSupport,
  onWithdraw,
  onSentimentChange,
  supportPending = false,
  withdrawPending = false,
}: AnswerCardProps) {
  const sentimentDefinition =
    sentimentDefinitions[answer.sentimentLabel] || defaultSentimentDisplay;
  const progress =
    answer.cpTarget && answer.cpTarget > 0
      ? Math.min(100, Math.round((answer.cpSupport / answer.cpTarget) * 100))
      : undefined;

  return (
    <article className="rounded-[16px] border border-black/10 bg-white p-5 shadow-[0_12px_25px_rgba(15,23,42,0.05)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <UserAvatar
            name={answer.author}
            src={answer.authorAvatar}
            size={40}
            className="bg-black/5"
            fallbackClassName="text-sm font-semibold text-black/70"
          />
          <div>
            <p className="text-[15px] font-semibold text-black">
              {answer.author}
            </p>
            <p className="text-xs uppercase tracking-[0.18em] text-black/50">
              {answer.role}
            </p>
            <p className="text-xs text-black/60">{answer.createdAt}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-black/70">
          {answer.isAccepted ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#e2f7ef] px-3 py-1 text-[#1c9e70]">
              <CheckCircle size={16} weight="fill" />
              Accepted Answer
            </span>
          ) : null}
          {answer.statusTag ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#fff3e6] px-3 py-1 text-[#c46a1d]">
              {answer.statusTag}
            </span>
          ) : null}
          {isScam ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#fff0ee] px-3 py-1 text-[#b53c1d]">
              Counter Claim
            </span>
          ) : null}
        </div>
      </div>
      <p className="mt-4 text-[15px] leading-relaxed text-black/80">
        {answer.body}
      </p>
      <div className="mt-4 space-y-2 rounded-[12px] bg-black/5 px-4 py-3 text-sm text-black/70">
        <p className="font-semibold">
          CP Support:{' '}
          <span className="text-black">
            {answer.cpSupport.toLocaleString()} CP
          </span>
          {answer.cpTarget ? (
            <span className="text-black/50">
              {' '}
              / {answer.cpTarget.toLocaleString()} CP
            </span>
          ) : null}
        </p>
        {progress !== undefined ? (
          <div className="h-2 rounded-full bg-white/40">
            <div
              className="h-full rounded-full bg-black/70"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-black/60">
        <span className="inline-flex items-center gap-2 font-semibold text-black">
          <sentimentDefinition.Icon
            size={18}
            weight="fill"
            style={{ color: sentimentDefinition.color }}
          />
          {sentimentDefinition.label}
          <span className="text-black/60">({answer.sentimentVotes} votes)</span>
        </span>
        <span className="text-xs uppercase tracking-[0.18em] text-black/40">
          {answer.commentsCount} comments
        </span>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button
            className="rounded-full border border-black/15 px-4 py-1.5 text-sm font-semibold text-black"
            onPress={() => onSupport(answer.numericId)}
            isDisabled={answer.viewerHasSupported || supportPending}
          >
            {supportPending ? 'Supporting…' : 'Support CP'}
          </Button>
          <Button
            className="rounded-full border border-black/15 px-4 py-1.5 text-sm font-semibold text-black"
            onPress={() => onWithdraw(answer.numericId)}
            isDisabled={!answer.viewerHasSupported || withdrawPending}
          >
            {withdrawPending ? 'Withdrawing…' : 'Withdraw CP'}
          </Button>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-black/60">
        <span className="font-semibold text-black">
          Share your sentiment on this answer
        </span>
        <SentimentSelector
          options={SENTIMENT_KEYS}
          value={answer.viewerSentiment ?? 'all'}
          onChange={(value) => onSentimentChange(answer.numericId, value)}
        />
      </div>
    </article>
  );
}
