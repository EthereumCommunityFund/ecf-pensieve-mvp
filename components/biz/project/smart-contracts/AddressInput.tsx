'use client';

import React, { useEffect, useState } from 'react';

import { Textarea } from '@/components/base/input';
import useDebounce from '@/hooks/useDebounce';
import {
  parseAddressInput,
  validateAndNormalizeAddresses,
} from '@/lib/utils/addressValidation';

export interface AddressInputProps {
  value: string[];
  onChange: (addresses: string[]) => void;
  chain: string;
  disabled?: boolean;
  placeholder?: string;
}

export const AddressInput: React.FC<AddressInputProps> = ({
  value,
  onChange,
  chain,
  disabled = false,
  placeholder = 'Enter addresses separated by commas',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  // Initialize input value from prop value
  useEffect(() => {
    if (value && value.length > 0) {
      setInputValue(value.join(', '));
    } else {
      setInputValue('');
    }
  }, [value]);

  // Use debounce hook for validation
  const debouncedInputValue = useDebounce(inputValue, 300);

  // Validate addresses when debounced value changes
  useEffect(() => {
    if (!debouncedInputValue.trim()) {
      setError('');
      onChange([]);
      return;
    }

    const addresses = parseAddressInput(debouncedInputValue);
    const validation = validateAndNormalizeAddresses(addresses);

    if (!validation.valid && validation.errors.length > 0) {
      setError(validation.errors[0]); // Show first error
    } else {
      setError('');
      onChange(validation.addresses);
    }
  }, [debouncedInputValue]); // Removed onChange from dependencies to prevent infinite loops

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
  };

  const getHelperText = () => {
    if (error) return error;
    if (inputValue && !error && debouncedInputValue === inputValue) {
      const addressCount = parseAddressInput(inputValue).filter(Boolean).length;
      if (addressCount > 0) {
        return `${addressCount} valid address${addressCount > 1 ? 'es' : ''}`;
      }
    }
    return "Use comma ',' to separate multiple addresses";
  };

  const getHelperColor = () => {
    if (error) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="w-full">
      <Textarea
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled || !chain}
        minRows={2}
        maxRows={4}
        isInvalid={!!error}
        classNames={{
          input: 'font-mono text-sm',
          inputWrapper: error ? 'border-red-500' : '',
        }}
      />
      <p className={`mt-1 text-xs ${getHelperColor()}`}>{getHelperText()}</p>
    </div>
  );
};
