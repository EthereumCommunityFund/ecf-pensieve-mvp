'use client';

import { Selection } from '@heroui/react';
import { useCallback, useMemo } from 'react';

import { Select, SelectItem } from '@/components/base';

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
};

const getSentimentDisplay = (value: string): SentimentDefinition =>
  sentimentDefinitions[value as SentimentKey] || defaultSentimentDisplay;

export function SentimentSelector({
  options,
  value,
  onChange,
}: SentimentSelectorProps) {
  const sentimentOptions = useMemo(
    () =>
      Array.from(
        new Set(
          options
            .filter(Boolean)
            .map((item) => item.trim())
            .filter(Boolean),
        ),
      ),
    [options],
  );

  const normalizedValue = sentimentOptions.includes(value ?? '')
    ? (value as string)
    : DEFAULT_SENTIMENT_VALUE;

  const selectedKeys = useMemo(
    () => new Set<string>([normalizedValue]),
    [normalizedValue],
  );

  const selectedDisplay = useMemo(
    () => getSentimentDisplay(normalizedValue),
    [normalizedValue],
  );

  const renderValue = () => {
    return (
      <div className="flex items-center gap-2">
        <selectedDisplay.Icon
          size={18}
          weight={'fill'}
          style={{ color: selectedDisplay.color }}
        />
        <span
          className="text-sm font-semibold"
          style={{ color: selectedDisplay.color }}
        >
          {selectedDisplay.label}
        </span>
      </div>
    );
  };

  const placeholder = (
    <div className="flex items-center gap-2">
      <defaultSentimentDisplay.Icon
        size={18}
        weight="fill"
        style={{ color: defaultSentimentDisplay.color }}
        className="opacity-30"
      />
      <span
        className="text-sm font-semibold"
        style={{ color: defaultSentimentDisplay.color }}
      >
        {defaultSentimentDisplay.label}
      </span>
    </div>
  );

  const handleSelectionChange = useCallback(
    (selection: Selection) => {
      if (selection === 'all') return;
      const keys = Array.from(selection);
      if (!keys.length) return;
      const selectedKey = String(keys[0]);
      if (selectedKey === normalizedValue) return;
      onChange?.(selectedKey);
    },
    [normalizedValue, onChange],
  );

  return (
    <Select
      aria-label="Select sentiment filter"
      selectionMode="single"
      size="sm"
      disallowEmptySelection={false}
      selectedKeys={selectedKeys}
      onSelectionChange={handleSelectionChange}
      className="min-w-[160px]"
      classNames={{
        trigger:
          'h-[32px] border border-black/10 rounded-[6px] px-3 bg-white text-black',
        value: 'flex-1 text-left',
        selectorIcon: 'text-black/60',
      }}
      placeholder={placeholder as unknown as string}
      renderValue={renderValue}
      listboxProps={{
        itemClasses: {
          base: 'text-sm font-semibold',
        },
      }}
    >
      {sentimentOptions.map((option) => {
        const display = getSentimentDisplay(option);
        return (
          <SelectItem
            key={option}
            startContent={
              <display.Icon
                size={18}
                weight={'fill'}
                style={{ color: display.color }}
              />
            }
            textValue={display.label}
            className="gap-2"
          >
            <span style={{ color: display.color }}>{display.label}</span>
          </SelectItem>
        );
      })}
    </Select>
  );
}
