import { CaretCircleUp as CaretCircleUpIcon } from '@phosphor-icons/react';

import { Button } from '@/components/base';

import { SentimentIndicator } from '../common/sentiment/SentimentIndicator';
import type { AnswerItem, CommentItem } from '../common/threadData';

import type { CommentNode } from './utils/discussionMappers';
import { buildCommentTree, formatExcerpt } from './utils/discussionMappers';

type CounterCommentNode = CommentNode<CommentItem>;

type CounterClaimCardProps = {
  claim: AnswerItem;
  cpTarget?: number;
  threadId: number;
  onSupport: (answerId: number) => void;
  onWithdraw: (answerId: number) => void;
  supportPending?: boolean;
  withdrawPending?: boolean;
  onPostComment: (context: {
    author: string;
    isOp?: boolean;
    timestamp?: string;
    excerpt: string;
    target: {
      threadId: number;
      answerId?: number;
      parentCommentId?: number;
      commentId?: number;
    };
  }) => void;
};

export function CounterClaimCard({
  claim,
  cpTarget,
  threadId,
  onSupport,
  onWithdraw,
  supportPending = false,
  withdrawPending = false,
  onPostComment,
}: CounterClaimCardProps) {
  const commentsCount = claim.commentsCount ?? claim.comments?.length ?? 0;
  const progress =
    cpTarget && cpTarget > 0
      ? Math.min(100, Math.round((claim.cpSupport / cpTarget) * 100))
      : undefined;
  const CP_SUPPORT_THRESHOLD = cpTarget ?? 9000;
  const meetsThreshold = claim.cpSupport >= CP_SUPPORT_THRESHOLD;
  const textColor = meetsThreshold
    ? 'text-[#64C0A5]'
    : claim.viewerHasSupported
      ? 'text-black'
      : 'text-black/60';
  const iconColor = meetsThreshold
    ? 'text-[#64C0A5]'
    : claim.viewerHasSupported
      ? 'text-black/30'
      : 'text-black/10';
  const commentTree = buildCommentTree<CounterCommentNode>(
    (claim.comments ?? []) as CounterCommentNode[],
  );

  return (
    <article className="rounded-[10px] border border-black/10 bg-white p-[10px]">
      <div className="flex gap-3">
        {/* TODO user avatar */}

        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center  gap-2">
            <div className="flex size-[32px] items-center justify-center rounded-full bg-[#d9d9d9]" />
            <p className="text-[15px] font-semibold text-black">
              {claim.author}
            </p>
            <SentimentIndicator />
          </div>
          {/* TODO 用 MdEditor */}
          <p className="text-[14px] leading-[20px] text-black/80">
            {claim.body}
          </p>

          <p className="text-[12px] text-black/60">{claim.createdAt}</p>

          <Button
            className={`h-[38px] w-full gap-3 rounded-[8px] px-[10px] ${
              meetsThreshold
                ? 'bg-[#F0FFF9]'
                : claim.viewerHasSupported
                  ? 'bg-black text-white'
                  : 'bg-[#f5f5f5]'
            }`}
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
                    threadId,
                    answerId: claim.numericId,
                    commentId: undefined,
                  },
                })
              }
            >
              Post Comment
            </Button>
          </div>
          <div className="space-y-[10px]">
            {commentTree.length ? (
              commentTree.map((comment, index) => (
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
                        threadId,
                        answerId: claim.numericId,
                        parentCommentId: payload.parentCommentId,
                        commentId: payload.commentId,
                      },
                    })
                  }
                />
              ))
            ) : (
              <p className="text-[13px] text-black/60">No comments yet.</p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export function DiscussionCommentCard({ comment }: { comment: CommentItem }) {
  return (
    <article className="rounded-[10px] border border-black/10 bg-white p-[10px]">
      <div className="flex gap-3">
        <div className="flex size-[28px] items-center justify-center rounded-full bg-[#d9d9d9]" />
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-semibold text-black">
                {comment.author}
              </span>
              <span className="text-[12px] text-black/60">
                {comment.createdAt}
              </span>
            </div>
            <SentimentIndicator />
          </div>
          <p className="text-[14px] leading-[20px] text-black/80">
            {comment.body}
          </p>
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
  onReply: (payload: {
    author: string;
    excerpt: string;
    timestamp: string;
    isOp: boolean;
    parentCommentId?: number;
    commentId?: number;
  }) => void;
};

function CounterCommentTree({
  node,
  depth,
  isFirst,
  hasSiblings,
  onReply,
}: CounterCommentTreeProps) {
  const handleReply = () => {
    onReply({
      author: node.author,
      excerpt: formatExcerpt(node.body),
      timestamp: node.createdAt,
      isOp: false,
      parentCommentId: node.numericId,
      commentId: node.commentId ?? node.numericId,
    });
  };

  return (
    <div className="space-y-2" style={{ marginLeft: depth ? depth * 16 : 0 }}>
      <div className="flex gap-2">
        <div className="flex size-8 items-center justify-center rounded-full bg-[#d9d9d9]" />
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-black">
              {node.author}
            </span>
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
}: {
  current: number;
  label: string;
}) {
  return (
    <section className="rounded-[10px] border border-black/10 bg-white p-[14px] shadow-sm">
      <header className="flex items-center gap-[10px] text-[14px] font-semibold text-black/80">
        <CaretCircleUpIcon size={20} weight="fill" className="text-black/60" />
        <span className="leading-[1.2]">{label}</span>
      </header>
      <p className="mt-[6px] text-[18px] font-semibold leading-none text-black/60">
        {current.toLocaleString()}
      </p>
    </section>
  );
}

export function ParticipateCard() {
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
          <div className="flex flex-col gap-[6px]">
            <Button className="h-[30px] rounded-[5px] border border-black/10 text-[13px] font-normal text-[#222222]">
              Support Claim
            </Button>
            <Button className="h-[30px] rounded-[5px] border border-black/10 text-[13px] font-normal text-[#222222]">
              Post a Comment
            </Button>
          </div>
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
          <Button className="h-[30px] w-full rounded-[5px] border border-black/10 text-[13px] font-normal text-[#222222]">
            Challenge Claim
          </Button>
        </div>
      </div>
    </section>
  );
}
