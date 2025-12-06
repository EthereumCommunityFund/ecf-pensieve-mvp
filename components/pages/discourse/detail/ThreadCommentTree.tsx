import { ArrowBendUpLeft, ThumbsDown } from '@phosphor-icons/react';
import { ChartBarIcon } from '@phosphor-icons/react';

import { Button, MdEditor } from '@/components/base';

import { SentimentIndicator } from '../common/sentiment/SentimentIndicator';
import type { CommentItem } from '../common/threadData';

import type { CommentTarget } from './hooks/useDiscussionComposer';
import { serializeEditorValue } from './PostDetailCard';
import type { CommentNode } from './utils/discussionMappers';
import { formatExcerpt } from './utils/discussionMappers';

type ThreadCommentNode = CommentNode<CommentItem>;

type ThreadCommentTreeProps = {
  node: ThreadCommentNode;
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

export function ThreadCommentTree({
  node,
  depth,
  isFirst,
  hasSiblings,
  onReply,
  threadAuthorName,
  threadId,
}: ThreadCommentTreeProps) {
  const handleReply = () => {
    onReply({
      threadId,
      parentCommentId: node.numericId,
      commentId: node.commentId ?? node.numericId,
      answerId: undefined,
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
      <CommentThreadItem
        comment={node}
        depth={depth}
        showConnector={hasSiblings && isFirst}
        onReply={handleReply}
        threadAuthorName={threadAuthorName}
      />
      {node.children?.length
        ? node.children.map((child, index) => (
            <ThreadCommentTree
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

type CommentThreadItemProps = {
  comment: CommentItem;
  showConnector?: boolean;
  onReply: (context?: any) => void;
  threadAuthorName: string;
  depth?: number;
};

function CommentThreadItem({
  comment,
  showConnector = false,
  onReply,
  threadAuthorName,
  depth = 0,
}: CommentThreadItemProps) {
  const isOp =
    comment.author?.toLowerCase().includes('(op)') ||
    comment.author === threadAuthorName;

  return (
    <div
      className="relative flex gap-3 rounded-[10px] bg-[#f7f7f7] p-3"
      style={{ marginLeft: depth ? depth * 20 : 0 }}
    >
      {showConnector ? (
        <div className="absolute left-[24px] top-[38px] h-[calc(100%-38px)] w-px bg-black/10" />
      ) : null}
      <div className="flex flex-col items-center gap-1">
        <div className="flex size-[30px] items-center justify-center rounded-full bg-[#d9d9d9]" />
        {isOp ? (
          <div className="flex flex-col items-center gap-1 text-black/50">
            <ArrowBendUpLeft size={14} />
            <ThumbsDown size={18} weight="fill" />
          </div>
        ) : null}
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-black">
              {comment.author}
            </span>
            {/* TODO sentiment icon */}
            {isOp ? (
              <span className="rounded-[4px] border border-white bg-[rgba(67,189,155,0.2)] px-2 py-[2px] text-[11px] font-semibold text-[#1b9573]">
                OP
              </span>
            ) : null}
            <span className="text-[12px] text-black/60">
              {comment.createdAt}
            </span>
          </div>
          <SentimentIndicator />
        </div>

        <MdEditor
          value={serializeEditorValue(comment.body)}
          mode="readonly"
          hideMenuBar
          className={{
            base: 'h-fit border-none bg-transparent p-0',
            editorWrapper: 'p-0',
            editor:
              'prose prose-base max-w-none text-[16px] leading-6 text-black/80',
          }}
        />

        <div className="flex items-center gap-3 text-[12px] text-black/70">
          <Button className="inline-flex h-[24px] min-w-0 items-center gap-[5px] rounded-[5px] border-none bg-black/5 px-[8px]">
            <ChartBarIcon size={20} weight="fill" className="opacity-30" />
            <span className="text-[12px] font-semibold text-black">4</span>
          </Button>
          <Button
            className="h-[24px]  min-w-0 rounded-[5px] border-none bg-black/5 px-[8px] py-[4px] font-sans text-[12px] font-semibold text-black/80"
            onPress={() =>
              onReply({
                title: 'Replying to:',
                author: comment.author,
                isOp,
                timestamp: comment.createdAt,
                excerpt: formatExcerpt(comment.body),
              })
            }
          >
            Reply
          </Button>
        </div>
      </div>
    </div>
  );
}
