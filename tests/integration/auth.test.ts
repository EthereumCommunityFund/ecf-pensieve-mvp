import { eq } from 'drizzle-orm';
import { ethers } from 'ethers';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { db } from '@/lib/db';
import { invitationCodes, lists, loginNonces, profiles } from '@/lib/db/schema';
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
        maxUses: 10,
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
      // Delete lists created by this user first to avoid foreign key constraint
      await db.delete(lists).where(eq(lists.creator, existingProfile.userId));

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

    it('should set expiration time to 10 minutes from now', async () => {
      const ctx = { db, supabase, user: null };
      const caller = authRouter.createCaller(ctx);

      const beforeTime = Date.now();
      await caller.generateNonce({ address: testAddress });
      const afterTime = Date.now();

      const nonceRecord = await db.query.loginNonces.findFirst({
        where: eq(loginNonces.address, testAddress),
      });

      expect(nonceRecord).toBeDefined();
      expect(nonceRecord!.expiresAt).toBeInstanceOf(Date);

      const expiresAtMs = nonceRecord!.expiresAt.getTime();
      const expectedMinExpiry = beforeTime + 10 * 60 * 1000;
      const expectedMaxExpiry = afterTime + 10 * 60 * 1000;

      expect(expiresAtMs).toBeGreaterThanOrEqual(expectedMinExpiry);
      expect(expiresAtMs).toBeLessThanOrEqual(expectedMaxExpiry);
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
        turnstileToken: 'test-token',
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
      expect(profile!.weight).toBe(0);
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
          turnstileToken: 'invalid-token',
        }),
      ).rejects.toThrow();
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
          turnstileToken: 'test-token',
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
          turnstileToken: 'invalid-token',
        }),
      ).rejects.toThrow();
    });
  });

  describe('verify - Expired Nonce Validation', () => {
    it('should fail verification with expired nonce', async () => {
      const expiredWallet = ethers.Wallet.createRandom();
      const expiredAddress = expiredWallet.address.toLowerCase();

      const ctx = { db, supabase, user: null };
      const caller = authRouter.createCaller(ctx);

      const nonceResult = await caller.generateNonce({
        address: expiredAddress,
      });

      await db
        .update(loginNonces)
        .set({ expiresAt: new Date(Date.now() - 10000) })
        .where(eq(loginNonces.address, expiredAddress));

      const nonceRecord = await db.query.loginNonces.findFirst({
        where: eq(loginNonces.address, expiredAddress),
      });
      expect(nonceRecord).toBeDefined();
      expect(new Date(nonceRecord!.expiresAt) < new Date()).toBe(true);

      const message = `Please sign this message to authenticate.\n\nNonce: ${nonceResult.nonce}`;
      const signature = await expiredWallet.signMessage(message);

      await expect(
        caller.verify({
          address: expiredAddress,
          signature,
          message,
          turnstileToken: 'test-token',
        }),
      ).rejects.toThrow('Nonce has expired, please try again.');
    });
  });

  describe('verify - Invalid Nonce Message', () => {
    it('should fail verification when message does not contain nonce', async () => {
      const messageWallet = ethers.Wallet.createRandom();
      const messageAddress = messageWallet.address.toLowerCase();

      const ctx = { db, supabase, user: null };
      const caller = authRouter.createCaller(ctx);

      await caller.generateNonce({ address: messageAddress });

      const tamperedMessage = `Please sign this message to authenticate.\n\nNonce: different-nonce`;
      const signature = await messageWallet.signMessage(tamperedMessage);

      await expect(
        caller.verify({
          address: messageAddress,
          signature,
          message: tamperedMessage,
          turnstileToken: 'test-token',
        }),
      ).rejects.toThrow('Invalid nonce in signature message.');
    });
  });

  describe('verify - Missing Nonce Data', () => {
    it('should fail verification when no nonce exists for address', async () => {
      const noNonceWallet = ethers.Wallet.createRandom();
      const noNonceAddress = noNonceWallet.address.toLowerCase();

      const ctx = { db, supabase, user: null };
      const caller = authRouter.createCaller(ctx);

      const fakeMessage = `Please sign this message to authenticate.\n\nNonce: fake-nonce-123`;
      const signature = await noNonceWallet.signMessage(fakeMessage);

      await expect(
        caller.verify({
          address: noNonceAddress,
          signature,
          message: fakeMessage,
          turnstileToken: 'test-token',
        }),
      ).rejects.toThrow('Invalid or expired nonce, please try again.');
    });

    it('should fail verification when nonce is manually deleted', async () => {
      const deletedWallet = ethers.Wallet.createRandom();
      const deletedAddress = deletedWallet.address.toLowerCase();

      const ctx = { db, supabase, user: null };
      const caller = authRouter.createCaller(ctx);

      const nonceResult = await caller.generateNonce({
        address: deletedAddress,
      });

      await db
        .delete(loginNonces)
        .where(eq(loginNonces.address, deletedAddress));

      const message = `Please sign this message to authenticate.\n\nNonce: ${nonceResult.nonce}`;
      const signature = await deletedWallet.signMessage(message);

      await expect(
        caller.verify({
          address: deletedAddress,
          signature,
          message,
          turnstileToken: 'test-token',
        }),
      ).rejects.toThrow('Invalid or expired nonce, please try again.');
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
        turnstileToken: 'test-token',
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
        turnstileToken: 'test-token',
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
          turnstileToken: 'test-token',
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
          turnstileToken: 'test-token',
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
          turnstileToken: 'test-token',
        }),
      ).rejects.toThrow(
        /Signature does not match provided address|Invalid nonce in signature message/,
      );
    });
  });
});
