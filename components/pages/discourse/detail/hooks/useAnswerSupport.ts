import { useCallback, useMemo, useState } from 'react';

import type { AnswerItem } from '@/components/pages/discourse/common/threadData';

type UseAnswerSupportOptions = {
  requireAuth: () => boolean;
  answers: AnswerItem[];
  voteAnswer: (answerId: number) => Promise<unknown>;
  unvoteAnswer: (answerId: number) => Promise<unknown>;
  onSupportSuccess?: () => void;
  onSupportError?: (error: unknown) => void;
  onWithdrawSuccess?: () => void;
  onWithdrawError?: (error: unknown) => void;
  onFinally?: () => void;
};

export function useAnswerSupport({
  requireAuth,
  answers,
  voteAnswer,
  unvoteAnswer,
  onSupportSuccess,
  onSupportError,
  onWithdrawSuccess,
  onWithdrawError,
  onFinally,
}: UseAnswerSupportOptions) {
  const [supportingId, setSupportingId] = useState<number | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<number | null>(null);
  const [pendingAction, setPendingAction] = useState<
    | { type: 'switch'; currentId: number; targetId: number }
    | { type: 'unvote'; currentId: number }
    | null
  >(null);

  const pendingIds = useMemo(() => {
    if (!pendingAction) return null;
    if (pendingAction.type === 'switch') {
      return {
        withdrawing: pendingAction.currentId,
        supporting: pendingAction.targetId,
      };
    }
    return { withdrawing: pendingAction.currentId };
  }, [pendingAction]);

  const handleWithdraw = useCallback(
    async (answerId: number) => {
      if (!requireAuth()) return;
      setPendingAction({ type: 'unvote', currentId: answerId });
    },
    [requireAuth],
  );

  const handleSupport = useCallback(
    async (answerId: number) => {
      if (!requireAuth()) return;
      const existingSupported = answers.find(
        (answer) => answer.viewerHasSupported,
      );

      if (existingSupported?.numericId === answerId) {
        setPendingAction({ type: 'unvote', currentId: answerId });
        return;
      }

      if (existingSupported && existingSupported.numericId !== answerId) {
        setPendingAction({
          type: 'switch',
          currentId: existingSupported.numericId,
          targetId: answerId,
        });
        return;
      }

      setSupportingId(answerId);
      try {
        await voteAnswer(answerId);
        onSupportSuccess?.();
      } catch (error) {
        onSupportError?.(error);
      } finally {
        setSupportingId((current) => (current === answerId ? null : current));
        onFinally?.();
      }
    },
    [
      answers,
      handleWithdraw,
      onFinally,
      onSupportError,
      onSupportSuccess,
      onWithdrawError,
      requireAuth,
      unvoteAnswer,
      voteAnswer,
    ],
  );

  const confirmAction = useCallback(async () => {
    if (!pendingAction || !requireAuth()) return;

    if (pendingAction.type === 'unvote') {
      const { currentId } = pendingAction;
      setWithdrawingId(currentId);
      try {
        await unvoteAnswer(currentId);
        onWithdrawSuccess?.();
      } catch (error) {
        onWithdrawError?.(error);
        return;
      } finally {
        setWithdrawingId((current) => (current === currentId ? null : current));
        setPendingAction(null);
        onFinally?.();
      }
      return;
    }

    if (pendingAction.type === 'switch') {
      const { currentId, targetId } = pendingAction;
      setWithdrawingId(currentId);
      let unvoteSucceeded = false;

      try {
        await unvoteAnswer(currentId);
        onWithdrawSuccess?.();
        unvoteSucceeded = true;
      } catch (error) {
        onWithdrawError?.(error);
      } finally {
        setWithdrawingId((current) => (current === currentId ? null : current));
      }

      if (!unvoteSucceeded) {
        setPendingAction(null);
        onFinally?.();
        return;
      }

      setSupportingId(targetId);
      try {
        await voteAnswer(targetId);
        onSupportSuccess?.();
      } catch (error) {
        onSupportError?.(error);
      } finally {
        setSupportingId((current) => (current === targetId ? null : current));
        setPendingAction(null);
        onFinally?.();
      }
    }
  }, [
    onFinally,
    onSupportError,
    onSupportSuccess,
    onWithdrawError,
    onWithdrawSuccess,
    pendingAction,
    requireAuth,
    unvoteAnswer,
    voteAnswer,
  ]);

  const cancelAction = useCallback(() => setPendingAction(null), []);

  const getOptimisticSupportState = useCallback(
    (answerId: number, viewerHasSupported: boolean | null | undefined) => {
      if (supportingId === answerId) return true;
      if (withdrawingId === answerId) return false;
      if (
        pendingAction?.type === 'unvote' &&
        pendingAction.currentId === answerId
      )
        return false;
      if (pendingAction?.type === 'switch') {
        if (pendingAction.currentId === answerId) return false;
        if (pendingAction.targetId === answerId) return true;
      }
      return Boolean(viewerHasSupported);
    },
    [pendingAction, supportingId, withdrawingId],
  );

  return {
    supportingId,
    withdrawingId,
    handleSupport,
    handleWithdraw,
    pendingAction,
    pendingIds,
    confirmAction,
    cancelAction,
    getOptimisticSupportState,
  };
}
