import { CaretCircleUp as CaretCircleUpIcon } from '@phosphor-icons/react';

import { Button, MdEditor } from '@/components/base';
import { SentimentVoteButton } from '@/components/pages/discourse/common/sentiment/SentimentVoteButton';
import { REDRESSED_SUPPORT_THRESHOLD } from '@/constants/discourse';

import { OpTag } from '../common/OpTag';
import type { SentimentKey } from '../common/sentiment/sentimentConfig';
import { SentimentIndicator } from '../common/sentiment/SentimentIndicator';
import { TagPill } from '../common/TagPill';
import type { AnswerItem, CommentItem } from '../common/threadData';
import { UserAvatar } from '../common/UserAvatar';

import type { CommentTarget } from './hooks/useDiscussionComposer';
import { serializeEditorValue } from './PostDetailCard';
import type { CommentNode } from './utils/discussionMappers';
import { buildCommentTree, formatExcerpt } from './utils/discussionMappers';

type CounterCommentNode = CommentNode<CommentItem>;

type CounterClaimCardProps = {
  claim: AnswerItem;
  cpTarget?: number;
  threadId: number;
  threadAuthorName: string;
  isTopSupport?: boolean;
  onSupport: (answerId: number) => void;
  onWithdraw: (answerId: number) => void;
  supportPending?: boolean;
  withdrawPending?: boolean;
  sentimentPendingId?: number | null;
  onSelectSentiment: (answerId: number, sentiment: SentimentKey) => void;
  onShowSentimentDetail: (payload: {
    title: string;
    excerpt: string;
    sentiments?: AnswerItem['sentimentBreakdown'];
    totalVotes?: number;
  }) => void;
  onShowSentimentIndicator?: (payload: {
    title: string;
    excerpt: string;
    sentiments?: AnswerItem['sentimentBreakdown'];
    totalVotes?: number;
  }) => void;
  onPostComment: (context: {
    author: string;
    isOp?: boolean;
    timestamp?: string;
    excerpt: string;
    target: CommentTarget;
  }) => void;
};

export function CounterClaimCard({
  claim,
  cpTarget,
  threadId,
  threadAuthorName,
  isTopSupport = false,
  onSupport,
  onWithdraw,
  supportPending = false,
  withdrawPending = false,
  sentimentPendingId = null,
  onSelectSentiment,
  onShowSentimentDetail,
  onShowSentimentIndicator,
  onPostComment,
}: CounterClaimCardProps) {
  const commentsCount = claim.commentsCount ?? claim.comments?.length ?? 0;
  const CP_SUPPORT_THRESHOLD = cpTarget ?? REDRESSED_SUPPORT_THRESHOLD;
  const meetsThreshold = claim.cpSupport >= CP_SUPPORT_THRESHOLD;
  const textColor = meetsThreshold
    ? 'text-[#64C0A5]'
    : claim.viewerHasSupported
      ? 'text-black'
      : 'text-black/60';
  const iconColor = meetsThreshold
    ? 'text-[#64C0A5]'
    : claim.viewerHasSupported
      ? 'text-black'
      : 'text-black/10';
  const isOp = claim.author === threadAuthorName;
  const acceptedBadge =
    isTopSupport && claim.cpSupport > 0 ? 'Highest voted answer' : undefined;
  const opVoteBadge = claim.threadAuthorSupported
    ? 'Voted by Original Poster'
    : undefined;
  const commentTree = buildCommentTree<CounterCommentNode>(
    (claim.comments ?? []) as CounterCommentNode[],
  );

  return (
    <article className="rounded-[10px] border border-black/10 bg-white p-[10px]">
      <div className="flex gap-3">
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <UserAvatar
              name={claim.author}
              src={claim.authorAvatar}
              size={32}
              className="bg-[#d9d9d9]"
            />
            <p className="text-[15px] font-semibold text-black">
              {claim.author}
            </p>
            {isOp ? <OpTag /> : null}
            {acceptedBadge ? <TagPill>{acceptedBadge}</TagPill> : null}
            {opVoteBadge ? <TagPill>{opVoteBadge}</TagPill> : null}
            <SentimentIndicator
              sentiments={claim.sentimentBreakdown}
              onClick={() =>
                onShowSentimentIndicator?.({
                  title: `Sentiment for ${claim.author}'s counter claim`,
                  excerpt: formatExcerpt(claim.body),
                  sentiments: claim.sentimentBreakdown,
                  totalVotes: claim.sentimentVotes,
                })
              }
            />
          </div>
          <MdEditor
            value={serializeEditorValue(claim.body)}
            mode="readonly"
            hideMenuBar
            className={{
              base: 'border-none bg-transparent p-0',
              editorWrapper: 'p-0',
              editor:
                'prose prose-base max-w-none text-[14px] leading-[20px] text-black/80',
            }}
          />

          <p className="text-[12px] text-black/60">{claim.createdAt}</p>
          <div className="flex items-center gap-2 text-xs text-black/60">
            <SentimentVoteButton
              totalVotes={claim.sentimentVotes}
              value={claim.viewerSentiment ?? null}
              isLoading={sentimentPendingId === claim.numericId}
              size="small"
              onSelect={(sentiment) =>
                onSelectSentiment(claim.numericId, sentiment)
              }
            />
          </div>

          <Button
            className={`h-[38px] w-full gap-3 rounded-[8px] bg-[#f5f5f5] px-[10px]`}
            isDisabled={supportPending || withdrawPending}
            isLoading={supportPending || withdrawPending}
            onPress={() =>
              claim.viewerHasSupported
                ? onWithdraw(claim.numericId)
                : onSupport(claim.numericId)
            }
          >
            <CaretCircleUpIcon weight="fill" size={30} className={iconColor} />
            <div className="font-mona flex gap-[5px] text-[13px] font-[500] text-black/50">
              <span className={`text-[13px] font-semibold ${textColor}`}>
                {claim.cpSupport.toLocaleString()}
              </span>
              <span>/</span>
              <span>{cpTarget ?? 0}</span>
            </div>
          </Button>

          <div className="flex items-center justify-between border-t border-black/10 pt-[10px] text-[13px] font-semibold text-black/80">
            <div className="flex items-center gap-2">
              <span>Comments</span>
              <span className="text-black/50">
                {String(commentsCount).padStart(2, '0')}
              </span>
            </div>
            <Button
              className="h-[30px] rounded-[5px] border border-black/10 px-[10px] text-[12px] font-semibold text-black/80"
              onPress={() =>
                onPostComment({
                  author: claim.author,
                  timestamp: claim.createdAt,
                  excerpt: formatExcerpt(claim.body),
                  target: {
                    targetType: 'answer',
                    targetId: claim.numericId,
                    threadId,
                    answerId: claim.numericId,
                  },
                })
              }
            >
              Post Comment
            </Button>
          </div>
          <div className="space-y-[10px]">
            {commentTree.length
              ? commentTree.map((comment, index) => (
                  <CounterCommentTree
                    key={comment.id}
                    node={comment}
                    depth={0}
                    isFirst={index === 0}
                    hasSiblings={commentTree.length > 1}
                    onReply={(payload) =>
                      onPostComment({
                        author: payload.author,
                        isOp: payload.isOp,
                        timestamp: payload.timestamp,
                        excerpt: payload.excerpt,
                        target: {
                          targetType: 'comment',
                          targetId:
                            payload.targetId ?? payload.rootCommentId ?? 0,
                          threadId,
                          answerId: claim.numericId,
                          rootCommentId: payload.rootCommentId,
                        },
                      })
                    }
                    threadAuthorName={threadAuthorName}
                  />
                ))
              : null}
          </div>
        </div>
      </div>
    </article>
  );
}

export function DiscussionCommentCard({
  comment,
  threadAuthorName,
}: {
  comment: CommentItem;
  threadAuthorName: string;
}) {
  const isOpTag =
    comment.author === threadAuthorName ||
    comment.author?.toLowerCase().includes('(op)');
  return (
    <article className="rounded-[10px] border border-black/10 bg-white p-[10px]">
      <div className="flex gap-3">
        <UserAvatar
          name={comment.author}
          src={comment.authorAvatar}
          size={28}
          className="bg-[#d9d9d9]"
        />
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-semibold text-black">
                {comment.author}
              </span>
              {isOpTag ? <OpTag /> : null}
              <span className="text-[12px] text-black/60">
                {comment.createdAt}
              </span>
            </div>
          </div>
          <MdEditor
            value={serializeEditorValue(comment.body)}
            mode="readonly"
            hideMenuBar
            className={{
              base: 'border-none bg-transparent p-0',
              editorWrapper: 'p-0',
              editor:
                'prose prose-base max-w-none text-[14px] leading-[20px] text-black/80',
            }}
          />
        </div>
      </div>
    </article>
  );
}

type CounterCommentTreeProps = {
  node: CounterCommentNode;
  depth: number;
  isFirst: boolean;
  hasSiblings: boolean;
  onReply: (
    payload: CommentTarget & {
      author: string;
      excerpt: string;
      timestamp: string;
      isOp: boolean;
    },
  ) => void;
  threadAuthorName: string;
};

function CounterCommentTree({
  node,
  depth,
  isFirst,
  hasSiblings,
  onReply,
  threadAuthorName,
}: CounterCommentTreeProps) {
  const handleReply = () => {
    const rootId = node.commentId ?? node.numericId;
    onReply({
      targetType: 'comment',
      targetId: node.numericId,
      rootCommentId: rootId,
      author: node.author,
      excerpt: formatExcerpt(node.body),
      timestamp: node.createdAt,
      isOp:
        node.author === threadAuthorName ||
        node.author?.toLowerCase().includes('(op)'),
    });
  };

  const isOpTag =
    node.author === threadAuthorName ||
    node.author?.toLowerCase().includes('(op)');

  return (
    <div className="space-y-2" style={{ marginLeft: depth ? depth * 16 : 0 }}>
      <div className="flex gap-2">
        <UserAvatar
          name={node.author}
          src={node.authorAvatar}
          size={28}
          className="bg-[#d9d9d9]"
        />
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-black">
              {node.author}
            </span>
            {isOpTag ? <OpTag /> : null}
            <span className="text-[12px] text-black/60">{node.createdAt}</span>
          </div>
          <div
            className="prose prose-sm max-w-none text-black/80"
            dangerouslySetInnerHTML={{ __html: node.body }}
          />
          <div className="flex items-center gap-3 text-[12px] text-black/70">
            <Button
              className="h-[24px] min-w-0 rounded-[5px] border-none bg-black/5 px-[8px] py-[4px] font-sans text-[12px] font-semibold text-black/80"
              onPress={handleReply}
            >
              Reply
            </Button>
          </div>
        </div>
      </div>
      {node.children?.length
        ? node.children.map((child, index) => (
            <CounterCommentTree
              key={child.id}
              node={child}
              depth={depth + 1}
              isFirst={index === 0}
              hasSiblings={node.children!.length > 1}
              onReply={onReply}
              threadAuthorName={threadAuthorName}
            />
          ))
        : null}
    </div>
  );
}

export function ScamEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[10px] border border-dashed border-black/15 bg-white px-6 py-8 text-center text-black/60">
      <CaretCircleUpIcon size={24} className="mx-auto text-black/30" />
      <p className="mt-3 text-[13px] font-semibold text-black">{title}</p>
      <p className="mt-1 text-[13px] text-black/60">{description}</p>
    </div>
  );
}

export function ContributionVotesCompact({
  current,
  label,
  isScam,
}: {
  current: number;
  label: string;
  isScam?: boolean;
}) {
  return (
    <section className="flex flex-col gap-[14px] rounded-[10px] border border-black/10 bg-white p-[14px] shadow-sm">
      <header className="flex items-center gap-[10px] ">
        <CaretCircleUpIcon size={20} weight="fill" className="text-black/60" />
        <span className="text-[14px] font-semibold leading-none text-black">
          {label}
        </span>
      </header>
      <p className="text-[18px] font-semibold leading-none text-black/60">
        {current.toLocaleString()}
      </p>

      {isScam && (
        <div className="flex flex-col gap-[5px] border-t border-black/10 pt-[10px] text-black">
          <p className="text-[14px] font-semibold leading-[1.2] text-black/80">
            Scam Acceptance Threshold:
          </p>
          <p className="text-[12px] font-[500] leading-[1.2] text-black/60">
            this is desc
          </p>
          <p className="font-inter text-[14px] font-semibold leading-[1.2] text-black/80">
            9000 <span className="text-[10px]">CP</span>
          </p>
        </div>
      )}
    </section>
  );
}

interface IParticipateCardProps {
  isOwner?: boolean;
}

export function ParticipateCard({ isOwner }: IParticipateCardProps) {
  return (
    <section className="rounded-[10px] border border-black/10 bg-white p-[14px] shadow-sm">
      <h3 className="text-[14px] font-semibold text-black">
        How to participate?
      </h3>
      <div className="mt-[10px] space-y-[10px] text-[13px] leading-[1.35] text-black/60">
        <div className="space-y-[6px]">
          <p className="text-[12px] font-semibold text-black/80">
            Support Main Claim:
          </p>
          <p>
            You can support this post as a scam by voting with your Contribution
            Points (CP) under this post. Once the Scam Acceptance Threshold is
            reached, it will display a label on the project page.
          </p>
          {!isOwner && (
            <div className="flex flex-col gap-[6px]">
              <Button className="h-[30px] rounded-[5px] border border-black/10 text-[13px] font-normal text-[#222222]">
                Support Claim
              </Button>
              <Button className="h-[30px] rounded-[5px] border border-black/10 text-[13px] font-normal text-[#222222]">
                Post a Comment
              </Button>
            </div>
          )}
        </div>
        <div className="space-y-[6px]">
          <p className="text-[12px] font-semibold text-black/80">
            Counter Claim:
          </p>
          <p>
            If you disagree with this post, you can either create a counter
            claim and gather support from the community or you can vote for any
            existing counter claims
          </p>
          {!isOwner && (
            <Button className="h-[30px] w-full rounded-[5px] border border-black/10 text-[13px] font-normal text-[#222222]">
              Challenge Claim
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
