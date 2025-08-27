import { eq } from 'drizzle-orm';
import { ethers } from 'ethers';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { db } from '@/lib/db';
import {
  invitationCodes,
  profiles,
  projectNotificationSettings,
  projects,
} from '@/lib/db/schema';
import { getServiceSupabase } from '@/lib/supabase/client';
import { authRouter } from '@/lib/trpc/routers/auth';
import { projectRouter } from '@/lib/trpc/routers/project';
import { projectNotificationSettingsRouter } from '@/lib/trpc/routers/projectNotificationSettings';

import { createValidProjectData } from './factories/projectFactory';
import { cleanDatabase } from './helpers/testHelpers';

// Mock Next.js cache functions
vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn((fn) => fn),
}));

describe('Project Notification Settings Integration Tests', () => {
  const supabase = getServiceSupabase();

  let testWallet: ethers.HDNodeWallet;
  let testAddress: string;
  let testInviteCode: string;
  let testUserId: string;
  let projectId: number;

  let secondTestWallet: ethers.HDNodeWallet;
  let secondTestAddress: string;
  let secondTestUserId: string;

  beforeAll(async () => {
    // Create first test user
    testWallet = ethers.Wallet.createRandom();
    testAddress = testWallet.address.toLowerCase();

    const [insertedCode] = await db
      .insert(invitationCodes)
      .values({
        code: 'test-invite-notif-settings-' + Date.now(),
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
      username: 'TestNotifSettingsUser',
      inviteCode: testInviteCode,
    });

    const profileData = await db.query.profiles.findFirst({
      where: eq(profiles.address, testAddress),
    });

    if (!profileData) {
      throw new Error('Profile not created successfully');
    }

    testUserId = profileData.userId;

    // Create second test user
    secondTestWallet = ethers.Wallet.createRandom();
    secondTestAddress = secondTestWallet.address.toLowerCase();

    const secondNonceResult = await authCaller.generateNonce({
      address: secondTestAddress,
    });
    const secondMessage = `Please sign this message to authenticate.\n\nNonce: ${secondNonceResult.nonce}`;
    const secondSignature = await secondTestWallet.signMessage(secondMessage);

    await authCaller.verify({
      address: secondTestAddress,
      signature: secondSignature,
      message: secondMessage,
      username: 'SecondTestUser',
      inviteCode: testInviteCode,
    });

    const secondProfileData = await db.query.profiles.findFirst({
      where: eq(profiles.address, secondTestAddress),
    });

    if (!secondProfileData) {
      throw new Error('Second profile not created successfully');
    }

    secondTestUserId = secondProfileData.userId;

    // Create a test project
    const ctx = { db, supabase, user: { id: testUserId } };
    const projectCaller = projectRouter.createCaller(ctx);

    const project = await projectCaller.createProject(createValidProjectData());
    projectId = project.id;

    // Publish the project
    await db
      .update(projects)
      .set({ isPublished: true })
      .where(eq(projects.id, projectId));
  });

  afterAll(async () => {
    // Clean up test data - notification settings are already cleaned by cleanDatabase
    await cleanDatabase();
  });

  describe('getProjectNotificationSetting', () => {
    it('should return undefined when no setting exists', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectNotificationSettingsRouter.createCaller(ctx);

      const result = await caller.getProjectNotificationSetting({
        projectId,
      });

      expect(result).toBeUndefined();
    });

    it('should return the notification setting after it is created', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectNotificationSettingsRouter.createCaller(ctx);

      // First create a setting
      await caller.updateProjectNotificationSetting({
        projectId,
        notificationMode: 'my_contributions',
      });

      // Then get the setting
      const result = await caller.getProjectNotificationSetting({
        projectId,
      });

      expect(result).toBeDefined();
      expect(result?.userId).toBe(testUserId);
      expect(result?.projectId).toBe(projectId);
      expect(result?.notificationMode).toBe('my_contributions');
    });

    it('should return different settings for different users', async () => {
      // Create setting for first user
      const ctx1 = { db, supabase, user: { id: testUserId } };
      const caller1 = projectNotificationSettingsRouter.createCaller(ctx1);

      await caller1.updateProjectNotificationSetting({
        projectId,
        notificationMode: 'muted',
      });

      // Create setting for second user
      const ctx2 = { db, supabase, user: { id: secondTestUserId } };
      const caller2 = projectNotificationSettingsRouter.createCaller(ctx2);

      await caller2.updateProjectNotificationSetting({
        projectId,
        notificationMode: 'all_events',
      });

      // Get settings for both users
      const result1 = await caller1.getProjectNotificationSetting({
        projectId,
      });
      const result2 = await caller2.getProjectNotificationSetting({
        projectId,
      });

      expect(result1?.notificationMode).toBe('muted');
      expect(result2?.notificationMode).toBe('all_events');
    });
  });

  describe('updateProjectNotificationSetting', () => {
    it('should create a new notification setting', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectNotificationSettingsRouter.createCaller(ctx);

      const result = await caller.updateProjectNotificationSetting({
        projectId,
        notificationMode: 'all_events',
      });

      expect(result).toBeDefined();
      expect(result.userId).toBe(testUserId);
      expect(result.projectId).toBe(projectId);
      expect(result.notificationMode).toBe('all_events');
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should update an existing notification setting', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectNotificationSettingsRouter.createCaller(ctx);

      // Create initial setting
      await caller.updateProjectNotificationSetting({
        projectId,
        notificationMode: 'all_events',
      });

      // Update the setting
      const result = await caller.updateProjectNotificationSetting({
        projectId,
        notificationMode: 'muted',
      });

      expect(result.notificationMode).toBe('muted');

      // Verify the setting was updated
      const setting = await caller.getProjectNotificationSetting({ projectId });
      expect(setting?.notificationMode).toBe('muted');
    });

    it('should handle all notification modes', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectNotificationSettingsRouter.createCaller(ctx);

      const modes: Array<'muted' | 'my_contributions' | 'all_events'> = [
        'muted',
        'my_contributions',
        'all_events',
      ];

      for (const mode of modes) {
        const result = await caller.updateProjectNotificationSetting({
          projectId,
          notificationMode: mode,
        });

        expect(result.notificationMode).toBe(mode);
      }
    });

    it('should throw error when project does not exist', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectNotificationSettingsRouter.createCaller(ctx);

      await expect(
        caller.updateProjectNotificationSetting({
          projectId: 999999,
          notificationMode: 'muted',
        }),
      ).rejects.toThrow('Project not found');
    });

    it('should maintain separate settings for different projects', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const projectCaller = projectRouter.createCaller(ctx);
      const settingsCaller =
        projectNotificationSettingsRouter.createCaller(ctx);

      // Create second project
      const project2 = await projectCaller.createProject(
        createValidProjectData(),
      );

      // Set different modes for different projects
      await settingsCaller.updateProjectNotificationSetting({
        projectId,
        notificationMode: 'muted',
      });

      await settingsCaller.updateProjectNotificationSetting({
        projectId: project2.id,
        notificationMode: 'all_events',
      });

      // Verify settings are different
      const setting1 = await settingsCaller.getProjectNotificationSetting({
        projectId,
      });
      const setting2 = await settingsCaller.getProjectNotificationSetting({
        projectId: project2.id,
      });

      expect(setting1?.notificationMode).toBe('muted');
      expect(setting2?.notificationMode).toBe('all_events');

      // Clean up - delete notification settings first to avoid foreign key constraint
      await db
        .delete(projectNotificationSettings)
        .where(eq(projectNotificationSettings.projectId, project2.id));
    });

    it('should update updatedAt timestamp when updating setting', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectNotificationSettingsRouter.createCaller(ctx);

      // Create initial setting
      const initial = await caller.updateProjectNotificationSetting({
        projectId,
        notificationMode: 'all_events',
      });

      const initialUpdatedAt = initial.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Update the setting
      const updated = await caller.updateProjectNotificationSetting({
        projectId,
        notificationMode: 'muted',
      });

      expect(updated.updatedAt.getTime()).toBeGreaterThan(
        initialUpdatedAt.getTime(),
      );
    });
  });

  describe('Edge cases and concurrency', () => {
    it('should handle concurrent updates correctly', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectNotificationSettingsRouter.createCaller(ctx);

      // Perform multiple concurrent updates
      const updates = await Promise.all([
        caller.updateProjectNotificationSetting({
          projectId,
          notificationMode: 'muted',
        }),
        caller.updateProjectNotificationSetting({
          projectId,
          notificationMode: 'my_contributions',
        }),
        caller.updateProjectNotificationSetting({
          projectId,
          notificationMode: 'all_events',
        }),
      ]);

      // All updates should succeed
      expect(updates).toHaveLength(3);

      // The final state should be one of the three modes
      const finalSetting = await caller.getProjectNotificationSetting({
        projectId,
      });
      expect(['muted', 'my_contributions', 'all_events']).toContain(
        finalSetting?.notificationMode,
      );
    });

    it('should handle rapid successive updates', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = projectNotificationSettingsRouter.createCaller(ctx);

      // Perform rapid successive updates
      for (let i = 0; i < 5; i++) {
        const mode = i % 2 === 0 ? 'muted' : 'all_events';
        await caller.updateProjectNotificationSetting({
          projectId,
          notificationMode: mode as 'muted' | 'all_events',
        });
      }

      // Final state should be 'muted' (last iteration with i=4)
      const finalSetting = await caller.getProjectNotificationSetting({
        projectId,
      });
      expect(finalSetting?.notificationMode).toBe('muted');
    });
  });
});
