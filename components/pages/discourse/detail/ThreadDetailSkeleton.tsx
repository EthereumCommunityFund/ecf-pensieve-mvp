import { Skeleton } from '@heroui/react';

import { BackHeaderSkeleton } from '@/components/pages/project/BackHeader';

import { SentimentSummaryPanelSkeleton } from '../common/sentiment/SentimentModal';

import { ContributionVotesCardSkeleton } from './ContributionVotesCard';
import { PostDetailCardSkeleton } from './PostDetailCard';
import { QuickActionsCardSkeleton } from './QuickActionsCard';
import { AnswerDetailCardSkeleton } from './ThreadAnswerCard';

const FiltersSkeleton = () => (
  <div className="rounded-[10px] border border-black/10 bg-white px-[14px] py-[10px]">
    <div className="flex flex-wrap items-center gap-3">
      <Skeleton className="h-[30px] w-[90px] rounded-[8px]" />
      <Skeleton className="h-[30px] w-[90px] rounded-[8px]" />
      <Skeleton className="h-[30px] w-[90px] rounded-[8px]" />
      <Skeleton className="h-[30px] w-[120px] rounded-[8px]" />
      <div className="ml-auto flex items-center gap-2">
        <Skeleton className="h-[26px] w-[60px] rounded-[6px]" />
        <Skeleton className="h-[32px] w-[120px] rounded-[6px]" />
      </div>
    </div>
  </div>
);

export function ThreadDetailSkeleton() {
  return (
    <>
      <BackHeaderSkeleton className="px-0" />
      <div className="flex justify-center px-[20px] pb-16 pt-4">
        <div className="flex w-full max-w-[1200px] items-start justify-center gap-[40px]">
          <section className="w-[700px] space-y-6">
            <PostDetailCardSkeleton />

            <FiltersSkeleton />

            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <AnswerDetailCardSkeleton key={index} />
              ))}
            </div>
          </section>

          <aside className="w-[300px] space-y-[20px]">
            <ContributionVotesCardSkeleton />
            <SentimentSummaryPanelSkeleton />
            <QuickActionsCardSkeleton />
          </aside>
        </div>
      </div>
    </>
  );
}

export function ScamThreadSkeleton() {
  return (
    <div className="flex justify-center px-[20px] pb-16 pt-4">
      <div className="flex w-full max-w-[1200px] justify-center gap-[40px]">
        <section className="w-[700px] space-y-6">
          <BackHeaderSkeleton className="px-0" />
          <PostDetailCardSkeleton />
          <FiltersSkeleton />
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <AnswerDetailCardSkeleton key={index} />
            ))}
          </div>
        </section>
        <aside className="w-[300px] space-y-[20px]">
          <ContributionVotesCardSkeleton />
          <SentimentSummaryPanelSkeleton />
          <QuickActionsCardSkeleton />
        </aside>
      </div>
    </div>
  );
}
