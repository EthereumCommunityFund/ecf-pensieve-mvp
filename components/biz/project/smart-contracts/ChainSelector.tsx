'use client';

import React, { useState } from 'react';

import { Button } from '@/components/base/button';
import { Input } from '@/components/base/input';
import { Select, SelectItem } from '@/components/base/select';
import {
  createCustomChain,
  getAllChains,
  getChainById,
  validateChainName,
} from '@/constants/chains';

export interface ChainSelectorProps {
  value: string;
  onChange: (chain: string) => void;
  excludeChains?: string[];
  disabled?: boolean;
  onCustomChainAdd?: (chainName: string) => void;
}

export const ChainSelector: React.FC<ChainSelectorProps> = ({
  value,
  onChange,
  excludeChains = [],
  disabled = false,
  onCustomChainAdd,
}) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customChainName, setCustomChainName] = useState('');
  const [customChainError, setCustomChainError] = useState('');

  // Normalize excludeChains to lowercase for consistent comparison
  const normalizedExcludeChains = excludeChains.map((id) => id.toLowerCase());

  // Get predefined chains
  const predefinedChains = getAllChains().filter(
    (chain) => !normalizedExcludeChains.includes(chain.id.toLowerCase()),
  );

  // If current value is a custom chain, ensure it's included in the list
  const customChainFromValue =
    value && value.startsWith('custom-') ? getChainById(value) : null;

  const availableChains = customChainFromValue
    ? [...predefinedChains, customChainFromValue]
    : predefinedChains;

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === 'custom') {
      setShowCustomInput(true);
      setCustomChainName('');
      setCustomChainError('');
    } else {
      onChange(selectedValue);
      setShowCustomInput(false);
    }
  };

  const handleCustomChainSubmit = () => {
    const validation = validateChainName(customChainName, excludeChains);

    if (!validation.valid) {
      setCustomChainError(validation.error || 'Invalid chain name');
      return;
    }

    // Create the custom chain and set the value
    const customChain = createCustomChain(customChainName);
    onChange(customChain.id);
    onCustomChainAdd?.(customChainName);

    // Reset state
    setShowCustomInput(false);
    setCustomChainName('');
    setCustomChainError('');
  };

  const handleCancelCustom = () => {
    setShowCustomInput(false);
    setCustomChainName('');
    setCustomChainError('');
    // Don't change the current value when canceling
    // This preserves any previously selected value
  };

  if (showCustomInput) {
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="Enter chain name (e.g., Solana, Near)"
            value={customChainName}
            onChange={(e) => {
              setCustomChainName(e.target.value);
              setCustomChainError('');
            }}
            isDisabled={disabled}
            className="flex-1"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCustomChainSubmit();
              }
            }}
            isInvalid={!!customChainError}
            errorMessage={customChainError}
          />
          <Button
            type="button"
            size="sm"
            onClick={handleCustomChainSubmit}
            disabled={disabled}
            color="primary"
          >
            Add
          </Button>
          <Button
            type="button"
            size="sm"
            variant="light"
            onClick={handleCancelCustom}
            disabled={disabled}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Select
      selectedKeys={value ? [value] : []}
      onSelectionChange={(keys) => {
        const selectedKey = Array.from(keys)[0] as string;
        if (selectedKey) {
          handleSelectChange(selectedKey);
        }
      }}
      isDisabled={disabled}
      placeholder="Select Chain"
      aria-label="Select blockchain"
      classNames={{
        trigger:
          'h-[40px] rounded-[8px] border-black/10 bg-black/[0.05] hover:border-black/40',
        value: 'text-black',
        mainWrapper: 'data-[hover=true]:border-black/40',
        listboxWrapper: 'bg-white',
      }}
    >
      <>
        {availableChains.map((chain) => (
          <SelectItem
            key={chain.id}
            textValue={chain.name}
            classNames={{
              base: chain.isCustom ? 'text-gray-600' : '',
            }}
          >
            <span>{chain.name}</span>
          </SelectItem>
        ))}
        <SelectItem
          key="custom"
          textValue="Custom Chain"
          classNames={{
            base: 'border-t border-gray-200 mt-1 pt-2',
          }}
        >
          <div
            className="flex items-center gap-2"
            style={{ color: 'var(--primary)' }}
          >
            <span>+ Add Custom Chain</span>
          </div>
        </SelectItem>
      </>
    </Select>
  );
};
