import { db } from '@/lib/db';
import { activeLogs } from '@/lib/db/schema';

export enum LogType {
  PROJECT = 'project',
  PROPOSAL = 'proposal',
  VOTE = 'vote',
  ITEM_PROPOSAL = 'item_proposal',
}

export enum LogAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export type LogItem = {
  field: string;
  oldValue?: any;
  newValue?: any;
};

type LogData = {
  userId: string;
  action: LogAction;
  type: LogType;
  targetId: number;
  projectId?: number;
  items?: LogItem[];
  proposalCreatorId?: string;
};

export async function addActiveLog({
  userId,
  action,
  type,
  targetId,
  projectId,
  items,
  proposalCreatorId,
}: LogData) {
  try {
    const [insertedLog] = await db
      .insert(activeLogs)
      .values({
        userId,
        action,
        type,
        targetId,
        projectId,
        items,
        proposalCreatorId,
      })
      .returning();

    return insertedLog;
  } catch (error) {
    console.error('addActiveLog error:', error);
    throw new Error('addActiveLog error');
  }
}

const createLogActions = (type: LogType) => ({
  create: (data: Omit<LogData, 'type' | 'action'>) =>
    addActiveLog({
      ...data,
      type,
      action: LogAction.CREATE,
    }),
  update: (data: Omit<LogData, 'type' | 'action'>) =>
    addActiveLog({
      ...data,
      type,
      action: LogAction.UPDATE,
    }),
  delete: (data: Omit<LogData, 'type' | 'action'>) =>
    addActiveLog({
      ...data,
      type,
      action: LogAction.DELETE,
    }),
});

export const logUserActivity = {
  project: createLogActions(LogType.PROJECT),
  proposal: createLogActions(LogType.PROPOSAL),
  vote: createLogActions(LogType.VOTE),
  itemProposal: createLogActions(LogType.ITEM_PROPOSAL),
};
