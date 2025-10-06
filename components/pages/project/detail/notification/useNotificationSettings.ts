import { useCallback, useState } from 'react';

import {
  NotificationMode,
  UseNotificationSettingsReturn,
} from '@/components/pages/project/detail/notification/notification';
import { useAuth } from '@/context/AuthContext';
import { trpc } from '@/lib/trpc/client';

export function useNotificationSettings(
  projectId: number,
): UseNotificationSettingsReturn {
  const { profile } = useAuth();
  const [optimisticMode, setOptimisticMode] = useState<NotificationMode | null>(
    null,
  );
  const utils = trpc.useUtils();

  // Query current notification settings
  const {
    data: setting,
    isLoading,
    error: queryError,
  } = trpc.projectNotificationSettings.getProjectNotificationSetting.useQuery(
    { projectId },
    {
      enabled: !!projectId && projectId > 0 && !!profile,
      staleTime: 5 * 60 * 1000, // 5 minutes cache
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    },
  );

  // Update notification settings mutation
  const updateMutation =
    trpc.projectNotificationSettings.updateProjectNotificationSetting.useMutation(
      {
        onMutate: async (variables) => {
          // Cancel any outgoing refetches
          await utils.projectNotificationSettings.getProjectNotificationSetting.cancel(
            { projectId },
          );

          // Get current data for rollback
          const previousSetting =
            utils.projectNotificationSettings.getProjectNotificationSetting.getData(
              { projectId },
            );

          // Optimistically update the cache
          if (previousSetting) {
            utils.projectNotificationSettings.getProjectNotificationSetting.setData(
              { projectId },
              {
                ...previousSetting,
                notificationMode: variables.notificationMode,
                updatedAt: new Date(),
              },
            );
          }

          // Set optimistic mode for UI update
          setOptimisticMode(variables.notificationMode);

          return { previousSetting };
        },
        onError: (error, variables, context) => {
          console.error('Failed to update notification settings:', error);

          // Rollback on error
          if (context?.previousSetting) {
            utils.projectNotificationSettings.getProjectNotificationSetting.setData(
              { projectId },
              context.previousSetting,
            );
          }
          setOptimisticMode(null);
        },
        onSuccess: (data) => {
          // Update cache with server response
          utils.projectNotificationSettings.getProjectNotificationSetting.setData(
            { projectId },
            data,
          );
          setOptimisticMode(null);
        },
        onSettled: () => {
          // Always refetch after mutation
          utils.projectNotificationSettings.getProjectNotificationSetting.invalidate(
            { projectId },
          );
        },
      },
    );

  const updateSetting = useCallback(
    (mode: NotificationMode) => {
      if (!projectId || projectId <= 0) {
        console.error('Invalid project ID');
        return;
      }

      updateMutation.mutate({
        projectId,
        notificationMode: mode,
      });
    },
    [projectId, updateMutation],
  );

  // Determine the current mode (prioritize optimistic update)
  const currentMode = optimisticMode || setting?.notificationMode;

  return {
    setting: setting
      ? {
          ...setting,
          notificationMode: currentMode || setting.notificationMode,
        }
      : undefined,
    isLoading,
    error: queryError as Error | null,
    updateSetting,
    isUpdating: updateMutation.isPending,
    optimisticMode,
  };
}
