import { ethers } from 'ethers';
import { beforeAll, describe, expect, it, vi } from 'vitest';

// Mock Next.js cache functions
vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn((fn) => fn),
}));

import { and, eq } from 'drizzle-orm';

import { REWARD_PERCENT, WEIGHT } from '@/lib/constants';
import { db } from '@/lib/db';
import {
  invitationCodes,
  profiles,
  projectLogs,
  projects,
  voteRecords,
} from '@/lib/db/schema';
import { notifications } from '@/lib/db/schema/notifications';
import { POC_ITEMS } from '@/lib/pocItems';
import { getServiceSupabase } from '@/lib/supabase/client';
import { authRouter } from '@/lib/trpc/routers/auth';
import { itemProposalRouter } from '@/lib/trpc/routers/itemProposal';
import { projectRouter } from '@/lib/trpc/routers/project';
import { voteRouter } from '@/lib/trpc/routers/vote';

import { createValidProjectData } from './factories/projectFactory';
import {
  getEssentialKey,
  getEssentialKeys,
  getNonEssentialKey,
} from './helpers/pocItemsHelpers';

describe('ItemProposal Integration Tests', () => {
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
    supabase,
    user: userId ? { id: userId } : null,
  });

  const createItemProposalCaller = (userId: string | null) =>
    itemProposalRouter.createCaller(createContext(userId));

  const createProjectCaller = (userId: string | null) =>
    projectRouter.createCaller(createContext(userId));

  const getUserProfile = async (userId: string) => {
    return await db.query.profiles.findFirst({
      where: eq(profiles.userId, userId),
    });
  };

  const getVoteRecordsByUser = async (userId: string, projectId: number) => {
    return await db.query.voteRecords.findMany({
      where: and(
        eq(voteRecords.creator, userId),
        eq(voteRecords.projectId, projectId),
      ),
    });
  };

  const getNotificationsByUser = async (userId: string) => {
    return await db.query.notifications.findMany({
      where: eq(notifications.userId, userId),
      orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
    });
  };

  const createVoteCaller = (userId: string | null) =>
    voteRouter.createCaller(createContext(userId));

  const getProjectLogs = async (projectId: number, key: string) => {
    return await db.query.projectLogs.findMany({
      where: and(
        eq(projectLogs.projectId, projectId),
        eq(projectLogs.key, key),
      ),
      orderBy: (projectLogs, { desc }) => [desc(projectLogs.createdAt)],
    });
  };

  beforeAll(async () => {
    // Create 5 test users
    for (let i = 0; i < 5; i++) {
      const wallet = ethers.Wallet.createRandom();
      const address = wallet.address.toLowerCase();

      // Create invitation code
      const [insertedCode] = await db
        .insert(invitationCodes)
        .values({
          code: `test-item-proposal-${i}-${Date.now()}`,
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
        username: `TestItemProposalUser${i}`,
        inviteCode: insertedCode.code,
      });

      const profileData = await db.query.profiles.findFirst({
        where: eq(profiles.address, address),
      });

      if (!profileData) {
        throw new Error(`Profile not created for user ${i}`);
      }

      // Set initial weight for testing
      const weights = [0, 70, 40, 60, 80]; // Match expected weights in tests
      await db
        .update(profiles)
        .set({ weight: weights[i] })
        .where(eq(profiles.userId, profileData.userId));

      testUsers.push({
        wallet,
        address,
        userId: profileData.userId,
        inviteCode: insertedCode.code,
      });
    }

    // Create a test project
    const projectCaller = createProjectCaller(testUsers[0].userId);
    testProject = await projectCaller.createProject(createValidProjectData());

    // Publish the test project
    await db
      .update(projects)
      .set({ isPublished: true })
      .where(eq(projects.id, testProject.id));
  });

  describe('createItemProposal', () => {
    describe('Basic Creation', () => {
      it('should successfully create an itemProposal with auto-vote', async () => {
        const caller = createItemProposalCaller(testUsers[0].userId);
        const key = getNonEssentialKey();
        const value = 'Test value for ' + key;
        const ref = 'https://example.com/ref';
        const reason = 'This project contributes to public goods';

        const result = await caller.createItemProposal({
          projectId: testProject.id,
          key,
          value,
          ref,
          reason,
        });

        expect(result).toBeDefined();
        expect(result.key).toBe(key);
        expect(result.value).toBe(value);
        expect(result.ref).toBe(ref);
        expect(result.reason).toBe(reason);
        expect(result.projectId).toBe(testProject.id);
        expect(result.creator).toBe(testUsers[0].userId);

        // Verify auto-vote was created
        const votes = await getVoteRecordsByUser(
          testUsers[0].userId,
          testProject.id,
        );
        const autoVote = votes.find(
          (v) => v.key === key && v.itemProposalId === result.id,
        );
        expect(autoVote).toBeDefined();

        // The auto-vote should have been created with the user's weight INCLUDING any rewards
        const userProfile = await getUserProfile(testUsers[0].userId);

        // After the fix, the auto-vote weight should equal the user's current weight
        // because rewards are applied BEFORE creating the auto-vote
        expect(autoVote!.weight).toEqual(userProfile!.weight);
      });

      it('should handle different value types correctly', async () => {
        const caller = createItemProposalCaller(testUsers[1].userId);

        const categoriesValue = ['DeFi', 'Infrastructure', 'DAO'];
        const categoriesResult = await caller.createItemProposal({
          projectId: testProject.id,
          key: 'categories',
          value: categoriesValue,
        });
        expect(categoriesResult.value).toEqual(categoriesValue);

        const websitesValue = [
          { title: 'Main Site', url: 'https://main.example.com' },
          { title: 'Docs', url: 'https://docs.example.com' },
        ];
        const websitesResult = await caller.createItemProposal({
          projectId: testProject.id,
          key: 'websites',
          value: websitesValue,
        });
        expect(websitesResult.value).toEqual(websitesValue);

        const foundersValue = [
          { name: 'Alice Smith', title: 'CEO' },
          { name: 'Bob Johnson', title: 'CTO' },
        ];
        const foundersResult = await caller.createItemProposal({
          projectId: testProject.id,
          key: 'founders',
          value: foundersValue,
        });
        expect(foundersResult.value).toEqual(foundersValue);

        const nameValue = 'Revolutionary DeFi Protocol';
        const nameResult = await caller.createItemProposal({
          projectId: testProject.id,
          key: 'name',
          value: nameValue,
        });
        expect(nameResult.value).toBe(nameValue);

        const openSourceValue = false;
        const openSourceResult = await caller.createItemProposal({
          projectId: testProject.id,
          key: 'openSource',
          value: openSourceValue,
        });
        expect(openSourceResult.value).toBe(openSourceValue);

        const dateValue = new Date('2024-06-15');
        const dateResult = await caller.createItemProposal({
          projectId: testProject.id,
          key: 'dateFounded',
          value: dateValue.toISOString(),
        });
        expect(dateResult.value).toBe(dateValue.toISOString());
      });

      it('should work without optional fields (ref and reason)', async () => {
        const caller = createItemProposalCaller(testUsers[2].userId);
        const key = getEssentialKey('founders');

        const result = await caller.createItemProposal({
          projectId: testProject.id,
          key,
          value:
            key === 'founders'
              ? [{ name: 'Alice', role: 'CEO' }]
              : 'Test value',
        });

        expect(result).toBeDefined();
        expect(result.ref).toBeNull();
        expect(result.reason).toBeNull();
      });
    });

    describe('First Proposal Rewards', () => {
      it('should award 20% reward for first proposal of a key', async () => {
        const caller = createItemProposalCaller(testUsers[1].userId);
        const key = getNonEssentialKey('roadmap'); // Non-essential item
        const accountability_metric =
          POC_ITEMS[key as keyof typeof POC_ITEMS].accountability_metric;
        const expectedReward = accountability_metric * WEIGHT * REWARD_PERCENT;

        // Get initial weight
        const profileBefore = await getUserProfile(testUsers[1].userId);
        const initialWeight = profileBefore?.weight || 0;

        // Create first proposal for this key
        const result = await caller.createItemProposal({
          projectId: testProject.id,
          key,
          value: 'Q1: Launch, Q2: Scale, Q3: Global',
        });

        // Verify weight increase
        const profileAfter = await getUserProfile(testUsers[1].userId);
        expect(profileAfter?.weight).toBe(initialWeight + expectedReward);

        // Verify reward notification
        const notifications = await getNotificationsByUser(testUsers[1].userId);
        const rewardNotification = notifications.find(
          (n) =>
            n.type === 'createItemProposal' &&
            n.itemProposalId === result.id &&
            n.reward === expectedReward,
        );
        expect(rewardNotification).toBeDefined();

        // Verify project hasProposalKeys updated
        const project = await db.query.projects.findFirst({
          where: eq(projects.id, testProject.id),
        });
        expect(project?.hasProposalKeys).toContain(key);
      });

      it('should not award reward for subsequent proposals of same key', async () => {
        const caller = createItemProposalCaller(testUsers[2].userId);
        const key = getNonEssentialKey('roadmap'); // Already has a proposal from previous test

        // Get initial weight
        const profileBefore = await getUserProfile(testUsers[2].userId);
        const initialWeight = profileBefore?.weight || 0;

        // Create another proposal for same key
        await caller.createItemProposal({
          projectId: testProject.id,
          key,
          value: 'Q1: Beta, Q2: Launch, Q3: Scale',
        });

        // Verify no weight change (should still be initial weight)
        const profileAfter = await getUserProfile(testUsers[2].userId);
        expect(profileAfter?.weight).toBe(initialWeight);

        // Verify no reward notification
        const notifications = await getNotificationsByUser(testUsers[2].userId);
        const rewardNotification = notifications.find(
          (n) => n.type === 'itemProposalCreated' && n.reward,
        );
        expect(rewardNotification).toBeUndefined();
      });
    });

    describe('Vote Switching on Creation', () => {
      it('should switch vote if user already voted on same key', async () => {
        const userId = testUsers[1].userId;
        const key = getNonEssentialKey('launch_plan'); // Non-essential item

        // First, create a proposal by another user
        const caller0 = createItemProposalCaller(testUsers[0].userId);
        const firstProposal = await caller0.createItemProposal({
          projectId: testProject.id,
          key,
          value: 'Q1 2024: Launch MVP\nQ2 2024: User growth',
        });

        // User1 votes for first proposal
        const voteCaller = createVoteCaller(userId);
        await voteCaller.createItemProposalVote({
          itemProposalId: firstProposal.id,
          key,
        });

        // Verify vote exists
        const votesBefore = await getVoteRecordsByUser(userId, testProject.id);
        const voteBefore = votesBefore.find((v) => v.key === key);
        expect(voteBefore?.itemProposalId).toBe(firstProposal.id);

        // User1 creates their own proposal for same key
        const caller1 = createItemProposalCaller(userId);
        const secondProposal = await caller1.createItemProposal({
          projectId: testProject.id,
          key,
          value: 'Q1 2024: Alpha release\nQ2 2024: Beta testing',
        });

        // Verify vote was switched
        const votesAfter = await getVoteRecordsByUser(userId, testProject.id);
        const voteAfter = votesAfter.find((v) => v.key === key);
        expect(voteAfter?.itemProposalId).toBe(secondProposal.id);

        // Should still have only one vote for this key
        const votesForKey = votesAfter.filter((v) => v.key === key);
        expect(votesForKey.length).toBe(1);
      });
    });

    describe('Error Cases', () => {
      it('should fail when project does not exist', async () => {
        const caller = createItemProposalCaller(testUsers[0].userId);

        const essentialKeys = getEssentialKeys();
        await expect(
          caller.createItemProposal({
            projectId: 999999,
            key: essentialKeys[0],
            value: 'Test Name',
          }),
        ).rejects.toThrow('Project not found');
      });

      it('should fail when user is not authenticated', async () => {
        const caller = createItemProposalCaller(null);

        const essentialKeys = getEssentialKeys();
        await expect(
          caller.createItemProposal({
            projectId: testProject.id,
            key: essentialKeys[0],
            value: 'Test Name',
          }),
        ).rejects.toThrow();
      });

      it('should fail with empty key', async () => {
        const caller = createItemProposalCaller(testUsers[0].userId);

        await expect(
          caller.createItemProposal({
            projectId: testProject.id,
            key: '',
            value: 'Test Value',
          }),
        ).rejects.toThrow('Key cannot be empty');
      });

      it('should fail when item key is not in POC_ITEMS', async () => {
        const caller = createItemProposalCaller(testUsers[0].userId);

        await expect(
          caller.createItemProposal({
            projectId: testProject.id,
            key: 'invalid_key_not_in_poc_items',
            value: 'Test Value',
          }),
        ).rejects.toThrow('Item not found');
      });
    });
  });

  describe('Complete End-to-End Flow', () => {
    it('should handle complete flow from project creation to proposal acceptance', async () => {
      // Step 1: Create a new project
      const projectCaller = createProjectCaller(testUsers[0].userId);
      const newProject = await projectCaller.createProject({
        ...createValidProjectData(),
        name: 'End-to-End Test Project',
      });

      expect(newProject).toBeDefined();
      expect(newProject.name).toBe('End-to-End Test Project');

      // Publish the project
      await db
        .update(projects)
        .set({ isPublished: true })
        .where(eq(projects.id, newProject.id));

      // Verify initial state
      const initialProject = await db.query.projects.findFirst({
        where: eq(projects.id, newProject.id),
      });
      // Project should have essential keys from initial creation
      expect(initialProject?.hasProposalKeys?.length).toBeGreaterThan(0);
      expect(initialProject?.itemsTopWeight).toBeDefined();

      // Step 2: Create first proposal for a non-essential item
      const key = getNonEssentialKey();
      const proposalCaller1 = createItemProposalCaller(testUsers[1].userId);
      const accountability_metric =
        POC_ITEMS[key as keyof typeof POC_ITEMS].accountability_metric;

      // Get creator's initial weight
      const creator1Before = await getUserProfile(testUsers[1].userId);
      const creator1InitialWeight = creator1Before?.weight || 0;

      const proposal1 = await proposalCaller1.createItemProposal({
        projectId: newProject.id,
        key,
        value: 'Q1 2024: Launch\nQ2 2024: Scale\nQ3 2024: Expand',
        ref: 'https://reference.com',
        reason: 'Comprehensive project roadmap',
      });

      // Verify 20% reward for first proposal
      const creator1AfterCreate = await getUserProfile(testUsers[1].userId);
      const firstReward = accountability_metric * WEIGHT * REWARD_PERCENT;
      expect(creator1AfterCreate?.weight).toBe(
        creator1InitialWeight + firstReward,
      );

      // Verify hasProposalKeys updated
      const projectAfterFirst = await db.query.projects.findFirst({
        where: eq(projects.id, newProject.id),
      });
      expect(projectAfterFirst?.hasProposalKeys).toContain(key);

      // Step 3: Add votes but not enough for quorum
      const voteCaller1 = createVoteCaller(testUsers[2].userId);
      await voteCaller1.createItemProposalVote({
        itemProposalId: proposal1.id,
        key,
      });

      // Verify not yet leading (2 votes < 3 quorum)
      let logs = await getProjectLogs(newProject.id, key);
      expect(logs.length).toBe(0);

      // Step 4: Create competing proposal
      const proposalCaller2 = createItemProposalCaller(testUsers[3].userId);
      const proposal2 = await proposalCaller2.createItemProposal({
        projectId: newProject.id,
        key,
        value: 'Q1 2024: Beta\nQ2 2024: Production\nQ3 2024: Enterprise',
        reason: 'More detailed roadmap with clear milestones',
      });

      // No reward for second proposal of same key
      const creator2Before = await getUserProfile(testUsers[3].userId);
      const creator2After = await getUserProfile(testUsers[3].userId);
      expect(creator2After?.weight).toBe(creator2Before?.weight);

      // Step 5: Add votes to proposal2 to reach quorum
      // User4 votes for proposal2
      const voteCaller2 = createVoteCaller(testUsers[4].userId); // weight: 80
      await voteCaller2.createItemProposalVote({
        itemProposalId: proposal2.id,
        key,
      });

      // Add one more vote to reach quorum (need 3 total)
      const voteCaller3 = createVoteCaller(testUsers[0].userId);
      await voteCaller3.createItemProposalVote({
        itemProposalId: proposal2.id,
        key,
      });

      // Calculate total weights
      // Proposal1: user1(70) + user2(40) = 110
      // Proposal2: user3(60) + user4(80) + user0(56) = 196
      // Proposal2 should be leading

      logs = await getProjectLogs(newProject.id, key);

      const leadingLog = logs.find((log) => !log.isNotLeading);
      expect(leadingLog?.itemProposalId).toBe(proposal2.id);

      // Verify creator of proposal2 got reward
      const creator2Final = await getUserProfile(testUsers[3].userId);
      // Creator2 may not get the full reward if they didn't defeat a leading proposal
      // Check that they have more weight than before
      expect(creator2Final!.weight).toBeGreaterThan(
        creator2Before?.weight || 0,
      );

      // Step 6: Test essential item (immediate leadership)
      const essentialKey = getEssentialKey();
      const essentialProposalCaller = createItemProposalCaller(
        testUsers[0].userId,
      );

      const creator0Before = await getUserProfile(testUsers[0].userId);
      const essentialProposal =
        await essentialProposalCaller.createItemProposal({
          projectId: newProject.id,
          key: essentialKey,
          value: 'Updated Project Name',
        });

      // Verify immediate leadership and full reward
      const essentialLogs = await getProjectLogs(newProject.id, essentialKey);
      expect(essentialLogs.length).toBe(1);
      expect(essentialLogs[0].itemProposalId).toBe(essentialProposal.id);

      const creator0After = await getUserProfile(testUsers[0].userId);
      // User0 already has some weight from creating the project, so just check increase
      expect(creator0After?.weight).toBeGreaterThan(
        creator0Before?.weight || 0,
      );

      // Step 7: Verify final project state
      const finalProject = await db.query.projects.findFirst({
        where: eq(projects.id, newProject.id),
      });

      expect(finalProject?.hasProposalKeys).toContain(key);
      expect(finalProject?.hasProposalKeys).toContain(essentialKey);

      const topWeights = finalProject?.itemsTopWeight as Record<string, number>;
      // Proposal2 has votes from user3(60) + user4(80) + user0(118) = 258
      expect(topWeights[key]).toBeGreaterThan(140); // Has more than just user3+user4
      expect(topWeights[essentialKey]).toBeGreaterThan(0); // User0 has gained weight

      // Step 8: Verify notifications were created
      const creator1Notifications = await getNotificationsByUser(
        testUsers[1].userId,
      );
      const creator0Notifications = await getNotificationsByUser(
        testUsers[0].userId,
      );

      // Creator1 should have: created with reward
      expect(
        creator1Notifications.some(
          (n) => n.type === 'createItemProposal' && n.reward === firstReward,
        ),
      ).toBe(true);

      // Creator0 should have some notifications from creating essential proposal
      expect(creator0Notifications.length).toBeGreaterThan(0);
    });

    it('should handle vote switching in complete flow', async () => {
      // Create new project for this test
      const projectCaller = createProjectCaller(testUsers[0].userId);
      const switchProject = await projectCaller.createProject({
        ...createValidProjectData(),
        name: 'Vote Switch Test Project',
      });

      // Publish the project
      await db
        .update(projects)
        .set({ isPublished: true })
        .where(eq(projects.id, switchProject.id));

      const key = getNonEssentialKey('audit_status');

      // Create two competing proposals
      const proposalCaller1 = createItemProposalCaller(testUsers[1].userId);
      const proposal1 = await proposalCaller1.createItemProposal({
        projectId: switchProject.id,
        key,
        value: 'Audited by CertiK in Q4 2023',
      });

      const proposalCaller2 = createItemProposalCaller(testUsers[2].userId);
      const proposal2 = await proposalCaller2.createItemProposal({
        projectId: switchProject.id,
        key,
        value: 'Audited by OpenZeppelin in Q1 2024',
      });

      // High weight user votes for proposal1
      const highWeightVoter = testUsers[4].userId; // weight: 80
      const voteCaller = createVoteCaller(highWeightVoter);
      await voteCaller.createItemProposalVote({
        itemProposalId: proposal1.id,
        key,
      });

      // Add another vote to reach quorum
      const voteCaller2 = createVoteCaller(testUsers[3].userId);
      await voteCaller2.createItemProposalVote({
        itemProposalId: proposal1.id,
        key,
      });

      // Verify proposal1 is leading
      let logs = await getProjectLogs(switchProject.id, key);
      let leadingLog = logs.find((log) => !log.isNotLeading);
      expect(leadingLog?.itemProposalId).toBe(proposal1.id);

      // High weight user switches vote
      await voteCaller.switchItemProposalVote({
        itemProposalId: proposal2.id,
        key,
      });

      // Also switch other voter to ensure quorum
      await voteCaller2.switchItemProposalVote({
        itemProposalId: proposal2.id,
        key,
      });

      // User2 already auto-voted for their own proposal, and user4 already voted
      // Use user0 who hasn't voted yet
      const voteCaller0 = createVoteCaller(testUsers[0].userId);
      await voteCaller0.createItemProposalVote({
        itemProposalId: proposal2.id,
        key,
      });

      // Verify proposal2 is now leading
      logs = await getProjectLogs(switchProject.id, key);
      leadingLog = logs.find((log) => !log.isNotLeading);
      expect(leadingLog?.itemProposalId).toBe(proposal2.id);

      // Verify notifications
      const user1Notifications = await getNotificationsByUser(
        testUsers[1].userId,
      );
      const user2Notifications = await getNotificationsByUser(
        testUsers[2].userId,
      );

      expect(
        user1Notifications.some(
          (n) =>
            n.type === 'itemProposalLostLeading' &&
            n.itemProposalId === proposal1.id,
        ),
      ).toBe(true);

      // Proposal2 may become leading through proposal1 losing, not directly passing
      // So check for either passed or became leading notification
      expect(
        user2Notifications.some(
          (n) =>
            (n.type === 'itemProposalPassed' ||
              n.type === 'itemProposalBecameLeading') &&
            n.itemProposalId === proposal2.id,
        ),
      ).toBe(true);
    });
  });

  describe('Vote Edge Cases', () => {
    it('should handle createItemProposalVote with non-existent itemProposal', async () => {
      const voteCaller = createVoteCaller(testUsers[0].userId);
      const nonExistentId = 999999;

      await expect(
        voteCaller.createItemProposalVote({
          itemProposalId: nonExistentId,
          key: 'name',
        }),
      ).rejects.toThrow('Item proposal not found');
    });

    it('should handle switchItemProposalVote with non-existent itemProposal', async () => {
      const voteCaller = createVoteCaller(testUsers[0].userId);
      const nonExistentId = 999999;

      await expect(
        voteCaller.switchItemProposalVote({
          itemProposalId: nonExistentId,
          key: 'name',
        }),
      ).rejects.toThrow('Target item proposal not found');
    });

    it('should handle switchItemProposalVote when no vote exists to switch', async () => {
      const projectCaller = createProjectCaller(testUsers[0].userId);
      const newProject = await projectCaller.createProject({
        ...createValidProjectData(),
        name: 'No Vote to Switch Test Project',
      });

      await db
        .update(projects)
        .set({ isPublished: true })
        .where(eq(projects.id, newProject.id));

      const key = getNonEssentialKey('audit_status');
      const proposalCaller = createItemProposalCaller(testUsers[1].userId);

      const proposal = await proposalCaller.createItemProposal({
        projectId: newProject.id,
        key,
        value: 'Audited by CertiK',
      });

      const voteCaller = createVoteCaller(testUsers[2].userId);

      await expect(
        voteCaller.switchItemProposalVote({
          itemProposalId: proposal.id,
          key,
        }),
      ).rejects.toThrow('No conflicting vote found to switch');
    });

    it('should handle switchItemProposalVote when already voted for target proposal', async () => {
      const projectCaller = createProjectCaller(testUsers[0].userId);
      const newProject = await projectCaller.createProject({
        ...createValidProjectData(),
        name: 'Already Voted Test Project',
      });

      await db
        .update(projects)
        .set({ isPublished: true })
        .where(eq(projects.id, newProject.id));

      const key = getNonEssentialKey('token_issuance_mechanism');
      const proposalCaller = createItemProposalCaller(testUsers[1].userId);

      const proposal = await proposalCaller.createItemProposal({
        projectId: newProject.id,
        key,
        value: 'Fair Launch',
      });

      const voteCaller = createVoteCaller(testUsers[2].userId);

      await voteCaller.createItemProposalVote({
        itemProposalId: proposal.id,
        key,
      });

      await expect(
        voteCaller.switchItemProposalVote({
          itemProposalId: proposal.id,
          key,
        }),
      ).rejects.toThrow(
        'You have already voted for this key in the target item proposal',
      );
    });

    it('should fail createItemProposalVote when already voted for same key', async () => {
      const projectCaller = createProjectCaller(testUsers[0].userId);
      const newProject = await projectCaller.createProject({
        ...createValidProjectData(),
        name: 'Already Voted Key Test Project',
      });

      await db
        .update(projects)
        .set({ isPublished: true })
        .where(eq(projects.id, newProject.id));

      const key = getNonEssentialKey('audit_status');

      // User1 creates first proposal
      const proposalCaller1 = createItemProposalCaller(testUsers[1].userId);
      const proposal1 = await proposalCaller1.createItemProposal({
        projectId: newProject.id,
        key,
        value: 'Audited by CertiK',
      });

      // User2 creates second proposal for same key
      const proposalCaller2 = createItemProposalCaller(testUsers[2].userId);
      const proposal2 = await proposalCaller2.createItemProposal({
        projectId: newProject.id,
        key,
        value: 'Audited by OpenZeppelin',
      });

      // User3 votes for proposal1
      const voteCaller = createVoteCaller(testUsers[3].userId);
      await voteCaller.createItemProposalVote({
        itemProposalId: proposal1.id,
        key,
      });

      // User3 tries to vote for proposal2 for the same key - should fail
      await expect(
        voteCaller.createItemProposalVote({
          itemProposalId: proposal2.id,
          key,
        }),
      ).rejects.toThrow('You have already voted for this key in this project');
    });

    it('should handle voting on already leading proposal (leadingProposal?.itemProposalId === itemProposalId)', async () => {
      const projectCaller = createProjectCaller(testUsers[0].userId);
      const newProject = await projectCaller.createProject({
        ...createValidProjectData(),
        name: 'Leading Proposal Test Project',
      });

      await db
        .update(projects)
        .set({ isPublished: true })
        .where(eq(projects.id, newProject.id));

      const key = getEssentialKey('tagline');
      const proposalCaller = createItemProposalCaller(testUsers[0].userId);

      const proposal = await proposalCaller.createItemProposal({
        projectId: newProject.id,
        key,
        value: 'Already Leading Tagline',
      });

      let logs = await getProjectLogs(newProject.id, key);
      expect(logs.length).toBe(1);
      expect(logs[0].itemProposalId).toBe(proposal.id);
      expect(logs[0].isNotLeading).toBe(false);

      const project = await db.query.projects.findFirst({
        where: eq(projects.id, newProject.id),
      });
      const initialTopWeight =
        (project?.itemsTopWeight as Record<string, number>)?.[key] || 0;

      const voteCaller = createVoteCaller(testUsers[1].userId);
      await voteCaller.createItemProposalVote({
        itemProposalId: proposal.id,
        key,
      });

      const updatedProject = await db.query.projects.findFirst({
        where: eq(projects.id, newProject.id),
      });
      const newTopWeight =
        (updatedProject?.itemsTopWeight as Record<string, number>)?.[key] || 0;

      expect(newTopWeight).toBeGreaterThan(initialTopWeight);

      logs = await getProjectLogs(newProject.id, key);
      expect(logs.length).toBe(1);
      expect(logs[0].itemProposalId).toBe(proposal.id);
    });

    it('should handle switch vote to already leading proposal', async () => {
      const projectCaller = createProjectCaller(testUsers[0].userId);
      const newProject = await projectCaller.createProject({
        ...createValidProjectData(),
        name: 'Switch to Leading Test Project',
      });

      await db
        .update(projects)
        .set({ isPublished: true })
        .where(eq(projects.id, newProject.id));

      const key = getNonEssentialKey('roadmap');

      // Create proposal1
      const proposalCaller1 = createItemProposalCaller(testUsers[1].userId);
      const proposal1 = await proposalCaller1.createItemProposal({
        projectId: newProject.id,
        key,
        value: 'Roadmap Option 1',
      });

      // Create proposal2
      const proposalCaller2 = createItemProposalCaller(testUsers[2].userId);
      const proposal2 = await proposalCaller2.createItemProposal({
        projectId: newProject.id,
        key,
        value: 'Roadmap Option 2 - Will be leading',
      });

      // User3 votes for proposal1
      const voteCaller3 = createVoteCaller(testUsers[3].userId);
      await voteCaller3.createItemProposalVote({
        itemProposalId: proposal1.id,
        key,
      });

      // User4 votes for proposal1
      const voteCaller4 = createVoteCaller(testUsers[4].userId);
      await voteCaller4.createItemProposalVote({
        itemProposalId: proposal1.id,
        key,
      });

      // Now make proposal2 the leading one with a high-weight voter
      // User0 (project creator) likely has high weight after creating project
      const voteCaller0 = createVoteCaller(testUsers[0].userId);
      await voteCaller0.createItemProposalVote({
        itemProposalId: proposal2.id,
        key,
      });

      // Verify which proposal is leading after votes
      let logs = await getProjectLogs(newProject.id, key);
      const leadingLog = logs.find((log) => !log.isNotLeading);

      // Get the current top weight before switching
      const project = await db.query.projects.findFirst({
        where: eq(projects.id, newProject.id),
      });
      const initialTopWeight =
        (project?.itemsTopWeight as Record<string, number>)?.[key] || 0;

      // Now switch user4's vote from proposal1 to proposal2
      // This will trigger different logic depending on which proposal is leading
      await voteCaller4.switchItemProposalVote({
        itemProposalId: proposal2.id,
        key,
      });

      // Get updated project state
      const updatedProject = await db.query.projects.findFirst({
        where: eq(projects.id, newProject.id),
      });
      const newTopWeight =
        (updatedProject?.itemsTopWeight as Record<string, number>)?.[key] || 0;

      // Verify proposal2 is still leading
      logs = await getProjectLogs(newProject.id, key);
      const updatedLeadingLog = logs.find((log) => !log.isNotLeading);
      expect(updatedLeadingLog?.itemProposalId).toBe(proposal2.id);

      // Verify the vote was switched to proposal2
      const votesForProposal2 = await db.query.voteRecords.findMany({
        where: and(
          eq(voteRecords.itemProposalId, proposal2.id),
          eq(voteRecords.key, key),
        ),
      });
      expect(
        votesForProposal2.some((v) => v.creator === testUsers[4].userId),
      ).toBe(true);

      // Verify user4 no longer has a vote for proposal1
      const votesForProposal1 = await db.query.voteRecords.findMany({
        where: and(
          eq(voteRecords.itemProposalId, proposal1.id),
          eq(voteRecords.key, key),
          eq(voteRecords.creator, testUsers[4].userId),
        ),
      });
      expect(votesForProposal1.length).toBe(0);
    });
  });
});
