'use client';

import React from 'react';

import { generateUUID } from '@/lib/utils/uuid';

import { ContractEntry, type SmartContract } from './ContractEntry';

export interface MultiContractEntryProps {
  value: SmartContract[];
  onChange: (contracts: SmartContract[]) => void;
  weight: number;
  applicable: boolean;
  onApplicableChange: (applicable: boolean) => void;
  references?: string[];
  onReferencesChange?: (refs: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const MultiContractEntry: React.FC<MultiContractEntryProps> = ({
  value,
  onChange,
  weight,
  applicable,
  onApplicableChange,
  references,
  disabled = false,
  placeholder,
}) => {
  const handleAddChain = () => {
    const newContract: SmartContract = {
      id: generateUUID(),
      chain: '',
      addresses: '',
    };
    onChange([...value, newContract]);
  };

  const handleRemoveChain = (id: string) => {
    onChange(value.filter((contract) => contract.id !== id));
  };

  const handleContractChange = (
    id: string,
    updates: Partial<SmartContract>,
  ) => {
    onChange(
      value.map((contract) =>
        contract.id === id ? { ...contract, ...updates } : contract,
      ),
    );
  };

  const handleCustomChainAdd = (chainName: string) => {
    // This is called when a user adds a custom chain
    // You can add any additional logic here if needed
    console.log('Custom chain added:', chainName);
  };

  // Get list of already selected chains (excluding the current one being edited)
  const getExistingChains = (currentId: string) => {
    return value
      .filter(
        (contract) =>
          contract.id !== currentId &&
          contract.chain &&
          contract.chain.trim() !== '',
      )
      .map((contract) => contract.chain);
  };

  return (
    <div className="space-y-[10px]" data-testid="multi-contract-entry">
      {/* Always show contract entries but disabled when not applicable */}
      {(value.length > 0 || !applicable) && (
        <div className="space-y-3">
          {value.length > 0
            ? value.map((contract, idx) => (
                <ContractEntry
                  key={contract.id}
                  contract={contract}
                  onChange={(updates) =>
                    handleContractChange(contract.id, updates)
                  }
                  onRemove={() => handleRemoveChain(contract.id)}
                  existingChains={getExistingChains(contract.id)}
                  disabled={disabled || !applicable}
                  onCustomChainAdd={handleCustomChainAdd}
                  showRemove={value.length > 1 && applicable && idx !== 0}
                  placeholder={placeholder}
                />
              ))
            : // Show one disabled entry when N/A is selected
              !applicable && (
                <ContractEntry
                  contract={{ id: 'placeholder', chain: '', addresses: '' }}
                  onChange={() => {}}
                  onRemove={() => {}}
                  existingChains={[]}
                  disabled={true}
                  showRemove={false}
                  placeholder={placeholder}
                />
              )}
        </div>
      )}

      <button
        type="button"
        onClick={handleAddChain}
        disabled={disabled || !applicable}
        className="flex h-auto w-full cursor-pointer items-center justify-center gap-[5px] rounded-[4px] border border-black/10 bg-black/[0.05] p-[10px] px-[8px] text-black opacity-60 transition-opacity duration-200 hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30"
        style={{
          outline: 'none',
          boxShadow: 'none',
          fontFamily: 'Open Sans, sans-serif',
        }}
      >
        <div className="flex size-[16px] items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 2.5v11M2.5 8h11"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <span className="text-[14px] font-[400] leading-[19px]">
          Add a new chain
        </span>
      </button>
    </div>
  );
};
