import { AddressValidator } from '@/lib/utils/addressValidation';

export const ADMIN_DEFAULT_ROLE = 'super_admin' as const;

export const normalizeAdminWalletAddress = (
  address?: string | null,
): string | null => {
  if (!address) return null;
  const trimmed = address.trim();
  if (!trimmed) return null;

  if (!AddressValidator.isValidFormat(trimmed)) {
    return null;
  }

  const normalized = AddressValidator.normalizeAddress(trimmed);
  if (!normalized) return null;

  return normalized.toLowerCase();
};

const parseWhitelist = (value?: string | null): string[] => {
  if (!value) return [];

  return value
    .split(',')
    .map((entry) => normalizeAdminWalletAddress(entry))
    .filter((entry): entry is string => Boolean(entry));
};

const serverWhitelist = parseWhitelist(process.env.ADMIN_WALLET_WHITELIST);
const ADMIN_WALLET_WHITELIST_SET = new Set<string>(serverWhitelist);

export const ADMIN_WALLET_WHITELIST = Array.from(ADMIN_WALLET_WHITELIST_SET);

export const isWalletInAdminConfigWhitelist = (
  address?: string | null,
): boolean => {
  const normalized = normalizeAdminWalletAddress(address);
  if (!normalized) return false;
  return ADMIN_WALLET_WHITELIST_SET.has(normalized);
};
