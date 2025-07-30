import { describe, expect, it } from 'vitest';

import {
  AddressValidator,
  parseAddressInput,
  validateAndNormalizeAddresses,
  validateEthereumAddress,
} from '@/lib/utils/addressValidation';

describe('AddressValidator', () => {
  describe('isValidFormat', () => {
    it('should validate correct Ethereum addresses', () => {
      expect(
        AddressValidator.isValidFormat(
          '0x742D35cc6634c0532925a3b844bc9e7595f8C8d3',
        ),
      ).toBe(true);
      expect(
        AddressValidator.isValidFormat(
          '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
        ),
      ).toBe(true);
      expect(
        AddressValidator.isValidFormat(
          '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
        ),
      ).toBe(true);
    });

    it('should reject invalid Ethereum addresses', () => {
      expect(AddressValidator.isValidFormat('')).toBe(false);
      expect(AddressValidator.isValidFormat('0x')).toBe(false);
      expect(AddressValidator.isValidFormat('0x123')).toBe(false);
      expect(AddressValidator.isValidFormat('not-an-address')).toBe(false);
      expect(
        AddressValidator.isValidFormat(
          '0xG234567890123456789012345678901234567890',
        ),
      ).toBe(false);
      expect(
        AddressValidator.isValidFormat(
          '0x12345678901234567890123456789012345678901',
        ),
      ).toBe(false); // 41 chars
    });
  });

  describe('isValidChecksum', () => {
    it('should validate correct checksum addresses', () => {
      expect(
        AddressValidator.isValidChecksum(
          '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
        ),
      ).toBe(true);
      expect(
        AddressValidator.isValidChecksum(
          '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
        ),
      ).toBe(true);
    });

    it('should reject incorrect checksum addresses', () => {
      expect(
        AddressValidator.isValidChecksum(
          '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed',
        ),
      ).toBe(false);
      expect(
        AddressValidator.isValidChecksum(
          '0xFB6916095CA1DF60BB79CE92CE3EA74C37C5D359',
        ),
      ).toBe(false);
    });

    it('should return false for invalid addresses', () => {
      expect(AddressValidator.isValidChecksum('not-an-address')).toBe(false);
      expect(AddressValidator.isValidChecksum('')).toBe(false);
    });
  });

  describe('normalizeAddress', () => {
    it('should convert address to checksum format', () => {
      expect(
        AddressValidator.normalizeAddress(
          '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed',
        ),
      ).toBe('0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed');
    });

    it('should return original address if invalid', () => {
      expect(AddressValidator.normalizeAddress('invalid-address')).toBe(
        'invalid-address',
      );
      expect(AddressValidator.normalizeAddress('')).toBe('');
    });
  });

  describe('validateBatch', () => {
    it('should validate batch of addresses', () => {
      const addresses = [
        '0x742D35cc6634c0532925a3b844bc9e7595f8C8d3',
        '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
        'invalid-address',
        '',
        '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
      ];

      const result = AddressValidator.validateBatch(addresses);

      expect(result.valid).toHaveLength(3);
      expect(result.invalid).toHaveLength(1);
      expect(result.invalid[0]).toBe('invalid-address');
      expect(result.results).toHaveLength(4); // Empty string is filtered out
    });

    it('should handle empty array', () => {
      const result = AddressValidator.validateBatch([]);
      expect(result.valid).toHaveLength(0);
      expect(result.invalid).toHaveLength(0);
      expect(result.results).toHaveLength(0);
    });

    it('should trim addresses before validation', () => {
      const addresses = [
        '  0x742D35cc6634c0532925a3b844bc9e7595f8C8d3  ',
        '\t0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe\n',
      ];

      const result = AddressValidator.validateBatch(addresses);
      expect(result.valid).toHaveLength(2);
      expect(result.results[0].address).toBe(
        '0x742D35cc6634c0532925a3b844bc9e7595f8C8d3',
      );
    });
  });

  describe('parseAddressString', () => {
    it('should parse comma-separated addresses', () => {
      const input =
        '0x742D35cc6634c0532925a3b844bc9e7595f8C8d3, 0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe';
      const result = AddressValidator.parseAddressString(input);

      expect(result).toHaveLength(2);
      expect(result[0]).toBe('0x742D35cc6634c0532925a3b844bc9e7595f8C8d3');
      expect(result[1]).toBe('0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe');
    });

    it('should handle various separators and spaces', () => {
      const input =
        '0x1234567890123456789012345678901234567890,0x2345678901234567890123456789012345678901,  ,0x3456789012345678901234567890123456789012';
      const result = AddressValidator.parseAddressString(input);

      expect(result).toHaveLength(3);
      expect(result[2]).toBe('0x3456789012345678901234567890123456789012');
    });

    it('should handle empty string', () => {
      expect(AddressValidator.parseAddressString('')).toHaveLength(0);
      expect(AddressValidator.parseAddressString('  ')).toHaveLength(0);
      expect(AddressValidator.parseAddressString(',')).toHaveLength(0);
    });
  });

  describe('validateAddresses', () => {
    it('should validate addresses with detailed errors', () => {
      const addresses = [
        '0x742D35cc6634c0532925a3b844bc9e7595f8C8d3',
        'invalid-address',
        '0x742D35cc6634c0532925a3b844bc9e7595f8C8d3', // duplicate
        '',
      ];

      const result = AddressValidator.validateAddresses(addresses);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0]).toContain('Invalid address format');
      expect(result.errors[1]).toContain('Duplicate address detected');
      expect(result.addresses).toHaveLength(1);
    });

    it('should handle all valid addresses', () => {
      const addresses = [
        '0x742D35cc6634c0532925a3b844bc9e7595f8C8d3',
        '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
        '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
      ];

      const result = AddressValidator.validateAddresses(addresses);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.addresses).toHaveLength(3);
    });

    it('should detect case-insensitive duplicates', () => {
      const addresses = [
        '0x742D35cc6634c0532925a3b844bc9e7595f8C8d3',
        '0x742d35cc6634c0532925a3b844bc9e7595f8c8d3', // same address, different case
      ];

      const result = AddressValidator.validateAddresses(addresses);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Duplicate address detected');
    });
  });

  describe('containsMultipleAddresses', () => {
    it('should detect comma-separated addresses', () => {
      expect(
        AddressValidator.containsMultipleAddresses('0x123..., 0x456...'),
      ).toBe(true);
    });

    it('should detect space-separated addresses', () => {
      expect(
        AddressValidator.containsMultipleAddresses('0x123... 0x456...'),
      ).toBe(true);
    });

    it('should return false for single address', () => {
      expect(
        AddressValidator.containsMultipleAddresses(
          '0x742D35cc6634c0532925a3b844bc9e7595f8C8d3',
        ),
      ).toBe(false);
    });

    it('should handle empty string', () => {
      expect(AddressValidator.containsMultipleAddresses('')).toBe(false);
    });
  });

  describe('formatAddressesForDisplay', () => {
    it('should format addresses with comma separation', () => {
      const addresses = [
        '0x742D35cc6634c0532925a3b844bc9e7595f8C8d3',
        '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
      ];

      expect(AddressValidator.formatAddressesForDisplay(addresses)).toBe(
        '0x742D35cc6634c0532925a3b844bc9e7595f8C8d3, 0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
      );
    });

    it('should handle empty array', () => {
      expect(AddressValidator.formatAddressesForDisplay([])).toBe('');
    });
  });

  describe('shortenAddress', () => {
    it('should shorten address with default lengths', () => {
      expect(
        AddressValidator.shortenAddress(
          '0x742D35cc6634c0532925a3b844bc9e7595f8C8d3',
        ),
      ).toBe('0x742D...C8d3');
    });

    it('should shorten address with custom lengths', () => {
      expect(
        AddressValidator.shortenAddress(
          '0x742D35cc6634c0532925a3b844bc9e7595f8C8d3',
          4,
          6,
        ),
      ).toBe('0x74...f8C8d3');
    });

    it('should return original if too short', () => {
      expect(AddressValidator.shortenAddress('0x123')).toBe('0x123');
      expect(AddressValidator.shortenAddress('')).toBe('');
    });
  });

  describe('groupByValidity', () => {
    it('should group addresses by validity', () => {
      const addresses = [
        '0x742D35cc6634c0532925a3b844bc9e7595f8C8d3',
        'invalid-1',
        '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
        'invalid-2',
        '',
      ];

      const result = AddressValidator.groupByValidity(addresses);

      expect(result.valid).toHaveLength(2);
      expect(result.invalid).toHaveLength(2);
      expect(result.invalid).toContain('invalid-1');
      expect(result.invalid).toContain('invalid-2');
    });

    it('should handle all valid addresses', () => {
      const addresses = [
        '0x742D35cc6634c0532925a3b844bc9e7595f8C8d3',
        '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
      ];

      const result = AddressValidator.groupByValidity(addresses);

      expect(result.valid).toHaveLength(2);
      expect(result.invalid).toHaveLength(0);
    });
  });
});

describe('Helper Functions', () => {
  it('validateEthereumAddress should work correctly', () => {
    expect(
      validateEthereumAddress('0x742D35cc6634c0532925a3b844bc9e7595f8C8d3'),
    ).toBe(true);
    expect(validateEthereumAddress('invalid')).toBe(false);
  });

  it('validateAndNormalizeAddresses should work correctly', () => {
    const addresses = ['0x742D35cc6634c0532925a3b844bc9e7595f8C8d3', 'invalid'];

    const result = validateAndNormalizeAddresses(addresses);

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.addresses).toHaveLength(1);
  });

  it('parseAddressInput should work correctly', () => {
    const input = '0x123..., 0x456...';
    const result = parseAddressInput(input);

    expect(result).toHaveLength(2);
    expect(result[0]).toBe('0x123...');
    expect(result[1]).toBe('0x456...');
  });
});
