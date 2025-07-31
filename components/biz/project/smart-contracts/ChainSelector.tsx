'use client';

import React, { useState } from 'react';

import { Button } from '@/components/base/button';
import { Input } from '@/components/base/input';
import {
  CommonModalHeader,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
} from '@/components/base/modal';
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

// Input sanitization function
const sanitizeChainName = (name: string): string => {
  return name
    .trim()
    .replace(/[<>"']/g, '') // Remove potential XSS characters
    .substring(0, 50); // Enforce length limit
};

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

  return (
    <>
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

      <Modal
        isOpen={showCustomInput}
        className="bg-white"
        onOpenChange={(open) => !open && handleCancelCustom()}
      >
        <ModalContent>
          <CommonModalHeader
            title="Add Custom Chain"
            onClose={handleCancelCustom}
            isDisabled={disabled}
          />
          <ModalBody>
            <Input
              placeholder="Enter chain name"
              value={customChainName}
              onChange={(e) => {
                const sanitizedValue = sanitizeChainName(e.target.value);
                setCustomChainName(sanitizedValue);
                setCustomChainError('');
              }}
              isDisabled={disabled}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCustomChainSubmit();
                }
              }}
              isInvalid={!!customChainError}
              errorMessage={customChainError}
              autoFocus
              aria-label="Custom blockchain name"
              aria-describedby="chain-name-help"
              aria-invalid={!!customChainError}
            />
            <div id="chain-name-help" className="mt-2 text-sm text-gray-500">
              Enter a custom blockchain name between 2 and 50 characters.
            </div>
          </ModalBody>
          <ModalFooter className="justify-end">
            <Button
              variant="light"
              onPress={handleCancelCustom}
              disabled={disabled}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleCustomChainSubmit}
              disabled={disabled || !customChainName.trim()}
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
