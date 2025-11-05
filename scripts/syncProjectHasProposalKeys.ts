#!/usr/bin/env tsx

import { config } from 'dotenv';

config();

import { eq } from 'drizzle-orm';

import { db } from '../lib/db';
import { itemProposals, projects } from '../lib/db/schema';

type ProjectRecord = {
  id: number;
  hasProposalKeys: string[] | null;
};

type ProposalKeyRecord = {
  projectId: number;
  key: string | null;
};

function toSortedArray(values: Iterable<string>): string[] {
  return Array.from(values)
    .filter((value) => value !== '')
    .sort();
}

function areArraysEqual(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return false;
    }
  }

  return true;
}

async function syncProjectHasProposalKeys() {
  console.log('🔍 开始扫描项目 hasProposalKeys 与 itemProposals 是否一致...');

  const [projectRows, proposalRows] = await Promise.all([
    db
      .select({
        id: projects.id,
        hasProposalKeys: projects.hasProposalKeys,
      })
      .from(projects),
    db
      .select({
        projectId: itemProposals.projectId,
        key: itemProposals.key,
      })
      .from(itemProposals),
  ]);

  const projectsMap = projectRows as ProjectRecord[];
  const proposalRecords = proposalRows as ProposalKeyRecord[];

  const proposalKeysByProject = new Map<number, Set<string>>();

  for (const proposal of proposalRecords) {
    if (!proposal.key) {
      continue;
    }

    if (!proposalKeysByProject.has(proposal.projectId)) {
      proposalKeysByProject.set(proposal.projectId, new Set());
    }

    proposalKeysByProject.get(proposal.projectId)!.add(proposal.key);
  }

  let updatedCount = 0;
  let skippedCount = 0;

  for (const project of projectsMap) {
    const recordedKeys = new Set(project.hasProposalKeys ?? []);
    const actualKeys = proposalKeysByProject.get(project.id) ?? new Set();

    const recordedSorted = toSortedArray(recordedKeys);
    const actualSorted = toSortedArray(actualKeys);

    if (areArraysEqual(recordedSorted, actualSorted)) {
      skippedCount += 1;
      continue;
    }

    console.log(
      `📌 项目 ${project.id}: hasProposalKeys=${JSON.stringify(
        recordedSorted,
      )} -> ${JSON.stringify(actualSorted)}`,
    );

    await db
      .update(projects)
      .set({ hasProposalKeys: actualSorted })
      .where(eq(projects.id, project.id));

    updatedCount += 1;
  }

  console.log('✅ 同步完成');
  console.log(`   已更新项目数量：${updatedCount}`);
  console.log(`   无需更新项目数量：${skippedCount}`);
}

if (require.main === module) {
  syncProjectHasProposalKeys()
    .then(() => {
      console.log('🚀 脚本执行成功');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 脚本执行失败:', error);
      process.exit(1);
    });
}

export { syncProjectHasProposalKeys };
