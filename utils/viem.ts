import { BaseError } from 'viem';

export function formatViemError(
  error: unknown,
  fallback = 'Unexpected error occurred.',
): string {
  if (error instanceof BaseError) {
    if (error.shortMessage) {
      return error.shortMessage;
    }
    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
