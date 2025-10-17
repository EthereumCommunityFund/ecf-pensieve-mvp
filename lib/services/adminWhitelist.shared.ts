export const ADMIN_WHITELIST_ROLES = ['super_admin', 'admin', 'extra'] as const;

export type AdminWhitelistRole = (typeof ADMIN_WHITELIST_ROLES)[number];

export type AdminWhitelistSource = 'database' | 'environment';
