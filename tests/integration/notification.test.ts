import { eq } from 'drizzle-orm';
import { ethers } from 'ethers';
import { beforeAll, describe, expect, it } from 'vitest';

import { db } from '@/lib/db';
import { invitationCodes, profiles } from '@/lib/db/schema';
import { notifications } from '@/lib/db/schema/notifications';
import { getServiceSupabase } from '@/lib/supabase/client';
import { authRouter } from '@/lib/trpc/routers/auth';
import { notificationRouter } from '@/lib/trpc/routers/notification';
import { projectRouter } from '@/lib/trpc/routers/project';

import { createValidProjectData } from './factories/projectFactory';

describe('Notification Integration Tests', () => {
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
        code: 'test-invite-notification-' + Date.now(),
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
      username: 'TestNotificationUser',
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

  describe('getUserNotifications', () => {
    let projectId: number;

    beforeAll(async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const projectCaller = projectRouter.createCaller(ctx);

      const project = await projectCaller.createProject(
        createValidProjectData(),
      );
      projectId = project.id;
    });

    it('should return user notifications with proper structure', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = notificationRouter.createCaller(ctx);

      const result = await caller.getUserNotifications({});

      expect(result).toBeDefined();
      expect(result.notifications).toBeDefined();
      expect(Array.isArray(result.notifications)).toBe(true);
      expect(result.hasMore).toBeDefined();
      expect(typeof result.hasMore).toBe('boolean');

      if (result.notifications.length > 0) {
        const notification = result.notifications[0];
        expect(notification.id).toBeDefined();
        expect(notification.type).toBeDefined();
        expect(notification.userId).toBe(testUserId);
        expect(notification.createdAt).toBeDefined();
        expect(notification.project).toBeDefined();
        expect(notification.project?.id).toBe(projectId);
      }
    });

    it('should filter unread notifications', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = notificationRouter.createCaller(ctx);

      const result = await caller.getUserNotifications({
        filter: 'unread',
      });

      expect(result.notifications).toBeDefined();

      result.notifications.forEach((notification) => {
        expect(notification.readAt).toBeNull();
        expect(notification.archivedAt).toBeNull();
      });
    });

    it('should respect limit parameter', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = notificationRouter.createCaller(ctx);

      const result = await caller.getUserNotifications({
        limit: 1,
      });

      expect(result.notifications.length).toBeLessThanOrEqual(1);
    });
  });

  describe('markAsRead', () => {
    let notificationId: number;

    beforeAll(async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const projectCaller = projectRouter.createCaller(ctx);

      await projectCaller.createProject(createValidProjectData());

      const userNotifications = await db.query.notifications.findMany({
        where: eq(notifications.userId, testUserId),
      });

      if (userNotifications.length > 0) {
        notificationId = userNotifications[0].id;
      }
    });

    it('should mark notifications as read', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = notificationRouter.createCaller(ctx);

      const result = await caller.markAsRead({
        notificationIds: [notificationId],
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0].readAt).not.toBeNull();
      expect(result[0].id).toBe(notificationId);
    });

    it('should fail when marking non-existent notification', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = notificationRouter.createCaller(ctx);

      await expect(
        caller.markAsRead({
          notificationIds: [999999],
        }),
      ).rejects.toThrow('Notifications not found or do not belong to user');
    });
  });

  describe('archiveAllNotifications', () => {
    beforeAll(async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const projectCaller = projectRouter.createCaller(ctx);

      await projectCaller.createProject(createValidProjectData());
    });

    it('should archive all user notifications', async () => {
      const ctx = { db, supabase, user: { id: testUserId } };
      const caller = notificationRouter.createCaller(ctx);

      const result = await caller.archiveAllNotifications();

      expect(result).toBeDefined();

      const archivedNotifications = await db.query.notifications.findMany({
        where: eq(notifications.userId, testUserId),
      });

      archivedNotifications.forEach((notification) => {
        expect(notification.archivedAt).not.toBeNull();
      });
    });
  });
});
