import { relations } from 'drizzle-orm';

import { activeLogs } from './activeLogs';
import { invitationCodes } from './invitations';
import { itemProposals } from './itemProposals';
import { notifications } from './notifications';
import { profiles } from './profiles';
import { projectLogs } from './projectLogs';
import { projects } from './projects';
import { proposals } from './proposals';
import { voteRecords } from './voteRecords';

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  invitationCode: one(invitationCodes, {
    fields: [profiles.invitationCodeId],
    references: [invitationCodes.id],
  }),
  createdProjects: many(projects),
  createdProposals: many(proposals),
  votes: many(voteRecords),
  notifications: many(notifications),
  activeLogs: many(activeLogs, { relationName: 'userActiveLogs' }),
  proposalCreatorLogs: many(activeLogs, {
    relationName: 'proposalCreatorLogs',
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  creator: one(profiles, {
    fields: [projects.creator],
    references: [profiles.userId],
  }),
  proposals: many(proposals),
  notifications: many(notifications),
  activeLogs: many(activeLogs),
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
  }),
  project: one(projects, {
    fields: [notifications.projectId],
    references: [projects.id],
  }),
  proposal: one(proposals, {
    fields: [notifications.proposalId],
    references: [proposals.id],
  }),
}));
