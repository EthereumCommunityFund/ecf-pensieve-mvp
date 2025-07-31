'use client';

import React from 'react';

import { RemoveChainIcon } from '@/components/icons';

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
  showRemove?: boolean;
}

export const ContractEntry: React.FC<ContractEntryProps> = ({
  contract,
  onChange,
  onRemove,
  existingChains,
  disabled = false,
  onCustomChainAdd,
  showRemove = true,
}) => {
  return (
    <div className="space-y-[10px]">
      <ChainSelector
        value={contract.chain}
        onChange={(chain) => onChange({ chain })}
        excludeChains={existingChains}
        disabled={disabled}
        onCustomChainAdd={onCustomChainAdd}
      />

      <AddressInput
        value={contract.addresses}
        onChange={(addresses) => onChange({ addresses })}
        chain={contract.chain}
        disabled={disabled}
      />

      {showRemove && (
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="inline-flex h-auto min-h-0 cursor-pointer items-center justify-center gap-[5px] rounded-[4px]  border-none px-[8px] py-[4px] text-[#D75454] opacity-60 transition-opacity duration-200 hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30"
          style={{
            fontFamily: 'Open Sans, sans-serif',
          }}
        >
          <RemoveChainIcon size={20} />
          <span className="text-[14px] font-[600] leading-[19px]">
            Remove Chain
          </span>
        </button>
      )}
    </div>
  );
};
