import { relations } from 'drizzle-orm';

import { activeLogs } from './activeLogs';
import { invitationCodes } from './invitations';
import { itemProposals } from './itemProposals';
import { likeRecords } from './likeRecord';
import { listFollows } from './listFollows';
import { listProjects } from './listProjects';
import { lists } from './lists';
import { notifications } from './notifications';
import { profiles } from './profiles';
import { projectLogs } from './projectLogs';
import { projectNotificationSettings } from './projectNotificationSettings';
import { projects } from './projects';
import { projectSnaps } from './projectSnaps';
import { proposals } from './proposals';
import { ranks } from './ranks';
import { voteRecords } from './voteRecords';

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  invitationCode: one(invitationCodes, {
    fields: [profiles.invitationCodeId],
    references: [invitationCodes.id],
  }),
  createdProjects: many(projects),
  createdProposals: many(proposals),
  votes: many(voteRecords),
  notificationsAsRecipient: many(notifications, {
    relationName: 'notificationUser',
  }),
  notificationsAsVoter: many(notifications, {
    relationName: 'notificationVoter',
  }),
  activeLogs: many(activeLogs, { relationName: 'userActiveLogs' }),
  proposalCreatorLogs: many(activeLogs, {
    relationName: 'proposalCreatorLogs',
  }),
  createdLists: many(lists),
  listFollows: many(listFollows),
  projectNotificationSettings: many(projectNotificationSettings),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  creator: one(profiles, {
    fields: [projects.creator],
    references: [profiles.userId],
  }),
  proposals: many(proposals),
  notifications: many(notifications),
  activeLogs: many(activeLogs),
  projectSnap: one(projectSnaps, {
    fields: [projects.id],
    references: [projectSnaps.projectId],
  }),
  rank: one(ranks, {
    fields: [projects.id],
    references: [ranks.projectId],
  }),
  listProjects: many(listProjects),
  projectNotificationSettings: many(projectNotificationSettings),
}));

export const proposalsRelations = relations(proposals, ({ one, many }) => ({
  creator: one(profiles, {
    fields: [proposals.creator],
    references: [profiles.userId],
  }),
  project: one(projects, {
    fields: [proposals.projectId],
    references: [projects.id],
  }),
  voteRecords: many(voteRecords),
  notifications: many(notifications),
}));

export const itemProposalsRelations = relations(
  itemProposals,
  ({ one, many }) => ({
    creator: one(profiles, {
      fields: [itemProposals.creator],
      references: [profiles.userId],
    }),
    project: one(projects, {
      fields: [itemProposals.projectId],
      references: [projects.id],
    }),
    voteRecords: many(voteRecords),
  }),
);

export const voteRecordsRelations = relations(voteRecords, ({ one }) => ({
  creator: one(profiles, {
    fields: [voteRecords.creator],
    references: [profiles.userId],
  }),
  proposal: one(proposals, {
    fields: [voteRecords.proposalId],
    references: [proposals.id],
  }),
  itemProposal: one(itemProposals, {
    fields: [voteRecords.itemProposalId],
    references: [itemProposals.id],
  }),
  project: one(projects, {
    fields: [voteRecords.projectId],
    references: [projects.id],
  }),
}));

export const activeLogsRelations = relations(activeLogs, ({ one }) => ({
  user: one(profiles, {
    fields: [activeLogs.userId],
    references: [profiles.userId],
    relationName: 'userActiveLogs',
  }),
  project: one(projects, {
    fields: [activeLogs.projectId],
    references: [projects.id],
  }),
  proposalCreator: one(profiles, {
    fields: [activeLogs.proposalCreatorId],
    references: [profiles.userId],
    relationName: 'proposalCreatorLogs',
  }),
}));

export const invitationCodesRelations = relations(
  invitationCodes,
  ({ many }) => ({
    profiles: many(profiles),
  }),
);

export const projectLogsRelations = relations(projectLogs, ({ one }) => ({
  project: one(projects, {
    fields: [projectLogs.projectId],
    references: [projects.id],
  }),
  proposal: one(proposals, {
    fields: [projectLogs.proposalId],
    references: [proposals.id],
  }),
  itemProposal: one(itemProposals, {
    fields: [projectLogs.itemProposalId],
    references: [itemProposals.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(profiles, {
    fields: [notifications.userId],
    references: [profiles.userId],
    relationName: 'notificationUser',
  }),
  project: one(projects, {
    fields: [notifications.projectId],
    references: [projects.id],
  }),
  proposal: one(proposals, {
    fields: [notifications.proposalId],
    references: [proposals.id],
  }),
  itemProposal: one(itemProposals, {
    fields: [notifications.itemProposalId],
    references: [itemProposals.id],
  }),
  voter: one(profiles, {
    fields: [notifications.voter_id],
    references: [profiles.userId],
    relationName: 'notificationVoter',
  }),
  projectSnaps: one(projectSnaps, {
    fields: [notifications.projectId],
    references: [projectSnaps.projectId],
  }),
}));

export const likeRecordsRelations = relations(likeRecords, ({ one }) => ({
  creator: one(profiles, {
    fields: [likeRecords.creator],
    references: [profiles.userId],
  }),
  project: one(projects, {
    fields: [likeRecords.projectId],
    references: [projects.id],
  }),
}));

export const ranksRelations = relations(ranks, ({ one }) => ({
  project: one(projects, {
    fields: [ranks.projectId],
    references: [projects.id],
  }),
}));

export const projectSnapsRelations = relations(projectSnaps, ({ one }) => ({
  project: one(projects, {
    fields: [projectSnaps.projectId],
    references: [projects.id],
  }),
}));

export const listsRelations = relations(lists, ({ one, many }) => ({
  creator: one(profiles, {
    fields: [lists.creator],
    references: [profiles.userId],
  }),
  listProjects: many(listProjects),
  listFollows: many(listFollows),
}));

export const listProjectsRelations = relations(listProjects, ({ one }) => ({
  list: one(lists, {
    fields: [listProjects.listId],
    references: [lists.id],
  }),
  project: one(projects, {
    fields: [listProjects.projectId],
    references: [projects.id],
  }),
  addedByUser: one(profiles, {
    fields: [listProjects.addedBy],
    references: [profiles.userId],
  }),
  projectSnap: one(projectSnaps, {
    fields: [listProjects.projectId],
    references: [projectSnaps.projectId],
  }),
}));

export const listFollowsRelations = relations(listFollows, ({ one }) => ({
  list: one(lists, {
    fields: [listFollows.listId],
    references: [lists.id],
  }),
  user: one(profiles, {
    fields: [listFollows.userId],
    references: [profiles.userId],
  }),
}));

export const projectNotificationSettingsRelations = relations(
  projectNotificationSettings,
  ({ one }) => ({
    user: one(profiles, {
      fields: [projectNotificationSettings.userId],
      references: [profiles.userId],
    }),
    project: one(projects, {
      fields: [projectNotificationSettings.projectId],
      references: [projects.id],
    }),
  }),
);
