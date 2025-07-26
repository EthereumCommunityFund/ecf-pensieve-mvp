import { eq } from 'drizzle-orm';
import { expect } from 'vitest';

import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';

export const publishProject = async (projectId: number) => {
  await db
    .update(projects)
    .set({ isPublished: true })
    .where(eq(projects.id, projectId));
};

export const createProjectWithUser = async (
  projectCaller: {
    createProject: (data: any) => Promise<{ id: number }>;
  },
  projectData: Record<string, any>,
  projectName: string,
) => {
  const project = await projectCaller.createProject({
    ...projectData,
    name: projectName,
  });
  await publishProject(project.id);
  return project;
};

export const expectProposalToBeLeading = (
  logs: Array<{ isNotLeading?: boolean; itemProposalId?: number }>,
  proposalId: number,
) => {
  const leadingLog = logs.find((log) => !log.isNotLeading);
  expect(leadingLog?.itemProposalId).toBe(proposalId);
};

export const expectNotificationOfType = (
  notifications: Array<{ type: string; itemProposalId?: number }>,
  type: string,
  itemProposalId?: number,
) => {
  const notification = notifications.find((n) => {
    if (itemProposalId) {
      return n.type === type && n.itemProposalId === itemProposalId;
    }
    return n.type === type;
  });
  expect(notification).toBeDefined();
  return notification;
};

export const getProjectTopWeight = async (projectId: number, key: string) => {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });
  return (project?.itemsTopWeight as Record<string, number>)?.[key] || 0;
};
