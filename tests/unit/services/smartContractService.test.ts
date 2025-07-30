import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SmartContract } from '@/lib/services/smartContractService';
import { SmartContractService } from '@/lib/services/smartContractService';

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
    from: vi.fn(),
    where: vi.fn(),
    limit: vi.fn(),
    set: vi.fn(),
  },
}));

describe('SmartContractService', () => {
  let service: SmartContractService;

  beforeEach(() => {
    service = new SmartContractService();
    vi.clearAllMocks();
  });

  describe('validateContracts', () => {
    it('should validate valid contracts', async () => {
      const contracts: SmartContract[] = [
        {
          chain: 'ethereum',
          addresses: [
            '0x742D35cc6634c0532925a3b844bc9e7595f8C8d3',
            '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
          ],
        },
        {
          chain: 'polygon',
          addresses: ['0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed'],
        },
      ];

      const result = await service.validateContracts(contracts);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing chain', async () => {
      const contracts: SmartContract[] = [
        {
          chain: '',
          addresses: ['0x742d35Cc6634C0532925a3b844Bc9e7595f8C8d3'],
        },
      ];

      const result = await service.validateContracts(contracts);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Chain selection is required');
    });

    it('should detect missing addresses', async () => {
      const contracts: SmartContract[] = [
        {
          chain: 'ethereum',
          addresses: [],
        },
      ];

      const result = await service.validateContracts(contracts);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('No addresses provided for ethereum');
    });

    it('should detect invalid address format', async () => {
      const contracts: SmartContract[] = [
        {
          chain: 'ethereum',
          addresses: [
            'invalid-address',
            '0x742D35cc6634c0532925a3b844bc9e7595f8C8d3',
          ],
        },
      ];

      const result = await service.validateContracts(contracts);

      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) => e.includes('Invalid address format')),
      ).toBe(true);
    });

    it('should detect duplicate addresses within same chain', async () => {
      const contracts: SmartContract[] = [
        {
          chain: 'ethereum',
          addresses: [
            '0x742D35cc6634c0532925a3b844bc9e7595f8C8d3',
            '0x742d35cc6634c0532925a3b844bc9e7595f8c8d3', // Same address, different case
          ],
        },
      ];

      const result = await service.validateContracts(contracts);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Duplicate address'))).toBe(
        true,
      );
    });

    it('should detect duplicate chains', async () => {
      const contracts: SmartContract[] = [
        {
          chain: 'ethereum',
          addresses: ['0x742d35Cc6634C0532925a3b844Bc9e7595f8C8d3'],
        },
        {
          chain: 'ethereum',
          addresses: ['0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe'],
        },
      ];

      const result = await service.validateContracts(contracts);

      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) =>
          e.includes('Chain "ethereum" appears multiple times'),
        ),
      ).toBe(true);
    });

    it('should handle empty addresses that get filtered', async () => {
      const contracts: SmartContract[] = [
        {
          chain: 'ethereum',
          addresses: ['', '  ', '0x742D35cc6634c0532925a3b844bc9e7595f8C8d3'],
        },
      ];

      const result = await service.validateContracts(contracts);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate custom chains', async () => {
      const contracts: SmartContract[] = [
        {
          chain: 'custom-solana',
          addresses: ['DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK'],
        },
        {
          chain: 'custom-near',
          addresses: ['alice.near', 'bob.near'],
        },
      ];

      const result = await service.validateContracts(contracts);

      // Should pass basic validation (chain exists and has addresses)
      // Note: Address format validation for non-EVM chains would need custom logic
      expect(
        result.errors.filter((e) => e.includes('Chain selection is required')),
      ).toHaveLength(0);
      expect(
        result.errors.filter((e) => e.includes('No addresses provided')),
      ).toHaveLength(0);
    });
  });

  describe('transformLegacyData', () => {
    it('should transform comma-separated string to contracts array', () => {
      const legacyData =
        '0x742d35Cc6634C0532925a3b844Bc9e7595f8C8d3, 0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe';

      const result = service.transformLegacyData(legacyData);

      expect(result).toHaveLength(1);
      expect(result[0].chain).toBe('ethereum');
      expect(result[0].addresses).toHaveLength(2);
      expect(result[0].addresses[0]).toBe(
        '0x742d35Cc6634C0532925a3b844Bc9e7595f8C8d3',
      );
      expect(result[0].addresses[1]).toBe(
        '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
      );
    });

    it('should handle empty legacy data', () => {
      expect(service.transformLegacyData(null)).toEqual([]);
      expect(service.transformLegacyData('')).toEqual([]);
      expect(service.transformLegacyData('  ')).toEqual([]);
    });

    it('should handle single address', () => {
      const legacyData = '0x742d35Cc6634C0532925a3b844Bc9e7595f8C8d3';

      const result = service.transformLegacyData(legacyData);

      expect(result).toHaveLength(1);
      expect(result[0].chain).toBe('ethereum');
      expect(result[0].addresses).toHaveLength(1);
      expect(result[0].addresses[0]).toBe(
        '0x742d35Cc6634C0532925a3b844Bc9e7595f8C8d3',
      );
    });

    it('should filter empty addresses', () => {
      const legacyData =
        '0x742d35Cc6634C0532925a3b844Bc9e7595f8C8d3, , , 0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe';

      const result = service.transformLegacyData(legacyData);

      expect(result).toHaveLength(1);
      expect(result[0].addresses).toHaveLength(2);
    });
  });

  describe('transformToLegacyFormat', () => {
    it('should transform contracts array to comma-separated string', () => {
      const contracts: SmartContract[] = [
        {
          chain: 'ethereum',
          addresses: [
            '0x742d35Cc6634C0532925a3b844Bc9e7595f8C8D3',
            '0xdE0B295669a9FD93d5F28D9Ec85E40f4cB697BAe',
          ],
        },
        {
          chain: 'polygon',
          addresses: ['0x5aAeb6053f3E94C9b9A09f33669435E7Ef1BeAed'],
        },
      ];

      const result = service.transformToLegacyFormat(contracts);

      expect(result).toBe(
        '0x742d35Cc6634C0532925a3b844Bc9e7595f8C8D3, 0xdE0B295669a9FD93d5F28D9Ec85E40f4cB697BAe, 0x5aAeb6053f3E94C9b9A09f33669435E7Ef1BeAed',
      );
    });

    it('should handle empty contracts array', () => {
      const result = service.transformToLegacyFormat([]);
      expect(result).toBe('');
    });

    it('should handle contracts with no addresses', () => {
      const contracts: SmartContract[] = [
        {
          chain: 'ethereum',
          addresses: [],
        },
      ];

      const result = service.transformToLegacyFormat(contracts);
      expect(result).toBe('');
    });
  });

  describe('getSmartContracts', () => {
    it('should handle legacy string data format', async () => {
      const mockDb = await import('@/lib/db');
      const selectMock = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 1,
            dappSmartContracts:
              '0x742D35cc6634c0532925a3b844bc9e7595f8C8d3, 0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
          },
        ]),
      };
      mockDb.db.select = vi.fn().mockReturnValue(selectMock);

      const result = await service.getSmartContracts(1);

      expect(result.applicable).toBe(true);
      expect(result.contracts).toHaveLength(1);
      expect(result.contracts[0].chain).toBe('ethereum');
      expect(result.contracts[0].addresses).toHaveLength(2);
      expect(result.references).toEqual([]);
    });

    it('should handle new JSONB data format', async () => {
      const mockDb = await import('@/lib/db');
      const mockData = {
        applicable: true,
        contracts: [
          {
            chain: 'ethereum',
            addresses: ['0x742d35Cc6634C0532925a3b844Bc9e7595f8C8d3'],
          },
          {
            chain: 'custom-solana',
            addresses: ['DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK'],
          },
        ],
        references: ['https://etherscan.io'],
      };

      const selectMock = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 1,
            dappSmartContracts: mockData,
          },
        ]),
      };
      mockDb.db.select = vi.fn().mockReturnValue(selectMock);

      const result = await service.getSmartContracts(1);

      expect(result).toEqual(mockData);
    });

    it('should handle null data', async () => {
      const mockDb = await import('@/lib/db');
      const selectMock = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 1,
            dappSmartContracts: null,
          },
        ]),
      };
      mockDb.db.select = vi.fn().mockReturnValue(selectMock);

      const result = await service.getSmartContracts(1);

      expect(result.applicable).toBe(true);
      expect(result.contracts).toEqual([]);
      expect(result.references).toEqual([]);
    });

    it('should throw error if project not found', async () => {
      const mockDb = await import('@/lib/db');
      const selectMock = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      mockDb.db.select = vi.fn().mockReturnValue(selectMock);

      await expect(service.getSmartContracts(999)).rejects.toThrow(
        'Project not found',
      );
    });
  });

  describe('updateSmartContracts', () => {
    it('should update project with new smart contracts data', async () => {
      const mockDb = await import('@/lib/db');
      const updateMock = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      };
      mockDb.db.update = vi.fn().mockReturnValue(updateMock);

      const data = {
        applicable: true,
        contracts: [
          {
            chain: 'ethereum',
            addresses: ['  0x742D35cc6634c0532925a3b844bc9e7595f8C8d3  '],
          },
        ],
        references: ['https://etherscan.io'],
      };

      await service.updateSmartContracts(1, data);

      expect(mockDb.db.update).toHaveBeenCalled();
      expect(updateMock.set).toHaveBeenCalledWith({
        dappSmartContracts: {
          applicable: true,
          contracts: [
            {
              chain: 'ethereum',
              addresses: ['0x742D35cc6634c0532925a3b844bc9e7595f8C8d3'], // trimmed
            },
          ],
          references: ['https://etherscan.io'],
        },
        updatedAt: expect.any(Date),
      });
    });

    it('should handle non-applicable state', async () => {
      const mockDb = await import('@/lib/db');
      const updateMock = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      };
      mockDb.db.update = vi.fn().mockReturnValue(updateMock);

      const data = {
        applicable: false,
        contracts: [
          {
            chain: 'ethereum',
            addresses: ['0x742d35Cc6634C0532925a3b844Bc9e7595f8C8d3'],
          },
        ],
      };

      await service.updateSmartContracts(1, data);

      expect(updateMock.set).toHaveBeenCalledWith({
        dappSmartContracts: {
          applicable: false,
          contracts: [], // Empty when not applicable
          references: [],
        },
        updatedAt: expect.any(Date),
      });
    });
  });
});
