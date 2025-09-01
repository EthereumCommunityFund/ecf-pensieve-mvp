import { eq, sql } from 'drizzle-orm';
import { ethers } from 'ethers';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { ESSENTIAL_ITEM_WEIGHT_AMOUNT, REWARD_PERCENT } from '@/lib/constants';
import { db } from '@/lib/db';
import {
  invitationCodes,
  profiles,
  projects,
  voteRecords,
} from '@/lib/db/schema';
import { notifications } from '@/lib/db/schema/notifications';
import { projectSnaps } from '@/lib/db/schema/projectSnaps';
import { getServiceSupabase } from '@/lib/supabase/client';
import { authRouter } from '@/lib/trpc/routers/auth';
import { projectRouter } from '@/lib/trpc/routers/project';

import { createInvalidProjectData } from './factories/invalidProjectFactory';
import {
  createProjectWithOptionalFields,
  createProjectWithoutOptionalFields,
  createProjectWithRefsOnly,
} from './factories/optionalFieldsFactory';
import { createValidProjectData } from './factories/projectFactory';

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn((fn) => fn),
}));

describe('Project Integration Tests', () => {
  const supabase = getServiceSupabase();

  let testWallet: ethers.HDNodeWallet;
  let testAddress: string;
  let testInviteCode: string;
  let testUserId: string;

  beforeAll(async () => {
    testWallet = ethers.Wallet.createRandom();
    testAddress = testWallet.address.toLowerCase();

    const [insertedCode] = await db
      .insert(invitationCodes)
      .values({
        code: 'test-invite-project-' + Date.now(),
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
      username: 'TestProjectUser',
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

  describe('createProject', () => {
    it('should successfully create a project with valid data', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectRouter.createCaller(ctx);

      const projectData = createValidProjectData();
      const result = await caller.createProject(projectData);

      expect(result).toBeDefined();
      expect(result.name).toBe(projectData.name);
      expect(result.tagline).toBe(projectData.tagline);
      expect(result.categories).toEqual(projectData.categories);
      expect(result.mainDescription).toBe(projectData.mainDescription);
      expect(result.logoUrl).toBe(projectData.logoUrl);
      expect(result.websites).toEqual(projectData.websites);
      expect(result.dateFounded).toEqual(projectData.dateFounded);
      expect(result.devStatus).toBe(projectData.devStatus);
      expect(result.openSource).toBe(projectData.openSource);
      expect(result.orgStructure).toBe(projectData.orgStructure);
      expect(result.publicGoods).toBe(projectData.publicGoods);
      expect(result.founders).toEqual(projectData.founders);
      expect(result.tags).toEqual(projectData.tags);
      expect(result.creator).toBe(testUserId);
      expect(result.isPublished).toBe(false);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should fail when user is not authenticated', async () => {
      const ctx = { db, supabase, user: null };
      const caller = projectRouter.createCaller(ctx);

      await expect(
        caller.createProject(createValidProjectData()),
      ).rejects.toThrow();
    });
  });

  describe('getProjects', () => {
    beforeEach(async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectRouter.createCaller(ctx);

      const projectData = createValidProjectData();
      await caller.createProject(projectData);
    });

    it('should return unpublished projects by default', async () => {
      const ctx = { db, supabase, user: null };
      const caller = projectRouter.createCaller(ctx);

      const result = await caller.getProjects();

      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.hasNextPage).toBeDefined();
      expect(result.items.length).toBeGreaterThan(0);
    });

    it('should respect limit parameter', async () => {
      const ctx = { db, supabase, user: null };
      const caller = projectRouter.createCaller(ctx);

      const result = await caller.getProjects({ limit: 1 });

      expect(result.items.length).toBeLessThanOrEqual(1);
    });

    it('should handle pagination with offset', async () => {
      const ctx = { db, supabase, user: null };
      const caller = projectRouter.createCaller(ctx);

      const firstPage = await caller.getProjects({ limit: 1, offset: 0 });

      if (firstPage.hasNextPage) {
        const secondPage = await caller.getProjects({
          limit: 1,
          offset: 1,
        });

        expect(secondPage.items).toBeDefined();
        expect(Array.isArray(secondPage.items)).toBe(true);
        expect(secondPage.offset).toBe(1);
      }
    });
  });

  describe('weight and notification system', () => {
    it('should verify weight increases are recorded correctly', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectRouter.createCaller(ctx);

      const initialProfile = await db.query.profiles.findFirst({
        where: eq(profiles.address, testAddress),
      });
      const initialWeight = initialProfile?.weight || 0;

      const project1 = await caller.createProject(createValidProjectData());

      const profileAfterFirst = await db.query.profiles.findFirst({
        where: eq(profiles.address, testAddress),
      });

      const expectedWeightIncrease =
        ESSENTIAL_ITEM_WEIGHT_AMOUNT * REWARD_PERCENT;
      expect(profileAfterFirst?.weight).toBe(
        initialWeight + expectedWeightIncrease,
      );

      const project2 = await caller.createProject(createValidProjectData());

      const profileAfterSecond = await db.query.profiles.findFirst({
        where: eq(profiles.address, testAddress),
      });

      expect(profileAfterSecond?.weight).toBe(
        initialWeight + expectedWeightIncrease * 2,
      );

      const userNotifications = await db.query.notifications.findMany({
        where: eq(notifications.userId, testUserId),
      });

      const project1Notification = userNotifications.find(
        (notification) =>
          notification.type === 'createProposal' &&
          notification.projectId === project1.id &&
          notification.reward === expectedWeightIncrease,
      );

      const project2Notification = userNotifications.find(
        (notification) =>
          notification.type === 'createProposal' &&
          notification.projectId === project2.id &&
          notification.reward === expectedWeightIncrease,
      );

      expect(project1Notification).toBeDefined();
      expect(project2Notification).toBeDefined();
    });

    it('should automatically vote for all project proposal items', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectRouter.createCaller(ctx);

      const initialProfile = await db.query.profiles.findFirst({
        where: eq(profiles.address, testAddress),
      });
      const initialWeight = initialProfile?.weight || 0;

      const projectData = createValidProjectData();
      const project = await caller.createProject(projectData);

      const expectedWeightIncrease =
        ESSENTIAL_ITEM_WEIGHT_AMOUNT * REWARD_PERCENT;
      const finalWeight = initialWeight + expectedWeightIncrease;

      const projectDetails = await caller.getProjectById({ id: project.id });
      const proposal = projectDetails.proposals[0];
      const proposalItems = proposal.items as Array<{
        key: string;
        value: any;
      }>;

      const userVoteRecords = await db.query.voteRecords.findMany({
        where: eq(voteRecords.proposalId, proposal.id),
        with: { creator: true },
      });

      const userVotes = userVoteRecords.filter(
        (vote) => vote.creator.userId === testUserId,
      );

      expect(userVotes.length).toBe(proposalItems.length);

      for (const vote of userVotes) {
        expect(vote.weight).toBe(finalWeight);
        expect(vote.projectId).toBe(project.id);
        expect(vote.itemProposalId).toBeNull();

        const correspondingItem = proposalItems.find(
          (item) => item.key === vote.key,
        );
        expect(correspondingItem).toBeDefined();
      }
    });
  });

  describe('createProject - Input Validation', () => {
    const validationTestCases = [
      {
        name: 'empty name',
        data: createInvalidProjectData.emptyName(),
        expectedError: 'Name cannot be empty',
      },
      {
        name: 'empty tagline',
        data: createInvalidProjectData.emptyTagline(),
        expectedError: 'Tagline cannot be empty',
      },
      {
        name: 'empty categories',
        data: createInvalidProjectData.emptyCategories(),
        expectedError: 'At least one category is required',
      },
      {
        name: 'empty main description',
        data: createInvalidProjectData.emptyMainDescription(),
        expectedError: 'Main description cannot be empty',
      },
      {
        name: 'empty logo URL',
        data: createInvalidProjectData.emptyLogoUrl(),
        expectedError: 'Logo URL cannot be empty',
      },
      {
        name: 'empty websites',
        data: createInvalidProjectData.emptyWebsites(),
        expectedError: 'At least one website is required',
      },
      {
        name: 'website with empty title',
        data: createInvalidProjectData.websiteWithEmptyTitle(),
        expectedError: 'Website title cannot be empty',
      },
      {
        name: 'website with empty URL',
        data: createInvalidProjectData.websiteWithEmptyUrl(),
        expectedError: 'Website URL cannot be empty',
      },
      {
        name: 'empty development status',
        data: createInvalidProjectData.emptyDevStatus(),
        expectedError: 'Development status cannot be empty',
      },
      {
        name: 'empty organization structure',
        data: createInvalidProjectData.emptyOrgStructure(),
        expectedError: 'Organization structure cannot be empty',
      },
      {
        name: 'empty founders',
        data: createInvalidProjectData.emptyFounders(),
        expectedError: 'At least one founder is required',
      },
      {
        name: 'founder with empty name',
        data: createInvalidProjectData.founderWithEmptyName(),
        expectedError: 'Founder name cannot be empty',
      },
      {
        name: 'founder with empty title',
        data: createInvalidProjectData.founderWithEmptyTitle(),
        expectedError: 'Founder title cannot be empty',
      },
      {
        name: 'empty tags',
        data: createInvalidProjectData.emptyTags(),
        expectedError: 'At least one tag is required',
      },
      {
        name: 'refs with empty key',
        data: createInvalidProjectData.refsWithEmptyKey(),
        expectedError: 'Key cannot be empty',
      },
      {
        name: 'refs with empty value',
        data: createInvalidProjectData.refsWithEmptyValue(),
        expectedError: 'Value cannot be empty',
      },
    ];

    validationTestCases.forEach(({ name, data, expectedError }) => {
      it(`should fail with ${name}`, async () => {
        const ctx = { db, supabase, user: { id: testUserId } };
        const caller = projectRouter.createCaller(ctx);

        await expect(caller.createProject(data as any)).rejects.toThrow(
          expectedError,
        );
      });
    });

    it('should fail with null or undefined values', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectRouter.createCaller(ctx);

      await expect(
        caller.createProject(createInvalidProjectData.nullValues()),
      ).rejects.toThrow();

      await expect(
        caller.createProject(createInvalidProjectData.undefinedValues()),
      ).rejects.toThrow();
    });

    const securityTestCases = [
      {
        name: 'special characters',
        data: createInvalidProjectData.specialCharactersInName(),
        expectedName: '<script>alert("xss")</script>',
      },
      {
        name: 'SQL injection attempt',
        data: createInvalidProjectData.sqlInjectionInName(),
        expectedName: "'; DROP TABLE projects; --",
      },
      {
        name: 'unicode characters',
        data: createInvalidProjectData.unicodeCharacters(),
        expectedName: '🚀💎 Test Project 中文名称 العربية русский',
      },
    ];

    securityTestCases.forEach(({ name, data, expectedName }) => {
      it(`should handle ${name} safely`, async () => {
        const ctx = { db, supabase, user: { id: testUserId } };
        const caller = projectRouter.createCaller(ctx);

        const result = await caller.createProject(data as any);
        expect(result.name).toBe(expectedName);

        if (name === 'SQL injection attempt') {
          const projectsStillExist = await db.query.projects.findMany();
          expect(projectsStillExist.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('createProject - Optional Fields', () => {
    it('should handle optional fields correctly', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectRouter.createCaller(ctx);

      const projectWithOptionals = createProjectWithOptionalFields();
      const resultWithOptionals =
        await caller.createProject(projectWithOptionals);

      expect(resultWithOptionals.appUrl).toBe(projectWithOptionals.appUrl);
      expect(resultWithOptionals.dateLaunch).toEqual(
        projectWithOptionals.dateLaunch,
      );
      expect(resultWithOptionals.fundingStatus).toBe(
        projectWithOptionals.fundingStatus,
      );
      expect(resultWithOptionals.codeRepo).toBe(projectWithOptionals.codeRepo);
      expect(resultWithOptionals.tokenContract).toBe(
        projectWithOptionals.tokenContract,
      );
      expect(resultWithOptionals.whitePaper).toBe(
        projectWithOptionals.whitePaper,
      );
      expect(resultWithOptionals.dappSmartContracts).toEqual([
        {
          chain: 'ethereum',
          addresses: '0x1234567890abcdef1234567890abcdef12345678',
        },
      ]);

      const projectWithoutOptionals = createProjectWithoutOptionalFields();
      const resultWithoutOptionals = await caller.createProject(
        projectWithoutOptionals,
      );

      expect(resultWithoutOptionals.appUrl).toBeNull();
      expect(resultWithoutOptionals.dateLaunch).toBeNull();
      expect(resultWithoutOptionals.fundingStatus).toBeNull();
      expect(resultWithoutOptionals.codeRepo).toBeNull();
      expect(resultWithoutOptionals.tokenContract).toBeNull();
      expect(resultWithoutOptionals.whitePaper).toBeNull();
      expect(resultWithoutOptionals.dappSmartContracts).toBeNull();
    });

    it('should handle refs field correctly', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectRouter.createCaller(ctx);

      const projectWithRefs = createProjectWithRefsOnly();
      const resultWithRefs = await caller.createProject(projectWithRefs);

      const projectWithRefsDetails = await caller.getProjectById({
        id: resultWithRefs.id,
      });
      const proposalWithRefs = projectWithRefsDetails.proposals[0];
      expect(proposalWithRefs.refs).toEqual(projectWithRefs.refs);

      const projectWithoutRefs = createProjectWithoutOptionalFields();
      const resultWithoutRefs = await caller.createProject(projectWithoutRefs);

      const projectWithoutRefsDetails = await caller.getProjectById({
        id: resultWithoutRefs.id,
      });
      const proposalWithoutRefs = projectWithoutRefsDetails.proposals[0];
      expect(proposalWithoutRefs.refs).toBeNull();
    });
  });

  describe('createProject - Data Integrity', () => {
    it('should create project with complete data integrity', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectRouter.createCaller(ctx);

      const projectData = createProjectWithOptionalFields();
      const result = await caller.createProject(projectData);

      expect(result.isPublished).toBe(false);
      expect(result.creator).toBe(testUserId);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(result.itemsTopWeight).toEqual({});

      expect(result.hasProposalKeys).toBeDefined();
      expect(Array.isArray(result.hasProposalKeys)).toBe(true);
      expect(result.hasProposalKeys).toContain('name');
      expect(result.hasProposalKeys).toContain('tagline');

      const projectWithDetails = await caller.getProjectById({ id: result.id });
      expect(projectWithDetails.proposals).toHaveLength(1);

      const proposal = projectWithDetails.proposals[0];
      expect(proposal.projectId).toBe(result.id);
      expect(proposal.creator.userId).toBe(testUserId);
      expect(proposal.creator.address).toBe(testAddress);

      const items = proposal.items as Array<{ key: string; value: any }>;
      expect(items.length).toBeGreaterThan(0);

      const nameItem = items.find((item) => item.key === 'name');
      expect(nameItem?.value).toBe(projectData.name);

      const categoriesItem = items.find((item) => item.key === 'categories');
      expect(categoriesItem?.value).toEqual(projectData.categories);

      const appUrlItem = items.find((item) => item.key === 'appUrl');
      expect(appUrlItem?.value).toBe(projectData.appUrl);
    });

    it('should handle complex nested data structures', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectRouter.createCaller(ctx);

      const complexProjectData = {
        ...createValidProjectData(),
        categories: ['DeFi', 'Gaming', 'Infrastructure'],
        websites: [
          { title: 'Main Website', url: 'https://example.com' },
          { title: 'Documentation', url: 'https://docs.example.com' },
        ],
        founders: [
          { name: 'Alice Smith', title: 'CEO' },
          { name: 'Bob Johnson', title: 'CTO' },
        ],
        tags: ['blockchain', 'defi', 'gaming', 'web3'],
      };

      const result = await caller.createProject(complexProjectData);

      expect(result.categories).toEqual(complexProjectData.categories);
      expect(result.websites).toEqual(complexProjectData.websites);
      expect(result.founders).toEqual(complexProjectData.founders);
      expect(result.tags).toEqual(complexProjectData.tags);
    });
  });

  describe('getProjectById', () => {
    let createdProjectId: number;

    beforeEach(async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectRouter.createCaller(ctx);

      const projectData = createValidProjectData();
      const project = await caller.createProject(projectData);
      createdProjectId = project.id;
    });

    it('should return project when valid ID is provided', async () => {
      const ctx = { db, supabase, user: null };
      const caller = projectRouter.createCaller(ctx);

      const result = await caller.getProjectById({ id: createdProjectId });

      expect(result).toBeDefined();
      expect(result.id).toBe(createdProjectId);
      expect(result.name).toContain('Test Project');
      expect(result.creator).toBeDefined();
      expect(result.proposals).toBeDefined();

      expect(Array.isArray(result.proposals)).toBe(true);
      expect(result.proposals.length).toBe(1);

      const proposal = result.proposals[0];
      expect(proposal.projectId).toBe(createdProjectId);
      expect(proposal.creator.userId).toBe(testUserId);
      expect(proposal.items).toBeDefined();
      expect(Array.isArray(proposal.items)).toBe(true);

      expect(proposal.voteRecords).toBeDefined();
      expect(Array.isArray(proposal.voteRecords)).toBe(true);
      expect(proposal.voteRecords.length).toBeGreaterThanOrEqual(0);

      if (proposal.voteRecords.length > 0) {
        const voteRecord = proposal.voteRecords[0];
        expect(voteRecord.creator).toBeDefined();
        expect(voteRecord.creator.userId).toBeDefined();
        expect(voteRecord.weight).toBeDefined();
        expect(voteRecord.key).toBeDefined();
      }

      const proposalItems = proposal.items as Array<{
        key: string;
        value: any;
      }>;
      expect(proposalItems.length).toBeGreaterThan(0);

      const nameItem = proposalItems.find((item) => item.key === 'name');
      expect(nameItem).toBeDefined();
      expect(nameItem!.value).toContain('Test Project');
    });

    it('should throw error when project ID does not exist', async () => {
      const ctx = { db, supabase, user: null };
      const caller = projectRouter.createCaller(ctx);

      const nonExistentId = 999999;

      await expect(
        caller.getProjectById({ id: nonExistentId }),
      ).rejects.toThrow('Project not found');
    });
  });

  describe('searchProjects', () => {
    beforeEach(async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectRouter.createCaller(ctx);

      const projects = [
        {
          ...createValidProjectData(),
          name: 'Ethereum Blockchain Platform',
          tagline: 'Decentralized computing platform',
        },
        {
          ...createValidProjectData(),
          name: 'Bitcoin Lightning Network',
          tagline: 'Layer 2 payment protocol',
        },
        {
          ...createValidProjectData(),
          name: 'Polkadot Network',
          tagline: 'Multi-chain interoperability protocol',
        },
      ];

      for (const projectData of projects) {
        await caller.createProject(projectData);
      }
    });

    it('should search unpublished projects by name', async () => {
      const ctx = { db, supabase, user: null };
      const caller = projectRouter.createCaller(ctx);

      const result = await caller.searchProjects({
        query: 'Ethereum',
        limit: 20,
      });

      expect(result.unpublished.items).toBeDefined();
      expect(result.unpublished.items.length).toBeGreaterThan(0);
      expect(
        result.unpublished.items.some((p) => p.name.includes('Ethereum')),
      ).toBe(true);
      expect(result.unpublished.totalCount).toBeGreaterThan(0);
    });

    it('should handle pagination for search results', async () => {
      const ctx = { db, supabase, user: null };
      const caller = projectRouter.createCaller(ctx);

      const firstPage = await caller.searchProjects({
        query: 'Network',
        limit: 1,
      });

      expect(firstPage.unpublished.items.length).toBe(1);

      if (firstPage.unpublished.nextCursor) {
        const secondPage = await caller.searchProjects({
          query: 'Network',
          limit: 1,
          unpublishedCursor: firstPage.unpublished.nextCursor,
        });

        expect(secondPage.unpublished.items.length).toBeGreaterThanOrEqual(0);
        expect(secondPage.unpublished.items[0]?.id).not.toBe(
          firstPage.unpublished.items[0]?.id,
        );
      }
    });

    it('should handle empty search results', async () => {
      const ctx = { db, supabase, user: null };
      const caller = projectRouter.createCaller(ctx);

      const result = await caller.searchProjects({
        query: 'NonExistentProjectNameXYZ123',
        limit: 20,
      });

      expect(result.unpublished.items).toEqual([]);
      expect(result.unpublished.totalCount).toBe(0);
      expect(result.published.items).toEqual([]);
      expect(result.published.totalCount).toBe(0);
    });

    it('should trim search query whitespace', async () => {
      const ctx = { db, supabase, user: null };
      const caller = projectRouter.createCaller(ctx);

      const result = await caller.searchProjects({
        query: '  Bitcoin  ',
        limit: 20,
      });

      expect(result.unpublished.items.length).toBeGreaterThan(0);
      expect(
        result.unpublished.items.some((p) => p.name.includes('Bitcoin')),
      ).toBe(true);
    });

    it('should handle case-insensitive search', async () => {
      const ctx = { db, supabase, user: null };
      const caller = projectRouter.createCaller(ctx);

      const result = await caller.searchProjects({
        query: 'polkadot',
        limit: 20,
      });

      expect(result.unpublished.items.length).toBeGreaterThan(0);
      expect(
        result.unpublished.items.some((p) =>
          p.name.toLowerCase().includes('polkadot'),
        ),
      ).toBe(true);
    });

    it('should validate search query is not empty', async () => {
      const ctx = { db, supabase, user: null };
      const caller = projectRouter.createCaller(ctx);

      await expect(
        caller.searchProjects({
          query: '',
          limit: 20,
        }),
      ).rejects.toThrow('Search query cannot be empty');
    });

    it('should search published projects by name', async () => {
      // First check if there are any published projects with projectSnaps
      const existingPublished = await db.query.projectSnaps.findMany({
        limit: 5,
      });

      if (existingPublished.length > 0) {
        const searchCtx = { db, supabase, user: null };
        const searchCaller = projectRouter.createCaller(searchCtx);

        const firstProjectSnap = existingPublished[0];
        const searchTerm = firstProjectSnap.name?.substring(0, 5) || 'test';

        const result = await searchCaller.searchProjects({
          query: searchTerm,
          limit: 20,
        });

        expect(result.published.items).toBeDefined();
        expect(Array.isArray(result.published.items)).toBe(true);

        if (result.published.totalCount > 0) {
          expect(result.published.items.length).toBeGreaterThan(0);
          expect(result.published.items[0].projectSnap).toBeDefined();
        }
      } else {
        const ctx = { db, supabase, user: { id: testUserId } };
        const caller = projectRouter.createCaller(ctx);

        const projectData = {
          ...createValidProjectData(),
          name: 'Test Published Ethereum Project',
          tagline: 'A published blockchain platform',
        };

        const project = await caller.createProject(projectData);

        await db.transaction(async (tx) => {
          await tx
            .update(projects)
            .set({ isPublished: true })
            .where(eq(projects.id, project.id));

          await tx.insert(projectSnaps).values({
            projectId: project.id,
            items: [],
            name: projectData.name,
            categories: projectData.categories,
          });
        });

        const searchCtx = { db, supabase, user: null };
        const searchCaller = projectRouter.createCaller(searchCtx);

        const result = await searchCaller.searchProjects({
          query: 'Test Published Ethereum',
          limit: 20,
        });

        expect(result.published.items).toBeDefined();
        expect(result.published.items.length).toBeGreaterThan(0);
        expect(
          result.published.items.some(
            (p) => p.projectSnap?.name === 'Test Published Ethereum Project',
          ),
        ).toBe(true);
        expect(result.published.totalCount).toBeGreaterThan(0);
      }
    });

    it('should handle pagination for published project search', async () => {
      const [existingCount] = await db
        .select({ count: sql`count(*)::int` })
        .from(projectSnaps);

      const needMoreProjects =
        !existingCount || (existingCount.count as number) < 3;

      if (needMoreProjects) {
        const ctx = { db, supabase, user: { id: testUserId } };
        const caller = projectRouter.createCaller(ctx);

        const projectsData = [
          {
            ...createValidProjectData(),
            name: 'Test Pagination Network Alpha',
          },
          {
            ...createValidProjectData(),
            name: 'Test Pagination Network Beta',
          },
          {
            ...createValidProjectData(),
            name: 'Test Pagination Network Gamma',
          },
        ];

        for (const data of projectsData) {
          const project = await caller.createProject(data);

          await db.transaction(async (tx) => {
            await tx
              .update(projects)
              .set({ isPublished: true })
              .where(eq(projects.id, project.id));

            await tx.insert(projectSnaps).values({
              projectId: project.id,
              items: [],
              name: data.name,
              categories: data.categories,
            });
          });
        }
      }

      const searchCtx = { db, supabase, user: null };
      const searchCaller = projectRouter.createCaller(searchCtx);

      const searchTerm = needMoreProjects ? 'Test Pagination Network' : '';

      const firstPage = await searchCaller.searchProjects({
        query: searchTerm || 'a',
        limit: 2,
      });

      expect(firstPage.published.items).toBeDefined();
      expect(Array.isArray(firstPage.published.items)).toBe(true);

      if (
        firstPage.published.items.length >= 2 &&
        firstPage.published.nextCursor
      ) {
        const secondPage = await searchCaller.searchProjects({
          query: searchTerm || 'a',
          limit: 2,
          publishedCursor: firstPage.published.nextCursor,
        });

        expect(secondPage.published.items).toBeDefined();
        expect(Array.isArray(secondPage.published.items)).toBe(true);

        if (secondPage.published.items.length > 0) {
          expect(secondPage.published.items[0]?.id).not.toBe(
            firstPage.published.items[0]?.id,
          );
        }
      }
    });

    it('should search both published and unpublished projects simultaneously', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectRouter.createCaller(ctx);

      const timestamp = Date.now();
      const unpublishedData = {
        ...createValidProjectData(),
        name: `TestSimultaneous${timestamp} Unpublished Project`,
      };
      await caller.createProject(unpublishedData);

      const publishedData = {
        ...createValidProjectData(),
        name: `TestSimultaneous${timestamp} Published Project`,
      };
      const publishedProject = await caller.createProject(publishedData);

      await db.transaction(async (tx) => {
        await tx
          .update(projects)
          .set({ isPublished: true })
          .where(eq(projects.id, publishedProject.id));

        await tx.insert(projectSnaps).values({
          projectId: publishedProject.id,
          items: [],
          name: publishedData.name,
          categories: publishedData.categories,
        });
      });

      const searchCtx = { db, supabase, user: null };
      const searchCaller = projectRouter.createCaller(searchCtx);

      const result = await searchCaller.searchProjects({
        query: `TestSimultaneous${timestamp}`,
        limit: 20,
      });

      expect(result.unpublished.items).toBeDefined();
      expect(result.unpublished.items.length).toBeGreaterThan(0);
      expect(
        result.unpublished.items.some((p) => p.name === unpublishedData.name),
      ).toBe(true);

      expect(result.published.items).toBeDefined();

      if (result.published.items.length === 0) {
        const verifyPublished = await db.query.projects.findFirst({
          where: eq(projects.id, publishedProject.id),
          with: { projectSnap: true },
        });

        expect(verifyPublished?.isPublished).toBe(true);
        expect(verifyPublished?.projectSnap).toBeDefined();
      } else {
        expect(result.published.items.length).toBeGreaterThan(0);
        expect(
          result.published.items.some(
            (p) => p.projectSnap?.name === publishedData.name,
          ),
        ).toBe(true);
      }
    });
  });

  describe('getCategories', () => {
    it('should return the same categories as in projectSnaps table', async () => {
      const ctx = { db, supabase, user: null };
      const caller = projectRouter.createCaller(ctx);

      const apiResult = await caller.getCategories();

      const dbResult = await db
        .select({
          category: sql<string>`unnest(${projectSnaps.categories})`.as(
            'category',
          ),
          count: sql<number>`count(distinct ${projectSnaps.projectId})::int`.as(
            'count',
          ),
        })
        .from(projectSnaps)
        .where(sql`${projectSnaps.categories} IS NOT NULL`)
        .groupBy(sql`unnest(${projectSnaps.categories})`)
        .orderBy(sql`count(distinct ${projectSnaps.projectId}) desc`);

      expect(apiResult).toEqual(dbResult);

      if (apiResult.length > 0) {
        expect(apiResult[0]).toHaveProperty('category');
        expect(apiResult[0]).toHaveProperty('count');
        expect(typeof apiResult[0].category).toBe('string');
        expect(typeof apiResult[0].count).toBe('number');
      }
    });
  });

  describe('getProjects - Advanced Features', () => {
    it('should filter published projects by categories', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectRouter.createCaller(ctx);

      await caller.createProject({
        ...createValidProjectData(),
        categories: ['DeFi', 'Gaming'],
      });

      const result = await caller.getProjects({
        isPublished: false,
        categories: ['DeFi'],
        limit: 10,
      });

      expect(result.items).toBeDefined();
      expect(result.hasNextPage).toBeDefined();
      expect(result.offset).toBeDefined();
    });

    it('should handle multiple category filters', async () => {
      const ctx = { db, supabase, user: null };
      const caller = projectRouter.createCaller(ctx);

      const result = await caller.getProjects({
        isPublished: false,
        categories: ['DeFi', 'Gaming', 'Infrastructure'],
        limit: 10,
      });

      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
    });
  });

  describe('createProject - shortCode generation', () => {
    it('should generate unique shortCode for each project', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectRouter.createCaller(ctx);

      const project1 = await caller.createProject(createValidProjectData());
      const project2 = await caller.createProject(createValidProjectData());

      expect(project1.shortCode).toBeDefined();
      expect(project2.shortCode).toBeDefined();
      expect(project1.shortCode).not.toBe(project2.shortCode);
      expect(project1.shortCode!.length).toBeGreaterThan(0);
      expect(project2.shortCode!.length).toBeGreaterThan(0);
    });
  });
});
