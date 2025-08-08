'use client';

import { cn } from '@heroui/react';
import React, { useEffect, useId, useRef, useState } from 'react';

import { Textarea } from '@/components/base/input';
import useDebounce from '@/hooks/useDebounce';
import {
  parseAddressInput,
  validateAndNormalizeAddresses,
} from '@/lib/utils/addressValidation';

export interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
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
  const [errors, setErrors] = useState<string[]>([]);
  const helperId = useId();

  // Use ref to store the latest onChange callback
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Use debounce hook for validation
  const debouncedValue = useDebounce(value, 300);

  // Validate addresses when debounced value changes
  useEffect(() => {
    if (!debouncedValue.trim()) {
      setErrors([]);
      return;
    }

    const addresses = parseAddressInput(debouncedValue);
    const validation = validateAndNormalizeAddresses(addresses);

    if (!validation.valid && validation.errors.length > 0) {
      setErrors(validation.errors);
    } else {
      setErrors([]);
    }
  }, [debouncedValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent onChange from being called when component is disabled
    if (disabled || !chain) {
      return;
    }
    const newValue = e.target.value;
    onChange(newValue);
  };

  const getHelperContent = () => {
    if (errors.length > 0) {
      return (
        <ul className="list-inside  space-y-1">
          {errors.map((err, idx) => (
            <li key={idx}>{err}</li>
          ))}
        </ul>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <div className="relative">
        <Textarea
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          isDisabled={disabled || !chain}
          minRows={3}
          maxRows={6}
          isInvalid={errors.length > 0}
          aria-invalid={errors.length > 0}
          aria-describedby={helperId}
          classNames={{
            base: 'w-full',
            inputWrapper: cn(
              'rounded-[8px] border-black/10 bg-black/[0.05] hover:border-black/40 p-[10px]',
              errors.length > 0 && 'border-red-500',
            ),
            input: 'text-[14px] leading-[20px]',
          }}
        />
        <div className="absolute bottom-[10px] right-[10px] flex flex-col items-center gap-[2px]">
          <div className="h-[2px] w-[20px] bg-[#D9D9D9]" />
          <div className="h-[2px] w-[12px] bg-[#D9D9D9]" />
          <div className="h-[2px] w-[8px] bg-[#D9D9D9]" />
        </div>
      </div>
      {errors.length > 0 && (
        <div
          id={helperId}
          className={`mt-[5px] flex items-center gap-[8px] text-[14px] leading-[20px] text-red-500`}
        >
          <span>{getHelperContent()}</span>
        </div>
      )}
    </div>
  );
};
