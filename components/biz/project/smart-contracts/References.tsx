'use client';

import React, { useState } from 'react';

import { Button } from '@/components/base/button';
import { Input } from '@/components/base/input';
import { CloseIcon, LinkIcon, PlusIcon } from '@/components/icons';

export interface ReferencesProps {
  value: string[];
  onChange: (refs: string[]) => void;
  disabled?: boolean;
}

export const References: React.FC<ReferencesProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [newRef, setNewRef] = useState('');
  const [error, setError] = useState('');
  const [showInput, setShowInput] = useState(false);

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleAddReference = () => {
    const trimmedRef = newRef.trim();

    if (!trimmedRef) {
      setError('Please enter a URL');
      return;
    }

    if (!validateUrl(trimmedRef)) {
      setError('Please enter a valid URL');
      return;
    }

    if (value.includes(trimmedRef)) {
      setError('This reference already exists');
      return;
    }

    onChange([...value, trimmedRef]);
    setNewRef('');
    setError('');
    setShowInput(false);
  };

  const handleRemoveReference = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddReference();
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700">References</h4>

      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((ref, index) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded-lg bg-gray-50 p-2"
            >
              <LinkIcon size={16} className="text-gray-400" />
              <a
                href={ref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 truncate text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                {ref}
              </a>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onClick={() => handleRemoveReference(index)}
                disabled={disabled}
                className="text-red-500 hover:bg-red-50 hover:text-red-700"
                aria-label="Remove reference"
              >
                <CloseIcon width={12} height={12} />
              </Button>
            </div>
          ))}
        </div>
      )}

      {showInput ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={newRef}
              onChange={(e) => {
                setNewRef(e.target.value);
                setError('');
              }}
              placeholder="https://example.com/contract-docs"
              disabled={disabled}
              onKeyPress={handleKeyPress}
              isInvalid={!!error}
              errorMessage={error}
              className="flex-1"
            />
            <Button
              type="button"
              size="sm"
              onClick={handleAddReference}
              disabled={disabled}
              color="primary"
            >
              Add
            </Button>
            <Button
              type="button"
              size="sm"
              variant="light"
              onClick={() => {
                setShowInput(false);
                setNewRef('');
                setError('');
              }}
              disabled={disabled}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="light"
          size="sm"
          onClick={() => setShowInput(true)}
          disabled={disabled}
          startContent={<PlusIcon size={16} />}
          className="text-gray-600 hover:text-gray-800"
        >
          Add Reference
        </Button>
      )}
    </div>
  );
};
