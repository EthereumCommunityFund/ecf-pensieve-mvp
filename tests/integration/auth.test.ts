import { eq } from 'drizzle-orm';
import { ethers } from 'ethers';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { db } from '@/lib/db';
import { invitationCodes, loginNonces, profiles } from '@/lib/db/schema';
import { getServiceSupabase } from '@/lib/supabase/client';
import { authRouter } from '@/lib/trpc/routers/auth';

describe('Authentication Integration Tests', () => {
  const supabase = getServiceSupabase();

  let testWallet: ethers.HDNodeWallet;
  let testAddress: string;
  let testInviteCode: string;

  beforeAll(async () => {
    testWallet = ethers.Wallet.createRandom();
    testAddress = testWallet.address.toLowerCase();

    const [insertedCode] = await db
      .insert(invitationCodes)
      .values({
        code: 'test-invite-' + Date.now(),
        maxUses: 5,
        currentUses: 0,
      })
      .returning();

    testInviteCode = insertedCode.code;
  });

  beforeEach(async () => {
    await db.delete(loginNonces).where(eq(loginNonces.address, testAddress));

    const existingProfile = await db.query.profiles.findFirst({
      where: eq(profiles.address, testAddress),
    });

    if (existingProfile) {
      await db
        .delete(profiles)
        .where(eq(profiles.userId, existingProfile.userId));

      try {
        await supabase.auth.admin.deleteUser(existingProfile.userId);
      } catch (error) {
        console.warn('Failed to delete supabase user:', error);
      }
    }
  });

  describe('generateNonce', () => {
    it('should generate a nonce for a new address', async () => {
      const ctx = { db, supabase, user: null };
      const caller = authRouter.createCaller(ctx);

      const result = await caller.generateNonce({ address: testAddress });

      expect(result).toHaveProperty('nonce');
      expect(typeof result.nonce).toBe('string');
      expect(result.nonce.length).toBeGreaterThan(0);
    });

    it('should update existing nonce for same address', async () => {
      const ctx = { db, supabase, user: null };
      const caller = authRouter.createCaller(ctx);

      const firstResult = await caller.generateNonce({ address: testAddress });
      const secondResult = await caller.generateNonce({ address: testAddress });

      expect(firstResult.nonce).not.toBe(secondResult.nonce);
    });
  });

  describe('checkRegistration', () => {
    it('should return false for unregistered address', async () => {
      const ctx = { db, supabase, user: null };
      const caller = authRouter.createCaller(ctx);

      const result = await caller.checkRegistration({ address: testAddress });

      expect(result.registered).toBe(false);
    });
  });

  describe('verify - User Registration', () => {
    it('should successfully register a new user', async () => {
      const ctx = { db, supabase, user: null };
      const caller = authRouter.createCaller(ctx);

      const nonceResult = await caller.generateNonce({ address: testAddress });
      const nonce = nonceResult.nonce;

      const message = `Please sign this message to authenticate.\n\nNonce: ${nonce}`;
      const signature = await testWallet.signMessage(message);

      const verifyResult = await caller.verify({
        address: testAddress,
        signature,
        message,
        username: 'TestUser',
        inviteCode: testInviteCode,
      });

      expect(verifyResult.isNewUser).toBe(true);
      expect(verifyResult.token).toBeDefined();
      expect(typeof verifyResult.token).toBe('string');

      const profile = await db.query.profiles.findFirst({
        where: eq(profiles.address, testAddress),
      });

      expect(profile).toBeDefined();
      expect(profile!.name).toBe('TestUser');
      expect(profile!.address).toBe(testAddress);
    });

    it('should fail registration without invite code', async () => {
      const ctx = { db, supabase, user: null };
      const caller = authRouter.createCaller(ctx);

      const nonceResult = await caller.generateNonce({ address: testAddress });
      const message = `Please sign this message to authenticate.\n\nNonce: ${nonceResult.nonce}`;
      const signature = await testWallet.signMessage(message);

      await expect(
        caller.verify({
          address: testAddress,
          signature,
          message,
          username: 'TestUser',
        }),
      ).rejects.toThrow('New account requires an invite code');
    });

    it('should fail registration without username', async () => {
      const ctx = { db, supabase, user: null };
      const caller = authRouter.createCaller(ctx);

      const nonceResult = await caller.generateNonce({ address: testAddress });
      const message = `Please sign this message to authenticate.\n\nNonce: ${nonceResult.nonce}`;
      const signature = await testWallet.signMessage(message);

      await expect(
        caller.verify({
          address: testAddress,
          signature,
          message,
          inviteCode: testInviteCode,
        }),
      ).rejects.toThrow('New account requires a username');
    });

    it('should fail with invalid invite code', async () => {
      const ctx = { db, supabase, user: null };
      const caller = authRouter.createCaller(ctx);

      const nonceResult = await caller.generateNonce({ address: testAddress });
      const message = `Please sign this message to authenticate.\n\nNonce: ${nonceResult.nonce}`;
      const signature = await testWallet.signMessage(message);

      await expect(
        caller.verify({
          address: testAddress,
          signature,
          message,
          username: 'TestUser',
          inviteCode: 'invalid-code',
        }),
      ).rejects.toThrow('Invalid invite code');
    });
  });

  describe('verify - User Login', () => {
    beforeEach(async () => {
      const ctx = { db, supabase, user: null };
      const caller = authRouter.createCaller(ctx);

      const nonceResult = await caller.generateNonce({ address: testAddress });
      const message = `Please sign this message to authenticate.\n\nNonce: ${nonceResult.nonce}`;
      const signature = await testWallet.signMessage(message);

      await caller.verify({
        address: testAddress,
        signature,
        message,
        username: 'TestUser',
        inviteCode: testInviteCode,
      });
    });

    it('should successfully login existing user', async () => {
      const ctx = { db, supabase, user: null };
      const caller = authRouter.createCaller(ctx);

      const registrationResult = await caller.checkRegistration({
        address: testAddress,
      });
      expect(registrationResult.registered).toBe(true);

      const nonceResult = await caller.generateNonce({ address: testAddress });
      const message = `Please sign this message to authenticate.\n\nNonce: ${nonceResult.nonce}`;
      const signature = await testWallet.signMessage(message);

      const loginResult = await caller.verify({
        address: testAddress,
        signature,
        message,
      });

      expect(loginResult.isNewUser).toBe(false);
      expect(loginResult.token).toBeDefined();
      expect(typeof loginResult.token).toBe('string');
    });

    it('should fail login with expired nonce', async () => {
      const ctx = { db, supabase, user: null };
      const caller = authRouter.createCaller(ctx);

      const nonceResult = await caller.generateNonce({ address: testAddress });

      await db
        .update(loginNonces)
        .set({ expiresAt: new Date(Date.now() - 1000) })
        .where(eq(loginNonces.address, testAddress));

      const message = `Please sign this message to authenticate.\n\nNonce: ${nonceResult.nonce}`;
      const signature = await testWallet.signMessage(message);

      await expect(
        caller.verify({
          address: testAddress,
          signature,
          message,
        }),
      ).rejects.toThrow(/Nonce has expired|Invalid or expired nonce/);
    });

    it('should fail login with wrong signature', async () => {
      const ctx = { db, supabase, user: null };
      const caller = authRouter.createCaller(ctx);

      const nonceResult = await caller.generateNonce({ address: testAddress });
      const message = `Please sign this message to authenticate.\n\nNonce: ${nonceResult.nonce}`;

      const wrongWallet = ethers.Wallet.createRandom();
      const wrongSignature = await wrongWallet.signMessage(message);

      await expect(
        caller.verify({
          address: testAddress,
          signature: wrongSignature,
          message,
        }),
      ).rejects.toThrow('Signature does not match provided address');
    });

    it('should fail login with tampered message', async () => {
      const ctx = { db, supabase, user: null };
      const caller = authRouter.createCaller(ctx);

      const nonceResult = await caller.generateNonce({ address: testAddress });
      const originalMessage = `Please sign this message to authenticate.\n\nNonce: ${nonceResult.nonce}`;
      const tamperedMessage = `Please sign this message to authenticate.\n\nNonce: different-nonce`;

      const signature = await testWallet.signMessage(originalMessage);

      await expect(
        caller.verify({
          address: testAddress,
          signature,
          message: tamperedMessage,
        }),
      ).rejects.toThrow(
        /Signature does not match provided address|Invalid nonce in signature message/,
      );
    });
  });
});
