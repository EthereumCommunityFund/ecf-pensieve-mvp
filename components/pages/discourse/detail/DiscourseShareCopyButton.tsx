'use client';

import { addToast } from '@heroui/react';
import { ShareFat } from '@phosphor-icons/react';
import { useCallback, useMemo, useState } from 'react';

import { Button } from '@/components/base/button';
import { trpc } from '@/lib/trpc/client';

async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      void error;
    }
  }

  try {
    if (typeof document === 'undefined') {
      return false;
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const result = document.execCommand('copy');
    document.body.removeChild(textarea);
    return result;
  } catch {
    return false;
  }
}

export type DiscourseShareCopyButtonProps =
  | {
      type: 'thread';
      threadId: number;
      fallbackUrl: string;
      className?: string;
      children?: string;
      message?: string;
    }
  | {
      type: 'answer';
      threadId: number;
      answerId: number;
      fallbackUrl: string;
      className?: string;
      children?: string;
      message?: string;
    };

export default function DiscourseShareCopyButton(
  props: DiscourseShareCopyButtonProps,
) {
  const [shortUrl, setShortUrl] = useState('');
  const ensureMutation = trpc.discourseShare.ensure.useMutation();

  const requestInput = useMemo(() => {
    if (props.type === 'thread') {
      return { type: 'thread' as const, threadId: props.threadId };
    }
    return {
      type: 'answer' as const,
      threadId: props.threadId,
      answerId: props.answerId,
    };
  }, [props]);

  const label = props.children ?? 'Share';

  const handleShare = useCallback(async () => {
    let urlToCopy = shortUrl || props.fallbackUrl;
    let usedShortLink = Boolean(shortUrl);

    if (!shortUrl) {
      try {
        const result = await ensureMutation.mutateAsync(requestInput);
        if (result?.shareUrl) {
          urlToCopy = result.shareUrl;
          setShortUrl(result.shareUrl);
          usedShortLink = true;
        }
      } catch (error) {
        void error;
      }
    }

    const copied = await copyTextToClipboard(urlToCopy);
    if (copied) {
      addToast({
        title: usedShortLink
          ? 'Short link copied to clipboard'
          : 'Link copied to clipboard',
        description: props.message,
        color: 'success',
      });
    } else {
      addToast({
        title: 'Failed to copy link',
        color: 'danger',
      });
    }
  }, [
    ensureMutation,
    props.fallbackUrl,
    props.message,
    requestInput,
    shortUrl,
  ]);

  return (
    <Button
      startContent={<ShareFat weight="fill" format="Stroke" size={20} />}
      className={props.className}
      isDisabled={ensureMutation.isPending}
      isLoading={ensureMutation.isPending}
      onPress={handleShare}
    >
      {label}
    </Button>
  );
}
