'use client';

import React from 'react';

interface URLInputProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

const URLInput: React.FC<URLInputProps> = ({
  value = '',
  onChange,
  disabled = false,
  error,
  placeholder = 'https://',
  className = '',
  required = false,
}) => {
  const validateURL = (url: string): string | null => {
    // If field is not required and empty, it's valid
    if (!required && !url.trim()) {
      return null;
    }

    // If field is required and empty, it's invalid
    if (required && !url.trim()) {
      return 'URL is required';
    }

    // If there's content, validate the URL format
    if (url.trim()) {
      try {
        // Try to create a URL object to validate format
        new URL(url);
        return null; // Valid URL
      } catch {
        // Check if it starts with http/https but is malformed
        if (url.startsWith('http://') || url.startsWith('https://')) {
          return 'Please enter a valid URL';
        }

        // If it doesn't start with protocol, suggest adding it
        return 'Please enter a valid URL (e.g., https://example.com)';
      }
    }

    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.trim();

    // Auto-prepend https:// if user enters a domain without protocol
    if (
      inputValue &&
      !inputValue.startsWith('http://') &&
      !inputValue.startsWith('https://')
    ) {
      // Check if it looks like a domain (contains at least one dot)
      if (inputValue.includes('.') && !inputValue.includes(' ')) {
        onChange(`https://${inputValue}`);
      }
    }
  };

  // const validationError = validateURL(value);
  // const displayError = error || validationError;

  return (
    <div className="w-full">
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
        className={`h-[20px] w-full border-none bg-transparent text-[13px] font-[400] text-black placeholder:text-black/60 focus:outline-none ${className}`}
        style={{
          boxShadow: 'none !important',
          outline: 'none !important',
          border: 'none !important',
        }}
      />
    </div>
  );
};

export default URLInput;
