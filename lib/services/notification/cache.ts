import { LRUCache } from 'lru-cache';

import type { NotificationMode } from './filter';

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

class NotificationCache {
  private userSettingsCache: LRUCache<string, CacheEntry<NotificationMode>>;
  private projectOwnersCache: LRUCache<number, CacheEntry<string>>;
  private itemProposalContributorsCache: LRUCache<
    number,
    CacheEntry<{ creator: string; voters: string[] }>
  >;

  constructor() {
    this.userSettingsCache = new LRUCache<string, CacheEntry<NotificationMode>>(
      {
        max: 500,
        ttl: 1000 * 60 * 3,
      },
    );

    this.projectOwnersCache = new LRUCache<number, CacheEntry<string>>({
      max: 100,
      ttl: 1000 * 60 * 3,
    });

    this.itemProposalContributorsCache = new LRUCache<
      number,
      CacheEntry<{ creator: string; voters: string[] }>
    >({
      max: 200,
      ttl: 1000 * 60 * 3,
    });
  }

  getUserSetting(userId: string, projectId: number): NotificationMode | null {
    const key = `${userId}:${projectId}`;
    const entry = this.userSettingsCache.get(key);
    return entry?.value ?? null;
  }

  setUserSetting(
    userId: string,
    projectId: number,
    mode: NotificationMode,
  ): void {
    const key = `${userId}:${projectId}`;
    this.userSettingsCache.set(key, {
      value: mode,
      timestamp: Date.now(),
    });
  }

  invalidateUserSettings(projectId: number): void {
    for (const key of this.userSettingsCache.keys()) {
      if (key.endsWith(`:${projectId}`)) {
        this.userSettingsCache.delete(key);
      }
    }
  }

  getProjectOwner(projectId: number): string | null {
    const entry = this.projectOwnersCache.get(projectId);
    return entry?.value ?? null;
  }

  setProjectOwner(projectId: number, owner: string): void {
    this.projectOwnersCache.set(projectId, {
      value: owner,
      timestamp: Date.now(),
    });
  }

  getItemProposalContributors(
    itemProposalId: number,
  ): { creator: string; voters: string[] } | null {
    const entry = this.itemProposalContributorsCache.get(itemProposalId);
    return entry?.value ?? null;
  }

  setItemProposalContributors(
    itemProposalId: number,
    contributors: { creator: string; voters: string[] },
  ): void {
    this.itemProposalContributorsCache.set(itemProposalId, {
      value: contributors,
      timestamp: Date.now(),
    });
  }

  clearAll(): void {
    this.userSettingsCache.clear();
    this.projectOwnersCache.clear();
    this.itemProposalContributorsCache.clear();
  }

  getStats() {
    return {
      userSettings: {
        size: this.userSettingsCache.size,
        capacity: this.userSettingsCache.max,
      },
      projectOwners: {
        size: this.projectOwnersCache.size,
        capacity: this.projectOwnersCache.max,
      },
      itemProposalContributors: {
        size: this.itemProposalContributorsCache.size,
        capacity: this.itemProposalContributorsCache.max,
      },
    };
  }
}

export const notificationCache = new NotificationCache();
