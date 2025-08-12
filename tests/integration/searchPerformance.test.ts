import { eq } from 'drizzle-orm';
import { ethers } from 'ethers';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { db } from '@/lib/db';
import {
  invitationCodes,
  profiles,
  projects,
  projectSnaps,
} from '@/lib/db/schema';
import { getServiceSupabase } from '@/lib/supabase/client';
import { authRouter } from '@/lib/trpc/routers/auth';
import { projectRouter } from '@/lib/trpc/routers/project';

import { createValidProjectData } from './factories/projectFactory';

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn((fn) => fn),
}));

describe('Search Performance Tests', () => {
  const supabase = getServiceSupabase();

  let testWallet: ethers.HDNodeWallet;
  let testAddress: string;
  let testInviteCode: string;
  let testUserId: string;
  const createdProjectIds: number[] = [];

  beforeAll(async () => {
    // Setup test user
    testWallet = ethers.Wallet.createRandom();
    testAddress = testWallet.address.toLowerCase();

    const [insertedCode] = await db
      .insert(invitationCodes)
      .values({
        code: 'test-invite-perf-' + Date.now(),
        maxUses: 10,
        currentUses: 0,
      })
      .returning();

    testInviteCode = insertedCode.code;

    const authCtx = { db, supabase, user: null };
    const authCaller = authRouter.createCaller(authCtx);

    const nonceResult = await authCaller.generateNonce({
      address: testAddress,
    });
    const message = `Please sign this message to authenticate.\n\nNonce: ${nonceResult.nonce}`;
    const signature = await testWallet.signMessage(message);

    await authCaller.verify({
      address: testAddress,
      signature,
      message,
      username: 'TestPerfUser',
      inviteCode: testInviteCode,
    });

    const profileData = await db.query.profiles.findFirst({
      where: eq(profiles.address, testAddress),
    });

    if (!profileData) {
      throw new Error('Profile not created successfully');
    }

    testUserId = profileData.userId;

    // Create test projects for performance testing
    const ctx = { db, supabase, user: { id: testUserId } };
    const caller = projectRouter.createCaller(ctx);

    // Create 10 test projects with various tags
    const tagSets = [
      ['Ethereum', 'DeFi', 'AMM'],
      ['Bitcoin', 'Lightning', 'Payment'],
      ['Optimism', 'Layer2', 'Rollup'],
      ['Arbitrum', 'Layer2', 'DeFi'],
      ['Polygon', 'Sidechain', 'Gaming'],
      ['Ethereum', 'NFT', 'Marketplace'],
      ['Solana', 'DeFi', 'DEX'],
      ['Avalanche', 'DeFi', 'Lending'],
      ['Ethereum', 'DAO', 'Governance'],
      ['Cosmos', 'IBC', 'Bridge'],
    ];

    for (let i = 0; i < tagSets.length; i++) {
      const projectData = createValidProjectData();
      projectData.name = `Performance Test Project ${i}`;
      projectData.tags = tagSets[i];
      const project = await caller.createProject(projectData);
      createdProjectIds.push(project.id);

      // Publish half of the projects
      if (i % 2 === 0) {
        await db
          .update(projects)
          .set({ isPublished: true })
          .where(eq(projects.id, project.id));

        await db.insert(projectSnaps).values({
          projectId: project.id,
          name: projectData.name,
          categories: projectData.categories,
          items: [
            { key: 'name', value: projectData.name },
            { key: 'tagline', value: projectData.tagline },
          ],
        });
      }
    }
  });

  describe('Search response time', () => {
    it('should complete tag search within 200ms', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectRouter.createCaller(ctx);

      const startTime = performance.now();

      await caller.searchProjects({
        query: 'Ethereum',
        limit: 20,
      });

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Search should complete within 200ms
      expect(responseTime).toBeLessThan(200);
      console.log(`Tag search response time: ${responseTime.toFixed(2)}ms`);
    });

    it('should complete partial tag match within 200ms', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectRouter.createCaller(ctx);

      const startTime = performance.now();

      await caller.searchProjects({
        query: 'Lay',
        limit: 20,
      });

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(200);
      console.log(
        `Partial tag search response time: ${responseTime.toFixed(2)}ms`,
      );
    });

    it('should handle mixed name and tag search efficiently', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectRouter.createCaller(ctx);

      const startTime = performance.now();

      await caller.searchProjects({
        query: 'DeFi',
        limit: 20,
      });

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(200);
      console.log(`Mixed search response time: ${responseTime.toFixed(2)}ms`);
    });

    it('should handle non-matching search efficiently', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectRouter.createCaller(ctx);

      const startTime = performance.now();

      await caller.searchProjects({
        query: 'NonExistentTag999',
        limit: 20,
      });

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(200);
      console.log(
        `Non-matching search response time: ${responseTime.toFixed(2)}ms`,
      );
    });
  });

  describe('Concurrent search performance', () => {
    it('should handle concurrent searches efficiently', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectRouter.createCaller(ctx);

      const startTime = performance.now();

      // Execute 5 concurrent searches
      const searches = await Promise.all([
        caller.searchProjects({ query: 'Ethereum', limit: 20 }),
        caller.searchProjects({ query: 'DeFi', limit: 20 }),
        caller.searchProjects({ query: 'Layer2', limit: 20 }),
        caller.searchProjects({ query: 'Bridge', limit: 20 }),
        caller.searchProjects({ query: 'NFT', limit: 20 }),
      ]);

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // All concurrent searches should complete within 500ms
      expect(totalTime).toBeLessThan(500);
      console.log(
        `5 concurrent searches completed in: ${totalTime.toFixed(2)}ms`,
      );

      // Verify all searches returned results
      searches.forEach((result) => {
        expect(result).toHaveProperty('published');
        expect(result).toHaveProperty('unpublished');
      });
    });
  });

  describe('Pagination performance', () => {
    it('should maintain performance with pagination', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectRouter.createCaller(ctx);

      // First page
      const startTime1 = performance.now();
      const page1 = await caller.searchProjects({
        query: 'DeFi',
        limit: 2,
      });
      const endTime1 = performance.now();
      const time1 = endTime1 - startTime1;

      expect(time1).toBeLessThan(200);
      console.log(`First page response time: ${time1.toFixed(2)}ms`);

      // Second page with cursor
      if (page1.unpublished.nextCursor) {
        const startTime2 = performance.now();
        const page2 = await caller.searchProjects({
          query: 'DeFi',
          limit: 2,
          unpublishedCursor: page1.unpublished.nextCursor,
        });
        const endTime2 = performance.now();
        const time2 = endTime2 - startTime2;

        expect(time2).toBeLessThan(200);
        console.log(`Second page response time: ${time2.toFixed(2)}ms`);

        // Second page should be as fast or faster than first page
        expect(time2).toBeLessThan(time1 * 1.2); // Allow 20% variance
      }
    });
  });

  describe('Query complexity performance comparison', () => {
    it('should not have significant performance degradation with tag search', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectRouter.createCaller(ctx);

      // Baseline: Name-only search
      const nameStartTime = performance.now();
      await caller.searchProjects({
        query: 'Performance Test',
        limit: 20,
      });
      const nameEndTime = performance.now();
      const nameSearchTime = nameEndTime - nameStartTime;

      // Tag search
      const tagStartTime = performance.now();
      await caller.searchProjects({
        query: 'Ethereum',
        limit: 20,
      });
      const tagEndTime = performance.now();
      const tagSearchTime = tagEndTime - tagStartTime;

      console.log(`Name search time: ${nameSearchTime.toFixed(2)}ms`);
      console.log(`Tag search time: ${tagSearchTime.toFixed(2)}ms`);
      console.log(
        `Performance ratio: ${(tagSearchTime / nameSearchTime).toFixed(2)}x`,
      );

      // Tag search should not be more than 1.2x slower than name search
      expect(tagSearchTime).toBeLessThan(nameSearchTime * 1.2);
    });
  });
});
