'use client';

import { Skeleton } from '@heroui/react';
import { useCallback, useMemo, useState } from 'react';

import { Button } from '@/components/base';

import { SentimentVoteButton } from '../common/sentiment/SentimentVoteButton';
import { SentimentKey } from '../common/sentiment/sentimentConfig';

type QuickActionsCardProps = {
  onUpvotePost?: () => void;
  onLeaveComment?: () => void;
  onAnswerComplaint?: () => void;
  onSelectSentiment?: (value: SentimentKey) => Promise<void> | void;
  sentimentVotes?: number;
  sentimentValue?: SentimentKey | null;
  sentimentPending?: boolean;
  requireAuth?: () => boolean;
  disableUpvote?: boolean;
  upvoteLoading?: boolean;
};

export function QuickActionsCard({
  onUpvotePost,
  onLeaveComment,
  onAnswerComplaint,
  onSelectSentiment,
  sentimentVotes = 0,
  sentimentValue,
  sentimentPending = false,
  requireAuth,
  disableUpvote = false,
  upvoteLoading = false,
}: QuickActionsCardProps) {
  const [sentimentOpen, setSentimentOpen] = useState(false);

  const sentimentValueProp = useMemo(
    () => sentimentValue ?? undefined,
    [sentimentValue],
  );

  const handleUpvote = useCallback(() => {
    if (disableUpvote) return;
    onUpvotePost?.();
  }, [disableUpvote, onUpvotePost]);

  const handleOpenComment = useCallback(() => {
    onLeaveComment?.();
  }, [onLeaveComment]);

  const handleOpenSentiment = useCallback(() => {
    if (requireAuth && !requireAuth()) return;
    setSentimentOpen(true);
  }, [requireAuth]);

  const handleSentimentSelect = useCallback(
    async (value: SentimentKey) => {
      await onSelectSentiment?.(value);
    },
    [onSelectSentiment],
  );

  const handleSentimentOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setSentimentOpen(false);
    }
  }, []);

  const handleAnswerComplaint = useCallback(() => {
    onAnswerComplaint?.();
  }, [onAnswerComplaint]);

  return (
    <section className="rounded-[10px] border border-black/10 bg-white p-[14px] shadow-sm">
      <h3 className="text-[14px] font-semibold text-black">
        How to participate?
      </h3>

      <div className="mt-[10px] space-y-[14px]">
        <div>
          <p className="text-[12px] font-semibold text-black/80">
            Discuss and Support:
          </p>
          <p className="mt-[2px] text-[13px] leading-[1.35] text-black/60">
            You can comment and reply to comments, including voting on answers
            that help gear the conversation toward a beneficial result.
          </p>
          <div className="mt-[6px] flex flex-col gap-[6px]">
            <Button
              onPress={handleUpvote}
              className="h-[30px] font-[400]"
              isDisabled={disableUpvote}
              isLoading={upvoteLoading}
            >
              Upvote Post
            </Button>
            <Button onPress={handleOpenComment} className="h-[30px] font-[400]">
              Leave a Comment
            </Button>
            {sentimentOpen ? (
              <div className="flex h-[30px] w-full justify-center">
                <SentimentVoteButton
                  totalVotes={sentimentVotes}
                  value={sentimentValueProp}
                  isLoading={sentimentPending}
                  disabled={!onSelectSentiment}
                  onSelect={handleSentimentSelect}
                  requireAuth={requireAuth}
                  defaultOpen
                  onOpenChange={handleSentimentOpenChange}
                />
              </div>
            ) : (
              <Button
                onPress={handleOpenSentiment}
                className="h-[30px] font-[400]"
                isDisabled={!onSelectSentiment}
              >
                Leave Your Sentiment
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-[5px]">
          <p className="text-[12px] font-semibold text-black/80">
            Give Answers:
          </p>
          <p className="mt-[2px] text-[13px] leading-[1.35] text-black/60">
            If you have an answer that remedies or provides sufficient
            information to the original poster, you can leave an answer.
          </p>
          <Button
            onPress={handleAnswerComplaint}
            className="h-[30px] font-[400]"
          >
            Answer Complaint
          </Button>
        </div>
      </div>
    </section>
  );
}

export function QuickActionsCardSkeleton() {
  return (
    <section className="rounded-[10px] border border-black/10 bg-white p-[14px] shadow-sm">
      <Skeleton className="h-[16px] w-[160px] rounded-[6px]" />

      <div className="mt-[12px] space-y-[14px]">
        <div className="space-y-[6px]">
          <Skeleton className="h-[14px] w-[140px] rounded-[6px]" />
          <Skeleton className="h-[13px] w-full rounded-[6px]" />
          <Skeleton className="h-[13px] w-4/5 rounded-[6px]" />
          <div className="mt-[6px] flex flex-col gap-[6px]">
            <Skeleton className="h-[30px] w-full rounded-[6px]" />
            <Skeleton className="h-[30px] w-full rounded-[6px]" />
            <Skeleton className="h-[30px] w-full rounded-[6px]" />
          </div>
        </div>

        <div className="space-y-[6px]">
          <Skeleton className="h-[14px] w-[120px] rounded-[6px]" />
          <Skeleton className="h-[13px] w-full rounded-[6px]" />
          <Skeleton className="h-[13px] w-4/5 rounded-[6px]" />
          <Skeleton className="h-[30px] w-full rounded-[6px]" />
        </div>
      </div>
    </section>
  );
}
