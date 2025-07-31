'use client';

import React, { useEffect, useId, useRef, useState } from 'react';

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
  const [errors, setErrors] = useState<string[]>([]);
  const helperId = useId();

  // Use ref to store the latest onChange callback
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

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
      setErrors([]);
      onChangeRef.current([]);
      return;
    }

    const addresses = parseAddressInput(debouncedInputValue);
    const validation = validateAndNormalizeAddresses(addresses);

    if (!validation.valid && validation.errors.length > 0) {
      setErrors(validation.errors);
    } else {
      setErrors([]);
      onChangeRef.current(validation.addresses);
    }
  }, [debouncedInputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
  };

  const getHelperContent = () => {
    if (errors.length > 0) {
      return (
        <ul className="list-inside list-disc space-y-1">
          {errors.map((err, idx) => (
            <li key={idx}>{err}</li>
          ))}
        </ul>
      );
    }

    if (
      inputValue &&
      errors.length === 0 &&
      debouncedInputValue === inputValue
    ) {
      const addressCount = parseAddressInput(inputValue).filter(Boolean).length;
      if (addressCount > 0) {
        return `${addressCount} valid address${addressCount > 1 ? 'es' : ''}`;
      } else {
        return 'No valid address found';
      }
    }
    return "Use comma ',' to separate multiple addresses";
  };

  const getHelperColor = () => {
    if (errors.length > 0) return 'text-red-600';
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
        isInvalid={errors.length > 0}
        aria-invalid={errors.length > 0}
        aria-describedby={helperId}
        classNames={{
          input: 'font-mono text-sm',
          inputWrapper: errors.length > 0 ? 'border-red-500' : '',
        }}
      />
      <div id={helperId} className={`mt-1 text-xs ${getHelperColor()}`}>
        {getHelperContent()}
      </div>
    </div>
  );
};
