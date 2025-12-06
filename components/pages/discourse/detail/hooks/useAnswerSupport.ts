import { useCallback, useState } from 'react';

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

  const handleWithdraw = useCallback(
    async (answerId: number) => {
      if (!requireAuth()) return;
      setWithdrawingId(answerId);
      try {
        await unvoteAnswer(answerId);
        onWithdrawSuccess?.();
      } catch (error) {
        onWithdrawError?.(error);
      } finally {
        setWithdrawingId((current) => (current === answerId ? null : current));
        onFinally?.();
      }
    },
    [onFinally, onWithdrawError, onWithdrawSuccess, requireAuth, unvoteAnswer],
  );

  const handleSupport = useCallback(
    async (answerId: number) => {
      if (!requireAuth()) return;
      const existingSupported = answers.find(
        (answer) => answer.viewerHasSupported,
      );

      if (existingSupported?.numericId === answerId) {
        await handleWithdraw(answerId);
        return;
      }

      if (existingSupported && existingSupported.numericId !== answerId) {
        setWithdrawingId(existingSupported.numericId);
        try {
          await unvoteAnswer(existingSupported.numericId);
        } catch (error) {
          onWithdrawError?.(error);
          setWithdrawingId(null);
          return;
        } finally {
          setWithdrawingId(null);
        }
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

  return {
    supportingId,
    withdrawingId,
    handleSupport,
    handleWithdraw,
  };
}
