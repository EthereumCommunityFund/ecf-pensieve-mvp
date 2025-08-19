export const SOCIAL_PLATFORMS = [
  { value: 'twitter', label: 'X' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'warpcast', label: 'Warpcast' },
  { value: 'farcaster', label: 'Farcaster' },
  { value: 'other', label: 'Other' },
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number]['value'];
