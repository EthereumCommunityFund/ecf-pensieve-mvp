'use client';

import { Tooltip, cn } from '@heroui/react';
import { X } from '@phosphor-icons/react';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/base';

import {
  defaultSentimentDisplay,
  sentimentDefinitions,
  type SentimentKey,
} from './sentimentConfig';

const SENTIMENT_ORDER: SentimentKey[] = [
  'recommend',
  'agree',
  'insightful',
  'provocative',
  'disagree',
];

export type SentimentVoteButtonProps = {
  totalVotes?: number;
  value?: SentimentKey | null;
  disabled?: boolean;
  isLoading?: boolean;
  onSelect: (value: SentimentKey) => Promise<void> | void;
  requireAuth?: () => boolean;
  size?: 'normal' | 'small';
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function SentimentVoteButton({
  totalVotes = 0,
  value,
  disabled = false,
  isLoading = false,
  onSelect,
  requireAuth,
  size = 'normal',
  defaultOpen = false,
  onOpenChange,
}: SentimentVoteButtonProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [optimisticValue, setOptimisticValue] = useState<
    SentimentKey | null | undefined
  >(undefined);

  const activeValue = optimisticValue ?? value ?? null;

  // Determine display based on defaultSentimentDisplay or activeValue value
  // const display = activeValue
  //   ? sentimentDefinitions[activeValue] || defaultSentimentDisplay
  //   : defaultSentimentDisplay;
  const display = defaultSentimentDisplay;

  const updateOpen = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      onOpenChange?.(nextOpen);
    },
    [onOpenChange],
  );

  useEffect(() => {
    setOptimisticValue(undefined);
  }, [value]);

  useEffect(() => {
    updateOpen(defaultOpen);
  }, [defaultOpen, updateOpen]);

  const ensureAuth = () => {
    if (!requireAuth) return true;
    return requireAuth();
  };

  const handleToggle = () => {
    if (disabled || isLoading) return;
    if (!open && !ensureAuth()) return;
    setOpen((prev) => {
      const next = !prev;
      onOpenChange?.(next);
      return next;
    });
  };

  const handleSelect = async (sentiment: SentimentKey) => {
    if (disabled || isLoading) return;
    if (!ensureAuth()) return;
    setOptimisticValue(sentiment);
    try {
      await onSelect(sentiment);
      updateOpen(false);
    } catch {
      // keep popover open to allow retry on error
      setOptimisticValue(undefined);
    }
  };

  const voteLabel =
    totalVotes > 999 ? totalVotes.toLocaleString() : `${totalVotes}`;

  const sizeStyles =
    size === 'small'
      ? {
          trigger:
            'h-[24px] gap-[5px] min-w-0 rounded-[8px] border-none bg-[#EBEBEB] px-[8px] py-[2px] text-[12px] font-semibold ',
          triggerHover: open ? 'hover:bg-[#EBEBEB]' : 'hover:bg-[#D7D7D7]',
          closeButton: 'size-[20px] rounded-[4px] min-w-0 border-none p-[2px]',
          iconSize: 16,
          option:
            'size-[20px] min-w-0 rounded-[4px] bg-transparent p-[2px] border-none',
          optionHover: 'hover:bg-black/10 hover:!border hover:!border-black/30',
          optionActive: '',
        }
      : {
          trigger:
            'h-[38px] gap-[10px] min-w-0 rounded-[5px] border-none bg-[#EBEBEB] px-[8px] py-[4px] text-[13px] font-semibold',
          triggerHover: open ? 'hover:bg-[#EBEBEB]' : 'hover:bg-[#D7D7D7]',
          closeButton: 'size-[28px] rounded-[4px] min-w-0 border-none p-[4px]',
          iconSize: 30,
          option:
            'size-[28px] min-w-0 rounded-[4px] bg-transparent p-[4px] border-none',
          optionHover: 'hover:bg-black/10 hover:!border hover:!border-black/30',
          optionActive: '',
        };

  return (
    <div className="flex items-center gap-[10px]">
      <Button
        className={cn(sizeStyles.trigger, sizeStyles.triggerHover)}
        isDisabled={disabled}
        isLoading={isLoading}
        onPress={handleToggle}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {open ? (
          <div className="flex items-center gap-[10px] rounded-[12px]">
            <Tooltip
              content="Close"
              closeDelay={0}
              classNames={{
                base: 'h-[21px] p-0 border border-black/10 rounded-[4px] bg-white flex items-center',
                content:
                  'bg-transparent shadow-none text-[13px] text-black leading-[1]',
              }}
            >
              <Button
                className={sizeStyles.closeButton}
                onPress={() => updateOpen(false)}
                isDisabled={isLoading}
              >
                <X
                  size={sizeStyles.iconSize}
                  className="text-black/50"
                  weight="bold"
                />
              </Button>
            </Tooltip>
            <div className="flex items-center justify-start gap-[2px]">
              {SENTIMENT_ORDER.map((option) => {
                const definition = sentimentDefinitions[option];
                const isActive = option === activeValue;
                return (
                  <Tooltip
                    key={option}
                    content={definition.label}
                    closeDelay={0}
                    placement="top"
                    classNames={{
                      base: 'h-[21px] p-0 border border-black/10 rounded-[4px] bg-white flex items-center',
                      content:
                        'bg-transparent shadow-none text-[13px] text-black leading-[1]',
                    }}
                  >
                    <Button
                      type="button"
                      onPress={() => handleSelect(option)}
                      isDisabled={isLoading}
                      className={cn(
                        sizeStyles.option,
                        sizeStyles.optionHover,
                        isActive && sizeStyles.optionActive,
                        isLoading && 'opacity-60 cursor-not-allowed',
                      )}
                      aria-pressed={isActive}
                      aria-label={definition.label}
                    >
                      <definition.Icon
                        size={sizeStyles.iconSize}
                        weight="bold"
                        style={{ color: definition.color }}
                        aria-hidden
                      />
                    </Button>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            <display.Icon
              size={sizeStyles.iconSize}
              weight={'fill'}
              className={'opacity-30'}
              style={activeValue ? { color: display.color } : undefined}
              aria-hidden
            />
            <span className="text-black/60">{voteLabel}</span>
          </>
        )}
      </Button>
    </div>
  );
}
