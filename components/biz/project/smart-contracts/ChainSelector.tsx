'use client';

import React, { useState } from 'react';

import { Button } from '@/components/base/button';
import { Input } from '@/components/base/input';
import { Select, SelectItem } from '@/components/base/select';
import {
  createCustomChain,
  getAllChains,
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

  const availableChains = getAllChains().filter(
    (chain) => !excludeChains.includes(chain.id),
  );

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
    const validation = validateChainName(customChainName);

    if (!validation.valid) {
      setCustomChainError(validation.error || 'Invalid chain name');
      return;
    }

    // Check if this custom name conflicts with excluded chains
    const customChain = createCustomChain(customChainName);
    if (excludeChains.includes(customChain.id)) {
      setCustomChainError('This chain name is already in use');
      return;
    }

    // Set the value and notify parent
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
    onChange(''); // Reset selection
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
            disabled={disabled}
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
      disabled={disabled}
      placeholder="Select Chain"
      aria-label="Select blockchain"
      classNames={{
        trigger: 'h-[40px]',
        value: 'text-black',
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
            <div className="flex items-center gap-2">
              {chain.icon && !chain.isCustom && (
                <img src={chain.icon} alt={chain.name} className="size-4" />
              )}
              <span>{chain.name}</span>
            </div>
          </SelectItem>
        ))}
        <SelectItem
          key="custom"
          textValue="Custom Chain"
          classNames={{
            base: 'border-t border-gray-200 mt-1 pt-2',
          }}
        >
          <div className="text-primary flex items-center gap-2">
            <span>+ Add Custom Chain</span>
          </div>
        </SelectItem>
      </>
    </Select>
  );
};
