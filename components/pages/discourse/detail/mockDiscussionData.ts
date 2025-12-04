import type { RouterOutputs } from '@/types';

type AnswerRecord =
  RouterOutputs['projectDiscussionInteraction']['listAnswers']['items'][0];
type AnswerCommentRecord = AnswerRecord['comments'][0];
type ThreadCommentRecord =
  RouterOutputs['projectDiscussionInteraction']['listComments']['items'][0];

type AnswersFixtureMap = {
  [threadId: string]: AnswerRecord[];
  default: AnswerRecord[];
};

type CommentsFixtureMap = {
  [threadId: string]: ThreadCommentRecord[];
  default: ThreadCommentRecord[];
};

const makeDate = (value: string) => new Date(value);

type CreatorShape = {
  userId: string;
  name: string;
  avatarUrl: string | null;
};

const creatorProfiles: Record<string, CreatorShape> = {
  strategist: {
    userId: '11111111-2222-4333-8444-555555555001',
    name: 'Stewardship Guild',
    avatarUrl: null,
  },
  moderator: {
    userId: '11111111-2222-4333-8444-555555555002',
    name: 'Forum Moderator',
    avatarUrl: null,
  },
  reviewer: {
    userId: '11111111-2222-4333-8444-555555555003',
    name: 'Independent Reviewer',
    avatarUrl: null,
  },
  opsLead: {
    userId: '11111111-2222-4333-8444-555555555004',
    name: 'Operations Lead',
    avatarUrl: null,
  },
};

const asAnswerCreator = (profile: CreatorShape) =>
  profile as AnswerRecord['creator'];
const asAnswerCommentCreator = (profile: CreatorShape) =>
  profile as AnswerCommentRecord['creator'];
const asThreadCommentCreator = (profile: CreatorShape) =>
  profile as ThreadCommentRecord['creator'];

const defaultAnswerFixtures: AnswerRecord[] = [
  {
    id: 91001,
    threadId: 1,
    creator: asAnswerCreator(creatorProfiles.strategist),
    content:
      'We published a funding ledger that groups every disbursement by KPI and epoch. The ledger is mirrored on Arweave and refreshed every Friday. ' +
      'Community members can now trace any wallet payout back to the original proposal along with reviewer comments.',
    voteCount: 1280,
    createdAt: makeDate('2024-11-18T12:00:00.000Z'),
    updatedAt: makeDate('2024-11-18T12:00:00.000Z'),
    isDeleted: false,
    deletedAt: null,
    comments: [
      {
        id: 92001,
        threadId: 1,
        answerId: 91001,
        parentCommentId: null,
        commentId: null,
        creator: asAnswerCommentCreator(creatorProfiles.moderator),
        content:
          'Appreciate the transparency drop. Could you also mark which payouts are tied to emergency approvals?',
        createdAt: makeDate('2024-11-18T13:00:00.000Z'),
        updatedAt: makeDate('2024-11-18T13:00:00.000Z'),
        isDeleted: false,
        deletedAt: null,
      },
    ],
    sentiments: [
      {
        id: 93001,
        createdAt: makeDate('2024-11-18T14:00:00.000Z'),
        threadId: null,
        answerId: 91001,
        creator: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0001',
        type: 'agree',
      },
      {
        id: 93002,
        createdAt: makeDate('2024-11-18T14:30:00.000Z'),
        threadId: null,
        answerId: 91001,
        creator: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0002',
        type: 'insightful',
      },
    ],
    viewerHasSupported: false,
  },
  {
    id: 91002,
    threadId: 1,
    creator: asAnswerCreator(creatorProfiles.reviewer),
    content:
      'Created an open dashboard that tracks whether milestones were delivered before CP unlocks. ' +
      'If milestones slip by more than 30 days, the dashboard pings the moderators and posts an auto-comment here.',
    voteCount: 740,
    createdAt: makeDate('2024-11-19T09:20:00.000Z'),
    updatedAt: makeDate('2024-11-19T09:20:00.000Z'),
    isDeleted: false,
    deletedAt: null,
    comments: [
      {
        id: 92002,
        threadId: 1,
        answerId: 91002,
        parentCommentId: null,
        commentId: null,
        creator: asAnswerCommentCreator(creatorProfiles.opsLead),
        content:
          'Love the automation. Can we plug in sentiment data as well so stalled proposals are prioritized?',
        createdAt: makeDate('2024-11-19T11:15:00.000Z'),
        updatedAt: makeDate('2024-11-19T11:15:00.000Z'),
        isDeleted: false,
        deletedAt: null,
      },
    ],
    sentiments: [
      {
        id: 93003,
        createdAt: makeDate('2024-11-19T12:00:00.000Z'),
        threadId: null,
        answerId: 91002,
        creator: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0003',
        type: 'recommend',
      },
      {
        id: 93004,
        createdAt: makeDate('2024-11-19T12:30:00.000Z'),
        threadId: null,
        answerId: 91002,
        creator: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0004',
        type: 'agree',
      },
    ],
    viewerHasSupported: true,
  },
];

const defaultDiscussionFixtures: ThreadCommentRecord[] = [
  {
    id: 94001,
    threadId: 1,
    answerId: null,
    parentCommentId: null,
    commentId: null,
    creator: asThreadCommentCreator(creatorProfiles.opsLead),
    content:
      'We still have ambiguity on how the treasury classifies ecosystem experiments versus core operations. ' +
      'Would love to see that spelled out before the next milestone review.',
    createdAt: makeDate('2024-11-20T08:00:00.000Z'),
    updatedAt: makeDate('2024-11-20T08:00:00.000Z'),
    isDeleted: false,
    deletedAt: null,
    comments: [
      {
        id: 94002,
        threadId: 1,
        answerId: null,
        parentCommentId: 94001,
        commentId: 94001,
        creator: asThreadCommentCreator(creatorProfiles.strategist),
        content:
          'Good call out. The stewardship deck on page 4 now lists the decision tree—we can cross-post it here too.',
        createdAt: makeDate('2024-11-20T09:10:00.000Z'),
        updatedAt: makeDate('2024-11-20T09:10:00.000Z'),
        isDeleted: false,
        deletedAt: null,
      },
    ],
  },
  {
    id: 94003,
    threadId: 1,
    answerId: null,
    parentCommentId: null,
    commentId: null,
    creator: asThreadCommentCreator(creatorProfiles.moderator),
    content:
      'Reminder that Discussion tab is best for clarifying questions. If you have a full remediation path, please post it as an Answer so CP votes can accrue.',
    createdAt: makeDate('2024-11-21T10:30:00.000Z'),
    updatedAt: makeDate('2024-11-21T10:30:00.000Z'),
    isDeleted: false,
    deletedAt: null,
    comments: [],
  },
];

export const mockThreadAnswers: AnswersFixtureMap = {
  default: defaultAnswerFixtures,
};

export const mockThreadComments: CommentsFixtureMap = {
  default: defaultDiscussionFixtures,
};
