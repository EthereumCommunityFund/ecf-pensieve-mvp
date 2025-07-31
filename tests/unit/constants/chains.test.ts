import { describe, expect, it } from 'vitest';

import {
  createCustomChain,
  CUSTOM_CHAIN_OPTION,
  getAllChains,
  getChainById,
  getChainDisplayInfo,
  PREDEFINED_CHAINS,
  validateChainName,
} from '@/constants/chains';

describe('Chain Constants', () => {
  describe('PREDEFINED_CHAINS', () => {
    it('should have valid chain configurations', () => {
      expect(PREDEFINED_CHAINS.length).toBeGreaterThan(0);

      PREDEFINED_CHAINS.forEach((chain) => {
        expect(chain.id).toBeTruthy();
        expect(chain.name).toBeTruthy();
        expect(chain.addressPattern).toBeInstanceOf(RegExp);
      });
    });

    it('should have unique chain IDs', () => {
      const ids = PREDEFINED_CHAINS.map((chain) => chain.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have unique chain names', () => {
      const names = PREDEFINED_CHAINS.map((chain) => chain.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it('should include expected chains', () => {
      const chainIds = PREDEFINED_CHAINS.map((chain) => chain.id);
      expect(chainIds).toContain('ethereum');
      expect(chainIds).toContain('polygon');
      expect(chainIds).toContain('bsc');
      expect(chainIds).toContain('arbitrum');
    });
  });

  describe('CUSTOM_CHAIN_OPTION', () => {
    it('should have correct configuration', () => {
      expect(CUSTOM_CHAIN_OPTION.id).toBe('custom');
      expect(CUSTOM_CHAIN_OPTION.name).toBe('Other Chain (Custom)');
      expect(CUSTOM_CHAIN_OPTION.isCustom).toBe(true);
      expect(CUSTOM_CHAIN_OPTION.addressPattern).toBeInstanceOf(RegExp);
    });
  });

  describe('getAllChains', () => {
    it('should return all chains including custom option', () => {
      const allChains = getAllChains();

      expect(allChains.length).toBe(PREDEFINED_CHAINS.length + 1);
      expect(allChains[allChains.length - 1]).toEqual(CUSTOM_CHAIN_OPTION);
    });
  });

  describe('getChainById', () => {
    it('should return predefined chain by ID', () => {
      const ethereum = getChainById('ethereum');
      expect(ethereum).toBeDefined();
      expect(ethereum?.name).toBe('Ethereum');
    });

    it('should return custom chain option', () => {
      const custom = getChainById('custom');
      expect(custom).toEqual(CUSTOM_CHAIN_OPTION);
    });

    it('should return custom chain configuration', () => {
      const customSolana = getChainById('custom-solana');
      expect(customSolana).toBeDefined();
      expect(customSolana?.id).toBe('custom-solana');
      expect(customSolana?.name).toBe('solana');
      expect(customSolana?.isCustom).toBe(true);
    });

    it('should handle custom chain with hyphens', () => {
      const customChain = getChainById('custom-my-custom-chain');
      expect(customChain).toBeDefined();
      expect(customChain?.name).toBe('my custom chain');
    });

    it('should return undefined for unknown chain', () => {
      expect(getChainById('unknown-chain')).toBeUndefined();
    });
  });

  describe('createCustomChain', () => {
    it('should create custom chain with correct ID', () => {
      const chain = createCustomChain('Solana');
      expect(chain.id).toBe('custom-solana');
      expect(chain.name).toBe('Solana');
      expect(chain.isCustom).toBe(true);
      expect(chain.addressPattern).toBeInstanceOf(RegExp);
    });

    it('should handle spaces in chain name', () => {
      const chain = createCustomChain('My Custom Chain');
      expect(chain.id).toBe('custom-my-custom-chain');
      expect(chain.name).toBe('My Custom Chain');
    });

    it('should handle multiple spaces', () => {
      const chain = createCustomChain('Chain   With    Spaces');
      expect(chain.id).toBe('custom-chain-with-spaces');
      expect(chain.name).toBe('Chain   With    Spaces');
    });

    it('should trim chain name', () => {
      const chain = createCustomChain('  Trimmed Chain  ');
      expect(chain.id).toBe('custom-trimmed-chain');
      expect(chain.name).toBe('Trimmed Chain');
    });

    it('should preserve case in name but lowercase in ID', () => {
      const chain = createCustomChain('CamelCase Chain');
      expect(chain.id).toBe('custom-camelcase-chain');
      expect(chain.name).toBe('CamelCase Chain');
    });
  });

  describe('validateChainName', () => {
    it('should validate valid chain names', () => {
      expect(validateChainName('Solana')).toEqual({ valid: true });
      expect(validateChainName('My Chain')).toEqual({ valid: true });
      expect(validateChainName('AB')).toEqual({ valid: true });
      expect(validateChainName('A'.repeat(50))).toEqual({ valid: true });
    });

    it('should reject empty chain name', () => {
      const result = validateChainName('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Chain name is required');
    });

    it('should reject whitespace-only chain name', () => {
      const result = validateChainName('   ');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Chain name is required');
    });

    it('should reject too short chain name', () => {
      const result = validateChainName('A');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Chain name must be at least 2 characters');
    });

    it('should reject too long chain name', () => {
      const result = validateChainName('A'.repeat(51));
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Chain name must be less than 50 characters');
    });

    it('should reject existing predefined chain names', () => {
      const result = validateChainName('Ethereum');
      expect(result.valid).toBe(false);
      expect(result.error).toBe(
        'This chain name already exists in the predefined list',
      );
    });

    it('should reject case-insensitive duplicates', () => {
      const result = validateChainName('ethereum');
      expect(result.valid).toBe(false);
      expect(result.error).toBe(
        'This chain name already exists in the predefined list',
      );
    });

    it('should trim chain name before validation', () => {
      const result = validateChainName('  Solana  ');
      expect(result.valid).toBe(true);
    });
  });

  describe('getChainDisplayInfo', () => {
    it('should return display info for predefined chain', () => {
      const info = getChainDisplayInfo('ethereum');
      expect(info.name).toBe('Ethereum');
    });

    it('should return display info for custom chain', () => {
      const info = getChainDisplayInfo('custom-solana');
      expect(info.name).toBe('solana');
    });

    it('should return Unknown Chain for invalid ID', () => {
      const info = getChainDisplayInfo('invalid-id');
      expect(info.name).toBe('Unknown Chain');
    });
  });

  describe('Address Pattern Validation', () => {
    it('should validate Ethereum addresses with predefined pattern', () => {
      const pattern = PREDEFINED_CHAINS[0].addressPattern!;

      // Valid addresses
      expect(pattern.test('0x742d35Cc6634C0532925a3b844Bc9e7595f8C8d3')).toBe(
        true,
      );
      expect(pattern.test('0x0000000000000000000000000000000000000000')).toBe(
        true,
      );
      expect(pattern.test('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF')).toBe(
        true,
      );

      // Invalid addresses
      expect(pattern.test('742d35Cc6634C0532925a3b844Bc9e7595f8C8d3')).toBe(
        false,
      ); // Missing 0x
      expect(pattern.test('0x742d35Cc6634C0532925a3b844Bc9e7595f8C8d')).toBe(
        false,
      ); // Too short
      expect(pattern.test('0x742d35Cc6634C0532925a3b844Bc9e7595f8C8d33')).toBe(
        false,
      ); // Too long
      expect(pattern.test('0xG42d35Cc6634C0532925a3b844Bc9e7595f8C8d3')).toBe(
        false,
      ); // Invalid character
    });
  });
});
