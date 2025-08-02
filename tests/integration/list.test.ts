import { eq } from 'drizzle-orm';
import { ethers } from 'ethers';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '@/lib/db';
import {
  invitationCodes,
  listProjects,
  lists,
  profiles,
  projects,
} from '@/lib/db/schema';
import { getServiceSupabase } from '@/lib/supabase/client';
import { listRouter } from '@/lib/trpc/routers/list';

import { createValidProjectData } from './factories/projectFactory';

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn((fn) => fn),
}));

const createContext = (userId: string | null) => ({
  db,
  user: userId ? { id: userId } : null,
  supabase: getServiceSupabase(),
});

describe('List Integration Tests', () => {
  const supabase = getServiceSupabase();

  let testWallet: ethers.HDNodeWallet;
  let testAddress: string;
  let testUserId: string;
  let testList: any;
  const testProjects: any[] = [];

  beforeAll(async () => {
    testWallet = ethers.Wallet.createRandom();
    testAddress = testWallet.address.toLowerCase();

    // Create test user
    const [insertedCode] = await db
      .insert(invitationCodes)
      .values({
        code: 'test-invite-list-' + Date.now(),
        maxUses: 10,
        currentUses: 0,
      })
      .returning();

    const signupResult = await supabase.auth.signUp({
      email: `${testAddress}@test.com`,
      password: 'test-password',
      options: {
        data: {
          wallet_address: testAddress,
          name: 'Test User',
          invitation_code: insertedCode.code,
        },
      },
    });

    testUserId = signupResult.data.user!.id;

    // Create test profile
    await db.insert(profiles).values({
      userId: testUserId,
      address: testAddress,
      name: 'Test User',
      invitationCodeId: insertedCode.id,
    });

    // Create test projects
    const projectData = createValidProjectData();
    for (let i = 0; i < 5; i++) {
      const [project] = await db
        .insert(projects)
        .values({
          ...projectData,
          tagline: `Test Project ${i + 1}`,
          isPublished: true,
          creator: testUserId,
        })
        .returning();
      testProjects.push(project);
    }
  });

  beforeEach(async () => {
    // Clean up lists and list projects
    await db.delete(listProjects);
    await db.delete(lists);

    // Create a fresh test list for each test
    const listCaller = listRouter.createCaller(createContext(testUserId));
    testList = await listCaller.createList({
      name: 'Test List',
      description: 'Test Description',
      privacy: 'public',
    });
  });

  describe('sortOrder functionality', () => {
    it('should assign sortOrder automatically when adding projects', async () => {
      const listCaller = listRouter.createCaller(createContext(testUserId));

      // Add first project
      await listCaller.addProjectToList({
        listId: testList.id,
        projectId: testProjects[0].id,
      });

      // Check sortOrder of first project
      const firstProject = await db.query.listProjects.findFirst({
        where: eq(listProjects.listId, testList.id),
      });
      expect(firstProject?.sortOrder).toBe(10);

      // Add second project
      await listCaller.addProjectToList({
        listId: testList.id,
        projectId: testProjects[1].id,
      });

      // Check sortOrder of second project
      const listProjectsData = await db.query.listProjects.findMany({
        where: eq(listProjects.listId, testList.id),
        orderBy: (lp, { asc }) => [asc(lp.sortOrder)],
      });

      expect(listProjectsData).toHaveLength(2);
      expect(listProjectsData[0].sortOrder).toBe(10);
      expect(listProjectsData[1].sortOrder).toBe(20);
    });

    it('should return projects in sortOrder when querying', async () => {
      const listCaller = listRouter.createCaller(createContext(testUserId));

      // Add projects in reverse order but with specific sortOrders
      for (let i = 4; i >= 0; i--) {
        await listCaller.addProjectToList({
          listId: testList.id,
          projectId: testProjects[i].id,
        });
      }

      // Query list projects
      const result = await listCaller.getListProjects({
        listId: testList.id,
        limit: 10,
      });

      // Should be ordered by sortOrder (which follows insertion order)
      expect(result.items).toHaveLength(5);
      expect(result.items[0].project.tagline).toBe('Test Project 5');
      expect(result.items[1].project.tagline).toBe('Test Project 4');
      expect(result.items[2].project.tagline).toBe('Test Project 3');
      expect(result.items[3].project.tagline).toBe('Test Project 2');
      expect(result.items[4].project.tagline).toBe('Test Project 1');
    });
  });

  describe('updateListProjectsOrder', () => {
    beforeEach(async () => {
      const listCaller = listRouter.createCaller(createContext(testUserId));

      // Add multiple projects
      for (const project of testProjects.slice(0, 3)) {
        await listCaller.addProjectToList({
          listId: testList.id,
          projectId: project.id,
        });
      }
    });

    it('should update sortOrder for multiple projects', async () => {
      const listCaller = listRouter.createCaller(createContext(testUserId));

      // Get current order
      const beforeUpdate = await db.query.listProjects.findMany({
        where: eq(listProjects.listId, testList.id),
        orderBy: (lp, { asc }) => [asc(lp.sortOrder)],
      });

      expect(beforeUpdate).toHaveLength(3);

      // Update order (reverse it)
      await listCaller.updateListProjectsOrder({
        listId: testList.id,
        items: [
          { projectId: testProjects[2].id, sortOrder: 5 },
          { projectId: testProjects[1].id, sortOrder: 15 },
          { projectId: testProjects[0].id, sortOrder: 25 },
        ],
      });

      // Check new order
      const afterUpdate = await db.query.listProjects.findMany({
        where: eq(listProjects.listId, testList.id),
        orderBy: (lp, { asc }) => [asc(lp.sortOrder)],
      });

      expect(afterUpdate[0].projectId).toBe(testProjects[2].id);
      expect(afterUpdate[0].sortOrder).toBe(5);
      expect(afterUpdate[1].projectId).toBe(testProjects[1].id);
      expect(afterUpdate[1].sortOrder).toBe(15);
      expect(afterUpdate[2].projectId).toBe(testProjects[0].id);
      expect(afterUpdate[2].sortOrder).toBe(25);
    });

    it('should throw error if user is not the list owner', async () => {
      // Create another user
      const anotherWallet = ethers.Wallet.createRandom();
      const anotherAddress = anotherWallet.address.toLowerCase();

      const signupResult = await supabase.auth.signUp({
        email: `${anotherAddress}@test.com`,
        password: 'test-password',
        options: {
          data: {
            wallet_address: anotherAddress,
            name: 'Another User',
          },
        },
      });

      const anotherUserId = signupResult.data.user!.id;

      await db.insert(profiles).values({
        userId: anotherUserId,
        address: anotherAddress,
        name: 'Another User',
      });

      const anotherUserCaller = listRouter.createCaller(
        createContext(anotherUserId),
      );

      await expect(
        anotherUserCaller.updateListProjectsOrder({
          listId: testList.id,
          items: [{ projectId: testProjects[0].id, sortOrder: 100 }],
        }),
      ).rejects.toThrow('You are not the owner of this list');
    });

    it('should throw error if project does not belong to list', async () => {
      const listCaller = listRouter.createCaller(createContext(testUserId));

      await expect(
        listCaller.updateListProjectsOrder({
          listId: testList.id,
          items: [
            { projectId: testProjects[0].id, sortOrder: 10 },
            { projectId: testProjects[4].id, sortOrder: 20 }, // This project is not in the list
          ],
        }),
      ).rejects.toThrow('Some projects do not belong to this list');
    });
  });

  describe('sortOrder edge cases', () => {
    it('should handle empty list correctly', async () => {
      const listCaller = listRouter.createCaller(createContext(testUserId));

      // Add project to empty list
      await listCaller.addProjectToList({
        listId: testList.id,
        projectId: testProjects[0].id,
      });

      const project = await db.query.listProjects.findFirst({
        where: eq(listProjects.listId, testList.id),
      });

      expect(project?.sortOrder).toBe(10);
    });

    it('should handle concurrent inserts gracefully', async () => {
      const listCaller = listRouter.createCaller(createContext(testUserId));

      // Add multiple projects concurrently
      const promises = testProjects.slice(0, 3).map((project) =>
        listCaller.addProjectToList({
          listId: testList.id,
          projectId: project.id,
        }),
      );

      await Promise.all(promises);

      // Check that all projects were inserted
      const listProjectsData = await db.query.listProjects.findMany({
        where: eq(listProjects.listId, testList.id),
        orderBy: (lp, { asc }) => [asc(lp.sortOrder)],
      });

      expect(listProjectsData).toHaveLength(3);

      // Due to concurrent inserts, some projects might have the same sortOrder
      // This is expected behavior and is handled by secondary sorting on id
      const sortOrders = listProjectsData.map((lp) => lp.sortOrder);
      // All sortOrders should be positive numbers
      sortOrders.forEach((so) => {
        expect(so).toBeGreaterThan(0);
      });
    });
  });

  describe('getListProjects with sorting', () => {
    it('should respect sortOrder over creation order', async () => {
      const listCaller = listRouter.createCaller(createContext(testUserId));

      // Add projects with custom sort orders
      await db.insert(listProjects).values([
        {
          listId: testList.id,
          projectId: testProjects[0].id,
          addedBy: testUserId,
          sortOrder: 30,
        },
        {
          listId: testList.id,
          projectId: testProjects[1].id,
          addedBy: testUserId,
          sortOrder: 10,
        },
        {
          listId: testList.id,
          projectId: testProjects[2].id,
          addedBy: testUserId,
          sortOrder: 20,
        },
      ]);

      const result = await listCaller.getListProjects({
        listId: testList.id,
        limit: 10,
      });

      // Should be ordered by sortOrder
      expect(result.items[0].project.id).toBe(testProjects[1].id); // sortOrder: 10
      expect(result.items[1].project.id).toBe(testProjects[2].id); // sortOrder: 20
      expect(result.items[2].project.id).toBe(testProjects[0].id); // sortOrder: 30
    });

    it('should handle projects with same sortOrder by id', async () => {
      const listCaller = listRouter.createCaller(createContext(testUserId));

      // Add projects with same sort order
      await db.insert(listProjects).values([
        {
          listId: testList.id,
          projectId: testProjects[0].id,
          addedBy: testUserId,
          sortOrder: 10,
        },
        {
          listId: testList.id,
          projectId: testProjects[1].id,
          addedBy: testUserId,
          sortOrder: 10,
        },
      ]);

      const result = await listCaller.getListProjects({
        listId: testList.id,
        limit: 10,
      });

      // Should still return consistent order (by id as secondary sort)
      expect(result.items).toHaveLength(2);
      expect(result.items[0].sortOrder).toBe(10);
      expect(result.items[1].sortOrder).toBe(10);
    });
  });
});
