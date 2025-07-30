import { ethers } from 'ethers';

export interface AddressValidationResult {
  address: string;
  isValid: boolean;
  hasValidChecksum: boolean;
  normalized: string | null;
}

export interface BatchValidationResult {
  results: AddressValidationResult[];
  valid: string[];
  invalid: string[];
}

export interface ValidationResult {
  valid: boolean;
  addresses: string[];
  errors: string[];
}

export class AddressValidator {
  /**
   * Check if address has valid format (basic validation)
   */
  static isValidFormat(address: string): boolean {
    return ethers.isAddress(address);
  }

  /**
   * Check if address has valid EIP-55 checksum
   */
  static isValidChecksum(address: string): boolean {
    try {
      return ethers.getAddress(address) === address;
    } catch {
      return false;
    }
  }

  /**
   * Normalize address to checksum format
   */
  static normalizeAddress(address: string): string {
    try {
      return ethers.getAddress(address);
    } catch {
      return address;
    }
  }

  /**
   * Validate multiple addresses in batch
   */
  static validateBatch(addresses: string[]): BatchValidationResult {
    const results: AddressValidationResult[] = [];
    const valid: string[] = [];
    const invalid: string[] = [];

    for (const address of addresses) {
      const trimmed = address.trim();
      if (!trimmed) continue;

      const isValid = this.isValidFormat(trimmed);
      const hasValidChecksum = isValid && this.isValidChecksum(trimmed);

      results.push({
        address: trimmed,
        isValid,
        hasValidChecksum,
        normalized: isValid ? ethers.getAddress(trimmed) : null,
      });

      if (isValid) {
        valid.push(trimmed);
      } else {
        invalid.push(trimmed);
      }
    }

    return { results, valid, invalid };
  }

  /**
   * Parse comma-separated address string
   */
  static parseAddressString(input: string): string[] {
    return input
      .split(',')
      .map((addr) => addr.trim())
      .filter(Boolean);
  }

  /**
   * Validate addresses with detailed error messages
   */
  static validateAddresses(addresses: string[]): ValidationResult {
    const errors: string[] = [];
    const validAddresses: string[] = [];
    const uniqueAddresses = new Set<string>();

    addresses.forEach((address) => {
      const trimmed = address.trim();
      if (!trimmed) return;

      if (!this.isValidFormat(trimmed)) {
        errors.push(`Invalid address format: ${trimmed}`);
        return;
      }

      const normalized = trimmed.toLowerCase();
      if (uniqueAddresses.has(normalized)) {
        errors.push(`Duplicate address detected: ${trimmed}`);
        return;
      }

      uniqueAddresses.add(normalized);
      validAddresses.push(trimmed);
    });

    return {
      valid: errors.length === 0,
      addresses: validAddresses,
      errors,
    };
  }

  /**
   * Check if string contains multiple addresses
   */
  static containsMultipleAddresses(input: string): boolean {
    return input.includes(',') || input.split(/\s+/).filter(Boolean).length > 1;
  }

  /**
   * Format addresses for display
   */
  static formatAddressesForDisplay(addresses: string[]): string {
    return addresses.join(', ');
  }

  /**
   * Shorten address for display (e.g., 0x1234...5678)
   */
  static shortenAddress(
    address: string,
    startLength: number = 6,
    endLength: number = 4,
  ): string {
    if (!address || address.length < startLength + endLength + 3) {
      return address;
    }
    return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
  }

  /**
   * Group addresses by validity
   */
  static groupByValidity(addresses: string[]): {
    valid: string[];
    invalid: string[];
  } {
    const valid: string[] = [];
    const invalid: string[] = [];

    addresses.forEach((address) => {
      const trimmed = address.trim();
      if (!trimmed) return;

      if (this.isValidFormat(trimmed)) {
        valid.push(trimmed);
      } else {
        invalid.push(trimmed);
      }
    });

    return { valid, invalid };
  }
}

/**
 * Helper function to validate Ethereum address
 */
export const validateEthereumAddress = (address: string): boolean => {
  return AddressValidator.isValidFormat(address);
};

/**
 * Helper function to validate and normalize addresses
 */
export const validateAndNormalizeAddresses = (
  addresses: string[],
): ValidationResult => {
  return AddressValidator.validateAddresses(addresses);
};

/**
 * Helper function to parse address input
 */
export const parseAddressInput = (input: string): string[] => {
  return AddressValidator.parseAddressString(input);
};
