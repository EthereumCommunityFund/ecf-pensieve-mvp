import { cn } from '@heroui/react';
import { CaretDownIcon, CaretUpIcon } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';

import { Button, MdEditor } from '@/components/base';

import { OpTag } from '../common/OpTag';
import type { CommentItem } from '../common/threadData';
import { UserAvatar } from '../common/UserAvatar';

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
  const children = node.children ?? [];

  const handleReply = () => {
    onReply({
      targetType: 'comment',
      targetId: node.numericId,
      threadId,
      rootCommentId: node.commentId ?? node.numericId,
      author: node.author,
      excerpt: formatExcerpt(node.body),
      timestamp: node.createdAt,
      isOp:
        node.author === threadAuthorName ||
        node.author?.toLowerCase().includes('(op)'),
    });
  };

  const visibleChildren = useMemo(() => children.slice(0, 2), [children]);
  const hasMore = children.length > visibleChildren.length;
  const [showAll, setShowAll] = useState(false);

  return (
    <div className={cn('space-y-[20px]')}>
      <CommentThreadItem
        comment={node}
        depth={depth}
        showConnector={hasSiblings && isFirst}
        onReply={handleReply}
        threadAuthorName={threadAuthorName}
      />
      {(showAll ? children : visibleChildren).map((child, index) => (
        <ThreadCommentTree
          key={child.id}
          node={child}
          depth={depth + 1}
          isFirst={index === 0}
          hasSiblings={children.length > 1}
          onReply={onReply}
          threadAuthorName={threadAuthorName}
          threadId={threadId}
        />
      ))}
      {hasMore ? (
        <div className="pl-[44px]">
          <Button
            onClick={() => setShowAll((prev) => !prev)}
            className="h-[28px] w-full text-[13px] font-semibold text-black/80"
          >
            {showAll ? 'Hide comments' : 'View All Comments'}
            {showAll ? <CaretUpIcon size={16} /> : <CaretDownIcon size={16} />}
          </Button>
        </div>
      ) : null}
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
      className={cn(
        'relative flex gap-3',
        depth > 0 ? 'pt-[10px] border-t border-black/10' : '',
      )}
      style={{ marginLeft: depth ? depth * 44 : 0 }}
    >
      <div className="relative flex flex-col items-center gap-1">
        <UserAvatar
          name={comment.author}
          src={comment.authorAvatar}
          size={30}
          className="bg-[#d9d9d9]"
        />
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-black">
              {comment.author}
            </span>
            {isOp ? <OpTag className="px-2 py-[2px]" /> : null}
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
            base: 'h-fit border-none bg-transparent p-0',
            editorWrapper: 'p-0',
            editor:
              'prose prose-base max-w-none text-[16px] leading-6 text-black/80',
          }}
        />

        <div className="flex items-center gap-3 text-[12px] text-black/70">
          {/* hold on sentiment vote */}
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
