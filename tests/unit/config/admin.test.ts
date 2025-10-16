import { afterEach, describe, expect, it, vi } from 'vitest';

const loadConfig = async (whitelist?: string) => {
  if (whitelist === undefined) {
    delete process.env.ADMIN_WALLET_WHITELIST;
  } else {
    process.env.ADMIN_WALLET_WHITELIST = whitelist;
  }

  vi.resetModules();
  return import('@/config/admin');
};

describe('config/admin', () => {
  afterEach(() => {
    delete process.env.ADMIN_WALLET_WHITELIST;
    vi.resetModules();
  });

  it('normalizes wallet address to lowercase checksum-safe form', async () => {
    const { normalizeAdminWalletAddress } = await loadConfig();

    const input = ' 0x8A293A85FCc865107f4F6c09170C4A6FaB7E65F6 ';
    expect(normalizeAdminWalletAddress(input)).toBe(
      '0x8a293a85fcc865107f4f6c09170c4a6fab7e65f6',
    );
  });

  it('returns null for invalid wallet address formats', async () => {
    const { normalizeAdminWalletAddress } = await loadConfig();

    expect(normalizeAdminWalletAddress('not-a-wallet')).toBeNull();
    expect(normalizeAdminWalletAddress('')).toBeNull();
    expect(normalizeAdminWalletAddress(null)).toBeNull();
  });

  it('derives whitelist entries from ADMIN_WALLET_WHITELIST env', async () => {
    const configModule = await loadConfig(
      '0x8A293A85FCc865107f4F6c09170C4A6FaB7E65F6, 0xBbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBB',
    );

    expect(configModule.ADMIN_WALLET_WHITELIST).toEqual([
      '0x8a293a85fcc865107f4f6c09170c4a6fab7e65f6',
      '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    ]);
  });

  it('detects addresses present in env whitelist', async () => {
    const configModule = await loadConfig(
      '0x8A293A85FCc865107f4F6c09170C4A6FaB7E65F6',
    );

    expect(
      configModule.isWalletInAdminConfigWhitelist(
        '0x8A293A85FCc865107f4F6c09170C4A6FaB7E65F6',
      ),
    ).toBe(true);
    expect(
      configModule.isWalletInAdminConfigWhitelist(
        '0x1111111111111111111111111111111111111111',
      ),
    ).toBe(false);
  });
});
