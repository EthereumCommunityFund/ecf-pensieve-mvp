import { and, eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import {
  itemProposals,
  profiles,
  projects,
  proposals,
  voteRecords,
} from '@/lib/db/schema';

import type { NotificationType } from '../notification';

export async function getProjectParticipants(
  projectId: number,
): Promise<string[]> {
  const participants = new Set<string>();

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });
  if (project?.creator) {
    participants.add(project.creator);
  }

  const proposalCreators = await db
    .selectDistinct({ creator: proposals.creator })
    .from(proposals)
    .where(eq(proposals.projectId, projectId));

  proposalCreators.forEach((p) => {
    if (p.creator) participants.add(p.creator);
  });

  const itemProposalCreators = await db
    .selectDistinct({ userId: profiles.userId })
    .from(itemProposals)
    .innerJoin(profiles, eq(itemProposals.creator, profiles.userId))
    .where(eq(itemProposals.projectId, projectId));

  itemProposalCreators.forEach((p) => {
    if (p.userId) participants.add(p.userId);
  });

  const voters = await db
    .selectDistinct({ creator: voteRecords.creator })
    .from(voteRecords)
    .where(eq(voteRecords.projectId, projectId));

  voters.forEach((v) => {
    if (v.creator) participants.add(v.creator);
  });

  return Array.from(participants);
}

export async function getFieldVoters(
  projectId: number,
  key: string,
): Promise<string[]> {
  const voters = await db
    .selectDistinct({ creator: voteRecords.creator })
    .from(voteRecords)
    .where(and(eq(voteRecords.projectId, projectId), eq(voteRecords.key, key)));

  return voters.map((v) => v.creator).filter(Boolean) as string[];
}

export async function getItemProposalContributors(
  itemProposalId: number,
): Promise<{ creator: string; voters: string[]; key: string }> {
  const itemProposal = await db.query.itemProposals.findFirst({
    where: eq(itemProposals.id, itemProposalId),
    with: {
      creator: true,
    },
  });

  if (!itemProposal) {
    return { creator: '', voters: [], key: '' };
  }

  const voters = await db
    .selectDistinct({ creator: voteRecords.creator })
    .from(voteRecords)
    .where(eq(voteRecords.itemProposalId, itemProposalId));

  return {
    creator: itemProposal.creator.userId,
    voters: voters.map((v) => v.creator).filter(Boolean) as string[],
    key: itemProposal.key,
  };
}

export interface NotificationRecipientContext {
  projectId: number;
  notificationType: NotificationType;
  originalRecipient: string;
  relatedUserId?: string;
  metadata?: {
    key?: string;
    itemProposalId?: number;
    proposalId?: number;
  };
}

export async function getNotificationRecipients(
  context: NotificationRecipientContext,
): Promise<string[]> {
  const {
    projectId,
    notificationType,
    originalRecipient,
    relatedUserId,
    metadata,
  } = context;

  switch (notificationType) {
    case 'itemProposalSupported':
      return [originalRecipient];

    case 'itemProposalBecameLeading':
    case 'itemProposalLostLeading':
      if (metadata?.key) {
        const voters = await getFieldVoters(projectId, metadata.key);
        const recipientsSet = new Set([originalRecipient, ...voters]);
        return Array.from(recipientsSet);
      }
      return [originalRecipient];

    case 'itemProposalPass':
      const allParticipants = await getProjectParticipants(projectId);
      return allParticipants;

    case 'itemProposalPassed':
      if (metadata?.key) {
        const voters = await getFieldVoters(projectId, metadata.key);
        return voters;
      }
      return [originalRecipient];

    default:
      return [originalRecipient];
  }
}

export async function batchGetNotificationRecipients(
  contexts: NotificationRecipientContext[],
): Promise<Map<number, string[]>> {
  const results = new Map<number, string[]>();

  for (let i = 0; i < contexts.length; i++) {
    const recipients = await getNotificationRecipients(contexts[i]);
    results.set(i, recipients);
  }

  return results;
}
