import { eq } from 'drizzle-orm';
import { ethers } from 'ethers';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

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

describe('Project Search Integration Tests', () => {
  const supabase = getServiceSupabase();

  let testWallet: ethers.HDNodeWallet;
  let testAddress: string;
  let testInviteCode: string;
  let testUserId: string;
  let createdProjectIds: number[] = [];

  beforeAll(async () => {
    // Setup test user
    testWallet = ethers.Wallet.createRandom();
    testAddress = testWallet.address.toLowerCase();

    const [insertedCode] = await db
      .insert(invitationCodes)
      .values({
        code: 'test-invite-search-' + Date.now(),
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
      username: 'TestSearchUser',
      inviteCode: testInviteCode,
    });

    const profileData = await db.query.profiles.findFirst({
      where: eq(profiles.address, testAddress),
    });

    if (!profileData) {
      throw new Error('Profile not created successfully');
    }

    testUserId = profileData.userId;
  });

  beforeEach(async () => {
    // Clean up projects created in previous tests
    if (createdProjectIds.length > 0) {
      await db
        .delete(projectSnaps)
        .where(eq(projectSnaps.projectId, createdProjectIds[0]));
      await db.delete(projects).where(eq(projects.id, createdProjectIds[0]));
      createdProjectIds = [];
    }
  });

  describe('searchProjects with tag search', () => {
    it('should find unpublished projects by exact tag match', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectRouter.createCaller(ctx);

      // Create a project with specific tags
      const projectData = createValidProjectData();
      projectData.tags = ['Ethereum', 'DeFi', 'Layer2'];
      const createdProject = await caller.createProject(projectData);
      createdProjectIds.push(createdProject.id);

      // Search by exact tag
      const searchResult = await caller.searchProjects({
        query: 'Ethereum',
        limit: 20,
      });

      expect(searchResult.unpublished.items).toHaveLength(1);
      expect(searchResult.unpublished.items[0].id).toBe(createdProject.id);
      expect(searchResult.unpublished.items[0].tags).toContain('Ethereum');
    });

    it('should find unpublished projects by partial tag match (case insensitive)', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectRouter.createCaller(ctx);

      // Create a project with specific tags
      const projectData = createValidProjectData();
      projectData.tags = ['Optimism', 'Rollup', 'Scaling'];
      const createdProject = await caller.createProject(projectData);
      createdProjectIds.push(createdProject.id);

      // Search by partial tag (case insensitive)
      const searchResult = await caller.searchProjects({
        query: 'optim',
        limit: 20,
      });

      expect(searchResult.unpublished.items).toHaveLength(1);
      expect(searchResult.unpublished.items[0].id).toBe(createdProject.id);
      expect(searchResult.unpublished.items[0].tags).toContain('Optimism');
    });

    it('should find projects by name OR tag match', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectRouter.createCaller(ctx);

      // Create two projects
      const project1Data = createValidProjectData();
      project1Data.name = 'Ethereum Bridge';
      project1Data.tags = ['Bridge', 'Cross-chain'];
      const project1 = await caller.createProject(project1Data);
      createdProjectIds.push(project1.id);

      const project2Data = createValidProjectData();
      project2Data.name = 'DeFi Protocol';
      project2Data.tags = ['Ethereum', 'DeFi'];
      const project2 = await caller.createProject(project2Data);
      createdProjectIds.push(project2.id);

      // Search for 'Ethereum' should find both projects
      const searchResult = await caller.searchProjects({
        query: 'Ethereum',
        limit: 20,
      });

      expect(searchResult.unpublished.items).toHaveLength(2);
      const projectIds = searchResult.unpublished.items.map((p) => p.id);
      expect(projectIds).toContain(project1.id);
      expect(projectIds).toContain(project2.id);
    });

    it('should not return duplicate results when both name and tag match', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectRouter.createCaller(ctx);

      // Create a project where both name and tag contain the search term
      const projectData = createValidProjectData();
      projectData.name = 'Ethereum Explorer';
      projectData.tags = ['Ethereum', 'Explorer', 'Analytics'];
      const createdProject = await caller.createProject(projectData);
      createdProjectIds.push(createdProject.id);

      // Search for 'Ethereum'
      const searchResult = await caller.searchProjects({
        query: 'Ethereum',
        limit: 20,
      });

      // Should only return the project once
      expect(searchResult.unpublished.items).toHaveLength(1);
      expect(searchResult.unpublished.items[0].id).toBe(createdProject.id);
    });

    it('should handle empty search results gracefully', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectRouter.createCaller(ctx);

      // Search for something that doesn't exist
      const searchResult = await caller.searchProjects({
        query: 'NonExistentTag123456',
        limit: 20,
      });

      expect(searchResult.unpublished.items).toHaveLength(0);
      expect(searchResult.unpublished.totalCount).toBe(0);
      expect(searchResult.published.items).toHaveLength(0);
      expect(searchResult.published.totalCount).toBe(0);
    });

    it('should find published projects by tag search', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectRouter.createCaller(ctx);

      // Create and publish a project
      const projectData = createValidProjectData();
      projectData.tags = ['Bitcoin', 'Lightning', 'Payment'];
      const createdProject = await caller.createProject(projectData);
      createdProjectIds.push(createdProject.id);

      // Manually publish the project for testing
      await db
        .update(projects)
        .set({ isPublished: true })
        .where(eq(projects.id, createdProject.id));

      // Create project snap for published project
      await db.insert(projectSnaps).values({
        projectId: createdProject.id,
        name: projectData.name,
        categories: projectData.categories,
        items: [
          { key: 'name', value: projectData.name },
          { key: 'tagline', value: projectData.tagline },
        ],
      });

      // Search by tag
      const searchResult = await caller.searchProjects({
        query: 'Lightning',
        limit: 20,
      });

      expect(searchResult.published.items).toHaveLength(1);
      expect(searchResult.published.items[0].id).toBe(createdProject.id);
      expect(searchResult.published.items[0].tags).toContain('Lightning');
    });

    it('should respect pagination with tag search', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectRouter.createCaller(ctx);

      // Create multiple projects with the same tag
      const projectIds = [];
      for (let i = 0; i < 3; i++) {
        const projectData = createValidProjectData();
        projectData.name = `DeFi Project ${i}`;
        projectData.tags = ['DeFi', 'Finance', `Protocol${i}`];
        const project = await caller.createProject(projectData);
        projectIds.push(project.id);
        createdProjectIds.push(project.id);
      }

      // First page
      const firstPage = await caller.searchProjects({
        query: 'DeFi',
        limit: 2,
      });

      expect(firstPage.unpublished.items).toHaveLength(2);
      expect(firstPage.unpublished.nextCursor).toBeDefined();

      // Second page
      const secondPage = await caller.searchProjects({
        query: 'DeFi',
        limit: 2,
        unpublishedCursor: firstPage.unpublished.nextCursor,
      });

      expect(secondPage.unpublished.items).toHaveLength(1);
      expect(secondPage.unpublished.nextCursor).toBeUndefined();

      // Total count should be 3
      expect(firstPage.unpublished.totalCount).toBe(3);
    });

    it('should search with special characters in tags', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectRouter.createCaller(ctx);

      // Create a project with tags containing special characters
      const projectData = createValidProjectData();
      projectData.tags = ['Layer-2', 'Cross_Chain', 'Web3.0'];
      const createdProject = await caller.createProject(projectData);
      createdProjectIds.push(createdProject.id);

      // Search by tag with special characters
      const searchResult1 = await caller.searchProjects({
        query: 'Layer-2',
        limit: 20,
      });

      expect(searchResult1.unpublished.items).toHaveLength(1);
      expect(searchResult1.unpublished.items[0].id).toBe(createdProject.id);

      // Search by partial match with special characters
      const searchResult2 = await caller.searchProjects({
        query: 'Cross_',
        limit: 20,
      });

      expect(searchResult2.unpublished.items).toHaveLength(1);
      expect(searchResult2.unpublished.items[0].id).toBe(createdProject.id);
    });
  });

  describe('searchProjects backward compatibility', () => {
    it('should still find projects by name only', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectRouter.createCaller(ctx);

      // Create a project
      const projectData = createValidProjectData();
      projectData.name = 'Unique Project Name XYZ';
      projectData.tags = ['Random', 'Tags'];
      const createdProject = await caller.createProject(projectData);
      createdProjectIds.push(createdProject.id);

      // Search by name
      const searchResult = await caller.searchProjects({
        query: 'Unique Project',
        limit: 20,
      });

      expect(searchResult.unpublished.items).toHaveLength(1);
      expect(searchResult.unpublished.items[0].id).toBe(createdProject.id);
    });

    it('should maintain the same response structure', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectRouter.createCaller(ctx);

      const searchResult = await caller.searchProjects({
        query: 'test',
        limit: 20,
      });

      // Verify response structure
      expect(searchResult).toHaveProperty('published');
      expect(searchResult).toHaveProperty('unpublished');
      expect(searchResult.published).toHaveProperty('items');
      expect(searchResult.published).toHaveProperty('nextCursor');
      expect(searchResult.published).toHaveProperty('totalCount');
      expect(searchResult.unpublished).toHaveProperty('items');
      expect(searchResult.unpublished).toHaveProperty('nextCursor');
      expect(searchResult.unpublished).toHaveProperty('totalCount');
    });

    it('should include tags field in returned project data', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectRouter.createCaller(ctx);

      // Create a project
      const projectData = createValidProjectData();
      projectData.tags = ['TestTag1', 'TestTag2'];
      const createdProject = await caller.createProject(projectData);
      createdProjectIds.push(createdProject.id);

      // Search and verify tags are included
      const searchResult = await caller.searchProjects({
        query: projectData.name.substring(0, 5),
        limit: 20,
      });

      expect(searchResult.unpublished.items).toHaveLength(1);
      const returnedProject = searchResult.unpublished.items[0];
      expect(returnedProject).toHaveProperty('tags');
      expect(returnedProject.tags).toEqual(['TestTag1', 'TestTag2']);
    });
  });
});
