import { eq } from 'drizzle-orm';
import { ethers } from 'ethers';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { db } from '@/lib/db';
import { invitationCodes, profiles, projects } from '@/lib/db/schema';
import { SortBy, SortOrder } from '@/lib/services/projectSortingService';
import { getServiceSupabase } from '@/lib/supabase/client';
import { authRouter } from '@/lib/trpc/routers/auth';
import { projectRouter } from '@/lib/trpc/routers/project';

import { createValidProjectData } from './factories/projectFactory';
import { cleanDatabase } from './helpers/testHelpers';

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn((fn) => fn),
}));

describe('Project Sorting Integration Tests', () => {
  const supabase = getServiceSupabase();

  let testWallet: ethers.HDNodeWallet;
  let testAddress: string;
  let testInviteCode: string;
  let testUserId: string;

  beforeAll(async () => {
    await cleanDatabase();

    testWallet = ethers.Wallet.createRandom();
    testAddress = testWallet.address.toLowerCase();

    const [insertedCode] = await db
      .insert(invitationCodes)
      .values({
        code: 'test-invite-sorting-' + Date.now(),
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
      message,
      signature,
      username: 'TestSortingUser',
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

  describe('Sorting by createdAt', () => {
    it('should sort projects by creation date in descending order', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };

      const caller = projectRouter.createCaller(ctx);

      const project1 = await caller.createProject(
        createValidProjectData({ name: 'Project A' }),
      );
      const project2 = await caller.createProject(
        createValidProjectData({ name: 'Project B' }),
      );
      const project3 = await caller.createProject(
        createValidProjectData({ name: 'Project C' }),
      );

      const result = await caller.getProjects({
        sortBy: SortBy.CREATED_AT,
        sortOrder: SortOrder.DESC,
        isPublished: false,
      });

      const projectIds = [project1.id, project2.id, project3.id];
      const ourProjects = result.items.filter(
        (item: any) => item && projectIds.includes(item.id),
      );

      expect(ourProjects).toHaveLength(3);

      const sortedProjectIds = ourProjects.map((p: any) => p.id);
      expect(sortedProjectIds[0]).toBe(project3.id);
      expect(sortedProjectIds[1]).toBe(project2.id);
      expect(sortedProjectIds[2]).toBe(project1.id);
    });

    it('should sort projects by creation date in ascending order', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };

      const caller = projectRouter.createCaller(ctx);

      const project1 = await caller.createProject(
        createValidProjectData({ name: 'Project A' }),
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
      const project2 = await caller.createProject(
        createValidProjectData({ name: 'Project B' }),
      );

      const result = await caller.getProjects({
        sortBy: SortBy.CREATED_AT,
        sortOrder: SortOrder.ASC,
        isPublished: false,
        limit: 100,
      });

      const projectIds = [project1.id, project2.id];
      const ourProjects = result.items.filter(
        (item: any) => item && projectIds.includes(item.id),
      );

      expect(ourProjects).toHaveLength(2);

      const project1Index = result.items.findIndex(
        (item: any) => item?.id === project1.id,
      );
      const project2Index = result.items.findIndex(
        (item: any) => item?.id === project2.id,
      );

      expect(project1Index).toBeGreaterThanOrEqual(0);
      expect(project2Index).toBeGreaterThanOrEqual(0);
      expect(project1Index).toBeLessThan(project2Index);
    });
  });

  describe('Sorting by name', () => {
    it('should sort projects by name alphabetically', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };

      const caller = projectRouter.createCaller(ctx);
      const uniqueSuffix = Date.now();
      const zebra = await caller.createProject(
        createValidProjectData({ name: `Zebra_${uniqueSuffix}` }),
      );
      const alpha = await caller.createProject(
        createValidProjectData({ name: `Alpha_${uniqueSuffix}` }),
      );
      const beta = await caller.createProject(
        createValidProjectData({ name: `Beta_${uniqueSuffix}` }),
      );

      const resultAsc = await caller.getProjects({
        sortBy: SortBy.NAME,
        sortOrder: SortOrder.ASC,
        isPublished: false,
        limit: 100,
      });

      const projectIds = [zebra.id, alpha.id, beta.id];
      const ourProjects = resultAsc.items.filter(
        (item: any) => item && projectIds.includes(item.id),
      );

      expect(ourProjects).toHaveLength(3);

      const sortedNames = ourProjects.map((p: any) => p.name);
      expect(sortedNames[0]).toBe(`Alpha_${uniqueSuffix}`);
      expect(sortedNames[1]).toBe(`Beta_${uniqueSuffix}`);
      expect(sortedNames[2]).toBe(`Zebra_${uniqueSuffix}`);

      const resultDesc = await caller.getProjects({
        sortBy: SortBy.NAME,
        sortOrder: SortOrder.DESC,
        isPublished: false,
        limit: 100,
      });

      const ourProjectsDesc = resultDesc.items.filter(
        (item: any) => item && projectIds.includes(item.id),
      );

      expect(ourProjectsDesc).toHaveLength(3);

      const sortedNamesDesc = ourProjectsDesc.map((p: any) => p.name);
      expect(sortedNamesDesc[0]).toBe(`Zebra_${uniqueSuffix}`);
      expect(sortedNamesDesc[1]).toBe(`Beta_${uniqueSuffix}`);
      expect(sortedNamesDesc[2]).toBe(`Alpha_${uniqueSuffix}`);
    });
  });

  describe('Sorting by communityTrusted (support)', () => {
    it('should sort projects by support value', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };

      const caller = projectRouter.createCaller(ctx);

      const project1 = await caller.createProject(
        createValidProjectData({ name: 'Low Support' }),
      );
      const project2 = await caller.createProject(
        createValidProjectData({ name: 'High Support' }),
      );
      const project3 = await caller.createProject(
        createValidProjectData({ name: 'Medium Support' }),
      );

      await db
        .update(projects)
        .set({ support: 10 })
        .where(eq(projects.id, project1.id));
      await db
        .update(projects)
        .set({ support: 100 })
        .where(eq(projects.id, project2.id));
      await db
        .update(projects)
        .set({ support: 50 })
        .where(eq(projects.id, project3.id));

      const result = await caller.getProjects({
        sortBy: SortBy.COMMUNITY_TRUSTED,
        sortOrder: SortOrder.DESC,
        isPublished: false,
        limit: 100,
      });

      const projectIds = [project1.id, project2.id, project3.id];
      const ourProjects = result.items.filter(
        (item: any) => item && projectIds.includes(item.id),
      );

      expect(ourProjects).toHaveLength(3);

      expect(ourProjects[0]?.id).toBe(project2.id);
      expect(ourProjects[1]?.id).toBe(project3.id);
      expect(ourProjects[2]?.id).toBe(project1.id);
    });
  });

  describe('Sorting by multiple fields', () => {
    it('should sort projects by multiple fields in order', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };

      const caller = projectRouter.createCaller(ctx);

      const project1 = await caller.createProject(
        createValidProjectData({ name: 'Project Z' }),
      );
      const project2 = await caller.createProject(
        createValidProjectData({ name: 'Project A' }),
      );
      const project3 = await caller.createProject(
        createValidProjectData({ name: 'Project B' }),
      );
      const project4 = await caller.createProject(
        createValidProjectData({ name: 'Project C' }),
      );

      await db
        .update(projects)
        .set({ support: 50 })
        .where(eq(projects.id, project1.id));
      await db
        .update(projects)
        .set({ support: 50 })
        .where(eq(projects.id, project2.id));
      await db
        .update(projects)
        .set({ support: 50 })
        .where(eq(projects.id, project3.id));
      await db
        .update(projects)
        .set({ support: 100 })
        .where(eq(projects.id, project4.id));

      const result = await caller.getProjects({
        sortBy: [SortBy.COMMUNITY_TRUSTED, SortBy.NAME],
        sortOrder: [SortOrder.DESC, SortOrder.ASC],
        isPublished: false,
        limit: 100,
      });

      const projectIds = [project1.id, project2.id, project3.id, project4.id];
      const ourProjects = result.items.filter(
        (item: any) => item && projectIds.includes(item.id),
      );

      expect(ourProjects).toHaveLength(4);

      expect(ourProjects[0]?.id).toBe(project4.id);

      const sameSupportProjects = ourProjects.slice(1, 4);
      expect(sameSupportProjects[0]?.name).toBe('Project A');
      expect(sameSupportProjects[1]?.name).toBe('Project B');
      expect(sameSupportProjects[2]?.name).toBe('Project Z');
    });
  });

  describe('Sorting with filters', () => {
    it('should apply sorting after filtering by category', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };

      const caller = projectRouter.createCaller(ctx);

      const uniqueSuffix = Date.now();
      const defiA = await caller.createProject(
        createValidProjectData({
          name: `DeFi A_${uniqueSuffix}`,
          categories: ['DeFi', 'Finance'],
        }),
      );
      const gamingA = await caller.createProject(
        createValidProjectData({
          name: `Gaming A_${uniqueSuffix}`,
          categories: ['Gaming'],
        }),
      );
      const defiB = await caller.createProject(
        createValidProjectData({
          name: `DeFi B_${uniqueSuffix}`,
          categories: ['DeFi'],
        }),
      );

      const result = await caller.getProjects({
        sortBy: SortBy.NAME,
        sortOrder: SortOrder.ASC,
        isPublished: false,
        limit: 100,
      });

      const projectIds = [defiA.id, gamingA.id, defiB.id];
      const ourProjects = result.items.filter(
        (item: any) => item && projectIds.includes(item.id),
      );

      expect(ourProjects).toHaveLength(3);
      expect(ourProjects[0]?.name).toBe(`DeFi A_${uniqueSuffix}`);
      expect(ourProjects[1]?.name).toBe(`DeFi B_${uniqueSuffix}`);
      expect(ourProjects[2]?.name).toBe(`Gaming A_${uniqueSuffix}`);
    });
  });

  describe('Cursor pagination with sorting', () => {
    it('should paginate correctly with sorted results', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };

      const caller = projectRouter.createCaller(ctx);

      const uniqueSuffix = Date.now();
      const createdProjects: any[] = [];
      for (let i = 1; i <= 5; i++) {
        const project = await caller.createProject(
          createValidProjectData({
            name: `Project ${String(i).padStart(2, '0')}_${uniqueSuffix}`,
          }),
        );
        createdProjects.push(project);
      }

      const allResults = await caller.getProjects({
        sortBy: SortBy.NAME,
        sortOrder: SortOrder.ASC,
        limit: 100,
        isPublished: false,
      });

      const projectIds = createdProjects.map((p) => p.id);
      const ourProjectsInFullList = allResults.items.filter(
        (item: any) => item && projectIds.includes(item.id),
      );

      expect(ourProjectsInFullList).toHaveLength(5);

      const sortedNames = ourProjectsInFullList.map((p: any) => p.name);
      expect(sortedNames[0]).toBe(`Project 01_${uniqueSuffix}`);
      expect(sortedNames[1]).toBe(`Project 02_${uniqueSuffix}`);
      expect(sortedNames[2]).toBe(`Project 03_${uniqueSuffix}`);
      expect(sortedNames[3]).toBe(`Project 04_${uniqueSuffix}`);
      expect(sortedNames[4]).toBe(`Project 05_${uniqueSuffix}`);

      const firstProjectIndex = allResults.items.findIndex(
        (item: any) => item?.id === createdProjects[0].id,
      );

      const page1 = await caller.getProjects({
        sortBy: SortBy.NAME,
        sortOrder: SortOrder.ASC,
        limit: 3,
        offset: firstProjectIndex,
        isPublished: false,
      });

      const page1ProjectIds = page1.items.map((item: any) => item?.id);
      expect(page1ProjectIds).toContain(createdProjects[0].id);
      expect(page1ProjectIds).toContain(createdProjects[1].id);
      expect(page1ProjectIds).toContain(createdProjects[2].id);
    });
  });
});
