import { addToast as heroAddToast } from '@heroui/react';

type HeroToastOptions = Parameters<typeof heroAddToast>[0];

export const addToast = (
  options: Omit<HeroToastOptions, 'timeout'> & { timeout?: number },
) => {
  return heroAddToast({
    ...options,
    timeout: options.timeout ?? 1500,
  });
};
