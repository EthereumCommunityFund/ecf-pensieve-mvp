import { ethers } from 'ethers';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { db } from '@/lib/db';
import { invitationCodes, profiles } from '@/lib/db/schema';
import type { SmartContract } from '@/lib/services/smartContractService';
import { getServiceSupabase } from '@/lib/supabase/client';

import { createValidProjectData } from './factories/projectFactory';
import { cleanDatabase } from './helpers/testHelpers';

// Mock Next.js cache functions
vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn((fn) => fn),
}));

// Helper function to create context
const createContext = (userId: string | null) => ({
  db,
  supabase: getServiceSupabase(),
  user: userId ? { id: userId } : null,
});

describe('Smart Contracts API Integration Tests', () => {
  const supabase = getServiceSupabase();
  let testUserId: string;
  let testUserId2: string;
  let testInviteCodeId: number;
  let userContext: any;
  let userContext2: any;
  let projectCaller: any;
  let smartContractsCaller: any;
  let testProjectId: number;

  beforeAll(async () => {
    await cleanDatabase();

    // Create test invite code
    const [inviteCode] = await db
      .insert(invitationCodes)
      .values({
        code: 'test-smart-contracts-' + Date.now(),
        maxUses: 10,
        currentUses: 0,
      })
      .returning();
    testInviteCodeId = inviteCode.id;

    // Create test users
    const testWallet = ethers.Wallet.createRandom();
    const testWallet2 = ethers.Wallet.createRandom();

    // Create users in Supabase Auth
    const { data: authUser1 } = await supabase.auth.admin.createUser({
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      email_confirm: true,
    });
    if (!authUser1?.user?.id) {
      throw new Error('Failed to create test user 1');
    }
    testUserId = authUser1.user.id;

    const { data: authUser2 } = await supabase.auth.admin.createUser({
      email: `test2-${Date.now()}@example.com`,
      password: 'password123',
      email_confirm: true,
    });
    if (!authUser2?.user?.id) {
      throw new Error('Failed to create test user 2');
    }
    testUserId2 = authUser2.user.id;

    // Create profiles
    await db.insert(profiles).values([
      {
        userId: testUserId,
        address: testWallet.address.toLowerCase(),
        name: 'TestUser1',
        inviteCodeId: testInviteCodeId,
      },
      {
        userId: testUserId2,
        address: testWallet2.address.toLowerCase(),
        name: 'TestUser2',
        inviteCodeId: testInviteCodeId,
      },
    ]);

    // Create contexts for authenticated users
    userContext = createContext(testUserId);
    userContext2 = createContext(testUserId2);

    // Create router callers
    const { projectRouter } = await import('@/lib/trpc/routers/project');
    const { smartContractsRouter } = await import(
      '@/lib/trpc/routers/smartContracts'
    );

    projectCaller = projectRouter.createCaller(userContext);
    smartContractsCaller = smartContractsRouter.createCaller(userContext);

    // Create a test project
    const projectData = createValidProjectData();
    const project = await projectCaller.createProject(projectData);
    testProjectId = project.id;
  });

  afterAll(async () => {
    // Clean up Supabase auth users
    try {
      await supabase.auth.admin.deleteUser(testUserId);
      await supabase.auth.admin.deleteUser(testUserId2);
    } catch (error) {
      console.warn('Failed to delete test users:', error);
    }

    await cleanDatabase();
  });

  describe('update', () => {
    it('should update smart contracts with single chain', async () => {
      const contractsData = {
        projectId: testProjectId,
        contracts: [
          {
            chain: 'ethereum',
            addresses:
              '0x742D35cc6634c0532925a3b844bc9e7595f8C8d3,0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
          },
        ],
      };

      const result = await smartContractsCaller.update(contractsData);

      expect(result.success).toBe(true);

      // Verify the data was saved correctly
      const savedData = await smartContractsCaller.get({
        projectId: testProjectId,
      });

      expect(savedData.contracts).toHaveLength(1);
      expect(savedData.contracts[0].chain).toBe('ethereum');
      expect(savedData.contracts[0].addresses).toContain(
        '0x742D35cc6634c0532925a3b844bc9e7595f8C8d3',
      );
      expect(savedData.contracts[0].addresses).toContain(
        '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
      );
    });

    it('should update smart contracts with multiple chains including custom', async () => {
      const contractsData = {
        projectId: testProjectId,
        contracts: [
          {
            chain: 'ethereum',
            addresses: '0x742D35cc6634c0532925a3b844bc9e7595f8C8d3',
          },
          {
            chain: 'polygon',
            addresses: '0x5aAeb6053f3E94C9b9A09f33669435E7Ef1BeAed',
          },
          {
            chain: 'custom-solana',
            addresses: 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
          },
        ],
      };

      const result = await smartContractsCaller.update(contractsData);

      expect(result.success).toBe(true);

      // Verify the data was saved correctly
      const savedData = await smartContractsCaller.get({
        projectId: testProjectId,
      });

      expect(savedData.contracts).toHaveLength(3);

      const ethereumContract = savedData.contracts.find(
        (c: SmartContract) => c.chain === 'ethereum',
      );
      expect(ethereumContract?.addresses).toBe(
        '0x742D35cc6634c0532925a3b844bc9e7595f8C8d3',
      );

      const customContract = savedData.contracts.find(
        (c: SmartContract) => c.chain === 'custom-solana',
      );
      expect(customContract?.addresses).toContain(
        'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
      );
    });

    it('should handle empty contracts (not applicable)', async () => {
      const contractsData = {
        projectId: testProjectId,
        contracts: [],
      };

      const result = await smartContractsCaller.update(contractsData);

      expect(result.success).toBe(true);

      // Verify the data was saved correctly
      const savedData = await smartContractsCaller.get({
        projectId: testProjectId,
      });

      expect(savedData.contracts).toHaveLength(0);
    });

    it('should reject invalid addresses', async () => {
      const contractsData = {
        projectId: testProjectId,
        contracts: [
          {
            chain: 'ethereum',
            addresses:
              'invalid-address,0x742D35cc6634c0532925a3b844bc9e7595f8C8d3',
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
            addresses:
              '0x742D35cc6634c0532925a3b844bc9e7595f8C8d3,0x742d35cc6634c0532925a3b844bc9e7595f8c8d3', // Same address, different case
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
        contracts: [
          {
            chain: 'ethereum',
            addresses: '0x742D35cc6634c0532925a3b844bc9e7595f8C8d3',
          },
          {
            chain: 'ethereum',
            addresses: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
          },
        ],
      };

      await expect(smartContractsCaller.update(contractsData)).rejects.toThrow(
        'Invalid contract data',
      );
    });

    it('should reject update from non-owner', async () => {
      const { smartContractsRouter } = await import(
        '@/lib/trpc/routers/smartContracts'
      );
      const otherUserCaller = smartContractsRouter.createCaller(userContext2);

      const contractsData = {
        projectId: testProjectId,
        contracts: [
          {
            chain: 'ethereum',
            addresses: '0x742D35cc6634c0532925a3b844bc9e7595f8C8d3',
          },
        ],
      };

      await expect(otherUserCaller.update(contractsData)).rejects.toThrow(
        'You do not have permission to update this project',
      );
    });

    // References field removed - no longer part of the API
  });

  describe('get', () => {
    it('should retrieve smart contracts data', async () => {
      // First update with some data
      await smartContractsCaller.update({
        projectId: testProjectId,
        contracts: [
          {
            chain: 'ethereum',
            addresses: '0x742D35cc6634c0532925a3b844bc9e7595f8C8d3',
          },
        ],
      });

      // Then retrieve
      const result = await smartContractsCaller.get({
        projectId: testProjectId,
      });

      expect(result.contracts).toHaveLength(1);
      expect(result.contracts[0].chain).toBe('ethereum');
    });

    it('should handle non-existent project', async () => {
      await expect(
        smartContractsCaller.get({ projectId: 99999 }),
      ).rejects.toThrow('Project not found');
    });

    it('should work for unauthenticated users', async () => {
      const publicContext = createContext(null);
      const { smartContractsRouter } = await import(
        '@/lib/trpc/routers/smartContracts'
      );
      const publicCaller = smartContractsRouter.createCaller(publicContext);

      const result = await publicCaller.get({ projectId: testProjectId });

      expect(result).toBeDefined();
    });
  });

  describe('validate', () => {
    it('should validate valid contracts', async () => {
      const contracts = [
        {
          chain: 'ethereum',
          addresses:
            '0x742d35Cc6634C0532925a3b844Bc9e7595f8C8d3,0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
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
          addresses: 'invalid-address',
        },
      ];

      const result = await smartContractsCaller.validate({ contracts });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Invalid address format');
    });

    it('should work for unauthenticated users', async () => {
      const publicContext = createContext(null);
      const { smartContractsRouter } = await import(
        '@/lib/trpc/routers/smartContracts'
      );
      const publicCaller = smartContractsRouter.createCaller(publicContext);

      const contracts = [
        {
          chain: 'ethereum',
          addresses: '0x742d35Cc6634C0532925a3b844Bc9e7595f8C8d3',
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
            addresses:
              'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK,8B38vCUK8FPLAHjKn8qEkQ5EDhS5LjJQmBvLp7aETaGj',
          },
          {
            chain: 'custom-near-protocol',
            addresses: 'alice.near,bob.near',
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
      expect(solanaContract?.addresses).toContain(
        'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
      );
      expect(solanaContract?.addresses).toContain(
        '8B38vCUK8FPLAHjKn8qEkQ5EDhS5LjJQmBvLp7aETaGj',
      );

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
            addresses: '0x742D35cc6634c0532925a3b844bc9e7595f8C8d3',
          },
          {
            chain: 'custom-cosmos',
            addresses: 'cosmos1qvuhm5m644660nd8377d6l7yz9e9hhm9evmx3x',
          },
          {
            chain: 'polygon',
            addresses: '0x5aAeb6053f3E94C9b9A09f33669435E7Ef1BeAed',
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

      expect(result.contracts).toHaveLength(1);
      expect(result.contracts[0].chain).toBe('ethereum');
      expect(result.contracts[0].addresses).toContain(
        '0x742D35cc6634c0532925a3b844bc9e7595f8C8d3',
      );
      expect(result.contracts[0].addresses).toContain(
        '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
      );
    });
  });
});
