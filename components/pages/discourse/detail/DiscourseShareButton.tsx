'use client';

import { useDisclosure } from '@heroui/react';
import { useCallback, useMemo, useState } from 'react';

import { Button } from '@/components/base';
import ShareModal from '@/components/biz/share/ShareModal';
import { buildDiscourseShareOgImageUrl } from '@/lib/services/discourseShare/url';
import { trpc } from '@/lib/trpc/client';
import { getAppOrigin } from '@/lib/utils/url';

type DiscourseShareButtonProps =
  | {
      type: 'thread';
      threadId: number;
      fallbackUrl: string;
      className?: string;
      children?: string;
      modalTitle?: string;
    }
  | {
      type: 'answer';
      threadId: number;
      answerId: number;
      fallbackUrl: string;
      className?: string;
      children?: string;
      modalTitle?: string;
    };

export default function DiscourseShareButton(props: DiscourseShareButtonProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [shareUrl, setShareUrl] = useState('');
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ensureMutation = trpc.discourseShare.ensure.useMutation();

  const input = useMemo(() => {
    if (props.type === 'thread') {
      return { type: 'thread' as const, threadId: props.threadId };
    }
    return {
      type: 'answer' as const,
      threadId: props.threadId,
      answerId: props.answerId,
    };
  }, [props]);

  const origin = useMemo(() => {
    if (typeof window !== 'undefined' && window.location?.origin) {
      return window.location.origin;
    }
    return getAppOrigin();
  }, []);

  const handleEnsure = useCallback(async () => {
    setError(null);
    try {
      const result = await ensureMutation.mutateAsync(input);
      if (result?.shareUrl) {
        setShareUrl(result.shareUrl);
      }
      if (result?.code) {
        setShareImageUrl(
          buildDiscourseShareOgImageUrl({
            code: result.code,
            version: result.imageVersion ?? undefined,
            origin,
          }),
        );
      }
    } catch (ensureError) {
      console.error('[discourse-share] ensure failed', ensureError);
      setError('Failed to create short link. Please retry.');
    }
  }, [ensureMutation, input, origin]);

  const handleOpen = useCallback(() => {
    onOpen();
    if (!shareUrl) {
      void handleEnsure();
    }
  }, [handleEnsure, onOpen, shareUrl]);

  const effectiveShareUrl = shareUrl || props.fallbackUrl;

  const subject = useMemo(() => {
    const title = props.modalTitle?.toLowerCase() ?? '';
    if (title.includes('counter claim')) {
      return 'counter claim';
    }
    if (props.type === 'answer') {
      return 'answer';
    }
    return 'thread';
  }, [props.modalTitle, props.type]);

  return (
    <>
      <Button className={props.className} onPress={handleOpen}>
        {props.children ?? 'Share'}
      </Button>
      <ShareModal
        isOpen={isOpen}
        onClose={onClose}
        title={props.modalTitle ?? 'Share Discourse'}
        linkTitle="Share Link"
        linkIntro={`Copy the link below to share this ${subject}.`}
        linkDetails="This short link generates a preview card for social platforms. (X/Twitter may need a few minutes to fetch the preview image)"
        shareUrl={effectiveShareUrl}
        shareImageUrl={shareImageUrl}
        isLoading={ensureMutation.isPending}
        error={error}
        onRefresh={handleEnsure}
      />
    </>
  );
}
