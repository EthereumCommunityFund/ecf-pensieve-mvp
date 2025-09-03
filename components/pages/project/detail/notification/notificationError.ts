import {
  NotificationErrorMessages,
  NotificationErrorType,
} from '@/components/pages/project/detail/notification/notification';

// Map TRPC error codes to notification error types
const errorCodeMap: Record<string, NotificationErrorType> = {
  UNAUTHORIZED: NotificationErrorType.AUTHENTICATION_ERROR,
  FORBIDDEN: NotificationErrorType.PERMISSION_DENIED,
  NOT_FOUND: NotificationErrorType.NOT_FOUND,
  TIMEOUT: NotificationErrorType.TIMEOUT_ERROR,
  CLIENT_CLOSED_REQUEST: NotificationErrorType.NETWORK_ERROR,
  INTERNAL_SERVER_ERROR: NotificationErrorType.UNKNOWN_ERROR,
};

/**
 * Maps TRPC errors to user-friendly error messages
 */
export function mapTRPCError(error: unknown): {
  type: NotificationErrorType;
  message: string;
  shouldRetry: boolean;
} {
  // Handle TRPC client errors or error objects with data property
  if (error && typeof error === 'object' && 'data' in error) {
    const errorObj = error as any;
    const errorType =
      errorCodeMap[errorObj.data?.code] || NotificationErrorType.UNKNOWN_ERROR;
    const message = NotificationErrorMessages[errorType];

    // Determine if the error should trigger a retry
    const shouldRetry = [
      NotificationErrorType.NETWORK_ERROR,
      NotificationErrorType.TIMEOUT_ERROR,
    ].includes(errorType);

    return {
      type: errorType,
      message,
      shouldRetry,
    };
  }

  // Handle network errors
  if (error instanceof Error) {
    if (
      error.message.includes('fetch failed') ||
      error.message.includes('NetworkError')
    ) {
      return {
        type: NotificationErrorType.NETWORK_ERROR,
        message: NotificationErrorMessages[NotificationErrorType.NETWORK_ERROR],
        shouldRetry: true,
      };
    }

    if (
      error.message.includes('timeout') ||
      error.message.includes('Timeout')
    ) {
      return {
        type: NotificationErrorType.TIMEOUT_ERROR,
        message: NotificationErrorMessages[NotificationErrorType.TIMEOUT_ERROR],
        shouldRetry: true,
      };
    }
  }

  // Default error
  return {
    type: NotificationErrorType.UNKNOWN_ERROR,
    message: NotificationErrorMessages[NotificationErrorType.UNKNOWN_ERROR],
    shouldRetry: false,
  };
}

/**
 * Determines if an error should trigger a retry
 */
export function shouldRetryError(error: unknown): boolean {
  const { shouldRetry } = mapTRPCError(error);
  return shouldRetry;
}

/**
 * Gets a user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  const { message } = mapTRPCError(error);
  return message;
}

/**
 * Formats error for display with optional retry action
 */
export function formatErrorDisplay(
  error: unknown,
  onRetry?: () => void,
): {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
} {
  const { type, message, shouldRetry } = mapTRPCError(error);

  let title = 'Error';
  switch (type) {
    case NotificationErrorType.NETWORK_ERROR:
      title = 'Network Error';
      break;
    case NotificationErrorType.AUTHENTICATION_ERROR:
      title = 'Authentication Required';
      break;
    case NotificationErrorType.PERMISSION_DENIED:
      title = 'Permission Denied';
      break;
    case NotificationErrorType.NOT_FOUND:
      title = 'Not Found';
      break;
    case NotificationErrorType.TIMEOUT_ERROR:
      title = 'Request Timeout';
      break;
    default:
      title = 'Error';
  }

  return {
    title,
    description: message,
    action:
      shouldRetry && onRetry
        ? {
            label: 'Retry',
            onClick: onRetry,
          }
        : undefined,
  };
}
