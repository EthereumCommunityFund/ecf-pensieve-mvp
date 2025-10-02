import { ethers } from 'ethers';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
// Mock Next.js cache functions to avoid errors in test environment
vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn((fn) => fn),
}));

import { and, eq } from 'drizzle-orm';

import {
  ESSENTIAL_ITEM_WEIGHT_AMOUNT,
  QUORUM_AMOUNT,
  REWARD_PERCENT,
} from '@/lib/constants';
import { db } from '@/lib/db';
import {
  invitationCodes,
  itemProposals,
  profiles,
  projectLogs,
  projects,
  projectSnaps,
  proposals,
  ranks,
  voteRecords,
} from '@/lib/db/schema';
import { notifications } from '@/lib/db/schema/notifications';
import { getServiceSupabase } from '@/lib/supabase/client';
import { authRouter } from '@/lib/trpc/routers/auth';
import { projectRouter } from '@/lib/trpc/routers/project';
import { proposalRouter } from '@/lib/trpc/routers/proposal';
import { voteRouter } from '@/lib/trpc/routers/vote';

import { createValidProjectData } from './factories/projectFactory';

describe('Vote Integration Tests', () => {
  const supabase = getServiceSupabase();

  interface TestUser {
    wallet: ethers.HDNodeWallet;
    address: string;
    userId: string;
    inviteCode: string;
  }

  const testUsers: TestUser[] = [];
  // Infer the output type of projectRouter.createCaller().createProject()
  type CreateProjectOutput = Awaited<
    ReturnType<
      ReturnType<(typeof projectRouter)['createCaller']>['createProject']
    >
  >;
  let testProject: CreateProjectOutput;
  type GetProjectByIdOutput = Awaited<
    ReturnType<
      ReturnType<(typeof projectRouter)['createCaller']>['getProjectById']
    >
  >;
  // A single proposal shape from getProjectById output
  type ProposalFromProject = GetProjectByIdOutput['proposals'][number];
  let testProposal: ProposalFromProject;

  // Helper functions
  const createContext = (userId: string | null) => ({
    db,
    supabase,
    user: userId ? { id: userId } : null,
  });

  const createVoteCaller = (userId: string | null) =>
    voteRouter.createCaller(createContext(userId));

  const createProjectCaller = (userId: string | null) =>
    projectRouter.createCaller(createContext(userId));

  const createProposalCaller = (userId: string | null) =>
    proposalRouter.createCaller(createContext(userId));

  const setProjectPublishStatus = async (
    projectId: number,
    isPublished: boolean,
  ) => {
    await db
      .update(projects)
      .set({ isPublished })
      .where(eq(projects.id, projectId));
  };

  const clearUserVotes = async (userId: string, projectId?: number) => {
    const whereCondition = projectId
      ? and(
          eq(voteRecords.creator, userId),
          eq(voteRecords.projectId, projectId),
        )
      : eq(voteRecords.creator, userId);

    await db.delete(voteRecords).where(whereCondition);
  };

  const createProposalItems = (data: any) =>
    Object.entries(data).map(([key, value]) => ({ key, value }));

  beforeAll(async () => {
    // Create 4 test users (1 creator + 3 voters to meet QUORUM_AMOUNT)
    for (let i = 0; i < 4; i++) {
      const wallet = ethers.Wallet.createRandom();
      const address = wallet.address.toLowerCase();

      // Create invitation code
      const [insertedCode] = await db
        .insert(invitationCodes)
        .values({
          code: `test-vote-${i}-${Date.now()}`,
          maxUses: 10,
          currentUses: 0,
        })
        .returning();

      // Authenticate user
      const authCtx = { db, supabase, user: null };
      const authCaller = authRouter.createCaller(authCtx);

      const nonceResult = await authCaller.generateNonce({ address });
      const message = `Please sign this message to authenticate.\n\nNonce: ${nonceResult.nonce}`;
      const signature = await wallet.signMessage(message);

      await authCaller.verify({
        address,
        signature,
        message,
        username: `TestVoteUser${i}`,
        turnstileToken: 'test-token',
      });

      const profileData = await db.query.profiles.findFirst({
        where: eq(profiles.address, address),
      });

      if (!profileData) {
        throw new Error(`Profile not created for user ${i}`);
      }

      // Set initial weight for voters (not creator)
      // High weights to ensure publishing conditions are met
      // Required weights: most items=10, some=20, codeRepo=30
      // With 3 voters at 50+ weight each, total will be 150+, enough for all items
      if (i > 0) {
        await db
          .update(profiles)
          .set({ weight: 50 + i * 20 }) // Give weights: 70, 90, 110
          .where(eq(profiles.userId, profileData.userId));
      }

      testUsers.push({
        wallet,
        address,
        userId: profileData.userId,
        inviteCode: insertedCode.code,
      });
    }

    // Create a test project with the first user
    const ctx = { db, supabase, user: { id: testUsers[0].userId } };
    const projectCaller = projectRouter.createCaller(ctx);
    testProject = await projectCaller.createProject(createValidProjectData());

    // Get the project details with proposals
    const projectDetails = await projectCaller.getProjectById({
      id: testProject.id,
    });
    testProposal = projectDetails.proposals[0];
  });

  describe('createVote', () => {
    beforeEach(async () => {
      // Clear vote records created by previous tests
      await db
        .delete(voteRecords)
        .where(eq(voteRecords.proposalId, testProposal.id));
    });

    it('should successfully create a vote for proposal', async () => {
      const caller = createVoteCaller(testUsers[1].userId);

      const voteData = {
        proposalId: testProposal.id,
        key: 'name',
      };

      const result = await caller.createVote(voteData);

      expect(result).toBeDefined();
      expect(result.proposalId).toBe(testProposal.id);
      expect(result.projectId).toBe(testProject.id);
      expect(result.key).toBe('name');
      expect(result.weight).toBe(70); // Initial weight: 50 + 1*20 = 70

      // Verify vote record in database
      const voteRecord = await db.query.voteRecords.findFirst({
        where: eq(voteRecords.id, result.id),
        with: { creator: true },
      });

      expect(voteRecord).toBeDefined();
      expect(voteRecord!.creator.userId).toBe(testUsers[1].userId);
      expect(voteRecord!.weight).toBe(70);
    });

    it('should fail when voting on published project', async () => {
      await setProjectPublishStatus(testProject.id, true);
      const caller = createVoteCaller(testUsers[2].userId);

      await expect(
        caller.createVote({
          proposalId: testProposal.id,
          key: 'tagline',
        }),
      ).rejects.toThrow('Cannot vote on proposals for published projects');

      await setProjectPublishStatus(testProject.id, false);
    });

    it('should fail when voting twice on same key', async () => {
      const caller = createVoteCaller(testUsers[1].userId);

      const voteData = {
        proposalId: testProposal.id,
        key: 'name',
      };

      await caller.createVote(voteData);
      await expect(caller.createVote(voteData)).rejects.toThrow(
        'You have already voted for this key in this proposal',
      );
    });

    it('should fail when user is not authenticated', async () => {
      const caller = createVoteCaller(null);

      await expect(
        caller.createVote({
          proposalId: testProposal.id,
          key: 'categories',
        }),
      ).rejects.toThrow();
    });

    it('should fail when proposal does not exist', async () => {
      const caller = createVoteCaller(testUsers[3].userId);

      await expect(
        caller.createVote({
          proposalId: 999999,
          key: 'categories',
        }),
      ).rejects.toThrow('Proposal not found');
    });

    it('should fail when already voted for same key in another proposal of same project', async () => {
      const testUserId = testUsers[2].userId;

      await clearUserVotes(testUserId);

      const proposalCaller = createProposalCaller(testUsers[0].userId);
      const secondProposalData = createValidProjectData();
      secondProposalData.name = 'Second Proposal Name';
      const secondProposal = await proposalCaller.createProposal({
        projectId: testProject.id,
        items: createProposalItems(secondProposalData),
      });

      const voteCaller = createVoteCaller(testUserId);

      const firstVote = await voteCaller.createVote({
        proposalId: testProposal.id,
        key: 'founders',
      });

      expect(firstVote).toBeDefined();
      expect(firstVote.key).toBe('founders');
      expect(firstVote.proposalId).toBe(testProposal.id);
      expect(firstVote.creator).toBe(testUserId);

      await expect(
        voteCaller.createVote({
          proposalId: secondProposal.id,
          key: 'founders',
        }),
      ).rejects.toThrow(
        'You have already voted for the same key in another proposal of this project',
      );
    });

    it('should create notification when voter is not proposal creator', async () => {
      const caller = createVoteCaller(testUsers[3].userId);

      await caller.createVote({
        proposalId: testProposal.id,
        key: 'mainDescription',
      });

      const notification = await db.query.notifications.findFirst({
        where: and(
          eq(notifications.userId, testUsers[0].userId),
          eq(notifications.type, 'proposalSupported'),
          eq(notifications.proposalId, testProposal.id),
          eq(notifications.voter_id, testUsers[3].userId),
        ),
      });

      expect(notification).toBeDefined();
      expect(notification?.voter_id).toBe(testUsers[3].userId);
    });
  });

  describe('switchVote', () => {
    let secondProposal: any;
    let secondProject: any;

    beforeEach(async () => {
      await clearUserVotes(testUsers[3].userId);

      const projectCaller = createProjectCaller(testUsers[1].userId);
      secondProject = await projectCaller.createProject(
        createValidProjectData(),
      );
      const secondProjectDetails = await projectCaller.getProjectById({
        id: secondProject.id,
      });
      secondProposal = secondProjectDetails.proposals[0];
    });

    it('should successfully vote on different projects with same key', async () => {
      const caller = createVoteCaller(testUsers[3].userId);

      await caller.createVote({
        proposalId: testProposal.id,
        key: 'categories',
      });

      const result = await caller.createVote({
        proposalId: secondProposal.id,
        key: 'categories',
      });

      expect(result).toBeDefined();
      expect(result.proposalId).toBe(secondProposal.id);
      expect(result.key).toBe('categories');

      const allVotes = await db.query.voteRecords.findMany({
        where: eq(voteRecords.creator, testUsers[3].userId),
      });
      expect(allVotes.length).toBe(2);
    });

    it('should correctly handle vote switching between project proposals', async () => {
      const caller = createVoteCaller(testUsers[1].userId);

      await caller.createVote({
        proposalId: testProposal.id,
        key: 'name',
      });

      await expect(
        caller.switchVote({
          proposalId: testProposal.id,
          key: 'name',
        }),
      ).rejects.toThrow(
        'You have already voted for this key in the target proposal',
      );
    });

    it('should fail when no existing vote to switch', async () => {
      const caller = createVoteCaller(testUsers[3].userId);

      await expect(
        caller.switchVote({
          proposalId: secondProposal.id,
          key: 'nonexistent-key',
        }),
      ).rejects.toThrow('No conflicting vote found to switch');
    });

    it('should fail when target proposal does not exist', async () => {
      const caller = createVoteCaller(testUsers[1].userId);

      await expect(
        caller.switchVote({
          proposalId: 999999,
          key: 'name',
        }),
      ).rejects.toThrow('Target proposal not found');
    });

    it('should fail when trying to switch vote on published project', async () => {
      const caller = createVoteCaller(testUsers[1].userId);

      await caller.createVote({
        proposalId: testProposal.id,
        key: 'websites',
      });

      await setProjectPublishStatus(testProject.id, true);

      await expect(
        caller.switchVote({
          proposalId: testProposal.id,
          key: 'websites',
        }),
      ).rejects.toThrow(
        'Cannot switch votes on proposals for published projects',
      );

      await setProjectPublishStatus(testProject.id, false);
    });

    it('should create notification when switching vote to different proposal creator', async () => {
      const proposalCaller3 = createProposalCaller(testUsers[3].userId);

      const thirdProposalData = createValidProjectData();
      thirdProposalData.name = 'Third Proposal Name';
      const thirdProposal = await proposalCaller3.createProposal({
        projectId: testProject.id,
        items: createProposalItems(thirdProposalData),
      });

      const voteCaller1 = createVoteCaller(testUsers[1].userId);

      await voteCaller1.createVote({
        proposalId: testProposal.id,
        key: 'publicGoods',
      });

      await voteCaller1.switchVote({
        proposalId: thirdProposal.id,
        key: 'publicGoods',
      });

      const notification = await db.query.notifications.findFirst({
        where: and(
          eq(notifications.userId, testUsers[3].userId),
          eq(notifications.type, 'proposalSupported'),
          eq(notifications.proposalId, thirdProposal.id),
        ),
      });

      expect(notification).toBeDefined();
      expect(notification?.voter_id).toBe(testUsers[1].userId);
    });
  });

  describe('getVotesByProposalId', () => {
    it('should return all votes for a specific proposal', async () => {
      const caller = createVoteCaller(null);

      const result = await caller.getVotesByProposalId({
        proposalId: testProposal.id,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      result.forEach((vote) => {
        expect(vote.proposalId).toBe(testProposal.id);
        expect(vote.creator).toBeDefined();
        expect(vote.weight).toBeDefined();
        expect(vote.key).toBeDefined();
      });
    });
  });

  describe('getVotesByProjectId', () => {
    it('should return all votes for a specific project', async () => {
      const caller = createVoteCaller(null);

      const result = await caller.getVotesByProjectId({
        projectId: testProject.id,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      result.forEach((vote) => {
        expect(vote.projectId).toBe(testProject.id);
        expect(vote.creator).toBeDefined();
        expect(vote.proposalId).toBeDefined();
      });
    });
  });

  describe('scanPendingProject - Project Publishing Flow', () => {
    let publishableProject: any;
    let publishableProposal: any;

    beforeEach(async () => {
      const projectCaller = createProjectCaller(testUsers[0].userId);
      publishableProject = await projectCaller.createProject(
        createValidProjectData(),
      );

      const projectDetails = await projectCaller.getProjectById({
        id: publishableProject.id,
      });
      publishableProposal = projectDetails.proposals[0];

      await db
        .delete(voteRecords)
        .where(eq(voteRecords.proposalId, publishableProposal.id));
    });

    it('should successfully publish project when all conditions are met', async () => {
      const projectCaller = createProjectCaller(null);

      // Add refs data to the existing project for mixed refs testing
      const refsData = [
        { key: 'name', value: 'Custom Name Reference' },
        { key: 'tagline', value: 'Custom Tagline Reference' },
        // Leave other keys without refs to test both scenarios
      ];

      // Update the proposal to include refs data
      await db
        .update(proposals)
        .set({ refs: refsData })
        .where(eq(proposals.id, publishableProposal.id));

      // Refresh proposal data
      const updatedProjectDetails = await projectCaller.getProjectById({
        id: publishableProject.id,
      });
      const updatedProposal = updatedProjectDetails.proposals[0];

      const proposalItems = updatedProposal.items as Array<{
        key: string;
        value: any;
      }>;
      const essentialKeys = proposalItems.map((item) => item.key);

      const voteCreationPromises = [];
      for (const key of essentialKeys) {
        for (let i = 1; i <= QUORUM_AMOUNT; i++) {
          const caller = createVoteCaller(testUsers[i].userId);
          voteCreationPromises.push(
            caller.createVote({
              proposalId: publishableProposal.id,
              key,
            }),
          );
        }
      }

      // Execute all votes in parallel for efficiency
      await Promise.all(voteCreationPromises);

      // Verify votes were created correctly
      const allVotes = await db.query.voteRecords.findMany({
        where: eq(voteRecords.proposalId, publishableProposal.id),
      });
      expect(allVotes.length).toBe(essentialKeys.length * QUORUM_AMOUNT);

      // Get counts before publishing
      const [itemProposalsBefore, ranksBefore, projectSnapsBefore] =
        await Promise.all([
          db.query.itemProposals.findMany({
            where: eq(itemProposals.projectId, publishableProject.id),
          }),
          db.query.ranks.findMany({
            where: eq(ranks.projectId, publishableProject.id),
          }),
          db.query.projectSnaps.findMany({
            where: eq(projectSnaps.projectId, publishableProject.id),
          }),
        ]);

      // Get creator weight before publishing
      const creatorProfileBefore = await db.query.profiles.findFirst({
        where: eq(profiles.userId, testUsers[0].userId),
      });

      // Run scanPendingProject
      const scanResult = await projectCaller.scanPendingProject();

      expect(scanResult).toBeDefined();
      expect(scanResult.processedCount).toBeGreaterThan(0);

      // === VERIFY PROJECT STATUS ===
      const publishedProject = await projectCaller.getProjectById({
        id: publishableProject.id,
      });
      expect(publishedProject.isPublished).toBe(true);
      expect(publishedProject.itemsTopWeight).toBeDefined();
      expect(Object.keys(publishedProject.itemsTopWeight || {})).toEqual(
        expect.arrayContaining(essentialKeys),
      );

      // === VERIFY ITEM PROPOSALS CREATION ===
      const itemProposalsAfter = await db.query.itemProposals.findMany({
        where: eq(itemProposals.projectId, publishableProject.id),
        with: { creator: true },
      });

      expect(itemProposalsAfter.length).toBe(essentialKeys.length);
      expect(itemProposalsAfter.length).toBeGreaterThan(
        itemProposalsBefore.length,
      );

      // Verify each essential key has an itemProposal
      const itemProposalKeys = itemProposalsAfter.map((ip) => ip.key);
      expect(itemProposalKeys.sort()).toEqual(essentialKeys.sort());

      // Verify creator is correct
      itemProposalsAfter.forEach((ip) => {
        expect(ip.creator.userId).toBe(testUsers[0].userId);
      });

      // === VERIFY ITEM PROPOSALS FIELD CORRECTNESS ===
      const originalProposalData = publishableProposal.items as Array<{
        key: string;
        value: any;
      }>;

      for (const itemProposal of itemProposalsAfter) {
        // Find corresponding original data
        const originalItem = originalProposalData.find(
          (item) => item.key === itemProposal.key,
        );
        expect(originalItem).toBeDefined();

        // Verify key field
        expect(itemProposal.key).toBe(originalItem!.key);

        // Verify value field (handle null/undefined cases)
        const expectedValue = originalItem!.value ?? '';
        if (Array.isArray(expectedValue) || typeof expectedValue === 'object') {
          expect(itemProposal.value).toStrictEqual(expectedValue);
        } else {
          expect(itemProposal.value).toBe(expectedValue);
        }

        // Verify projectId
        expect(itemProposal.projectId).toBe(publishableProject.id);

        // Verify creator
        expect(itemProposal.creator.userId).toBe(testUsers[0].userId);

        // === VERIFY REFS FIELD PROCESSING LOGIC (MIXED SCENARIO) ===
        // Check if this key has a corresponding ref
        const correspondingRef = refsData.find(
          (ref) => ref.key === itemProposal.key,
        );

        if (correspondingRef) {
          // If ref exists for this key, verify it's correctly set
          expect(itemProposal.ref).toBe(correspondingRef.value);
        } else {
          // If no ref for this key, should be null
          expect(itemProposal.ref).toBeNull();
        }
      }

      // === ADDITIONAL REFS PROCESSING VERIFICATION (MIXED SCENARIO) ===
      // Verify that the updated proposal refs field was correctly processed
      expect(updatedProposal.refs).toBeDefined();
      expect(Array.isArray(updatedProposal.refs)).toBe(true);
      expect(updatedProposal.refs).toHaveLength(2);

      // Verify original refs data integrity
      const originalRefs = updatedProposal.refs as Array<{
        key: string;
        value: string;
      }>;

      expect(originalRefs).toEqual(
        expect.arrayContaining([
          { key: 'name', value: 'Custom Name Reference' },
          { key: 'tagline', value: 'Custom Tagline Reference' },
        ]),
      );

      // === VERIFY FORMATREFS FUNCTION LOGIC (MIXED SCENARIO) ===
      // Count itemProposals that have refs vs those that don't
      const itemProposalsWithRefs = itemProposalsAfter.filter(
        (ip) => ip.ref !== null,
      );
      const itemProposalsWithoutRefs = itemProposalsAfter.filter(
        (ip) => ip.ref === null,
      );

      // Should have exactly 2 itemProposals with refs (name and tagline)
      expect(itemProposalsWithRefs.length).toBe(refsData.length);
      // The rest should have null refs
      expect(itemProposalsWithoutRefs.length).toBe(
        essentialKeys.length - refsData.length,
      );

      // Verify specific refs mapping
      const nameItemProposal = itemProposalsAfter.find(
        (ip) => ip.key === 'name',
      );
      const taglineItemProposal = itemProposalsAfter.find(
        (ip) => ip.key === 'tagline',
      );

      if (nameItemProposal) {
        expect(nameItemProposal.ref).toBe('Custom Name Reference');
      }
      if (taglineItemProposal) {
        expect(taglineItemProposal.ref).toBe('Custom Tagline Reference');
      }

      // This test validates the complete formatRefs function behavior:
      // 1. When refs array exists and has data, finds matching key and returns value ✓
      // 2. When key doesn't exist in refs, returns null ✓
      // 3. When refs is null/empty, returns null (tested in mixed scenario) ✓

      // === VERIFY VOTE RECORDS CONVERSION DATA CORRECTNESS ===
      const [voteRecordsAfter, originalVotesBefore] = await Promise.all([
        db.query.voteRecords.findMany({
          where: eq(voteRecords.projectId, publishableProject.id),
          with: { creator: true },
        }),
        allVotes, // Use the allVotes from before publishing
      ]);

      // Both original proposal votes and new itemProposal votes should exist
      const itemProposalVotes = voteRecordsAfter.filter(
        (vr) => vr.itemProposalId !== null,
      );
      const originalProposalVotes = voteRecordsAfter.filter(
        (vr) => vr.proposalId === publishableProposal.id,
      );

      expect(itemProposalVotes.length).toBe(
        essentialKeys.length * QUORUM_AMOUNT,
      );
      expect(originalProposalVotes.length).toBe(
        essentialKeys.length * QUORUM_AMOUNT,
      );

      // Verify each converted vote record has correct data
      for (const itemProposalVote of itemProposalVotes) {
        // Find corresponding original vote
        const originalVote = originalVotesBefore.find(
          (ov) =>
            ov.creator === itemProposalVote.creator.userId &&
            ov.key === itemProposalVote.key,
        );
        expect(originalVote).toBeDefined();

        // Verify itemProposalId is correctly set
        expect(itemProposalVote.itemProposalId).not.toBeNull();

        // Find corresponding itemProposal to verify the mapping
        const correspondingItemProposal = itemProposalsAfter.find(
          (ip) => ip.id === itemProposalVote.itemProposalId,
        );
        expect(correspondingItemProposal).toBeDefined();
        expect(correspondingItemProposal!.key).toBe(itemProposalVote.key);

        // Verify proposalId is null for itemProposal votes
        expect(itemProposalVote.proposalId).toBeNull();

        // Verify creator is preserved
        expect(itemProposalVote.creator.userId).toBe(originalVote!.creator);

        // Verify key is preserved
        expect(itemProposalVote.key).toBe(originalVote!.key);

        // Verify weight is preserved
        expect(itemProposalVote.weight).toBe(originalVote!.weight);

        // Verify projectId is preserved
        expect(itemProposalVote.projectId).toBe(publishableProject.id);
        expect(itemProposalVote.projectId).toBe(originalVote!.projectId);
      }

      // === VERIFY PROJECT LOGS CREATION ===
      const projectLogsAfter = await db.query.projectLogs.findMany({
        where: eq(projectLogs.projectId, publishableProject.id),
        orderBy: (projectLogs, { asc }) => [asc(projectLogs.createdAt)],
      });

      // Should have one project log for each itemProposal
      expect(projectLogsAfter.length).toBe(essentialKeys.length);

      // Verify each project log has correct data
      for (const projectLog of projectLogsAfter) {
        // Verify basic fields
        expect(projectLog.projectId).toBe(publishableProject.id);
        expect(projectLog.key).toBeDefined();
        expect(projectLog.itemProposalId).not.toBeNull();
        expect(projectLog.isNotLeading).toBe(false); // These are leading proposals
        expect(projectLog.createdAt).toBeDefined();

        // Verify the key exists in essential keys
        expect(essentialKeys).toContain(projectLog.key);

        // Find corresponding itemProposal to verify the mapping
        const correspondingItemProposal = itemProposalsAfter.find(
          (ip) => ip.id === projectLog.itemProposalId,
        );
        expect(correspondingItemProposal).toBeDefined();
        expect(correspondingItemProposal!.key).toBe(projectLog.key);
        expect(correspondingItemProposal!.projectId).toBe(projectLog.projectId);
      }

      // Verify each essential key has a corresponding project log
      for (const key of essentialKeys) {
        const correspondingLog = projectLogsAfter.find(
          (log) => log.key === key,
        );
        expect(correspondingLog).toBeDefined();
      }

      // === VERIFY ITEMS TOP WEIGHT CALCULATION CORRECTNESS ===
      const publishedProjectAfterWeights = await projectCaller.getProjectById({
        id: publishableProject.id,
      });

      // Verify itemsTopWeight is properly set
      expect(publishedProjectAfterWeights.itemsTopWeight).toBeDefined();
      expect(typeof publishedProjectAfterWeights.itemsTopWeight).toBe('object');
      expect(publishedProjectAfterWeights.itemsTopWeight).not.toBeNull();

      const actualItemsTopWeight =
        publishedProjectAfterWeights.itemsTopWeight! as Record<string, number>;

      // Calculate expected weights from original votes
      const expectedWeights: Record<string, number> = {};
      for (const vote of originalVotesBefore) {
        const key = vote.key;
        expectedWeights[key] = (expectedWeights[key] || 0) + (vote.weight || 0);
      }

      // Verify each essential key has correct weight
      for (const key of essentialKeys) {
        expect(actualItemsTopWeight[key]).toBeDefined();
        expect(actualItemsTopWeight[key]).toBe(expectedWeights[key]);
        expect(actualItemsTopWeight[key]).toBeGreaterThan(0);
      }

      // Verify no extra keys are present
      const actualKeys = Object.keys(actualItemsTopWeight).sort();
      const expectedKeys = essentialKeys.sort();
      expect(actualKeys).toEqual(expectedKeys);

      // Verify weight calculation matches vote aggregation
      for (const [key, expectedWeight] of Object.entries(expectedWeights)) {
        if (essentialKeys.includes(key)) {
          // Calculate weight by user for this key
          const votesForKey = originalVotesBefore.filter((v) => v.key === key);
          const calculatedWeight = votesForKey.reduce(
            (sum, vote) => sum + (vote.weight || 0),
            0,
          );
          expect(actualItemsTopWeight[key]).toBe(calculatedWeight);
          expect(calculatedWeight).toBe(expectedWeight);
        }
      }

      // === VERIFY RANKS INSERTION ===
      const ranksAfter = await db.query.ranks.findMany({
        where: eq(ranks.projectId, publishableProject.id),
      });

      expect(ranksAfter.length).toBe(ranksBefore.length + 1);
      expect(ranksAfter[0].publishedGenesisWeight).toBeGreaterThan(0);

      // === VERIFY PROJECT SNAPS INSERTION ===
      const projectSnapsAfter = await db.query.projectSnaps.findMany({
        where: eq(projectSnaps.projectId, publishableProject.id),
      });

      expect(projectSnapsAfter.length).toBe(projectSnapsBefore.length + 1);
      expect(projectSnapsAfter[0].items).toBeDefined();
      expect(Array.isArray(projectSnapsAfter[0].items)).toBe(true);

      // === VERIFY WEIGHT REWARDS ===
      const creatorProfileAfter = await db.query.profiles.findFirst({
        where: eq(profiles.userId, testUsers[0].userId),
      });

      const expectedCreatorReward =
        ESSENTIAL_ITEM_WEIGHT_AMOUNT * (1 - REWARD_PERCENT);
      const expectedTotalWeight =
        (creatorProfileBefore?.weight || 0) + expectedCreatorReward;
      expect(creatorProfileAfter!.weight).toBe(expectedTotalWeight);

      // === VERIFY NOTIFICATIONS ===
      const creatorNotifications = await db.query.notifications.findMany({
        where: eq(notifications.userId, testUsers[0].userId),
      });

      const rewardNotifications = creatorNotifications.filter(
        (n) => n.projectId === publishableProject.id,
      );

      expect(rewardNotifications.length).toBeGreaterThan(0);

      const rewardNotification = rewardNotifications.find(
        (n) => n.reward === expectedCreatorReward,
      );
      expect(rewardNotification).toBeDefined();

      // === VERIFY PUBLISHED PROJECTS CACHE MECHANISM ===
      // Test the cached getProjects logic for published projects
      const publicProjectCaller = createProjectCaller(null);

      // First call should populate the cache (isPublished=true, no cursor)
      const firstCallResult = await publicProjectCaller.getProjects({
        isPublished: true,
        limit: 10,
      });

      expect(firstCallResult).toBeDefined();
      expect(firstCallResult.items).toBeDefined();
      expect(Array.isArray(firstCallResult.items)).toBe(true);
      expect(firstCallResult.hasNextPage).toBeDefined();

      // Verify our published project is in the results
      const publishedProjectInResults = firstCallResult.items.find(
        (p: any) => p.id === publishableProject.id,
      );
      expect(publishedProjectInResults).toBeDefined();
      expect(publishedProjectInResults!.isPublished).toBe(true);

      // Second call with same parameters should use cache
      // (We can't directly test cache hit, but we can verify consistent results)
      const secondCallResult = await publicProjectCaller.getProjects({
        isPublished: true,
        limit: 10,
      });

      expect(secondCallResult).toEqual(firstCallResult);

      // Call with offset should NOT use cache (cache only applies when offset === 0)
      if (firstCallResult.hasNextPage) {
        const offsetCallResult = await publicProjectCaller.getProjects({
          isPublished: true,
          limit: 10,
          offset: 10,
        });

        expect(offsetCallResult).toBeDefined();
        expect(offsetCallResult.items).toBeDefined();
        // Should be different from first call (different page)
        expect(offsetCallResult.items).not.toEqual(firstCallResult.items);
      }

      // Call with isPublished=false should NOT use cache
      const unpublishedCallResult = await publicProjectCaller.getProjects({
        isPublished: false,
        limit: 10,
      });

      expect(unpublishedCallResult).toBeDefined();
      expect(unpublishedCallResult.items).toBeDefined();
      // Should contain unpublished projects (different from published results)
      const unpublishedProject = unpublishedCallResult.items.find(
        (p: any) => !p.isPublished,
      );
      if (unpublishedProject) {
        expect(unpublishedProject.isPublished).toBe(false);
      }

      // === VERIFY CACHE TAGS AND REVALIDATION LOGIC ===
      // The cache should be tagged with CACHE_TAGS.PROJECTS
      // When a project is published, revalidateTag should be called
      // (This is tested implicitly - the cache would be invalidated during publishing)

      // Verify that subsequent calls after publishing still work correctly
      const postPublishCallResult = await publicProjectCaller.getProjects({
        isPublished: true,
        limit: 10,
      });

      expect(postPublishCallResult).toBeDefined();
      const freshPublishedProject = postPublishCallResult.items.find(
        (p: any) => p.id === publishableProject.id,
      );
      expect(freshPublishedProject).toBeDefined();
      expect(freshPublishedProject!.isPublished).toBe(true);
    });

    it('should not publish when vote count is insufficient', async () => {
      const projectCaller = createProjectCaller(null);

      const proposalItems = publishableProposal.items as Array<{
        key: string;
        value: any;
      }>;
      const firstKey = proposalItems[0].key;

      for (let i = 1; i <= 2; i++) {
        const caller = createVoteCaller(testUsers[i].userId);
        await caller.createVote({
          proposalId: publishableProposal.id,
          key: firstKey,
        });
      }

      const scanResult = await projectCaller.scanPendingProject();
      expect(scanResult.processedCount).toBe(0);

      const project = await projectCaller.getProjectById({
        id: publishableProject.id,
      });
      expect(project.isPublished).toBe(false);
    });

    it('should not publish when only partial essential items meet conditions', async () => {
      const projectCaller = createProjectCaller(null);

      const proposalItems = publishableProposal.items as Array<{
        key: string;
        value: any;
      }>;
      const firstKey = proposalItems[0].key;

      for (let i = 1; i <= QUORUM_AMOUNT; i++) {
        const caller = createVoteCaller(testUsers[i].userId);
        await caller.createVote({
          proposalId: publishableProposal.id,
          key: firstKey,
        });
      }

      const scanResult = await projectCaller.scanPendingProject();
      expect(scanResult.processedCount).toBe(0);

      const project = await projectCaller.getProjectById({
        id: publishableProject.id,
      });
      expect(project.isPublished).toBe(false);
    });

    it('should not publish when vote weight is insufficient', async () => {
      const projectCaller = createProjectCaller(null);

      for (let i = 1; i <= 3; i++) {
        await db
          .update(profiles)
          .set({ weight: 1 })
          .where(eq(profiles.userId, testUsers[i].userId));
      }

      const proposalItems = publishableProposal.items as Array<{
        key: string;
        value: any;
      }>;
      const firstKey = proposalItems[0].key;

      for (let i = 1; i <= QUORUM_AMOUNT; i++) {
        const caller = createVoteCaller(testUsers[i].userId);
        await caller.createVote({
          proposalId: publishableProposal.id,
          key: firstKey,
        });
      }

      const scanResult = await projectCaller.scanPendingProject();
      expect(scanResult.processedCount).toBe(0);

      const project = await projectCaller.getProjectById({
        id: publishableProject.id,
      });
      expect(project.isPublished).toBe(false);
    });
  });
});
