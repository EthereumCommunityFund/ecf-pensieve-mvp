import { useCallback, useMemo, useState } from 'react';

import { parseEditorValue } from '@/components/pages/discourse/utils/editorValue';

import type { ComposerContext, ComposerVariant } from '../ThreadComposerModal';

export type CommentTarget = {
  threadId: number;
  answerId?: number;
  parentCommentId?: number;
  commentId?: number;
};

type OpenCommentOptions = {
  title?: string;
  context?: ComposerContext | null;
  target?: CommentTarget;
};

type Messages = {
  primary: {
    required: string;
    exceed: string;
    failed: string;
  };
  comment: {
    required: string;
    exceed: string;
    failed: string;
  };
};

type DiscussionComposerOptions = {
  primaryVariant: Exclude<ComposerVariant, 'comment'>;
  threadId: number;
  maxCharacters: number;
  requireAuth: () => boolean;
  defaultCommentTarget?: CommentTarget;
  messages: Messages;
  primarySubmit?: (payload: {
    html: string;
    plain: string;
  }) => Promise<unknown>;
  commentSubmit?: (payload: {
    html: string;
    plain: string;
    target: CommentTarget;
  }) => Promise<unknown>;
  primarySubmitting?: boolean;
  commentSubmitting?: boolean;
};

export function useDiscussionComposer({
  primaryVariant,
  threadId,
  maxCharacters,
  requireAuth,
  defaultCommentTarget,
  messages,
  primarySubmit,
  commentSubmit,
  primarySubmitting = false,
  commentSubmitting = false,
}: DiscussionComposerOptions) {
  const [composerVariant, setComposerVariant] =
    useState<ComposerVariant | null>(null);
  const [commentComposerTitle, setCommentComposerTitle] = useState<
    string | undefined
  >(undefined);
  const [commentContext, setCommentContext] = useState<ComposerContext | null>(
    null,
  );
  const [commentTarget, setCommentTarget] = useState<CommentTarget | null>(
    null,
  );
  const [primaryDraft, setPrimaryDraft] = useState('');
  const [commentDraft, setCommentDraft] = useState('');
  const [primaryError, setPrimaryError] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);

  const isPrimaryComposer = composerVariant === primaryVariant;

  const openPrimaryComposer = useCallback(() => {
    setComposerVariant(primaryVariant);
    setCommentComposerTitle(undefined);
    setCommentContext(null);
    setCommentTarget(null);
  }, [primaryVariant]);

  const openCommentComposer = useCallback(
    (options?: OpenCommentOptions) => {
      const mergedTarget =
        options?.target ?? options?.context?.target ?? defaultCommentTarget;
      const hasReplyTarget =
        Boolean(options?.context) ||
        Boolean(
          mergedTarget?.answerId ||
            mergedTarget?.parentCommentId ||
            mergedTarget?.commentId,
        );

      setCommentComposerTitle(options?.title);
      setCommentTarget(mergedTarget ?? null);
      setCommentContext(
        hasReplyTarget
          ? {
              title:
                options?.context?.title ?? options?.title ?? 'Post Comment',
              author: options?.context?.author ?? '',
              timestamp: options?.context?.timestamp,
              excerpt: options?.context?.excerpt ?? '',
              isOp: options?.context?.isOp,
              target: mergedTarget ?? undefined,
            }
          : null,
      );
      setComposerVariant('comment');
    },
    [defaultCommentTarget],
  );

  const closeComposer = useCallback(() => {
    if (isPrimaryComposer && primarySubmitting) {
      return;
    }
    if (
      !isPrimaryComposer &&
      composerVariant === 'comment' &&
      commentSubmitting
    ) {
      return;
    }
    setComposerVariant(null);
    setPrimaryError(null);
    setCommentError(null);
    setCommentComposerTitle(undefined);
    setCommentContext(null);
    setCommentTarget(null);
  }, [
    commentSubmitting,
    composerVariant,
    isPrimaryComposer,
    primarySubmitting,
  ]);

  const handleSubmitPrimary = useCallback(async () => {
    if (!primarySubmit) return;
    if (!requireAuth()) {
      return;
    }
    const { html, plain } = parseEditorValue(primaryDraft);
    if (!plain) {
      setPrimaryError(messages.primary.required);
      return;
    }
    if (plain.length > maxCharacters) {
      setPrimaryError(messages.primary.exceed);
      return;
    }
    setPrimaryError(null);
    try {
      await primarySubmit({ html, plain });
      setPrimaryDraft('');
      setComposerVariant(null);
    } catch (error: any) {
      setPrimaryError(error?.message ?? messages.primary.failed);
    }
  }, [
    maxCharacters,
    messages.primary.exceed,
    messages.primary.failed,
    messages.primary.required,
    primaryDraft,
    primarySubmit,
    requireAuth,
  ]);

  const handleSubmitComment = useCallback(async () => {
    if (!commentSubmit) return;
    if (!requireAuth()) {
      return;
    }
    const { html, plain } = parseEditorValue(commentDraft);
    if (!plain) {
      setCommentError(messages.comment.required);
      return;
    }
    if (plain.length > maxCharacters) {
      setCommentError(messages.comment.exceed);
      return;
    }
    const target: CommentTarget = commentTarget ??
      commentContext?.target ?? {
        threadId,
      };
    setCommentError(null);
    try {
      await commentSubmit({
        html,
        plain,
        target,
      });
      setCommentDraft('');
      setComposerVariant(null);
      setCommentContext(null);
      setCommentTarget(null);
      setCommentComposerTitle(undefined);
    } catch (error: any) {
      setCommentError(error?.message ?? messages.comment.failed);
    }
  }, [
    commentContext?.target,
    commentDraft,
    commentSubmit,
    commentTarget,
    maxCharacters,
    messages.comment.exceed,
    messages.comment.failed,
    messages.comment.required,
    requireAuth,
    threadId,
  ]);

  const modalVariant = useMemo<ComposerVariant>(() => {
    if (composerVariant === 'comment') return 'comment';
    if (composerVariant === 'counter') return 'counter';
    return 'answer';
  }, [composerVariant]);

  return {
    composerVariant,
    modalVariant,
    isPrimaryComposer,
    primaryDraft,
    commentDraft,
    primaryError,
    commentError,
    commentContext,
    commentTarget,
    commentComposerTitle,
    setPrimaryDraft,
    setCommentDraft,
    openPrimaryComposer,
    openCommentComposer,
    closeComposer,
    handleSubmitPrimary,
    handleSubmitComment,
  };
}
