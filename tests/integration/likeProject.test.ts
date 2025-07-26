import { ethers } from 'ethers';
import { beforeAll, describe, expect, it, vi } from 'vitest';

// Mock Next.js cache functions
vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn((fn) => fn),
}));

import { and, eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import {
  invitationCodes,
  likeRecords,
  profiles,
  projects,
} from '@/lib/db/schema';
import { getServiceSupabase } from '@/lib/supabase/client';
import { authRouter } from '@/lib/trpc/routers/auth';
import { likeProjectRouter } from '@/lib/trpc/routers/likeProject';
import { projectRouter } from '@/lib/trpc/routers/project';

import { createValidProjectData } from './factories/projectFactory';
import { publishProject } from './helpers/testHelpers';

describe('LikeProject Integration Tests', () => {
  const supabase = getServiceSupabase();

  interface TestUser {
    wallet: ethers.HDNodeWallet;
    address: string;
    userId: string;
    inviteCode: string;
  }

  const testUsers: TestUser[] = [];
  let testProject: any;

  // Helper functions
  const createContext = (userId: string | null) => ({
    db,
    user: userId ? { id: userId } : null,
    supabase,
  });

  const setupWalletAndAuth = async (inviteCode?: string) => {
    const wallet = ethers.Wallet.createRandom();
    const address = wallet.address;

    const authCaller = authRouter.createCaller(createContext(null));

    // Generate nonce
    const { nonce } = await authCaller.generateNonce({ address });

    // Sign message with nonce
    const message = `Please sign this message to authenticate.\n\nNonce: ${nonce}`;
    const signature = await wallet.signMessage(message);

    // Verify and authenticate
    let result;
    try {
      result = await authCaller.verify({
        address,
        signature,
        message,
        username: `TestUser${Date.now()}`,
        inviteCode: inviteCode,
      });
    } catch (error: any) {
      console.error('Auth error:', error.message);
      throw error;
    }

    // Get the created profile
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.address, address.toLowerCase()),
    });

    return {
      wallet,
      address,
      userId: profile?.userId || '',
      inviteCode: inviteCode || '',
    };
  };

  beforeAll(async () => {
    // Clean up existing test data in correct order
    // First, delete records that reference other tables
    await db.delete(likeRecords);

    // Create invite codes for all test users
    const inviteCodes = [];
    for (let i = 0; i < 3; i++) {
      const [code] = await db
        .insert(invitationCodes)
        .values({
          code: `test-like-project-${i}-${Date.now()}`,
          maxUses: 1,
          currentUses: 0,
        })
        .returning();
      inviteCodes.push(code);
    }

    // Create test users
    for (let i = 0; i < 3; i++) {
      const user = await setupWalletAndAuth(inviteCodes[i].code);
      testUsers.push(user);
    }

    // Create a test project
    const projectCaller = projectRouter.createCaller(
      createContext(testUsers[0].userId),
    );
    const projectData = createValidProjectData();
    testProject = await projectCaller.createProject(projectData);
    await publishProject(testProject.id);

    // Set initial weight for test users
    // User 0: 100 weight (project creator gets weight)
    // User 1: 50 weight
    // User 2: 10 weight
    await db
      .update(profiles)
      .set({ weight: 50 })
      .where(eq(profiles.userId, testUsers[1].userId));
    await db
      .update(profiles)
      .set({ weight: 10 })
      .where(eq(profiles.userId, testUsers[2].userId));
  });

  describe('getUserAvailableWeight', () => {
    it('should return available weight for user', async () => {
      const caller = likeProjectRouter.createCaller(
        createContext(testUsers[0].userId),
      );
      const result = await caller.getUserAvailableWeight();

      expect(result.availableWeight).toBeGreaterThanOrEqual(0);
      expect(typeof result.availableWeight).toBe('number');
    });
  });

  describe('likeProject', () => {
    it('should successfully like a project', async () => {
      const caller = likeProjectRouter.createCaller(
        createContext(testUsers[1].userId),
      );

      const likeWeight = 20;
      const result = await caller.likeProject({
        projectId: testProject.id,
        weight: likeWeight,
      });

      expect(result).toBeDefined();
      expect(result.projectId).toBe(testProject.id);
      expect(result.creator).toBe(testUsers[1].userId);
      expect(result.weight).toBe(likeWeight);

      // Verify project support and likeCount were updated
      const updatedProject = await db.query.projects.findFirst({
        where: eq(projects.id, testProject.id),
      });
      expect(updatedProject?.support).toBe(likeWeight);
      expect(updatedProject?.likeCount).toBe(1);
    });

    it('should throw NOT_FOUND error when project does not exist', async () => {
      const caller = likeProjectRouter.createCaller(
        createContext(testUsers[1].userId),
      );

      await expect(
        caller.likeProject({
          projectId: 999999,
          weight: 10,
        }),
      ).rejects.toThrow('Project not found');
    });

    it('should throw BAD_REQUEST error when user has already liked the project', async () => {
      const caller = likeProjectRouter.createCaller(
        createContext(testUsers[1].userId),
      );

      await expect(
        caller.likeProject({
          projectId: testProject.id,
          weight: 10,
        }),
      ).rejects.toThrow('You have already liked this project');
    });

    it('should throw BAD_REQUEST error when user has insufficient weight', async () => {
      const caller = likeProjectRouter.createCaller(
        createContext(testUsers[2].userId),
      );

      await expect(
        caller.likeProject({
          projectId: testProject.id,
          weight: 100, // User 2 only has 10 weight
        }),
      ).rejects.toThrow('Insufficient weight');
    });

    it('should throw validation error for non-positive weight', async () => {
      const caller = likeProjectRouter.createCaller(
        createContext(testUsers[2].userId),
      );

      await expect(
        caller.likeProject({
          projectId: testProject.id,
          weight: 0,
        }),
      ).rejects.toThrow('Weight must be greater than 0');

      await expect(
        caller.likeProject({
          projectId: testProject.id,
          weight: -10,
        }),
      ).rejects.toThrow('Weight must be greater than 0');
    });
  });

  describe('updateLikeProject', () => {
    it('should successfully update like weight', async () => {
      const caller = likeProjectRouter.createCaller(
        createContext(testUsers[1].userId),
      );

      const newWeight = 30;
      const result = await caller.updateLikeProject({
        projectId: testProject.id,
        weight: newWeight,
      });

      expect(result).toBeDefined();
      expect(result.weight).toBe(newWeight);

      // Verify project support was updated correctly (20 -> 30, so +10)
      const updatedProject = await db.query.projects.findFirst({
        where: eq(projects.id, testProject.id),
      });
      expect(updatedProject?.support).toBe(30);
      expect(updatedProject?.likeCount).toBe(1); // Like count should not change
    });

    it('should throw NOT_FOUND error when project does not exist', async () => {
      const caller = likeProjectRouter.createCaller(
        createContext(testUsers[1].userId),
      );

      await expect(
        caller.updateLikeProject({
          projectId: 999999,
          weight: 10,
        }),
      ).rejects.toThrow('Project not found');
    });

    it('should throw BAD_REQUEST error when user has not liked the project', async () => {
      const caller = likeProjectRouter.createCaller(
        createContext(testUsers[2].userId),
      );

      await expect(
        caller.updateLikeProject({
          projectId: testProject.id,
          weight: 10,
        }),
      ).rejects.toThrow('You have not liked this project yet');
    });

    it('should throw BAD_REQUEST error when user has insufficient additional weight', async () => {
      const caller = likeProjectRouter.createCaller(
        createContext(testUsers[1].userId),
      );

      await expect(
        caller.updateLikeProject({
          projectId: testProject.id,
          weight: 100, // Current: 30, need additional: 70, but user doesn't have enough
        }),
      ).rejects.toThrow('Insufficient weight');
    });

    it('should handle edge case when existing weight is null', async () => {
      // Create a like record with null weight
      const [nullWeightLike] = await db
        .insert(likeRecords)
        .values({
          projectId: testProject.id,
          creator: testUsers[2].userId,
          weight: null as any, // Force null weight
        })
        .returning();

      const caller = likeProjectRouter.createCaller(
        createContext(testUsers[2].userId),
      );

      const result = await caller.updateLikeProject({
        projectId: testProject.id,
        weight: 5,
      });

      expect(result.weight).toBe(5);

      // Clean up
      await db.delete(likeRecords).where(eq(likeRecords.id, nullWeightLike.id));
    });
  });

  describe('withdrawLike', () => {
    let projectForWithdraw: any;

    beforeAll(async () => {
      // Create a separate project for withdrawal tests
      const projectCaller = projectRouter.createCaller(
        createContext(testUsers[0].userId),
      );
      projectForWithdraw = await projectCaller.createProject({
        ...createValidProjectData(),
        name: 'Project for Withdrawal Test',
      });
      await publishProject(projectForWithdraw.id);

      // User 2 likes the project with weight 5
      const likeCaller = likeProjectRouter.createCaller(
        createContext(testUsers[2].userId),
      );
      await likeCaller.likeProject({
        projectId: projectForWithdraw.id,
        weight: 5,
      });
    });

    it('should successfully withdraw like', async () => {
      const caller = likeProjectRouter.createCaller(
        createContext(testUsers[2].userId),
      );

      const result = await caller.withdrawLike({
        projectId: projectForWithdraw.id,
      });

      expect(result.success).toBe(true);
      expect(result.withdrawnWeight).toBe(5);

      // Verify like record was deleted
      const likeRecord = await db.query.likeRecords.findFirst({
        where: and(
          eq(likeRecords.projectId, projectForWithdraw.id),
          eq(likeRecords.creator, testUsers[2].userId),
        ),
      });
      expect(likeRecord).toBeUndefined();

      // Verify project support and likeCount were updated
      const updatedProject = await db.query.projects.findFirst({
        where: eq(projects.id, projectForWithdraw.id),
      });
      expect(updatedProject?.support).toBe(0);
      expect(updatedProject?.likeCount).toBe(0);
    });

    it('should throw NOT_FOUND error when project does not exist', async () => {
      const caller = likeProjectRouter.createCaller(
        createContext(testUsers[1].userId),
      );

      await expect(
        caller.withdrawLike({
          projectId: 999999,
        }),
      ).rejects.toThrow('Project not found');
    });

    it('should throw BAD_REQUEST error when user has not liked the project', async () => {
      const caller = likeProjectRouter.createCaller(
        createContext(testUsers[0].userId),
      );

      await expect(
        caller.withdrawLike({
          projectId: projectForWithdraw.id,
        }),
      ).rejects.toThrow('You have not liked this project yet');
    });

    it('should handle edge case when existing weight is null', async () => {
      // Create a like record with null weight
      const [nullWeightLike] = await db
        .insert(likeRecords)
        .values({
          projectId: testProject.id,
          creator: testUsers[0].userId,
          weight: null as any, // Force null weight
        })
        .returning();

      const caller = likeProjectRouter.createCaller(
        createContext(testUsers[0].userId),
      );

      const result = await caller.withdrawLike({
        projectId: testProject.id,
      });

      expect(result.success).toBe(true);
      expect(result.withdrawnWeight).toBe(0); // Should handle null as 0
    });
  });
});
