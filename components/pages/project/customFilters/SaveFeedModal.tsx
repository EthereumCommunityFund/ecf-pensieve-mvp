'use client';

import {
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { Button, addToast } from '@/components/base';
import { Select, SelectItem } from '@/components/base/select';
import ECFTypography from '@/components/base/typography';
import { GlobeHemisphereWestIcon, LockKeyIcon } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { trpc } from '@/lib/trpc/client';
import type { RouterOutputs } from '@/types';

type SaveFeedResult = RouterOutputs['sieve']['createSieve'];

async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('navigator.clipboard.writeText failed', error);
    }
  }

  if (typeof document === 'undefined') {
    return false;
  }

  try {
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
  } catch (error) {
    console.error('Fallback clipboard copy failed', error);
    return false;
  }
}

interface SaveFeedModalProps {
  isOpen: boolean;
  targetPath: string;
  onClose: () => void;
  onSaved?: (result: SaveFeedResult) => void;
}

const visibilityOptions: Array<{
  value: 'public' | 'private';
  label: string;
  description: string;
  icon: 'public' | 'private';
}> = [
  {
    value: 'public',
    label: 'Public',
    description: 'Anyone with the link can view this feed.',
    icon: 'public',
  },
  {
    value: 'private',
    label: 'Private',
    description: 'Only you can access this feed. Sharing is disabled.',
    icon: 'private',
  },
];

const SaveFeedModal = ({
  isOpen,
  targetPath,
  onClose,
  onSaved,
}: SaveFeedModalProps) => {
  const { isAuthenticated, showAuthPrompt, profile } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
  const router = useRouter();

  const utils = trpc.useUtils();

  const createMutation = trpc.sieve.createSieve.useMutation({
    onSuccess: async (data) => {
      const shareUrl =
        data.share.visibility === 'public' ? data.share.url : undefined;
      let toastTitle = 'Feed saved successfully';
      let toastColor: 'success' | 'warning' = 'success';

      if (shareUrl) {
        const copied = await copyTextToClipboard(shareUrl);
        if (copied) {
          toastTitle = 'Link has been copied to clipboard';
        } else {
          toastTitle = 'Feed saved but failed to copy link';
          toastColor = 'warning';
        }
      }

      addToast({
        title: toastTitle,
        color: toastColor,
      });

      utils.sieve.getUserSieves.invalidate();
      onSaved?.(data);
      handleClose();

      const destinationAddress = profile?.address;
      if (destinationAddress) {
        router.push(`/profile/${destinationAddress}?tab=sieve`);
      }
    },
    onError: (error) => {
      addToast({
        title: error.message || 'Failed to save feed',
        color: 'danger',
      });
    },
  });

  const nameError = useMemo(() => {
    if (!hasTriedSubmit) {
      return '';
    }
    if (!name.trim()) {
      return 'Feed name is required';
    }
    return '';
  }, [hasTriedSubmit, name]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setVisibility('public');
    setHasTriedSubmit(false);
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = () => {
    setHasTriedSubmit(true);

    if (!isAuthenticated) {
      showAuthPrompt('invalidAction');
      return;
    }

    if (!name.trim()) {
      return;
    }

    if (!targetPath) {
      addToast({ title: 'Current filters are unavailable', color: 'warning' });
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      description: description.trim() ? description.trim() : undefined,
      targetPath,
      visibility,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      placement="center"
      classNames={{
        base: 'max-w-[480px]',
        closeButton: 'hidden',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center justify-between border-b border-black/10 px-5 py-[10px]">
          <ECFTypography
            type="subtitle2"
            className="text-[16px] font-semibold leading-[22px] text-black opacity-80"
          >
            Save as Feed
          </ECFTypography>
          <button
            onClick={handleClose}
            className="rounded p-[5px] transition-opacity hover:bg-black/5"
          >
            ×
          </button>
        </ModalHeader>

        <ModalBody className="flex flex-col gap-5 p-5">
          <div className="flex flex-col gap-[10px]">
            <ECFTypography
              type="body1"
              className="text-[16px] font-semibold leading-[24px]"
            >
              Feed Name
            </ECFTypography>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Name your feed"
              classNames={{
                inputWrapper:
                  'border border-black/10 bg-[rgba(0,0,0,0.05)] h-[40px] rounded-[8px] px-[10px]',
                input: 'text-[14px] leading-[20px] placeholder:opacity-50',
              }}
              maxLength={150}
              isInvalid={Boolean(nameError)}
              errorMessage={nameError}
            />
            <ECFTypography
              type="caption"
              className="text-right text-[11px] leading-[15px] text-black/60"
            >
              {name.length} / 150
            </ECFTypography>
          </div>

          <div className="flex flex-col gap-[10px]">
            <div className="flex items-center gap-[6px]">
              <ECFTypography
                type="body1"
                className="text-[16px] font-semibold leading-[24px]"
              >
                Description
              </ECFTypography>
              <span className="text-[12px] text-black/40">(optional)</span>
            </div>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add notes to remember why you saved this feed"
              classNames={{
                inputWrapper:
                  'border border-black/10 bg-[rgba(0,0,0,0.05)] min-h-[80px] rounded-[8px] px-[10px] py-[10px]',
                input: 'text-[14px] leading-[20px] placeholder:opacity-50',
              }}
              maxLength={1000}
            />
            <ECFTypography
              type="caption"
              className="text-right text-[11px] leading-[15px] text-black/60"
            >
              {description.length} / 1000
            </ECFTypography>
          </div>

          <div className="flex flex-col gap-[10px]">
            <ECFTypography
              type="body1"
              className="text-[16px] font-semibold leading-[24px]"
            >
              Visibility
            </ECFTypography>
            <Select
              selectedKeys={[visibility]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as
                  | 'public'
                  | 'private'
                  | undefined;
                if (selected) {
                  setVisibility(selected);
                }
              }}
              classNames={{
                trigger:
                  'h-[50px] border border-black/15 bg-[rgba(0,0,0,0.04)] px-[12px] rounded-[10px]',
                value: 'text-[14px] font-semibold text-black',
                listbox:
                  'border border-black/10 rounded-[12px] p-[8px] bg-white',
                popoverContent: 'p-0',
              }}
              placeholder="Select visibility"
              renderValue={(items) =>
                items.map((item) => (
                  <div key={item.key} className="flex items-center gap-[10px]">
                    <span className="flex size-[30px] items-center justify-center rounded-full bg-black/5 text-black">
                      {item.key === 'public' ? (
                        <GlobeHemisphereWestIcon size={16} />
                      ) : (
                        <LockKeyIcon size={16} />
                      )}
                    </span>
                    <span className="text-[14px] font-semibold">
                      {item.textValue}
                    </span>
                  </div>
                ))
              }
            >
              {visibilityOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  textValue={option.label}
                  className="rounded-[10px] px-[10px] py-[8px]"
                >
                  <div className="flex items-start gap-[12px]">
                    <span className="mt-[2px] flex size-[30px] items-center justify-center rounded-full bg-black/5 text-black">
                      {option.icon === 'public' ? (
                        <GlobeHemisphereWestIcon size={16} />
                      ) : (
                        <LockKeyIcon size={16} />
                      )}
                    </span>
                    <div className="flex flex-col gap-[4px]">
                      <span className="text-[14px] font-semibold text-black">
                        {option.label}
                      </span>
                      <span className="text-[12px] text-black/60">
                        {option.description}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </Select>

            {visibility === 'private' ? (
              <span className="rounded-[8px] bg-[#FDEBEC] px-[10px] py-[6px] text-[12px] text-[#D14343]">
                Private feeds stay personal. Switch to Public to enable sharing.
              </span>
            ) : (
              <span className="rounded-[8px] bg-[#EEF8F2] px-[10px] py-[6px] text-[12px] text-[#1E9E5D]">
                Public feeds generate a shareable short link automatically.
              </span>
            )}
          </div>
        </ModalBody>

        <ModalFooter className="flex items-center justify-end gap-[10px] border-t border-black/10 px-5 py-[10px]">
          <Button onPress={handleClose} isDisabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleSave}
            isLoading={createMutation.isPending}
          >
            Save Feed
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SaveFeedModal;
