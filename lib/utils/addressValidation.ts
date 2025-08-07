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
   * More lenient validation for EVM-compatible chains
   * Accepts any 0x-prefixed 40 hex character string
   */
  static isValidFormat(address: string): boolean {
    // Basic regex validation for EVM addresses
    // Accepts uppercase, lowercase, or mixed case
    const evmAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return evmAddressRegex.test(address);
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
   * Falls back to lowercase if checksum conversion fails
   */
  static normalizeAddress(address: string): string {
    // First check if it's a valid format
    if (!this.isValidFormat(address)) {
      return address;
    }

    try {
      // Try to convert to checksum format
      return ethers.getAddress(address);
    } catch {
      // If checksum conversion fails, return lowercase format
      // This ensures valid addresses are not rejected
      return address.toLowerCase();
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
   * Also supports newline and space-separated addresses
   */
  static parseAddressString(input: string): string[] {
    // Support multiple separators: comma, newline, and multiple spaces
    return input
      .split(/[,\n]+/)
      .map((addr) => addr.trim())
      .filter(Boolean)
      .reduce((acc: string[], curr) => {
        // Further split by spaces if multiple addresses on same line
        const spaceSplit = curr.split(/\s+/).filter(Boolean);
        return acc.concat(spaceSplit);
      }, []);
  }

  /**
   * Validate addresses with detailed error messages
   */
  static validateAddresses(addresses: string[]): ValidationResult {
    const errors: string[] = [];
    const validAddresses: string[] = [];
    const uniqueAddresses = new Set<string>();

    addresses.forEach((address, index) => {
      const trimmed = address.trim();
      if (!trimmed) return;

      if (!this.isValidFormat(trimmed)) {
        errors.push(`Line ${index + 1}: Invalid address format: ${trimmed}`);
        return;
      }

      // Normalize to checksum format or lowercase
      // We accept addresses even if checksum validation fails
      const normalizedAddress = this.normalizeAddress(trimmed);

      // Check for duplicates using lowercase comparison
      const lowercaseAddress = normalizedAddress.toLowerCase();
      if (uniqueAddresses.has(lowercaseAddress)) {
        errors.push(
          `Line ${index + 1}: Duplicate address detected: ${trimmed}`,
        );
        return;
      }

      uniqueAddresses.add(lowercaseAddress);
      // Store with normalized format (checksum or lowercase)
      validAddresses.push(normalizedAddress);
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
 * Helper function to validate Ethereum/EVM address
 * Uses lenient validation that accepts any valid EVM address format
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
