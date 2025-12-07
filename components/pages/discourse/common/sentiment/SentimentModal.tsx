'use client';

import { XCircleIcon } from '@phosphor-icons/react';
import { Skeleton } from '@heroui/react';

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

export type SentimentSummaryPanelProps = {
  title?: string;
  customHeader?: React.ReactNode;
  sentiments?: SentimentMetric[];
  totalVotes?: number;
  excerpt?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
};

export function SentimentSummaryPanel({
  title,
  sentiments,
  totalVotes,
  excerpt,
  onClose,
  customHeader,
  showCloseButton = false,
}: SentimentSummaryPanelProps) {
  return (
    <div className="relative flex flex-col gap-[14px] rounded-[16px] border border-black/10 bg-white p-[14px]">
      {showCloseButton && onClose ? (
        <div className="absolute right-[14px] top-[14px]">
          <Button
            isIconOnly
            onPress={onClose}
            aria-label="Close sentiment modal"
            className="rounded-full border-none bg-transparent p-1 text-black/60 hover:bg-black/5"
          >
            <XCircleIcon size={24} weight="fill" className="opacity-30" />
          </Button>
        </div>
      ) : null}

      <header className="flex flex-col gap-[14px] pr-6">
        <div className="flex flex-col gap-[10px]">
          {customHeader ? (
            customHeader
          ) : (
            <p className="text-sm font-semibold text-black/60">
              User Sentiment
            </p>
          )}

          <p className="text-[13px] text-black/60">{totalVotes || 0} voted</p>
        </div>

        {title && (
          <div className="w-full truncate rounded-[5px] bg-[#f5f5f5] p-[10px] text-[16px] font-semibold text-black">
            {title}
          </div>
        )}
      </header>

      <SentimentBreakdownList sentiments={sentiments} />

      <div className="text-right text-[13px] font-[500] text-black/50">
        What is User Sentiment?
      </div>
    </div>
  );
}

export function SentimentSummaryPanelSkeleton() {
  return (
    <div className="relative flex flex-col gap-[14px] rounded-[16px] border border-black/10 bg-white p-[14px]">
      <div className="flex flex-col gap-[10px] pr-6">
        <div className="flex flex-col gap-[6px]">
          <Skeleton className="h-[16px] w-[150px] rounded-[6px]" />
          <Skeleton className="h-[14px] w-[100px] rounded-[6px]" />
        </div>
      </div>
      <div className="space-y-[8px]">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-2 rounded-[6px] border border-black/5 px-[8px] py-[6px]"
          >
            <div className="flex items-center gap-2">
              <Skeleton className="size-[16px] rounded-full" />
              <Skeleton className="h-[14px] w-[90px] rounded-[4px]" />
            </div>
            <Skeleton className="h-[12px] w-[40px] rounded-[4px]" />
          </div>
        ))}
      </div>
      <Skeleton className="h-[14px] w-[140px] self-end rounded-[6px]" />
    </div>
  );
}
