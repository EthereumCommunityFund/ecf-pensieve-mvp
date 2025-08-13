'use client';

import React from 'react';

import { AddressInput } from './AddressInput';
import { ChainSelector } from './ChainSelector';

export interface SingleContractEntryProps {
  chain: string;
  addresses: string;
  onChainChange: (chain: string) => void;
  onAddressesChange: (addresses: string) => void;
  disabled?: boolean;
  placeholder?: string;
  excludeChains?: string[];
  onCustomChainAdd?: (chainName: string) => void;
}

export const SingleContractEntry: React.FC<SingleContractEntryProps> = ({
  chain,
  addresses,
  onChainChange,
  onAddressesChange,
  disabled = false,
  placeholder,
  excludeChains = [],
  onCustomChainAdd,
}) => {
  return (
    <div className="space-y-[10px]">
      <ChainSelector
        value={chain}
        onChange={onChainChange}
        excludeChains={excludeChains}
        disabled={disabled}
        onCustomChainAdd={onCustomChainAdd}
      />

      <AddressInput
        value={addresses}
        onChange={onAddressesChange}
        chain={chain}
        disabled={disabled}
        placeholder={placeholder}
      />
    </div>
  );
};
