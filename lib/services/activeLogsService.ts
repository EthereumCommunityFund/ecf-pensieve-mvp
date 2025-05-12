import { db } from '@/lib/db';
import { activeLogs } from '@/lib/db/schema';

export enum LogType {
  PROPOSAL = 'proposal',
  VOTE = 'vote',
}

export enum LogAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export async function addActiveLog(
  userId: string,
  action: string,
  type: string,
  targetId: number,
  projectId?: number,
) {
  try {
    const [insertedLog] = await db
      .insert(activeLogs)
      .values({
        userId,
        action,
        type,
        targetId,
        projectId,
      })
      .returning();

    return insertedLog;
  } catch (error) {
    console.error('addActiveLog error:', error);
    throw new Error('addActiveLog error');
  }
}

const createLogActions = (type: LogType) => ({
  create: (userId: string, targetId: number, projectId?: number) =>
    addActiveLog(userId, LogAction.CREATE, type, targetId, projectId),
  update: (userId: string, targetId: number, projectId?: number) =>
    addActiveLog(userId, LogAction.UPDATE, type, targetId, projectId),
  delete: (userId: string, targetId: number, projectId?: number) =>
    addActiveLog(userId, LogAction.DELETE, type, targetId, projectId),
});

export const logUserActivity = {
  proposal: createLogActions(LogType.PROPOSAL),
  vote: createLogActions(LogType.VOTE),
};
