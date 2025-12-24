import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';

import type { Database } from '@/lib/db';
import { projects } from '@/lib/db/schema';

export const ensurePublishedProject = async (
  db: Database,
  projectId: number,
): Promise<void> => {
  const project = await db.query.projects.findFirst({
    columns: {
      id: true,
      isPublished: true,
    },
    where: eq(projects.id, projectId),
  });

  if (!project) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
  }

  if (!project.isPublished) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Project is not published',
    });
  }
};
