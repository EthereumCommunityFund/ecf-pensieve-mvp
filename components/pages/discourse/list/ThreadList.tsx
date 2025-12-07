'use client';

import { cn, Skeleton } from '@heroui/react';
import {
  CaretCircleUpIcon,
  CheckIcon,
  CheckSquare,
} from '@phosphor-icons/react';
import {
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Button } from '@/components/base';
import { addToast } from '@/components/base/toast';
import { useAuth } from '@/context/AuthContext';
import { trpc } from '@/lib/trpc/client';

import { SentimentKey } from '../common/sentiment/sentimentConfig';
import { SentimentIndicator } from '../common/sentiment/SentimentIndicator';
import { SentimentModal } from '../common/sentiment/SentimentModal';
import { TopicTag } from '../common/TopicTag';
import { UserAvatar } from '../common/UserAvatar';
import { ThreadMeta } from '../utils/threadTransforms';

type ThreadListProps = {
  isLoading: boolean;
  isFetched: boolean;
  isFetchingNextPage?: boolean;
  threads: ThreadMeta[];
  emptyMessage?: string;
  skeletonCount?: number;
  onThreadSelect?: (thread: ThreadMeta) => void;
  sentimentSortKey?: SentimentKey | 'all';
};

type ThreadItemProps = {
  thread: ThreadMeta;
  onSentimentClick: (thread: ThreadMeta) => void;
  onSelect?: (thread: ThreadMeta) => void;
  onToggleVote?: (
    thread: ThreadMeta,
    hasSupported: boolean,
    onSettled?: () => void,
  ) => Promise<void> | void;
  isVoting?: boolean;
  supportedMap?: Set<number>;
  voteOverrides?: Record<number, number>;
  pendingThreadId?: number | null;
};

function ThreadItem({
  thread,
  onSentimentClick,
  onSelect,
  onToggleVote,
  isVoting = false,
  supportedMap,
  voteOverrides = {},
  pendingThreadId,
}: ThreadItemProps) {
  const hasAnswers = !!thread.answeredCount;
  const hasStatus = Boolean(thread.statusLabel ?? thread.status);
  const numericId = Number(thread.id);
  const statusTheme = thread.isAlertDisplayed
    ? {
        border: 'border-[rgba(187,93,0,0.40)]',
        bg: 'bg-[rgba(187,93,0,0.20)]',
        text: 'text-[#BB5D00]',
        icon: 'text-[#bb5d00]',
      }
    : thread.isClaimRedressed
      ? {
          border: 'border-[rgba(67,189,155,0.6)]',
          bg: 'bg-[rgba(67,189,155,0.1)]',
          text: 'text-[#1b9573]',
          icon: 'text-[#1b9573]',
        }
      : {
          border: 'border-black/10',
          bg: 'bg-[#f5f5f5]',
          text: 'text-black/80',
          icon: 'text-black/60',
        };
  const voteCount =
    voteOverrides?.[numericId] !== undefined
      ? voteOverrides[numericId]
      : (thread.votes ?? 0);
  const hasSupported =
    supportedMap?.has(numericId) || thread.viewerHasSupported;
  const clickableProps = onSelect
    ? {
        role: 'button' as const,
        tabIndex: 0,
        onClick: () => onSelect(thread),
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect(thread);
          }
        },
      }
    : {};

  return (
    <article
      className={`flex flex-col gap-4 rounded-[10px] px-5 py-[10px] hover:bg-[#EBEBEB] ${
        onSelect ? 'cursor-pointer transition' : ''
      }`}
      {...clickableProps}
    >
      <div className="space-y-[8px]">
        <div className="flex flex-wrap items-start justify-between gap-[10px]">
          <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold text-black/70">
            {thread.tag ? (
              <TopicTag
                label={thread.tag}
                isScam={thread.isScam}
                iconClassName="opacity-100"
              />
            ) : null}
            {hasStatus ? (
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-[4px] border px-[8px] py-[4px] text-[13px] font-semibold',
                  statusTheme.border,
                  statusTheme.bg,
                  statusTheme.text,
                )}
              >
                <CheckIcon
                  size={16}
                  weight="bold"
                  className={cn('', statusTheme.icon)}
                />
                {thread.statusLabel ?? thread.status}
              </span>
            ) : null}
            {hasAnswers ? (
              <span className="inline-flex items-center gap-1 text-[13px] font-semibold ">
                <CheckSquare size={32} className="text-[#43bd9b]" />
                <span className="text-[#43BD9B] opacity-80">
                  {thread.answeredCount}
                </span>
              </span>
            ) : null}
          </div>
          {thread.sentimentBreakdown?.length ? (
            <SentimentIndicator
              sentiments={thread.sentimentBreakdown}
              onClick={() => onSentimentClick(thread)}
            />
          ) : null}
        </div>

        <div className="flex gap-3 sm:flex-row sm:items-start">
          <div className="flex-1 space-y-[8px]">
            <h2 className="text-[18px] font-semibold text-[#202023]">
              {thread.title}
            </h2>
            {/* TODO use MdEditor */}
            <p className="text-[14px] leading-5 text-black/70">
              {thread.excerpt}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-[12px] tracking-[0.12em] text-black/50">
              <span>BY:</span>
              <span className="flex items-center gap-2 text-[13px] tracking-normal text-black">
                <UserAvatar
                  name={thread.author}
                  src={thread.authorAvatar}
                  size={24}
                  className="bg-black/10"
                  fallbackClassName="text-[11px] font-semibold"
                />
                <span className="text-[13px]">{thread.author}</span>
              </span>
              <span className="tracking-normal text-black/60">
                {thread.timeAgo}
              </span>
            </div>
          </div>

          {/* Upvote */}
          <div className="flex items-center">
            <div className="flex flex-col items-center gap-[10px] text-sm text-black">
              <Button
                isIconOnly
                type="button"
                aria-label="Upvote"
                className="h-[36px] min-w-0 rounded-full border-none bg-transparent p-0 transition-transform hover:bg-transparent"
                isDisabled={isVoting}
                isLoading={isVoting && pendingThreadId === numericId}
                onPress={() => onToggleVote?.(thread, !!hasSupported)}
              >
                <CaretCircleUpIcon
                  size={36}
                  weight="fill"
                  className={cn(
                    hasSupported
                      ? 'text-black hover:text-black/80'
                      : 'text-black/10 hover:text-black/30',
                    'opacity-100',
                  )}
                />
              </Button>
              <span className="text-[13px] font-semibold">{voteCount}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function ThreadList({
  threads,
  emptyMessage,
  onThreadSelect,
  isLoading,
  isFetched,
  isFetchingNextPage,
  skeletonCount = 4,
  sentimentSortKey = 'all',
}: ThreadListProps) {
  const { isAuthenticated, showAuthPrompt } = useAuth();
  const utils = trpc.useUtils();
  const voteThreadMutation =
    trpc.projectDiscussionThread.voteThread.useMutation();
  const unvoteThreadMutation =
    trpc.projectDiscussionThread.unvoteThread.useMutation();
  const [activeSentimentThread, setActiveSentimentThread] =
    useState<ThreadMeta | null>(null);
  const [supportedThreads, setSupportedThreads] = useState<Set<number>>(
    new Set(),
  );
  const [voteOverrides, setVoteOverrides] = useState<Record<number, number>>(
    {},
  );
  const [pendingThreadId, setPendingThreadId] = useState<number | null>(null);

  useEffect(() => {
    const supported = threads
      .filter((thread) => thread.viewerHasSupported)
      .map((thread) => Number(thread.id))
      .filter((id) => Number.isFinite(id));
    setSupportedThreads(new Set(supported));
  }, [threads]);

  const requireAuth = useCallback(() => {
    if (isAuthenticated) return true;
    showAuthPrompt();
    return false;
  }, [isAuthenticated, showAuthPrompt]);

  const toggleThreadVote = useCallback(
    async (
      thread: ThreadMeta,
      hasSupported: boolean,
      onSettled?: () => void,
    ) => {
      const numericId = Number(thread.id);
      if (!Number.isFinite(numericId)) return;
      if (!requireAuth()) return;
      setPendingThreadId(numericId);
      try {
        if (hasSupported) {
          const result = await unvoteThreadMutation.mutateAsync({
            threadId: numericId,
          });
          setSupportedThreads((prev) => {
            const next = new Set(prev);
            next.delete(numericId);
            return next;
          });
          setVoteOverrides((prev) => ({
            ...prev,
            [numericId]: result.support ?? thread.votes ?? 0,
          }));
          addToast({
            title: 'Support withdrawn',
            description: 'Your CP support was withdrawn.',
            color: 'success',
          });
        } else {
          const result = await voteThreadMutation.mutateAsync({
            threadId: numericId,
          });
          setSupportedThreads((prev) => new Set(prev).add(numericId));
          setVoteOverrides((prev) => ({
            ...prev,
            [numericId]: result.support ?? (thread.votes ?? 0) + 1,
          }));
          addToast({
            title: 'Supported thread',
            description: 'CP support registered for this thread.',
            color: 'success',
          });
        }
        utils.projectDiscussionThread.listThreads.invalidate();
      } catch (error: any) {
        addToast({
          title: 'Unable to update vote',
          description: error?.message ?? 'Please try again.',
          color: 'danger',
        });
      } finally {
        setPendingThreadId((current) =>
          current === numericId ? null : current,
        );
        onSettled?.();
      }
    },
    [
      requireAuth,
      unvoteThreadMutation,
      voteThreadMutation,
      utils.projectDiscussionThread.listThreads,
    ],
  );

  const sortedThreads = useMemo(() => {
    if (!sentimentSortKey || sentimentSortKey === 'all') {
      return threads;
    }
    const sortKey = sentimentSortKey;
    return [...threads]
      .map((thread, index) => ({
        thread,
        index,
        sentimentCount: thread.sentimentCounts?.[sortKey] ?? 0,
      }))
      .sort((a, b) => {
        if (b.sentimentCount !== a.sentimentCount) {
          return b.sentimentCount - a.sentimentCount;
        }
        return a.index - b.index;
      })
      .map((item) => item.thread);
  }, [threads, sentimentSortKey]);

  const renderedThreads = useMemo(
    () =>
      sortedThreads.map((thread) => (
        <div
          key={thread.id}
          className="border-b border-black/10 pb-[10px] last:border-0"
        >
          <ThreadItem
            thread={thread}
            onSentimentClick={setActiveSentimentThread}
            onSelect={onThreadSelect}
            onToggleVote={toggleThreadVote}
            isVoting={
              pendingThreadId === (thread.numericId ?? Number(thread.id))
            }
            supportedMap={supportedThreads}
            voteOverrides={voteOverrides}
            pendingThreadId={pendingThreadId}
          />
        </div>
      )),
    [
      sortedThreads,
      onThreadSelect,
      supportedThreads,
      pendingThreadId,
      voteOverrides,
      toggleThreadVote,
    ],
  );

  const showInitialSkeleton = (!isFetched || isLoading) && !threads.length;
  const showEmptyState = isFetched && !threads.length && !isLoading;

  return (
    <div>
      {showInitialSkeleton ? (
        <ThreadListSkeleton count={skeletonCount} />
      ) : showEmptyState ? (
        <div className="rounded-[10px] border border-black/10 bg-white p-10 text-center text-sm text-gray-500">
          {emptyMessage || 'No threads yet.'}
        </div>
      ) : (
        <div className="flex flex-col gap-[10px]">
          {renderedThreads}
          {isFetchingNextPage ? <ThreadListSkeleton count={2} /> : null}
        </div>
      )}

      <SentimentModal
        open={Boolean(activeSentimentThread)}
        onClose={() => setActiveSentimentThread(null)}
        title={activeSentimentThread?.title || ''}
        excerpt={activeSentimentThread?.excerpt || ''}
        totalVotes={activeSentimentThread?.totalSentimentVotes}
        sentiments={activeSentimentThread?.sentimentBreakdown}
      />
    </div>
  );
}

function ThreadItemSkeleton() {
  return (
    <article className="flex flex-col gap-4 rounded-[10px] bg-white px-5 py-[10px]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-[24px] w-[70px] rounded-[6px]" />
          <Skeleton className="h-[24px] w-[80px] rounded-[6px]" />
          <Skeleton className="h-[24px] w-[60px] rounded-[6px]" />
        </div>
        <Skeleton className="h-[28px] w-[140px] rounded-[8px]" />
      </div>

      <div className="flex gap-3 sm:flex-row sm:items-start">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-[20px] w-3/5 rounded-[6px]" />
          <Skeleton className="h-[14px] w-full rounded-[4px]" />
          <Skeleton className="h-[14px] w-4/5 rounded-[4px]" />
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="h-[12px] w-[120px] rounded-[4px]" />
            <Skeleton className="h-[12px] w-[90px] rounded-[4px]" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 sm:ml-auto">
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="h-[14px] w-[28px] rounded-[4px]" />
        </div>
      </div>
    </article>
  );
}

function ThreadListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-[10px]">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="border-b border-black/10 pb-[10px] last:border-0"
        >
          <ThreadItemSkeleton />
        </div>
      ))}
    </div>
  );
}
