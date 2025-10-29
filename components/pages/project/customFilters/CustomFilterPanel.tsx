'use client';

import { BookmarkSimple, PlusCircle, ShareFat } from '@phosphor-icons/react';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { addToast, Button } from '@/components/base';
import { GearSixIcon } from '@/components/icons';
import { trpc } from '@/lib/trpc/client';

import CustomFilterCard from './CustomFilterCard';
import { type AdvancedFilterCard } from './types';
import { buildFilterSummary } from './utils';

async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('navigator.clipboard.writeText failed', error);
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
  } catch (error) {
    console.error('Fallback clipboard copy failed', error);
    return false;
  }
}

interface CustomFilterPanelProps {
  filters: AdvancedFilterCard[];
  onCreate: () => void;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
  onClearAll?: () => void;
  variant?: 'desktop' | 'mobile';
  isDisabled?: boolean;
  disabledReason?: string;
  onSaveAsFeed?: () => void;
  canSaveFeed?: boolean;
  saveDisabledReason?: string;
}

const CustomFilterPanel = ({
  filters,
  onCreate,
  onEdit,
  onRemove,
  onClearAll,
  variant = 'desktop',
  isDisabled = false,
  disabledReason,
  onSaveAsFeed,
  canSaveFeed = false,
  saveDisabledReason,
}: CustomFilterPanelProps) => {
  const summaries = filters.map((filter) => buildFilterSummary(filter));
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams?.toString() ?? '';
  const targetPath = useMemo(() => {
    if (!pathname) {
      return '';
    }
    return `${pathname}${searchParamsString ? `?${searchParamsString}` : ''}`;
  }, [pathname, searchParamsString]);

  const longShareUrl = useMemo(() => {
    if (!targetPath) {
      return '';
    }
    if (typeof window === 'undefined') {
      return targetPath;
    }
    return `${window.location.origin}${targetPath}`;
  }, [targetPath]);

  const [shortShareUrl, setShortShareUrl] = useState('');
  const shareMutation = trpc.share.ensureCustomFilter.useMutation();

  useEffect(() => {
    setShortShareUrl('');
  }, [targetPath]);

  const isShareDisabled = !targetPath || shareMutation.isPending;
  const isSaveDisabled =
    !onSaveAsFeed || !targetPath || !canSaveFeed || isDisabled;

  const handleShareCustomFilter = useCallback(async () => {
    if (!targetPath) {
      return;
    }

    let urlToCopy = shortShareUrl || longShareUrl;
    let usedShortLink = Boolean(shortShareUrl);

    if (!shortShareUrl) {
      try {
        const result = await shareMutation.mutateAsync({ targetPath });
        if (result?.shareUrl) {
          urlToCopy = result.shareUrl;
          setShortShareUrl(result.shareUrl);
          usedShortLink = true;
        }
      } catch (error) {
        console.error('Failed to ensure custom filter short link:', error);
      }
    }

    const copied = await copyTextToClipboard(urlToCopy);
    if (copied) {
      addToast({
        title: usedShortLink
          ? 'Short link copied to clipboard'
          : 'Link copied to clipboard',
        color: 'success',
      });
    } else {
      addToast({
        title: 'Failed to copy link',
        color: 'danger',
      });
    }
  }, [targetPath, shortShareUrl, longShareUrl, shareMutation]);

  return (
    <div className="flex flex-col gap-[10px]">
      {summaries.length === 0 ? (
        <div className="flex flex-col gap-[12px] rounded-[10px] border border-black/10 bg-transparent p-[14px] text-center">
          <div className="flex items-center gap-[10px]">
            <GearSixIcon
              width={20}
              height={20}
              className="text-black opacity-80"
            />
            <span className="text-[14px] font-[600] text-black/60">
              Custom Filter
            </span>
          </div>
          <Button
            size="sm"
            color="secondary"
            onPress={onCreate}
            isDisabled={isDisabled}
            className={`flex h-[30px] items-center justify-center gap-[5px] rounded-[5px] border text-[14px] font-semibold text-black/60`}
          >
            <PlusCircle className="size-[20px] opacity-50" />
            Create Filter
          </Button>
          {isDisabled && disabledReason && (
            <p className="text-[11px] text-[#D14343]">{disabledReason}</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-[12px]">
          {summaries.map((summary, index) => (
            <Fragment key={summary.id}>
              <CustomFilterCard
                summary={summary}
                onEdit={() => onEdit(summary.id)}
                onRemove={() => onRemove(summary.id)}
                variant={variant}
              />
              {/* {index < summaries.length - 1 && (
                <div className="flex items-center justify-center mt-[10px]">
                  <span className="rounded-[2px] bg-black/50 px-[4px] py-[2px] text-[10px] font-semibold uppercase tracking-wide text-white">
                    AND
                  </span>
                </div>
              )} */}
            </Fragment>
          ))}

          <div className="flex flex-col gap-[12px] rounded-[10px] border border-black/10 bg-transparent p-[14px] text-center">
            <div className="flex items-center gap-[10px]">
              <GearSixIcon
                width={20}
                height={20}
                className="text-black opacity-80"
              />
              <span className="text-[14px] font-[600] text-black/60">
                Custom Filter
              </span>
            </div>
            <Button
              size="sm"
              onPress={onCreate}
              isDisabled={isDisabled}
              className={`flex h-[30px] items-center justify-center gap-[5px] rounded-[5px] border text-[14px] font-semibold text-black/60`}
            >
              <PlusCircle className="size-[20px] opacity-50" />
              Create Filter
            </Button>
          </div>

          {/* <div className="flex items-center justify-center text-[11px] text-black/45">
            {onClearAll && (
              <Button
                size="sm"
                onPress={onClearAll}
                className="h-auto border-none bg-transparent p-0 text-[11px] font-semibold text-black/40 hover:bg-transparent hover:text-black"
              >
                Clear All Custom Filters
              </Button>
            )}
          </div> */}

          <div className="flex flex-col gap-[10px]">
            <Button
              size="sm"
              aria-label="Save filters as feed"
              onPress={onSaveAsFeed}
              isDisabled={isSaveDisabled}
              className={`flex h-[30px] w-full items-center justify-center gap-[5px] rounded-[5px] border text-[14px] font-semibold text-black/60`}
            >
              <BookmarkSimple />
              Save as Feed
            </Button>
            <Button
              size="sm"
              aria-label="Share custom filter"
              onPress={handleShareCustomFilter}
              isLoading={shareMutation.isPending}
              isDisabled={isShareDisabled}
              className={`flex h-[30px] w-full items-center justify-center gap-[5px] rounded-[5px] border text-[14px] font-semibold text-black/60`}
            >
              <ShareFat />
              Share Filters
            </Button>
            {isSaveDisabled && saveDisabledReason && (
              <p className="text-[11px] text-[#D14343]">{saveDisabledReason}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(CustomFilterPanel);
