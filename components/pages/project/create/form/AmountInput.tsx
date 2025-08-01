'use client';

import React from 'react';

interface AmountInputProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  className?: string;
}

const AmountInput: React.FC<AmountInputProps> = ({
  value = '',
  onChange,
  disabled = false,
  error,
  placeholder = '$000.00',
  className = '',
}) => {
  const formatNumber = (num: string): string => {
    // Remove all non-numeric characters except decimal point
    const cleaned = num.replace(/[^0-9.]/g, '');

    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }

    // Limit decimal places to 2
    if (parts.length === 2 && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].substring(0, 2);
    }

    return cleaned;
  };

  const addThousandsSeparators = (num: string): string => {
    const parts = num.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];

    // Add commas as thousands separators
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return decimalPart !== undefined
      ? `${formattedInteger}.${decimalPart}`
      : formattedInteger;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Allow empty input for deletion
    if (inputValue === '') {
      onChange('');
      return;
    }

    // Remove existing formatting (commas) and process
    const rawValue = inputValue.replace(/,/g, '');
    const formattedValue = formatNumber(rawValue);

    // Only update if value is valid (not empty and contains valid characters)
    if (formattedValue && /^[0-9]*\.?[0-9]*$/.test(formattedValue)) {
      onChange(formattedValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, home, end, left, right, decimal point
    if (
      [8, 9, 27, 13, 35, 36, 37, 39, 46, 190].includes(e.keyCode) ||
      // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
      (e.keyCode >= 65 && e.keyCode <= 90 && (e.ctrlKey || e.metaKey))
    ) {
      return;
    }

    // Ensure that it is a number and stop the keypress
    if (
      (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
      (e.keyCode < 96 || e.keyCode > 105)
    ) {
      e.preventDefault();
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/,/g, '');

    if (inputValue && inputValue !== '0' && inputValue !== '0.00') {
      // Add thousands separators on blur for display
      const displayValue = addThousandsSeparators(inputValue);
      // We keep the raw value in state but show formatted version
      e.target.value = displayValue;
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Remove formatting on focus for easier editing
    const rawValue = value.replace(/,/g, '');
    e.target.value = rawValue;
  };

  const displayValue = value ? addThousandsSeparators(value) : '';

  return (
    <div className="w-full">
      <input
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
        disabled={disabled}
        placeholder={placeholder}
        className={`h-[20px] w-full border-none bg-transparent text-[13px] font-[400] text-black placeholder:text-black/60 focus:outline-none ${
          error ? 'text-red-500' : ''
        } ${className}`}
        style={{
          boxShadow: 'none !important',
          outline: 'none !important',
          border: 'none !important',
        }}
      />
      {error && <div className="mt-1 text-[13px] text-red-500">{error}</div>}
    </div>
  );
};

export default AmountInput;
