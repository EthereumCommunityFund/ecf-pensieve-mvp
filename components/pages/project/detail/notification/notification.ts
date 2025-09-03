// Notification mode types
export type NotificationMode = 'muted' | 'my_contributions' | 'all_events';

// Project notification setting interface
export interface ProjectNotificationSetting {
  userId: string;
  projectId: number;
  notificationMode: NotificationMode;
  createdAt: Date;
  updatedAt: Date;
}

// Component props interfaces
export interface NotificationConfigDropdownProps {
  projectId: number;
  className?: string;
  disabled?: boolean;
}

// Component state interfaces
export interface NotificationConfigState {
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  optimisticMode: NotificationMode | null;
}

// Hook return type
export interface UseNotificationSettingsReturn {
  setting: ProjectNotificationSetting | undefined;
  isLoading: boolean;
  error: Error | null;
  updateSetting: (mode: NotificationMode) => void;
  isUpdating: boolean;
  optimisticMode: NotificationMode | null;
}

// Error types
export enum NotificationErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// Error messages
export const NotificationErrorMessages: Record<NotificationErrorType, string> =
  {
    [NotificationErrorType.NETWORK_ERROR]:
      'Network connection failed. Please check your internet connection.',
    [NotificationErrorType.TIMEOUT_ERROR]:
      'Request timed out. Please try again.',
    [NotificationErrorType.AUTHENTICATION_ERROR]:
      'Please log in to change notification settings.',
    [NotificationErrorType.NOT_FOUND]: 'Project not found.',
    [NotificationErrorType.PERMISSION_DENIED]:
      'You do not have permission to change these settings.',
    [NotificationErrorType.UNKNOWN_ERROR]:
      'An unexpected error occurred. Please try again.',
  };
