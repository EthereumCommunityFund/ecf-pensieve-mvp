'use client';

import { XCircleIcon } from '@phosphor-icons/react';

import { Button } from '@/components/base';
import { Modal, ModalBody, ModalContent } from '@/components/base/modal';

import { SentimentBreakdownList } from './SentimentBreakdownList';
import { SentimentMetric } from './sentimentConfig';

export type SentimentModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  excerpt: string;
  sentiments?: SentimentMetric[];
  totalVotes?: number;
};

export function SentimentModal({
  open,
  onClose,
  title,
  excerpt,
  sentiments,
  totalVotes,
}: SentimentModalProps) {
  if (!open) return null;

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      hideCloseButton
      classNames={{
        base: 'w-full max-w-[470px] rounded-[16px] bg-transparent p-0 shadow-none',
        body: 'p-0',
      }}
    >
      <ModalContent>
        <ModalBody className="p-0">
          <SentimentSummaryPanel
            title={title}
            totalVotes={totalVotes}
            sentiments={sentiments}
            excerpt={excerpt}
            onClose={onClose}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

type SentimentSummaryPanelProps = {
  title: string;
  sentiments?: SentimentMetric[];
  totalVotes?: number;
  excerpt?: string;
  onClose: () => void;
};

export function SentimentSummaryPanel({
  title,
  sentiments,
  totalVotes,
  excerpt,
  onClose,
}: SentimentSummaryPanelProps) {
  return (
    <div className="relative flex flex-col gap-[14px] rounded-[16px] bg-white p-[14px] shadow-[0_25px_65px_rgba(15,23,42,0.25)]">
      <div className="absolute right-[14px] top-[14px]">
        <Button
          isIconOnly
          onPress={onClose}
          aria-label="Close sentiment modal"
          className="rounded-full border-none bg-transparent p-0 text-black/60 hover:bg-black/5"
        >
          <XCircleIcon size={24} weight="fill" className="opacity-30" />
        </Button>
      </div>

      <header className="flex flex-col gap-[14px]">
        <div className="flex flex-col gap-[10px]">
          <p className="text-sm font-semibold text-black/60">User Sentiment</p>
          <p className="text-[13px] text-black/60">{totalVotes || 0} voted</p>
        </div>

        <div className="w-full truncate rounded-[5px] bg-[#f5f5f5] p-[10px] text-[16px] font-semibold text-black">
          {title}
        </div>
      </header>

      <SentimentBreakdownList sentiments={sentiments} />

      <div className="text-right text-[13px] font-[500] text-black/50">
        What is User Sentiment?
      </div>
    </div>
  );
}
