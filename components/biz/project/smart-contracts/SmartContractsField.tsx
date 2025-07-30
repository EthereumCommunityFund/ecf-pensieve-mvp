'use client';

import React from 'react';

import { Button } from '@/components/base/button';
import { PlusIcon } from '@/components/icons';

import { ApplicableToggle } from './ApplicableToggle';
import { ContractEntry, type SmartContract } from './ContractEntry';
import { References } from './References';

export interface SmartContractsFieldProps {
  value: SmartContract[];
  onChange: (contracts: SmartContract[]) => void;
  weight: number;
  applicable: boolean;
  onApplicableChange: (applicable: boolean) => void;
  references?: string[];
  onReferencesChange?: (refs: string[]) => void;
  disabled?: boolean;
}

export const SmartContractsField: React.FC<SmartContractsFieldProps> = ({
  value,
  onChange,
  weight,
  applicable,
  onApplicableChange,
  references,
  onReferencesChange,
  disabled = false,
}) => {
  const handleAddChain = () => {
    const newContract: SmartContract = {
      id: crypto.randomUUID(),
      chain: '',
      addresses: [],
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
      .filter((contract) => contract.id !== currentId && contract.chain)
      .map((contract) => contract.chain);
  };

  return (
    <div className="space-y-4" data-testid="smart-contracts-field">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-medium text-gray-900">
            Dapp Smart Contracts
          </h3>
          <span className="text-sm text-gray-500">Weight: {weight}</span>
        </div>
        <ApplicableToggle
          value={applicable}
          onChange={onApplicableChange}
          disabled={disabled}
        />
      </div>

      {applicable && (
        <>
          {value.length > 0 && (
            <div className="space-y-3">
              {value.map((contract) => (
                <ContractEntry
                  key={contract.id}
                  contract={contract}
                  onChange={(updates) =>
                    handleContractChange(contract.id, updates)
                  }
                  onRemove={() => handleRemoveChain(contract.id)}
                  existingChains={getExistingChains(contract.id)}
                  disabled={disabled}
                  onCustomChainAdd={handleCustomChainAdd}
                />
              ))}
            </div>
          )}

          <Button
            type="button"
            variant="bordered"
            onClick={handleAddChain}
            disabled={disabled}
            className="w-full border-2 border-dashed border-gray-300 hover:border-gray-400"
            startContent={<PlusIcon size={16} />}
          >
            Add a new chain
          </Button>

          {onReferencesChange && (
            <References
              value={references || []}
              onChange={onReferencesChange}
              disabled={disabled}
            />
          )}
        </>
      )}

      {!applicable && (
        <div className="rounded-lg bg-gray-50 p-4 text-center text-gray-500">
          Smart contracts are marked as not applicable for this project
        </div>
      )}
    </div>
  );
};
