'use client';

import React from 'react';

import { Button } from '@/components/base/button';
import { CloseIcon } from '@/components/icons';
import { getChainDisplayInfo } from '@/constants/chains';

import { AddressInput } from './AddressInput';
import { ChainSelector } from './ChainSelector';

export interface SmartContract {
  id: string;
  chain: string;
  addresses: string[];
}

export interface ContractEntryProps {
  contract: SmartContract;
  onChange: (updates: Partial<SmartContract>) => void;
  onRemove: () => void;
  existingChains: string[];
  disabled?: boolean;
  onCustomChainAdd?: (chainName: string) => void;
}

export const ContractEntry: React.FC<ContractEntryProps> = ({
  contract,
  onChange,
  onRemove,
  existingChains,
  disabled = false,
  onCustomChainAdd,
}) => {
  const chainInfo = getChainDisplayInfo(contract.chain);

  return (
    <div className="flex gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-48">
            <ChainSelector
              value={contract.chain}
              onChange={(chain) => onChange({ chain })}
              excludeChains={existingChains}
              disabled={disabled}
              onCustomChainAdd={onCustomChainAdd}
            />
          </div>
          {contract.chain && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {chainInfo.icon && (
                <img
                  src={chainInfo.icon}
                  alt={chainInfo.name}
                  className="size-4"
                />
              )}
              <span>{chainInfo.name}</span>
            </div>
          )}
        </div>

        <AddressInput
          value={contract.addresses}
          onChange={(addresses) => onChange({ addresses })}
          chain={contract.chain}
          disabled={disabled}
        />
      </div>

      <div className="flex items-start">
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onClick={onRemove}
          disabled={disabled}
          className="text-red-500 hover:bg-red-50 hover:text-red-700"
          aria-label="Remove chain"
        >
          <CloseIcon width={16} height={16} />
        </Button>
      </div>
    </div>
  );
};
