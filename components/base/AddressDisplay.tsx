import { Tooltip } from '@heroui/react';
import React, { useState } from 'react';

import { AddressValidator } from '@/lib/utils/addressValidation';

interface AddressDisplayProps {
  address: string;
  startLength?: number;
  endLength?: number;
  showCopy?: boolean;
  className?: string;
}

export const AddressDisplay: React.FC<AddressDisplayProps> = ({
  address,
  startLength = 6,
  endLength = 4,
  showCopy = true,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  const shortenedAddress = AddressValidator.shortenAddress(
    address,
    startLength,
    endLength,
  );

  return (
    <Tooltip
      content={
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs">{address}</span>
          {showCopy && (
            <button
              onClick={handleCopy}
              className="rounded p-1 hover:bg-white/10"
              aria-label="Copy address"
            >
              {copied ? (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.667 3.5L5.25 9.917L2.333 7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="3.5"
                    y="3.5"
                    width="7"
                    height="7"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                  <path
                    d="M10.5 5.5V2.5C10.5 1.94772 10.0523 1.5 9.5 1.5H2.5C1.94772 1.5 1.5 1.94772 1.5 2.5V9.5C1.5 10.0523 1.94772 10.5 2.5 10.5H5.5"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                </svg>
              )}
            </button>
          )}
        </div>
      }
      classNames={{
        content: 'p-2 rounded-md border border-black/10',
      }}
      closeDelay={0}
    >
      <span className={`font-mono text-sm ${className}`}>
        {shortenedAddress}
      </span>
    </Tooltip>
  );
};

interface AddressListDisplayProps {
  addresses: string[];
  className?: string;
  itemClassName?: string;
  layout?: 'inline' | 'vertical';
  separator?: string;
}

export const AddressListDisplay: React.FC<AddressListDisplayProps> = ({
  addresses,
  className = '',
  itemClassName = '',
  layout = 'vertical',
  separator = ', ',
}) => {
  if (!addresses || addresses.length === 0) {
    return <span className="text-gray-400">No addresses</span>;
  }

  if (layout === 'inline') {
    return (
      <div className={`flex flex-wrap items-center gap-1 ${className}`}>
        {addresses.map((address, index) => (
          <React.Fragment key={index}>
            <AddressDisplay address={address} className={itemClassName} />
            {index < addresses.length - 1 && (
              <span className="text-gray-400">{separator}</span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {addresses.map((address, index) => (
        <div key={index}>
          <AddressDisplay address={address} className={itemClassName} />
        </div>
      ))}
    </div>
  );
};
