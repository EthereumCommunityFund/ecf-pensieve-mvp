'use client';

import { useCallback, useMemo } from 'react';

import { addToast } from '@/components/base';
import { useAuth } from '@/context/AuthContext';
import { trpc } from '@/lib/trpc/client';
import { CreateListRequest } from '@/types/bookmark';

export function useBookmark() {
  const { profile, showAuthPrompt } = useAuth();
  const utils = trpc.useUtils();

  // Query hooks
  const getUserListsWithProjectStatus = (
    projectId: number,
    enabled: boolean = true,
  ) => {
    return trpc.list.getUserListsWithProjectStatus.useQuery(
      { projectId },
      {
        enabled: enabled && !!profile,
        staleTime: 30 * 1000, // Data is fresh for 30 seconds
        gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
      },
    );
  };

  const isProjectBookmarked = (projectId: number) => {
    return trpc.list.isProjectBookmarked.useQuery(
      { projectId },
      {
        enabled: !!profile,
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
      },
    );
  };

  // Mutation hooks
  const createListMutation = trpc.list.createList.useMutation({
    onSuccess: async () => {
      await utils.list.getUserListsWithProjectStatus.invalidate();
    },
    onError: (error) => {
      addToast({
        title: 'Error',
        description: error.message || 'Failed to create list',
        color: 'danger',
      });
    },
  });

  const addProjectToListMutation = trpc.list.addProjectToList.useMutation({
    onSuccess: async (_, variables) => {
      await utils.list.getUserListsWithProjectStatus.invalidate({
        projectId: variables.projectId,
      });
      await utils.list.isProjectBookmarked.invalidate({
        projectId: variables.projectId,
      });
    },
    onError: (error) => {
      if (error.message?.includes('already in this list')) {
        addToast({
          title: 'Info',
          description: 'Project is already in this list',
          color: 'warning',
        });
      } else {
        addToast({
          title: 'Error',
          description: error.message || 'Failed to add project to list',
          color: 'danger',
        });
      }
    },
  });

  const removeProjectFromListMutation =
    trpc.list.removeProjectFromList.useMutation({
      onSuccess: async (_, variables) => {
        await utils.list.getUserListsWithProjectStatus.invalidate({
          projectId: variables.projectId,
        });
        await utils.list.isProjectBookmarked.invalidate({
          projectId: variables.projectId,
        });
      },
      onError: (error) => {
        addToast({
          title: 'Error',
          description: error.message || 'Failed to remove project from list',
          color: 'danger',
        });
      },
    });

  // Action handlers
  const handleCreateList = useCallback(
    async (data: CreateListRequest) => {
      if (!profile) {
        showAuthPrompt();
        return;
      }
      return createListMutation.mutateAsync(data);
    },
    [profile, showAuthPrompt, createListMutation],
  );

  const handleAddProjectToList = useCallback(
    async (listId: number, projectId: number) => {
      if (!profile) {
        showAuthPrompt();
        return;
      }
      return addProjectToListMutation.mutateAsync({ listId, projectId });
    },
    [profile, showAuthPrompt, addProjectToListMutation],
  );

  const handleRemoveProjectFromList = useCallback(
    async (listId: number, projectId: number) => {
      if (!profile) {
        showAuthPrompt();
        return;
      }
      return removeProjectFromListMutation.mutateAsync({ listId, projectId });
    },
    [profile, showAuthPrompt, removeProjectFromListMutation],
  );

  // Loading states
  const isLoading = useMemo(
    () =>
      createListMutation.isPending ||
      addProjectToListMutation.isPending ||
      removeProjectFromListMutation.isPending,
    [
      createListMutation.isPending,
      addProjectToListMutation.isPending,
      removeProjectFromListMutation.isPending,
    ],
  );

  return {
    // Query hooks
    getUserListsWithProjectStatus,
    isProjectBookmarked,

    // Actions
    handleCreateList,
    handleAddProjectToList,
    handleRemoveProjectFromList,

    // States
    isLoading,

    // Direct mutation access for special cases
    createListMutation,
    addProjectToListMutation,
    removeProjectFromListMutation,
  };
}
