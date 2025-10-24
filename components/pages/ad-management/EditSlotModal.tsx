'use client';

import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/base/button';
import { Input } from '@/components/base/input';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
} from '@/components/base/modal';
import { Select, SelectItem } from '@/components/base/select';
import ECFTypography from '@/components/base/typography';
import { InfoIcon, ShowMetricsIcon, XIcon } from '@/components/icons';
import type { ActiveSlotData } from '@/hooks/useHarbergerSlots';
import { formatDuration } from '@/utils/harberger';

const CONTENT_TYPE_OPTIONS = [
  { key: 'image', label: 'Image' },
  { key: 'html', label: 'HTML Embed' },
  { key: 'video', label: 'Video' },
];

interface EditSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: ActiveSlotData | null;
  isSubmitting?: boolean;
  errorMessage?: string;
  onSubmit: (payload: {
    creativeUri: string;
    metadata: {
      contentType: string;
      title: string;
      linkUrl: string;
      mediaUrl: string;
    };
  }) => Promise<void>;
}

export default function EditSlotModal({
  isOpen,
  onClose,
  slot,
  isSubmitting = false,
  errorMessage,
  onSubmit,
}: EditSlotModalProps) {
  const [contentType, setContentType] = useState<string>(
    CONTENT_TYPE_OPTIONS[0].key,
  );
  const [title, setTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setLocalError(null);

    if (!slot) {
      setContentType(CONTENT_TYPE_OPTIONS[0].key);
      setTitle('');
      setLinkUrl('');
      setMediaUrl('');
      return;
    }

    const uri = slot.currentAdURI ?? '';
    if (uri.startsWith('data:application/json')) {
      try {
        const payload = decodeURIComponent(uri.split(',')[1] ?? '');
        const parsed = JSON.parse(payload) as {
          contentType?: string;
          title?: string;
          linkUrl?: string;
          mediaUrl?: string;
        };
        setContentType(parsed.contentType ?? CONTENT_TYPE_OPTIONS[0].key);
        setTitle(parsed.title ?? '');
        setLinkUrl(parsed.linkUrl ?? '');
        setMediaUrl(parsed.mediaUrl ?? '');
        return;
      } catch (error) {
        // fall through to using raw URI
      }
    }

    setContentType(CONTENT_TYPE_OPTIONS[0].key);
    setTitle('');
    if (
      uri.startsWith('http://') ||
      uri.startsWith('https://') ||
      uri.startsWith('ipfs://')
    ) {
      setMediaUrl(uri);
      setLinkUrl('');
    } else {
      setMediaUrl('');
      setLinkUrl(uri);
    }
  }, [isOpen, slot]);

  const coverageLabel = useMemo(() => {
    if (!slot) {
      return '—';
    }
    return formatDuration(slot.taxPeriodInSeconds, { fallback: '—' });
  }, [slot]);

  const combinedError = localError ?? errorMessage ?? null;

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }
    setLocalError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!slot) {
      return;
    }

    const trimmedLink = linkUrl.trim();
    const trimmedMedia = mediaUrl.trim();
    const trimmedTitle = title.trim();

    let creativeUri = '';
    if (trimmedMedia) {
      creativeUri = trimmedMedia;
    } else if (trimmedLink) {
      creativeUri = trimmedLink;
    } else {
      const payload = {
        contentType,
        title: trimmedTitle,
        linkUrl: trimmedLink,
        mediaUrl: trimmedMedia,
      };
      creativeUri = `data:application/json,${encodeURIComponent(
        JSON.stringify(payload),
      )}`;
    }

    if (!creativeUri) {
      setLocalError('Provide a creative URI or metadata.');
      return;
    }

    try {
      await onSubmit({
        creativeUri,
        metadata: {
          contentType,
          title: trimmedTitle,
          linkUrl: trimmedLink,
          mediaUrl: trimmedMedia,
        },
      });
      setLocalError(null);
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : 'Failed to update creative.',
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      classNames={{
        base: 'w-[600px] mobile:w-[calc(100vw-32px)] bg-white p-0 max-w-[9999px]',
      }}
      placement="center"
    >
      <ModalContent>
        {() => (
          <>
            <div className="flex flex-col gap-[6px] px-5 pt-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <ECFTypography type="subtitle2" className="text-[18px]">
                    Edit Slot
                  </ECFTypography>
                  <span className="rounded-[6px] border border-black/10 bg-[#F4F5F7] px-[8px] py-[2px] text-[12px] font-semibold uppercase tracking-[0.04em] text-black/70">
                    {slot?.statusLabel ?? 'Owned'}
                  </span>
                </div>

                <Button
                  isIconOnly
                  radius="sm"
                  className="size-[32px] rounded-[8px] bg-black/5 p-0 text-black/50 hover:bg-black/10"
                  onPress={handleClose}
                  isDisabled={isSubmitting}
                >
                  <XIcon size={16} />
                </Button>
              </div>
            </div>

            <ModalBody className="flex flex-col gap-[20px] px-5 pb-0 pt-4">
              <div className="flex flex-col gap-[8px]">
                <span className="text-[13px] font-semibold text-black/50">
                  Slot:
                </span>
                <span className="text-[14px] font-semibold text-black">
                  {slot?.slotName ?? '—'}
                </span>
              </div>

              <div className="flex flex-col gap-[12px] rounded-[12px] border border-black/10 bg-[#FCFCFC] p-[16px]">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-[8px] text-[13px] font-semibold text-black/70">
                    <ShowMetricsIcon className="size-[18px] text-black/40" />
                    <span>Current Slot Settings</span>
                  </div>
                  <InfoIcon size={18} />
                </div>

                <InfoRow label="Valuation" value={slot?.valuation ?? '—'} />
                <InfoRow label="Locked Bond" value={slot?.lockedBond ?? '—'} />
                <InfoRow label="Tax Rate" value={slot?.taxRate ?? '—'} />
                <InfoRow label="Coverage Per Period" value={coverageLabel} />
              </div>

              <div className="flex flex-col gap-[20px]">
                <div className="flex flex-col gap-[12px]">
                  <LabelWithInfo label="Content Type" />
                  <Select
                    selectedKeys={[contentType]}
                    onSelectionChange={(keys) => {
                      const key = Array.from(keys)[0] as string | undefined;
                      if (key) {
                        setContentType(key);
                      }
                    }}
                    className="w-full"
                    aria-label="Select content type"
                  >
                    {CONTENT_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.key}>{option.label}</SelectItem>
                    ))}
                  </Select>
                </div>

                <div className="flex flex-col gap-[12px]">
                  <LabelWithInfo label="Title" />
                  <Input
                    placeholder="type here"
                    aria-label="Creative title"
                    value={title}
                    onValueChange={setTitle}
                  />
                </div>

                <div className="flex flex-col gap-[12px]">
                  <LabelWithInfo label="Link URL" />
                  <Input
                    placeholder="https://"
                    aria-label="Link URL"
                    value={linkUrl}
                    onValueChange={setLinkUrl}
                  />
                </div>

                <div className="flex flex-col gap-[12px]">
                  <LabelWithInfo label="Media / Image URI" />
                  <Input
                    placeholder="https:// or ipfs://"
                    aria-label="Media reference"
                    value={mediaUrl}
                    onValueChange={setMediaUrl}
                  />
                  <span className="text-[12px] text-black/50">
                    Provide a direct asset link when available. If omitted,
                    metadata will be embedded and you can update later.
                  </span>
                </div>
              </div>

              {combinedError ? (
                <div className="rounded-[8px] border border-[#F87171] bg-[#FEF2F2] px-4 py-3 text-[13px] font-medium text-[#B91C1C]">
                  {combinedError}
                </div>
              ) : null}
            </ModalBody>

            <ModalFooter className="flex items-center gap-[12px] p-5">
              <Button
                color="secondary"
                className="h-[40px] flex-1 rounded-[8px] border border-black/20 bg-white text-[14px] font-semibold text-black hover:bg-black/[0.05]"
                onPress={handleClose}
                isDisabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                className="h-[40px] flex-1 rounded-[8px] bg-black text-[14px] font-semibold text-white hover:bg-black/90"
                onPress={handleSubmit}
                isDisabled={isSubmitting}
                isLoading={isSubmitting}
              >
                Save Changes
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

function LabelWithInfo({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-[8px] text-[13px] font-semibold text-black/70">
      <span>{label}</span>
      <InfoIcon size={16} />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[13px]">
      <span className="text-black/60">{label}</span>
      <span className="font-semibold text-black">{value}</span>
    </div>
  );
}
