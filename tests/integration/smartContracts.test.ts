import { ethers } from 'ethers';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import type { SmartContract } from '@/lib/services/smartContractService';
import { appRouter } from '@/lib/trpc/routers';

import { createValidProjectData } from './factories/projectFactory';
import { cleanDatabase } from './helpers/testHelpers';

// Mock createContext since it's not available in test environment
const createContext = ({ auth }: { auth: { address: string | null } }) => ({
  auth,
  address: auth.address,
});

// Mock Next.js cache functions
vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn((fn) => fn),
}));

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ user: null }),
    },
  })),
}));

describe.skip('Smart Contracts API Integration Tests', () => {
  let testWallet: ethers.HDNodeWallet;
  let testWallet2: ethers.HDNodeWallet;
  let userContext: any;
  let userContext2: any;
  let projectCaller: any;
  let smartContractsCaller: any;
  let testProjectId: number;

  beforeAll(async () => {
    await cleanDatabase();

    // Create test wallets
    testWallet = ethers.Wallet.createRandom();
    testWallet2 = ethers.Wallet.createRandom();

    // Create contexts for authenticated users
    userContext = createContext({
      auth: { address: testWallet.address },
    });

    userContext2 = createContext({
      auth: { address: testWallet2.address },
    });

    // Create router callers
    projectCaller =
      appRouter.project._def._config.transformer.output.serialize(userContext);
    smartContractsCaller =
      appRouter.smartContracts._def._config.transformer.output.serialize(
        userContext,
      );

    // Create a test project
    const projectData = createValidProjectData();
    const project = await projectCaller.createProject(projectData);
    testProjectId = project.id;
  });

  afterAll(async () => {
    await cleanDatabase();
  });

  describe('update', () => {
    it('should update smart contracts with single chain', async () => {
      const contractsData = {
        projectId: testProjectId,
        applicable: true,
        contracts: [
          {
            chain: 'ethereum',
            addresses: [
              '0x742D35cc6634c0532925a3b844bc9e7595f8C8d3',
              '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
            ],
          },
        ],
        references: ['https://etherscan.io'],
      };

      const result = await smartContractsCaller.update(contractsData);

      expect(result.success).toBe(true);

      // Verify the data was saved correctly
      const savedData = await smartContractsCaller.get({
        projectId: testProjectId,
      });

      expect(savedData.applicable).toBe(true);
      expect(savedData.contracts).toHaveLength(1);
      expect(savedData.contracts[0].chain).toBe('ethereum');
      expect(savedData.contracts[0].addresses).toHaveLength(2);
      expect(savedData.references).toEqual(['https://etherscan.io']);
    });

    it('should update smart contracts with multiple chains including custom', async () => {
      const contractsData = {
        projectId: testProjectId,
        applicable: true,
        contracts: [
          {
            chain: 'ethereum',
            addresses: ['0x742D35cc6634c0532925a3b844bc9e7595f8C8d3'],
          },
          {
            chain: 'polygon',
            addresses: ['0x5aAeb6053f3E94C9b9A09f33669435E7Ef1BeAed'],
          },
          {
            chain: 'custom-solana',
            addresses: ['DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK'],
          },
        ],
      };

      const result = await smartContractsCaller.update(contractsData);

      expect(result.success).toBe(true);

      // Verify the data was saved correctly
      const savedData = await smartContractsCaller.get({
        projectId: testProjectId,
      });

      expect(savedData.applicable).toBe(true);
      expect(savedData.contracts).toHaveLength(3);

      const ethereumContract = savedData.contracts.find(
        (c: SmartContract) => c.chain === 'ethereum',
      );
      expect(ethereumContract?.addresses).toHaveLength(1);

      const customContract = savedData.contracts.find(
        (c: SmartContract) => c.chain === 'custom-solana',
      );
      expect(customContract?.addresses).toContain(
        'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
      );
    });

    it('should handle non-applicable state', async () => {
      const contractsData = {
        projectId: testProjectId,
        applicable: false,
        contracts: [],
      };

      const result = await smartContractsCaller.update(contractsData);

      expect(result.success).toBe(true);

      // Verify the data was saved correctly
      const savedData = await smartContractsCaller.get({
        projectId: testProjectId,
      });

      expect(savedData.applicable).toBe(false);
      expect(savedData.contracts).toHaveLength(0);
    });

    it('should reject invalid addresses', async () => {
      const contractsData = {
        projectId: testProjectId,
        applicable: true,
        contracts: [
          {
            chain: 'ethereum',
            addresses: [
              'invalid-address',
              '0x742D35cc6634c0532925a3b844bc9e7595f8C8d3',
            ],
          },
        ],
      };

      await expect(smartContractsCaller.update(contractsData)).rejects.toThrow(
        'Invalid contract data',
      );
    });

    it('should reject duplicate addresses on same chain', async () => {
      const contractsData = {
        projectId: testProjectId,
        applicable: true,
        contracts: [
          {
            chain: 'ethereum',
            addresses: [
              '0x742D35cc6634c0532925a3b844bc9e7595f8C8d3',
              '0x742d35cc6634c0532925a3b844bc9e7595f8c8d3', // Same address, different case
            ],
          },
        ],
      };

      await expect(smartContractsCaller.update(contractsData)).rejects.toThrow(
        'Invalid contract data',
      );
    });

    it('should reject duplicate chains', async () => {
      const contractsData = {
        projectId: testProjectId,
        applicable: true,
        contracts: [
          {
            chain: 'ethereum',
            addresses: ['0x742D35cc6634c0532925a3b844bc9e7595f8C8d3'],
          },
          {
            chain: 'ethereum',
            addresses: ['0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe'],
          },
        ],
      };

      await expect(smartContractsCaller.update(contractsData)).rejects.toThrow(
        'Invalid contract data',
      );
    });

    it('should reject update from non-owner', async () => {
      const otherUserCaller =
        appRouter.smartContracts.createCaller(userContext2);

      const contractsData = {
        projectId: testProjectId,
        applicable: true,
        contracts: [
          {
            chain: 'ethereum',
            addresses: ['0x742D35cc6634c0532925a3b844bc9e7595f8C8d3'],
          },
        ],
      };

      await expect(otherUserCaller.update(contractsData)).rejects.toThrow(
        'You do not have permission to update this project',
      );
    });

    it('should validate URL references', async () => {
      const contractsData = {
        projectId: testProjectId,
        applicable: true,
        contracts: [
          {
            chain: 'ethereum',
            addresses: ['0x742D35cc6634c0532925a3b844bc9e7595f8C8d3'],
          },
        ],
        references: ['not-a-url', 'https://valid-url.com'],
      };

      await expect(
        smartContractsCaller.update(contractsData),
      ).rejects.toThrow();
    });
  });

  describe('get', () => {
    it('should retrieve smart contracts data', async () => {
      // First update with some data
      await smartContractsCaller.update({
        projectId: testProjectId,
        applicable: true,
        contracts: [
          {
            chain: 'ethereum',
            addresses: ['0x742D35cc6634c0532925a3b844bc9e7595f8C8d3'],
          },
        ],
        references: ['https://etherscan.io'],
      });

      // Then retrieve
      const result = await smartContractsCaller.get({
        projectId: testProjectId,
      });

      expect(result.applicable).toBe(true);
      expect(result.contracts).toHaveLength(1);
      expect(result.contracts[0].chain).toBe('ethereum');
      expect(result.references).toEqual(['https://etherscan.io']);
    });

    it('should handle non-existent project', async () => {
      await expect(
        smartContractsCaller.get({ projectId: 99999 }),
      ).rejects.toThrow('Project not found');
    });

    it('should work for unauthenticated users', async () => {
      const publicContext = await createContext({
        headers: new Headers(),
      });
      const publicCaller = appRouter.smartContracts.createCaller(publicContext);

      const result = await publicCaller.get({ projectId: testProjectId });

      expect(result).toBeDefined();
    });
  });

  describe('validate', () => {
    it('should validate valid contracts', async () => {
      const contracts = [
        {
          chain: 'ethereum',
          addresses: [
            '0x742d35Cc6634C0532925a3b844Bc9e7595f8C8d3',
            '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
          ],
        },
      ];

      const result = await smartContractsCaller.validate({ contracts });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for invalid contracts', async () => {
      const contracts = [
        {
          chain: 'ethereum',
          addresses: ['invalid-address'],
        },
      ];

      const result = await smartContractsCaller.validate({ contracts });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Invalid address format');
    });

    it('should work for unauthenticated users', async () => {
      const publicContext = await createContext({
        headers: new Headers(),
      });
      const publicCaller = appRouter.smartContracts.createCaller(publicContext);

      const contracts = [
        {
          chain: 'ethereum',
          addresses: ['0x742d35Cc6634C0532925a3b844Bc9e7595f8C8d3'],
        },
      ];

      const result = await publicCaller.validate({ contracts });

      expect(result.valid).toBe(true);
    });
  });

  describe('Custom Chain Support', () => {
    it('should save and retrieve custom chain data', async () => {
      const contractsData = {
        projectId: testProjectId,
        applicable: true,
        contracts: [
          {
            chain: 'custom-solana',
            addresses: [
              'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
              '8B38vCUK8FPLAHjKn8qEkQ5EDhS5LjJQmBvLp7aETaGj',
            ],
          },
          {
            chain: 'custom-near-protocol',
            addresses: ['alice.near', 'bob.near'],
          },
        ],
      };

      await smartContractsCaller.update(contractsData);

      const savedData = await smartContractsCaller.get({
        projectId: testProjectId,
      });

      expect(savedData.contracts).toHaveLength(2);

      const solanaContract = savedData.contracts.find(
        (c: SmartContract) => c.chain === 'custom-solana',
      );
      expect(solanaContract?.addresses).toHaveLength(2);

      const nearContract = savedData.contracts.find(
        (c: SmartContract) => c.chain === 'custom-near-protocol',
      );
      expect(nearContract?.addresses).toContain('alice.near');
    });

    it('should handle mixed predefined and custom chains', async () => {
      const contractsData = {
        projectId: testProjectId,
        applicable: true,
        contracts: [
          {
            chain: 'ethereum',
            addresses: ['0x742D35cc6634c0532925a3b844bc9e7595f8C8d3'],
          },
          {
            chain: 'custom-cosmos',
            addresses: ['cosmos1qvuhm5m644660nd8377d6l7yz9e9hhm9evmx3x'],
          },
          {
            chain: 'polygon',
            addresses: ['0x5aAeb6053f3E94C9b9A09f33669435E7Ef1BeAed'],
          },
        ],
      };

      await smartContractsCaller.update(contractsData);

      const savedData = await smartContractsCaller.get({
        projectId: testProjectId,
      });

      expect(savedData.contracts).toHaveLength(3);
      expect(savedData.contracts.map((c: SmartContract) => c.chain)).toContain(
        'custom-cosmos',
      );
    });
  });

  describe('Legacy Data Migration', () => {
    it('should handle legacy string format when reading', async () => {
      // Simulate legacy data by directly updating the database
      const { db } = await import('@/lib/db');
      const { projects } = await import('@/lib/db/schema');
      const { eq } = await import('drizzle-orm');

      await db
        .update(projects)
        .set({
          dappSmartContracts:
            '0x742D35cc6634c0532925a3b844bc9e7595f8C8d3, 0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
        })
        .where(eq(projects.id, testProjectId));

      // Read through the API
      const result = await smartContractsCaller.get({
        projectId: testProjectId,
      });

      expect(result.applicable).toBe(true);
      expect(result.contracts).toHaveLength(1);
      expect(result.contracts[0].chain).toBe('ethereum');
      expect(result.contracts[0].addresses).toHaveLength(2);
    });
  });
});
