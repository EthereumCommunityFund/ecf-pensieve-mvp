import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { itemProposals, projects, voteRecords } from '@/lib/db/schema';

import type { NotificationType } from '../notification';

import { notificationCache } from './cache';

export interface NotificationRecipientContext {
  projectId: number;
  notificationType: NotificationType;
  userId: string;
  itemProposalId?: number;
}

export interface UserWithRole {
  userId: string;
  isProjectOwner?: boolean;
  isCreator?: boolean;
  isVoter?: boolean;
}

export async function getItemProposalContributors(
  itemProposalId: number,
): Promise<{ creator: string; voters: string[] }> {
  const cached = notificationCache.getItemProposalContributors(itemProposalId);
  if (cached) {
    return cached;
  }

  const itemProposal = await db.query.itemProposals.findFirst({
    where: eq(itemProposals.id, itemProposalId),
  });

  if (!itemProposal) {
    return { creator: '', voters: [] };
  }

  const voters = await db
    .selectDistinct({ creator: voteRecords.creator })
    .from(voteRecords)
    .where(eq(voteRecords.itemProposalId, itemProposalId));

  const result = {
    creator: itemProposal.creator,
    voters: voters.map((v) => v.creator),
  };

  notificationCache.setItemProposalContributors(itemProposalId, result);

  return result;
}

async function getProjectOwner(projectId: number): Promise<string | null> {
  let projectOwner = notificationCache.getProjectOwner(projectId);
  if (!projectOwner) {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
    });
    if (project?.creator) {
      projectOwner = project.creator;
      notificationCache.setProjectOwner(projectId, projectOwner);
    }
  }
  return projectOwner;
}

export async function getNotificationUsers(
  context: NotificationRecipientContext,
): Promise<UserWithRole[]> {
  const { projectId, notificationType, userId, itemProposalId } = context;
  const userRoleMap = new Map<string, UserWithRole>();

  const addUserWithRole = (uid: string, role: Partial<UserWithRole>) => {
    const existing = userRoleMap.get(uid) || { userId: uid };
    userRoleMap.set(uid, { ...existing, ...role });
  };

  switch (notificationType) {
    case 'createItemProposal': {
      const projectOwner = await getProjectOwner(projectId);
      if (projectOwner) {
        addUserWithRole(projectOwner, { isProjectOwner: true });
      }
      break;
    }

    case 'itemProposalSupported':
    case 'itemProposalBecameLeading':
    case 'itemProposalLostLeading': {
      const projectOwner = await getProjectOwner(projectId);
      if (projectOwner) {
        addUserWithRole(projectOwner, { isProjectOwner: true });
      }

      const contributors = await getItemProposalContributors(itemProposalId!);
      if (contributors.creator) {
        addUserWithRole(contributors.creator, { isCreator: true });
      }

      contributors.voters.forEach((voter) => {
        addUserWithRole(voter, { isVoter: true });
      });
      break;
    }

    default:
      addUserWithRole(userId, {});
  }

  return Array.from(userRoleMap.values());
}
