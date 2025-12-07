import { cn } from '@heroui/react';
import { CaretCircleUpIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';

import { Button, MdEditor } from '@/components/base';
import { SentimentIndicator } from '@/components/pages/discourse/common/sentiment/SentimentIndicator';
import { SentimentVoteButton } from '@/components/pages/discourse/common/sentiment/SentimentVoteButton';
import { UserAvatar } from '@/components/pages/discourse/common/UserAvatar';
import { REDRESSED_SUPPORT_THRESHOLD } from '@/constants/discourse';

import { OpTag } from '../common/OpTag';
import type {
  SentimentKey,
  SentimentMetric,
} from '../common/sentiment/sentimentConfig';
import { TagPill } from '../common/TagPill';
import type { AnswerItem, CommentItem } from '../common/threadData';

import type { CommentTarget } from './hooks/useDiscussionComposer';
import { serializeEditorValue } from './PostDetailCard';
import type { ComposerContext } from './ThreadComposerModal';
import { buildCommentTree, formatExcerpt } from './utils/discussionMappers';

type AnswerCommentNode = CommentItem & {
  commentId?: number;
  children?: AnswerCommentNode[];
};

type AnswerDetailCardProps = {
  answer: AnswerItem;
  onSupport: (answerId: number) => void;
  onWithdraw: (answerId: number) => void;
  onPostComment: (context?: ComposerContext) => void;
  onSelectSentiment: (answerId: number, sentiment: SentimentKey) => void;
  onShowSentimentDetail: (params: {
    title: string;
    excerpt: string;
    sentiments?: SentimentMetric[];
    totalVotes?: number;
  }) => void;
  isTopSupport?: boolean;
  threadAuthorName: string;
  threadId: number;
  supportPending?: boolean;
  withdrawPending?: boolean;
  sentimentPendingId?: number | null;
};

export function AnswerDetailCard({
  answer,
  onSupport,
  onWithdraw,
  onPostComment,
  onSelectSentiment,
  onShowSentimentDetail,
  isTopSupport = false,
  threadAuthorName,
  threadId,
  supportPending = false,
  withdrawPending = false,
  sentimentPendingId = null,
}: AnswerDetailCardProps) {
  const commentCount = answer.comments?.length ?? answer.commentsCount;
  const acceptedBadge =
    isTopSupport && answer.cpSupport > 0 ? 'Highest voted answer' : undefined;
  const opVoteBadge =
    answer.statusTag ||
    (answer.threadAuthorSupported ? 'Voted by Original Poster' : undefined);
  const isOp = answer.author === threadAuthorName;
  const opTag = isOp ? 'OP' : undefined;
  const cpLabel = formatCompactNumber(answer.cpSupport);
  const meetsThreshold = answer.cpSupport >= REDRESSED_SUPPORT_THRESHOLD;
  const cpTextColor = meetsThreshold
    ? 'text-[#64C0A5]'
    : answer.viewerHasSupported
      ? 'text-black'
      : 'text-black/60';
  const cpIconColor = meetsThreshold
    ? 'text-[#64C0A5]'
    : answer.viewerHasSupported
      ? 'text-black/80'
      : 'text-black/10';

  const commentTree = useMemo<AnswerCommentNode[]>(
    () =>
      buildCommentTree<AnswerCommentNode>(
        (answer.comments ?? []) as AnswerCommentNode[],
      ),
    [answer.comments],
  );

  return (
    <article className="space-y-[10px] rounded-[10px] bg-white p-[10px]">
      <div className="flex gap-[10px]">
        <UserAvatar name={answer.author} src={answer.authorAvatar} size={32} />
        <div className="flex-1 space-y-[10px]">
          {/* author + sentiment indicator */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[15px] font-semibold text-black">
                {answer.author}
              </span>
              {opTag ? <OpTag label={opTag} /> : null}
              {acceptedBadge ? <TagPill>{acceptedBadge}</TagPill> : null}
              {opVoteBadge ? <TagPill>{opVoteBadge}</TagPill> : null}
            </div>
            <div className="flex items-center gap-2 text-[12px] text-black/70">
              <SentimentIndicator
                sentiments={answer.sentimentBreakdown}
                onClick={() =>
                  onShowSentimentDetail({
                    title: `Sentiment for answer by ${answer.author}`,
                    excerpt: formatExcerpt(answer.body),
                    sentiments: answer.sentimentBreakdown,
                    totalVotes: answer.sentimentVotes,
                  })
                }
              />
            </div>
          </div>

          {/* content + upvote */}
          <div className="flex items-start gap-[10px]">
            <MdEditor
              value={serializeEditorValue(answer.body)}
              mode="readonly"
              hideMenuBar
              className={{
                base: 'border-none bg-transparent p-0',
                editorWrapper: 'p-0',
                editor:
                  'prose prose-base max-w-none text-[16px] leading-6 text-black/80',
              }}
            />

            {/* upvote button */}
            <Button
              className="min-w-0 shrink-0 gap-[5px] rounded-[8px] border-none bg-[#F5F5F5] px-[8px] py-[4px]"
              isDisabled={supportPending || withdrawPending}
              isLoading={supportPending || withdrawPending}
              onPress={() =>
                answer.viewerHasSupported
                  ? onWithdraw(answer.numericId)
                  : onSupport(answer.numericId)
              }
            >
              <span
                className={cn(
                  'font-mona text-[13px] leading-[19px]',
                  meetsThreshold ? 'text-[#64C0A5]' : cpTextColor,
                )}
              >
                {cpLabel}
              </span>
              <CaretCircleUpIcon
                weight="fill"
                size={30}
                className={cn(cpIconColor)}
              />
            </Button>
          </div>

          {/* time and sentiment */}
          <div className="flex flex-col gap-[10px] text-xs text-black/60">
            <span>{answer.createdAt}</span>
            <SentimentVoteButton
              totalVotes={answer.sentimentVotes}
              value={answer.viewerSentiment ?? null}
              isLoading={sentimentPendingId === answer.numericId}
              disabled={supportPending || withdrawPending}
              size="small"
              onSelect={(sentiment) =>
                onSelectSentiment(answer.numericId, sentiment)
              }
            />
          </div>
        </div>
      </div>
      {/* comment module */}
      <div className="flex flex-col gap-[10px] border-t border-black/10 pt-[10px]">
        {/* comment header */}
        <div className="flex items-center justify-between text-[14px] font-semibold text-black/80">
          <div className="flex items-center gap-2">
            <span>Comments</span>
            <span className="text-black/50">
              {String(commentCount ?? 0).padStart(2, '0')}
            </span>
          </div>
          {/* TODO opt: useCallback  */}
          <Button
            className="h-[32px] rounded-[5px] border border-black/10 bg-[#F5F5F5] px-[10px] text-[13px] font-semibold text-black/80"
            onPress={() =>
              onPostComment({
                title: 'Commenting to Answer:',
                author: answer.author,
                isOp,
                timestamp: answer.createdAt,
                excerpt: formatExcerpt(answer.body),
                target: {
                  threadId,
                  answerId: answer.numericId,
                  commentId: undefined,
                },
              })
            }
          >
            Post Comment
          </Button>
        </div>

        {/* comment tree */}
        <div className="space-y-[10px]">
          {commentTree.length
            ? commentTree.map((comment, index) => (
                <AnswerCommentTree
                  key={comment.id}
                  node={comment}
                  depth={0}
                  isFirst={index === 0}
                  hasSiblings={commentTree.length > 1}
                  threadId={threadId}
                  // TODO opt: useCallback
                  onReply={(payload) =>
                    onPostComment({
                      title: 'Replying to:',
                      author: payload.author,
                      isOp: payload.isOp,
                      timestamp: payload.timestamp,
                      excerpt: payload.excerpt,
                      target: {
                        threadId,
                        answerId: answer.numericId,
                        parentCommentId: payload.parentCommentId,
                        commentId: payload.commentId,
                      },
                    })
                  }
                  threadAuthorName={threadAuthorName}
                />
              ))
            : null}
        </div>
      </div>
    </article>
  );
}

function AnswerCommentRow({
  comment,
  onReply,
  depth = 0,
  threadAuthorName,
}: {
  comment: CommentItem;
  onReply: () => void;
  depth?: number;
  threadAuthorName: string;
}) {
  const isOp =
    comment.author === threadAuthorName ||
    comment.author?.toLowerCase().includes('(op)');

  return (
    <div
      className="flex gap-[10px]"
      style={{ marginLeft: depth ? depth * 16 : 0 }}
    >
      <UserAvatar name={comment.author} src={comment.authorAvatar} size={32} />
      <div className="flex-1 space-y-[10px]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[14px] font-semibold text-black">
            {comment.author}
          </span>
          {isOp ? <OpTag className="px-2 py-[2px]" /> : null}
          <span className="text-[12px] text-black/60">{comment.createdAt}</span>
        </div>
        <MdEditor
          value={serializeEditorValue(comment.body)}
          mode="readonly"
          hideMenuBar
          className={{
            base: 'border-none bg-transparent p-0',
            editorWrapper: 'p-0',
            editor:
              'prose prose-base max-w-none text-[16px] leading-6 text-black/80',
          }}
        />
        <div className="flex items-center gap-3 text-[12px] text-black/70">
          {/* TODO: comment 维度的情绪投票，暂不做 */}
          <Button
            className="h-[24px]  min-w-0 rounded-[5px] border-none bg-black/5 px-[8px] py-[4px] font-sans text-[12px] font-semibold text-black/80"
            onPress={onReply}
          >
            Reply
          </Button>
        </div>
      </div>
    </div>
  );
}

type AnswerCommentTreeProps = {
  node: AnswerCommentNode;
  depth: number;
  isFirst: boolean;
  hasSiblings: boolean;
  onReply: (
    target: CommentTarget & {
      author: string;
      excerpt: string;
      timestamp: string;
      isOp: boolean;
    },
  ) => void;
  threadAuthorName: string;
  threadId: number;
};

function AnswerCommentTree({
  node,
  depth,
  isFirst,
  hasSiblings,
  onReply,
  threadAuthorName,
  threadId,
}: AnswerCommentTreeProps) {
  const handleReply = () => {
    const rootId = node.commentId ?? node.numericId;
    onReply({
      threadId,
      answerId: node.answerId,
      parentCommentId: node.numericId ?? rootId,
      commentId: rootId,
      author: node.author,
      excerpt: formatExcerpt(node.body),
      timestamp: node.createdAt,
      isOp:
        node.author === threadAuthorName ||
        node.author?.toLowerCase().includes('(op)'),
    });
  };

  return (
    <div className="space-y-3">
      <AnswerCommentRow
        comment={node}
        onReply={handleReply}
        depth={depth}
        threadAuthorName={threadAuthorName}
      />
      {node.children?.length
        ? node.children.map((child, index) => (
            <AnswerCommentTree
              key={child.id}
              node={child}
              depth={depth + 1}
              isFirst={index === 0}
              hasSiblings={!!node.children && node.children.length > 1}
              onReply={onReply}
              threadAuthorName={threadAuthorName}
              threadId={threadId}
            />
          ))
        : null}
    </div>
  );
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}
