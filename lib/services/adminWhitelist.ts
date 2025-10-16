import { eq, sql } from 'drizzle-orm';

import {
  ADMIN_DEFAULT_ROLE,
  ADMIN_WALLET_WHITELIST,
  normalizeAdminWalletAddress,
} from '@/config/admin';
import type { Database } from '@/lib/db';
import { db } from '@/lib/db';
import {
  AdminWhitelist,
  adminWhitelist,
  type AdminWhitelistInsert,
} from '@/lib/db/schema';

import {
  type AdminWhitelistRole,
  type AdminWhitelistSource,
} from './adminWhitelist.shared';

export {
  ADMIN_WHITELIST_ROLES,
  type AdminWhitelistRole,
  type AdminWhitelistSource,
} from './adminWhitelist.shared';

export type AdminWhitelistSeed = {
  address: string;
  nickname?: string | null;
  role?: AdminWhitelistRole;
  isDisabled?: boolean;
};

export type AdminWhitelistCheckResult = {
  isWhitelisted: boolean;
  normalizedAddress: string | null;
  entry: AdminWhitelist | null;
  role: AdminWhitelistRole | null;
  source: AdminWhitelistSource | null;
};

export type AdminWhitelistErrorCode =
  | 'invalid_address'
  | 'duplicate_address'
  | 'not_found'
  | 'last_entry';

export class AdminWhitelistError extends Error {
  readonly code: AdminWhitelistErrorCode;

  constructor(code: AdminWhitelistErrorCode, message: string) {
    super(message);
    this.name = 'AdminWhitelistError';
    this.code = code;
  }
}

const DEFAULT_ADMIN_WHITELIST_SET = new Set<string>(ADMIN_WALLET_WHITELIST);

export const DEFAULT_ADMIN_WHITELIST = ADMIN_WALLET_WHITELIST;

export const DEFAULT_ADMIN_WHITELIST_ROLE: AdminWhitelistRole =
  ADMIN_DEFAULT_ROLE;

export const normalizeWalletAddress = normalizeAdminWalletAddress;

export const getDefaultAdminWhitelistSeeds = (): AdminWhitelistSeed[] => {
  return DEFAULT_ADMIN_WHITELIST.map((address) => ({
    address,
    role: DEFAULT_ADMIN_WHITELIST_ROLE,
    isDisabled: false,
  }));
};

const resolveDb = (database?: Database): Database => {
  return database ?? db;
};

export const syncDefaultAdminWhitelist = async (
  database?: Database,
): Promise<void> => {
  const dbToUse = resolveDb(database);
  const seeds = getDefaultAdminWhitelistSeeds();
  if (seeds.length === 0) return;

  for (const seed of seeds) {
    const address = normalizeWalletAddress(seed.address);
    if (!address) continue;

    const payload: AdminWhitelistInsert = {
      address,
      nickname: seed.nickname ?? null,
      role: seed.role ?? DEFAULT_ADMIN_WHITELIST_ROLE,
      isDisabled: seed.isDisabled ?? false,
    };

    await dbToUse.insert(adminWhitelist).values(payload).onConflictDoNothing();
  }
};

export const listAdminWhitelist = async (database?: Database) => {
  const dbToUse = resolveDb(database);
  await syncDefaultAdminWhitelist(dbToUse);

  return dbToUse.query.adminWhitelist.findMany({
    orderBy: (fields, operators) => [operators.asc(fields.createdAt)],
  });
};

export const findAdminWhitelistByAddress = async (
  address: string,
  database?: Database,
): Promise<AdminWhitelist | null> => {
  const dbToUse = resolveDb(database);
  const normalized = normalizeWalletAddress(address);
  if (!normalized) {
    return null;
  }

  await syncDefaultAdminWhitelist(dbToUse);

  return (
    (await dbToUse.query.adminWhitelist.findFirst({
      where: eq(adminWhitelist.address, normalized),
    })) ?? null
  );
};

export const checkAdminWhitelist = async (
  address?: string | null,
  database?: Database,
): Promise<AdminWhitelistCheckResult> => {
  const normalizedAddress = normalizeWalletAddress(address);
  if (!normalizedAddress) {
    return {
      isWhitelisted: false,
      normalizedAddress: null,
      entry: null,
      role: null,
      source: null,
    };
  }

  const dbToUse = resolveDb(database);
  await syncDefaultAdminWhitelist(dbToUse);

  const isDefaultAddress = DEFAULT_ADMIN_WHITELIST_SET.has(normalizedAddress);

  const entry =
    (await dbToUse.query.adminWhitelist.findFirst({
      where: eq(adminWhitelist.address, normalizedAddress),
    })) ?? null;

  if (entry) {
    const source: AdminWhitelistSource = isDefaultAddress
      ? 'environment'
      : 'database';

    if (entry.isDisabled) {
      return {
        isWhitelisted: false,
        normalizedAddress,
        entry,
        role: entry.role,
        source,
      };
    }
    return {
      isWhitelisted: true,
      normalizedAddress,
      entry,
      role: entry.role,
      source,
    };
  }

  if (isDefaultAddress) {
    return {
      isWhitelisted: true,
      normalizedAddress,
      entry: null,
      role: DEFAULT_ADMIN_WHITELIST_ROLE,
      source: 'environment',
    };
  }

  return {
    isWhitelisted: false,
    normalizedAddress,
    entry: null,
    role: null,
    source: null,
  };
};

export const createAdminWhitelistEntry = async (
  payload: AdminWhitelistSeed,
  database?: Database,
) => {
  const dbToUse = resolveDb(database);
  const normalized = normalizeWalletAddress(payload.address);

  if (!normalized) {
    throw new AdminWhitelistError('invalid_address', 'Invalid wallet address');
  }

  const existing = await dbToUse.query.adminWhitelist.findFirst({
    where: eq(adminWhitelist.address, normalized),
  });

  if (existing) {
    throw new AdminWhitelistError(
      'duplicate_address',
      'Wallet already whitelisted',
    );
  }

  const created = await dbToUse
    .insert(adminWhitelist)
    .values({
      address: normalized,
      nickname: payload.nickname ?? null,
      role: payload.role ?? 'admin',
      isDisabled: payload.isDisabled ?? false,
    })
    .returning()
    .then((rows) => rows[0] ?? null);

  if (!created) {
    throw new Error('Failed to create admin whitelist entry');
  }

  return created;
};

export const updateAdminWhitelistEntry = async (
  id: number,
  payload: Pick<AdminWhitelistSeed, 'nickname' | 'role' | 'isDisabled'>,
  database?: Database,
) => {
  const dbToUse = resolveDb(database);

  const updatePayload: Partial<AdminWhitelistInsert> & {
    updatedAt: Date;
    nickname: string | null;
  } = {
    nickname: payload.nickname ?? null,
    updatedAt: new Date(),
  };

  if (payload.role) {
    updatePayload.role = payload.role;
  }

  if (payload.isDisabled !== undefined) {
    updatePayload.isDisabled = payload.isDisabled;
  }

  const updated = await dbToUse
    .update(adminWhitelist)
    .set(updatePayload)
    .where(eq(adminWhitelist.id, id))
    .returning()
    .then((rows) => rows[0] ?? null);

  if (!updated) {
    throw new AdminWhitelistError('not_found', 'Whitelist entry not found');
  }

  return updated;
};

export const deleteAdminWhitelistEntry = async (
  id: number,
  database?: Database,
) => {
  const dbToUse = resolveDb(database);

  const entry =
    (await dbToUse.query.adminWhitelist.findFirst({
      where: eq(adminWhitelist.id, id),
    })) ?? null;

  if (!entry) {
    throw new AdminWhitelistError('not_found', 'Whitelist entry not found');
  }

  const [{ count }] = await dbToUse
    .select({ count: sql<number>`count(*)::int` })
    .from(adminWhitelist);

  if ((count ?? 0) <= 1) {
    throw new AdminWhitelistError(
      'last_entry',
      'Cannot delete the last whitelist entry',
    );
  }

  const deleted = await dbToUse
    .delete(adminWhitelist)
    .where(eq(adminWhitelist.id, id))
    .returning()
    .then((rows) => rows[0] ?? null);

  if (!deleted) {
    throw new AdminWhitelistError('not_found', 'Whitelist entry not found');
  }

  return deleted;
};
