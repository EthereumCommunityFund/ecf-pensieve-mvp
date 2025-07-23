import { TRPCError } from '@trpc/server';
import { and, desc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';

import { listFollows, listProjects, lists, projects } from '@/lib/db/schema';
import {
  checkListAccess,
  generateUniqueSlug,
  isListOwner,
  isUserFollowingList,
  updateListFollowCount,
} from '@/lib/services/listService';

import { protectedProcedure, publicProcedure, router } from '../server';

export const listRouter = router({
  getUserLists: protectedProcedure.query(async ({ ctx }) => {
    try {
      const items = await ctx.db.query.lists.findMany({
        where: eq(lists.creator, ctx.user.id),
        orderBy: [desc(lists.createdAt)],
      });

      return items;
    } catch (error) {
      console.error('Failed to get user lists:', {
        userId: ctx.user.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get user lists',
      });
    }
  }),

  getListBySlug: publicProcedure
    .input(
      z.object({
        slug: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const list = await ctx.db.query.lists.findFirst({
          where: eq(lists.slug, input.slug),
          with: {
            creator: {
              columns: {
                name: true,
                avatarUrl: true,
              },
            },
          },
        });

        if (!list) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'List not found',
          });
        }

        if (!checkListAccess(list, ctx.user?.id)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to access this list',
          });
        }

        const isFollowing = ctx.user?.id
          ? await isUserFollowingList(list.id, ctx.user.id, ctx.db)
          : false;

        return {
          ...list,
          isFollowing,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Failed to get list:', {
          slug: input.slug,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get list',
        });
      }
    }),

  getListProjects: publicProcedure
    .input(
      z.union([
        z.object({
          listId: z.number(),
          limit: z.number().min(1).max(100).default(20),
          cursor: z.number().optional(),
        }),
        z.object({
          slug: z.string(),
          limit: z.number().min(1).max(100).default(20),
          cursor: z.number().optional(),
        }),
      ]),
    )
    .query(async ({ ctx, input }) => {
      try {
        const { limit, cursor } = input;
        const listId = 'listId' in input ? input.listId : undefined;
        const slug = 'slug' in input ? input.slug : undefined;

        let whereCondition;
        if (listId) {
          whereCondition = eq(lists.id, listId);
        } else if (slug) {
          whereCondition = eq(lists.slug, slug);
        }

        const list = await ctx.db.query.lists.findFirst({
          where: whereCondition!,
        });

        if (!list) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'List not found',
          });
        }

        if (!checkListAccess(list, ctx.user?.id)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to access this list',
          });
        }

        const conditions = [eq(listProjects.listId, list.id)];
        if (cursor) {
          conditions.push(sql`${listProjects.id} < ${cursor}`);
        }

        const items = await ctx.db.query.listProjects.findMany({
          where: and(...conditions),
          orderBy: [desc(listProjects.id)],
          limit: limit + 1,
          with: {
            project: {
              with: {
                creator: {
                  columns: {
                    name: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        });

        let nextCursor: number | undefined = undefined;
        if (items.length > limit) {
          const nextItem = items.pop();
          nextCursor = nextItem?.id;
        }

        return {
          items,
          nextCursor,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get list projects',
        });
      }
    }),

  getUserFollowedLists: protectedProcedure.query(async ({ ctx }) => {
    try {
      const items = await ctx.db.query.listFollows.findMany({
        where: eq(listFollows.userId, ctx.user.id),
        orderBy: [desc(listFollows.createdAt)],
        with: {
          list: {
            with: {
              creator: {
                columns: {
                  name: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      });

      return items.map((item) => item.list);
    } catch (error) {
      console.error('Failed to get user followed lists:', {
        userId: ctx.user.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get user followed lists',
      });
    }
  }),

  createList: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, 'List name cannot be empty'),
        description: z.string().optional(),
        privacy: z.enum(['private', 'public']),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.transaction(async (tx) => {
          const slug = await generateUniqueSlug(tx);

          const { name, description, privacy } = input;

          const [list] = await tx
            .insert(lists)
            .values({
              name,
              description,
              privacy,
              creator: ctx.user.id,
              slug,
            })
            .returning();

          return list;
        });
      } catch (error) {
        console.error('Failed to create list:', {
          userId: ctx.user.id,
          input,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create list',
        });
      }
    }),

  updateList: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        privacy: z.enum(['private', 'public']).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, name, description, privacy } = input;
        const list = await ctx.db.query.lists.findFirst({
          where: eq(lists.id, id),
        });

        if (!list) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'List not found',
          });
        }

        if (!isListOwner(list, ctx.user.id)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You are not the owner of this list',
          });
        }

        const updateData: Partial<typeof input> = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (privacy !== undefined) updateData.privacy = privacy;

        if (Object.keys(updateData).length === 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'No fields to update',
          });
        }

        const [updatedList] = await ctx.db
          .update(lists)
          .set(updateData)
          .where(eq(lists.id, id))
          .returning();

        return updatedList;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Failed to update list:', {
          userId: ctx.user.id,
          listId: input.id,
          input,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update list',
        });
      }
    }),

  deleteList: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { id } = input;
        const list = await ctx.db.query.lists.findFirst({
          where: eq(lists.id, id),
        });

        if (!list) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'List not found',
          });
        }

        if (!isListOwner(list, ctx.user.id)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You are not the owner of this list',
          });
        }

        await ctx.db.delete(lists).where(eq(lists.id, id));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Failed to delete list:', {
          userId: ctx.user.id,
          listId: input.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete list',
        });
      }
    }),

  addProjectToList: protectedProcedure
    .input(
      z.object({
        listId: z.number(),
        projectId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.transaction(async (tx) => {
          const { listId, projectId } = input;
          const list = await tx.query.lists.findFirst({
            where: eq(lists.id, listId),
          });

          if (!list) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'List not found',
            });
          }

          if (!isListOwner(list, ctx.user.id)) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'You are not the owner of this list',
            });
          }

          const project = await tx.query.projects.findFirst({
            where: eq(projects.id, projectId),
          });

          if (!project) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Project not found',
            });
          }

          const existingListProject = await tx.query.listProjects.findFirst({
            where: and(
              eq(listProjects.listId, listId),
              eq(listProjects.projectId, projectId),
            ),
          });

          if (existingListProject) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Project is already in this list',
            });
          }

          const [listProject] = await tx
            .insert(listProjects)
            .values({
              listId,
              projectId,
              addedBy: ctx.user.id,
            })
            .returning();

          return listProject;
        });
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Failed to add project to list:', {
          userId: ctx.user.id,
          listId: input.listId,
          projectId: input.projectId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add project to list',
        });
      }
    }),

  removeProjectFromList: protectedProcedure
    .input(
      z.object({
        listId: z.number(),
        projectId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { listId, projectId } = input;
        const list = await ctx.db.query.lists.findFirst({
          where: eq(lists.id, listId),
        });

        if (!list) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'List not found',
          });
        }

        if (!isListOwner(list, ctx.user.id)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You are not the owner of this list',
          });
        }

        await ctx.db
          .delete(listProjects)
          .where(
            and(
              eq(listProjects.listId, listId),
              eq(listProjects.projectId, projectId),
            ),
          );

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Failed to remove project from list:', {
          userId: ctx.user.id,
          listId: input.listId,
          projectId: input.projectId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove project from list',
        });
      }
    }),

  followList: protectedProcedure
    .input(
      z.object({
        listId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.transaction(async (tx) => {
          const { listId } = input;
          const list = await tx.query.lists.findFirst({
            where: eq(lists.id, listId),
          });

          if (!list) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'List not found',
            });
          }

          if (list.privacy === 'private') {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Cannot follow private list',
            });
          }

          if (list.creator === ctx.user.id) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Cannot follow your own list',
            });
          }

          const existingFollow = await tx.query.listFollows.findFirst({
            where: and(
              eq(listFollows.listId, listId),
              eq(listFollows.userId, ctx.user.id),
            ),
          });

          if (existingFollow) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'You are already following this list',
            });
          }

          const [follow] = await tx
            .insert(listFollows)
            .values({
              listId,
              userId: ctx.user.id,
            })
            .returning();

          await updateListFollowCount(listId, tx);

          return follow;
        });
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Failed to follow list:', {
          userId: ctx.user.id,
          listId: input.listId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to follow list',
        });
      }
    }),

  unfollowList: protectedProcedure
    .input(
      z.object({
        listId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.transaction(async (tx) => {
          const { listId } = input;
          const existingFollow = await tx.query.listFollows.findFirst({
            where: and(
              eq(listFollows.listId, listId),
              eq(listFollows.userId, ctx.user.id),
            ),
          });

          if (!existingFollow) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'You are not following this list',
            });
          }

          await tx
            .delete(listFollows)
            .where(
              and(
                eq(listFollows.listId, listId),
                eq(listFollows.userId, ctx.user.id),
              ),
            );

          await updateListFollowCount(listId, tx);

          return { success: true };
        });
      } catch (error) {
        console.error('Failed to unfollow list:', {
          userId: ctx.user.id,
          listId: input.listId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to unfollow list',
        });
      }
    }),

  isProjectBookmarked: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const { projectId } = input;

        // First get all user's lists
        const userLists = await ctx.db.query.lists.findMany({
          where: eq(lists.creator, ctx.user.id),
          columns: {
            id: true,
          },
        });

        if (userLists.length === 0) {
          return {
            isBookmarked: false,
            listId: undefined,
          };
        }

        // Check if project exists in any of the user's lists
        const bookmarkedList = await ctx.db.query.listProjects.findFirst({
          where: and(
            eq(listProjects.projectId, projectId),
            sql`${listProjects.listId} IN (${sql.join(
              userLists.map((list) => sql`${list.id}`),
              sql`, `,
            )})`,
          ),
        });

        return {
          isBookmarked: !!bookmarkedList,
          listId: bookmarkedList?.listId,
        };
      } catch (error) {
        console.error('Failed to check project bookmark status:', {
          userId: ctx.user.id,
          projectId: input.projectId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to check project bookmark status',
        });
      }
    }),

  getUserListsWithProjectStatus: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const { projectId } = input;

        // Get all user lists
        const userLists = await ctx.db.query.lists.findMany({
          where: eq(lists.creator, ctx.user.id),
          orderBy: [desc(lists.createdAt)],
        });

        if (userLists.length === 0) {
          return [];
        }

        // Get all list-project relationships for this user's lists and this project
        const listProjectRelations = await ctx.db.query.listProjects.findMany({
          where: and(
            eq(listProjects.projectId, projectId),
            sql`${listProjects.listId} IN (${sql.join(
              userLists.map((list) => sql`${list.id}`),
              sql`, `,
            )})`,
          ),
        });

        // Create a Set of list IDs that contain the project
        const listsWithProject = new Set(
          listProjectRelations.map((lp) => lp.listId),
        );

        // Return lists with project status
        return userLists.map((list) => ({
          ...list,
          isProjectInList: listsWithProject.has(list.id),
        }));
      } catch (error) {
        console.error('Failed to get user lists with project status:', {
          userId: ctx.user.id,
          projectId: input.projectId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get user lists with project status',
        });
      }
    }),
});
