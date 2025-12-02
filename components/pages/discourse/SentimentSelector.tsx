'use client';

import { CaretDown } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/base';

import {
  DEFAULT_SENTIMENT_VALUE,
  defaultSentimentDisplay,
  SentimentDefinition,
  sentimentDefinitions,
  SentimentKey,
} from './sentimentConfig';

export type SentimentSelectorProps = {
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
};

const getSentimentDisplay = (value: string): SentimentDefinition =>
  sentimentDefinitions[value as SentimentKey] || defaultSentimentDisplay;

export function SentimentSelector({
  options,
  value,
  onChange,
  defaultValue = DEFAULT_SENTIMENT_VALUE,
}: SentimentSelectorProps) {
  const [open, setOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  const normalizedValue = value || defaultValue;
  const isDefaultValue = normalizedValue === defaultValue;
  const activeSentiment = !isDefaultValue
    ? sentimentDefinitions[normalizedValue as SentimentKey]
    : undefined;
  const sentimentDisplay = activeSentiment || defaultSentimentDisplay;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectorRef.current &&
        !selectorRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (selectedOption: string) => {
    const nextValue =
      selectedOption === normalizedValue ? defaultValue : selectedOption;

    onChange?.(nextValue);
    setOpen(false);
  };

  return (
    <div ref={selectorRef} className="relative">
      <Button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-[32px] items-center gap-2 rounded-[6px] border border-black/10 bg-white px-3 text-sm font-semibold"
      >
        <sentimentDisplay.Icon
          size={18}
          weight={activeSentiment ? 'fill' : 'regular'}
          style={{ color: sentimentDisplay.color }}
        />
        <span style={{ color: sentimentDisplay.color }}>
          {sentimentDisplay.label}
        </span>
        <CaretDown
          size={16}
          style={{ color: sentimentDisplay.color }}
          className={`transition ${open ? 'rotate-180' : ''}`}
        />
      </Button>
      {open ? (
        <div className="absolute right-0 top-[calc(100%+6px)] z-10 w-[200px] rounded-[8px] border border-[#d7d3cc] bg-white shadow-[0_12px_28px_rgba(15,23,42,0.12)]">
          <div className="flex flex-col gap-[5px] p-[8px]">
            {options.map((option) => {
              const display = getSentimentDisplay(option);
              const isActive = option === normalizedValue;

              return (
                <Button
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={`flex h-[30px] w-full items-center justify-start gap-3 rounded-[6px] border-none px-[6px] py-[4px] text-left text-sm font-semibold ${
                    isActive ? 'bg-black/5' : 'hover:bg-black/5'
                  }`}
                >
                  <display.Icon
                    size={18}
                    weight={isActive ? 'fill' : 'regular'}
                    style={{ color: display.color }}
                  />
                  <span style={{ color: display.color }}>{display.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
