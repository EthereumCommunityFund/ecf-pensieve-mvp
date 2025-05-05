import { db } from '@/lib/db';
import { activeLogs } from '@/lib/db/schema/activeLogs';

export enum LogType {
  PROJECT = 'project',
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
) {
  try {
    const [insertedLog] = await db
      .insert(activeLogs)
      .values({
        userId,
        action,
        type,
        targetId,
      })
      .returning();

    return insertedLog;
  } catch (error) {
    console.error('addActiveLog error:', error);
    throw new Error('addActiveLog error');
  }
}

const createLogActions = (type: LogType) => ({
  create: (userId: string, targetId: number) =>
    addActiveLog(userId, LogAction.CREATE, type, targetId),
  update: (userId: string, targetId: number) =>
    addActiveLog(userId, LogAction.UPDATE, type, targetId),
  delete: (userId: string, targetId: number) =>
    addActiveLog(userId, LogAction.DELETE, type, targetId),
});

export const logUserActivity = {
  project: createLogActions(LogType.PROJECT),
  proposal: createLogActions(LogType.PROPOSAL),
  vote: createLogActions(LogType.VOTE),
};
