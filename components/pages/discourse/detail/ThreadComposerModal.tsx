'use client';

import { ChartBar, Info, PaperPlaneRight } from '@phosphor-icons/react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/base';
import MdEditor from '@/components/base/MdEditor';
import {
  CommonModalHeader,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
} from '@/components/base/modal';

import { EDITOR_MAX_CHARACTERS, parseEditorValue } from '../utils/editorValue';

type ThreadComposerModalProps = {
  isOpen: boolean;
  variant: 'answer' | 'comment';
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  isSubmitting?: boolean;
  error?: string | null;
  threadTitle: string;
  threadCategory?: string;
  isScam?: boolean;
  contextCard?: ComposerContext;
  titleOverride?: string;
};

const VARIANT_CONFIG = {
  answer: {
    title: 'Post Answer',
    placeholder: 'Write about your issue',
    helper: 'Markdown supported.',
    primaryLabel: 'Publish Answer',
    badge: 'Answer',
  },
  comment: {
    title: 'Post Comment',
    placeholder: 'Write about your issue',
    helper: 'Markdown supported.',
    primaryLabel: 'Publish Post',
    badge: 'Discussion',
  },
} as const;

export type ComposerContext = {
  title: string;
  author: string;
  timestamp?: string;
  excerpt: string;
  isOp?: boolean;
};

export function ThreadComposerModal({
  isOpen,
  variant,
  value,
  onChange,
  onSubmit,
  onClose,
  isSubmitting,
  error,
  threadTitle,
  threadCategory,
  isScam,
  contextCard,
  titleOverride,
}: ThreadComposerModalProps) {
  const config = VARIANT_CONFIG[variant];
  const plainText = useMemo(() => parseEditorValue(value).plain, [value]);
  const charactersUsed = plainText.length;
  const charactersRemaining = Math.max(
    0,
    EDITOR_MAX_CHARACTERS - charactersUsed,
  );
  const [includeSentiment, setIncludeSentiment] = useState(false);
  const showSentimentToggle = true;
  const modalTitle = titleOverride || config.title;
  const showOpBadge =
    contextCard?.isOp && !contextCard.author.toLowerCase().includes('(op)');

  const handleEditorChange = (nextValue: string) => {
    onChange(nextValue);
  };

  const badgeLabel = useMemo(() => {
    if (variant === 'answer' && isScam) {
      return 'Counter Claim';
    }
    return config.badge;
  }, [config.badge, isScam, variant]);

  const canSubmit =
    Boolean(plainText.trim()) &&
    plainText.length <= EDITOR_MAX_CHARACTERS &&
    !isSubmitting;

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      setIncludeSentiment(false);
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      classNames={{
        base: 'w-[700px] max-w-auto tablet:max-w-[calc(80vw)] mobile:max-w-[calc(100vw-24px)] bg-transparent border-none p-0 shadow-none',
        body: 'p-0',
        header: 'p-0',
        footer: 'p-0',
      }}
    >
      <ModalContent className="overflow-hidden rounded-[10px] border border-black/10 bg-white p-0 shadow-[0_24px_80px_rgba(0,0,0,0.16)]">
        <CommonModalHeader
          title={modalTitle}
          onClose={handleClose}
          isDisabled={isSubmitting}
          classNames={{
            base: 'items-center px-6 pt-5 pb-4 border-b border-black/10',
            title: 'text-[18px] font-semibold text-black',
            button: 'opacity-50 hover:opacity-100',
          }}
        />

        <ModalBody className="flex flex-col gap-3 px-6 pb-5 pt-4">
          {contextCard ? (
            <div className="rounded-[10px] border border-black/10 bg-white px-[12px] py-[10px]">
              <p className="text-[14px] font-semibold text-black/50">
                {contextCard.title}
              </p>
              <div className="mt-2 flex flex-col gap-[6px]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[14px] font-semibold text-black">
                    {contextCard.author}
                  </span>
                  {showOpBadge ? (
                    <span className="text-[12px] font-semibold text-[#1b9573]">
                      (OP)
                    </span>
                  ) : null}
                  {contextCard.timestamp ? (
                    <span className="text-[12px] text-black/60">
                      {contextCard.timestamp}
                    </span>
                  ) : null}
                </div>
                <p className="text-[14px] leading-[20px] text-black/80">
                  {contextCard.excerpt}
                </p>
              </div>
            </div>
          ) : null}

          <MdEditor
            value={value}
            onChange={handleEditorChange}
            placeholder={config.placeholder}
            hideMenuBar={false}
            debounceMs={150}
            className={{
              base: `min-h-[320px] rounded-[8px] border bg-white ${
                error ? 'border-[#d14343]' : 'border-black/10'
              }`,
              editorWrapper: 'p-3',
              editor:
                'min-h-[260px] text-[14px] leading-[20px] text-black/80 placeholder:text-black/40',
            }}
            isEdit={!isSubmitting}
          />
          {error ? <p className="text-xs text-[#d14343]">{error}</p> : null}
          <div className="flex items-center justify-between text-xs text-black/70">
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex items-center rounded-[3px] bg-black px-2 py-[2px] text-[10px] font-semibold uppercase tracking-[0.08em] text-white">
                MD
              </span>
              <span>Markdown Available</span>
            </span>
            <span className="text-[11px] text-black/60">
              {charactersRemaining.toLocaleString()} characters remaining
            </span>
          </div>

          {showSentimentToggle ? (
            <div className="flex items-center justify-between rounded-[5px] border border-black/10 bg-white px-3 py-2">
              <div className="flex items-center gap-[10px] text-[14px] text-black">
                <ChartBar size={18} weight="fill" className="text-black/60" />
                <span className="font-medium">
                  Include Sentiment in Comment
                </span>
                <Info size={16} className="text-black/40" />
              </div>
              <button
                type="button"
                aria-pressed={includeSentiment}
                disabled={isSubmitting}
                onClick={() => setIncludeSentiment((current) => !current)}
                className={`flex h-6 w-11 items-center rounded-full border border-black/15 px-[4px] transition ${
                  includeSentiment ? 'bg-black' : 'bg-black/10'
                } ${
                  isSubmitting
                    ? 'cursor-not-allowed opacity-60'
                    : 'cursor-pointer'
                }`}
              >
                <span
                  className={`size-[18px] rounded-full bg-white shadow-sm transition ${
                    includeSentiment ? 'translate-x-[14px]' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ) : null}
        </ModalBody>

        <ModalFooter className="flex items-center justify-end gap-3 border-t border-black/10 bg-[rgba(0,0,0,0.02)] px-6 pb-5 pt-4">
          <Button
            variant="light"
            className="rounded-[5px] border border-black/15 bg-white px-[20px] py-[10px] text-[14px] font-semibold text-black"
            onPress={handleClose}
            isDisabled={isSubmitting}
          >
            Discard Draft
          </Button>
          <Button
            color="secondary"
            onPress={onSubmit}
            isDisabled={!canSubmit}
            isLoading={isSubmitting}
            className="rounded-[5px] bg-[#d4d4d4] px-[24px] py-[10px] text-[14px] font-semibold text-black hover:bg-[#c0c0c0] disabled:bg-[#e6e6e6]"
          >
            {config.primaryLabel}
            <PaperPlaneRight size={16} weight="fill" />
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
