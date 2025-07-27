import { POC_ITEMS } from '@/lib/pocItems';

// Helper functions to get keys from POC_ITEMS
export const getEssentialKeys = () => {
  return Object.entries(POC_ITEMS)
    .filter(([_, item]) => item.isEssential)
    .map(([key]) => key);
};

export const getNonEssentialKeys = () => {
  return Object.entries(POC_ITEMS)
    .filter(([_, item]) => !item.isEssential)
    .map(([key]) => key);
};

// Get a specific key or fallback to a default one
export const getEssentialKey = (preferredKey?: string, index = 0) => {
  const keys = getEssentialKeys();
  return keys.find((k) => k === preferredKey) || keys[index];
};

export const getNonEssentialKey = (preferredKey?: string, index = 0) => {
  const keys = getNonEssentialKeys();
  return keys.find((k) => k === preferredKey) || keys[index];
};
