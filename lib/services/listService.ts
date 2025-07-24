import { and, eq, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { db } from '@/lib/db';
import { listFollows, listProjects, lists } from '@/lib/db/schema';

export async function generateUniqueSlug(
  currentDb?: any,
  maxRetries: number = 5,
): Promise<string> {
  const dbToUse = currentDb ?? db;
  for (let i = 0; i < maxRetries; i++) {
    const slug = nanoid(10);
    const existing = await dbToUse.query.lists.findFirst({
      where: eq(lists.slug, slug),
    });
    if (!existing) {
      return slug;
    }
  }
  throw new Error('Failed to generate unique slug after maximum retries');
}

export async function updateListFollowCount(
  listId: number,
  currentDb?: any,
): Promise<void> {
  const dbToUse = currentDb ?? db;
  const followCountResult = await dbToUse
    .select({ count: sql<number>`count(*)::int` })
    .from(listFollows)
    .where(eq(listFollows.listId, listId));

  const followCount = followCountResult[0]?.count ?? 0;

  await dbToUse.update(lists).set({ followCount }).where(eq(lists.id, listId));
}

export function checkListAccess(
  list: {
    privacy: 'private' | 'public' | 'default';
    creator: { userId: string } | string;
  },
  userId?: string,
): boolean {
  // Public lists are accessible to everyone
  if (list.privacy === 'public') {
    return true;
  }

  // Default lists are only accessible to their owners
  if (list.privacy === 'default' || list.privacy === 'private') {
    const creatorId =
      typeof list.creator === 'string' ? list.creator : list.creator.userId;
    return creatorId === userId;
  }

  return false;
}

export function isListOwner(
  list: { creator: string },
  userId?: string,
): boolean {
  if (!userId) {
    return false;
  }
  return list.creator === userId;
}

export async function isProjectInList(
  listId: number,
  projectId: number,
  currentDb?: any,
): Promise<boolean> {
  const dbToUse = currentDb ?? db;
  const listProject = await dbToUse.query.listProjects.findFirst({
    where: and(
      eq(listProjects.listId, listId),
      eq(listProjects.projectId, projectId),
    ),
  });
  return !!listProject;
}

export async function getListProjectCount(
  listId: number,
  currentDb?: any,
): Promise<number> {
  const dbToUse = currentDb ?? db;
  const result = await dbToUse
    .select({ count: sql<number>`count(*)::int` })
    .from(listProjects)
    .where(eq(listProjects.listId, listId));

  return result[0]?.count ?? 0;
}

export async function isUserFollowingList(
  listId: number,
  userId: string,
  currentDb?: any,
): Promise<boolean> {
  const dbToUse = currentDb ?? db;
  const follow = await dbToUse.query.listFollows.findFirst({
    where: and(eq(listFollows.listId, listId), eq(listFollows.userId, userId)),
  });
  return !!follow;
}

export async function addDefaultListToUser(
  userId: string,
  currentDb?: any,
): Promise<void> {
  const dbToUse = currentDb ?? db;
  // Check if user already has a default list
  const defaultList = await dbToUse.query.lists.findFirst({
    where: and(eq(lists.creator, userId), eq(lists.privacy, 'default')),
  });
  if (!defaultList) {
    const slug = await generateUniqueSlug(db);
    await dbToUse.insert(lists).values({
      name: 'Bookmarked Projects (Default)',
      creator: userId,
      privacy: 'default',
      slug,
    });
  }
}
