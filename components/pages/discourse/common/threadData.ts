import { SentimentKey } from './setiment/sentimentConfig';

export type DetailedSentimentMetric = {
  key: SentimentKey;
  percentage: number;
  votes: number;
};

export type AnswerItem = {
  id: string;
  numericId: number;
  author: string;
  role: string;
  createdAt: string;
  body: string;
  cpSupport: number;
  cpTarget?: number;
  sentimentLabel: SentimentKey;
  sentimentVotes: number;
  commentsCount: number;
  comments?: CommentItem[];
  viewerSentiment?: SentimentKey | null;
  viewerHasSupported?: boolean;
  isAccepted?: boolean;
  statusTag?: string;
};

export type CommentItem = {
  id: string;
  numericId: number;
  answerId?: number;
  parentCommentId?: number;
  author: string;
  role: string;
  createdAt: string;
  body: string;
  sentimentLabel: SentimentKey;
};

export type ThreadHighlight = {
  label: string;
  value: string;
};

export type QuickAction = {
  label: string;
  helper: string;
};

export type ThreadDetailRecord = {
  id: string;
  title: string;
  summary: string;
  badge: string;
  status: string;
  isScam: boolean;
  categories: string[];
  tags: string[];
  highlights: ThreadHighlight[];
  body: string[];
  attachmentsCount?: number;
  cpProgress: {
    current: number;
    target: number;
    label: string;
    helper: string;
  };
  sentiment: DetailedSentimentMetric[];
  totalSentimentVotes: number;
  answers: AnswerItem[];
  counterClaims?: AnswerItem[];
  comments: CommentItem[];
  author: {
    name: string;
    handle: string;
    avatarFallback: string;
    role: string;
    postedAt: string;
    editedAt?: string;
  };
  participation: {
    supportSteps: string[];
    counterSteps: string[];
  };
  quickActions: QuickAction[];
  canRetract?: boolean;
};

export const generalThread: ThreadDetailRecord = {
  id: '1',
  title: 'What in the actual..is Ethereum’s Mission?',
  summary:
    'A long-running thread that questions whether the Foundation is still aligned with the community-defined mission and how new programs are evaluated.',
  badge: 'Complaint Topic',
  status: 'Redressed',
  isScam: false,
  categories: ['Governance & DAO'],
  tags: ['Mission Alignment', 'Community Pulse', 'Funding Signals'],
  highlights: [
    { label: 'Answers', value: '12' },
    { label: 'Comments', value: '64' },
    { label: 'Views', value: '18.4k' },
  ],
  body: [
    'The OP outlines concerns that Ethereum’s public narrative and the incentives attached to multiple grant programs have drifted away from the original purpose of neutral coordination. They cite funding examples across three ecosystems and ask for a unified answer from EF stewards.',
    'Participants have requested clarification on who defines the north star mission today, how new initiatives are screened, and what data can be shared to show alignment checkpoints. The thread stays active because each answer is reviewed by volunteers who track Contribution Points.',
  ],
  cpProgress: {
    current: 1180,
    target: 2000,
    label: 'Contribution Points supporting the leading answer',
    helper:
      'Reaching 2,000 CP signals enough community confidence to lock this complaint as Redressed.',
  },
  sentiment: [
    { key: 'recommend', percentage: 32, votes: 148 },
    { key: 'agree', percentage: 26, votes: 112 },
    { key: 'insightful', percentage: 20, votes: 87 },
    { key: 'provocative', percentage: 12, votes: 52 },
    { key: 'disagree', percentage: 10, votes: 45 },
  ],
  totalSentimentVotes: 444,
  answers: [
    {
      id: 'ans-1',
      numericId: 1,
      author: 'BuilderOne',
      role: 'Core Contributor',
      createdAt: 'Posted 6 days ago',
      body: 'Summarized the EF strategic narrative deck and linked to the yearly roadmap call that restated neutrality guardrails. Proposed quarterly public forums with Foundation leadership. The answer is co-signed by multiple long-term contributors.',
      cpSupport: 1180,
      cpTarget: 2000,
      sentimentLabel: 'agree',
      sentimentVotes: 86,
      commentsCount: 4,
      viewerSentiment: 'agree',
      viewerHasSupported: true,
      comments: [
        {
          id: 'ans-1-comment-1',
          numericId: 101,
          answerId: 1,
          author: 'Community Lead',
          role: 'Community Member',
          createdAt: '2 days ago',
          body: 'Appreciate the synthesis — are there public notes for the roadmap call?',
          sentimentLabel: 'insightful',
        },
      ],
      isAccepted: true,
      statusTag: 'Adopted',
    },
    {
      id: 'ans-2',
      numericId: 2,
      author: 'ResearchGuild',
      role: 'Community Working Group',
      createdAt: 'Posted 4 days ago',
      body: 'Requests a third-party audit on historical funding decisions and suggests sending future proposals through a public scorecard. Recommends pairing EF statements with on-chain allocations.',
      cpSupport: 525,
      sentimentLabel: 'insightful',
      sentimentVotes: 44,
      commentsCount: 6,
      comments: [],
    },
  ],
  comments: [
    {
      id: 'c-1',
      numericId: 201,
      author: 'Watcher',
      role: 'Community Member',
      createdAt: '3 days ago',
      body: 'Appreciate the clarity. Would be helpful to add accountability milestones per vertical. Happy to draft a template if EF can endorse the format.',
      sentimentLabel: 'recommend',
    },
    {
      id: 'c-2',
      numericId: 202,
      author: 'OpsLead',
      role: 'EF Moderator',
      createdAt: '2 days ago',
      body: 'We are preparing a follow-up timeline. Current plan is to test a lightweight advisory council before EthCC. Feedback welcome on scope.',
      sentimentLabel: 'insightful',
    },
  ],
  author: {
    name: 'Username',
    handle: '@mission-builder',
    avatarFallback: 'U',
    role: 'Community Member',
    postedAt: 'Posted 1 week ago',
    editedAt: 'Edited 2 days ago',
  },
  participation: {
    supportSteps: [
      'Share records or dashboards that validate the historical claim.',
      'Spend CP to upvote answers that provide verifiable remedies.',
      'Flag unanswered follow-ups so moderators can request updates.',
    ],
    counterSteps: [
      'Publish fresh data or links disproving the original assumption.',
      'Offer an alternative remediation plan and request CP support.',
      'Submit a moderator note if coordination or context is missing.',
    ],
  },
  quickActions: [
    { label: 'Update Post', helper: 'Add context, links, or clarifications.' },
    {
      label: 'Answer Complaint',
      helper: 'Share an actionable resolution path.',
    },
    { label: 'Post Comment', helper: 'Discuss evidence or ask for details.' },
  ],
};

export const scamThread: ThreadDetailRecord = {
  id: '3',
  title: 'Multiple scam alerts connected to OTC token sale',
  summary:
    'Several early supporters flagged suspicious OTC offers that impersonate the project treasury. CP votes are required to surface the alert globally.',
  badge: '⚠️ Scam & Fraud',
  status: 'Alert Displayed on Page',
  isScam: true,
  attachmentsCount: 4,
  categories: ['Scam & Fraud Concerns'],
  tags: ['Secondary Markets', 'OTC Sales', 'Security'],
  highlights: [
    { label: 'Alert Threshold', value: '9,000 CP' },
    { label: 'Supporters', value: '1,294' },
    { label: 'Evidence Links', value: '37 submissions' },
  ],
  body: [
    'The claim documents three OTC conversations where an impersonator shared forged treasury certificates, collected stablecoins, and disappeared. Screenshots and wallet traces are available to moderators.',
    'Victims are requesting that the project pauses OTC operations, publishes official addresses, and sets up a direct reporting hotline. Contributors can either support the alert or add counter claims if remediation already happened.',
  ],
  cpProgress: {
    current: 2899,
    target: 9000,
    label: 'Contribution Points supporting the main claim',
    helper:
      'Cross the 9,000 CP threshold to pin the alert across the project surfaces.',
  },
  sentiment: [
    { key: 'recommend', percentage: 22, votes: 186 },
    { key: 'agree', percentage: 28, votes: 238 },
    { key: 'insightful', percentage: 18, votes: 152 },
    { key: 'provocative', percentage: 11, votes: 92 },
    { key: 'disagree', percentage: 21, votes: 177 },
  ],
  totalSentimentVotes: 845,
  answers: [],
  counterClaims: [
    {
      id: 'counter-1',
      numericId: 11,
      author: 'SecurityOps',
      role: 'Project Team',
      createdAt: 'Posted 3 hours ago',
      body: 'Escalated the wallets to centralized exchanges, revoked OTC permissions, and will publish an updated treasury registry in 24 hours. Inviting harmed users to submit reimbursements through a secure form.',
      cpSupport: 1450,
      cpTarget: 9000,
      sentimentLabel: 'agree',
      sentimentVotes: 38,
      commentsCount: 8,
      statusTag: 'Investigation',
      viewerSentiment: 'agree',
      comments: [],
    },
    {
      id: 'counter-2',
      numericId: 12,
      author: 'CommunityWatch',
      role: 'Community Reviewer',
      createdAt: 'Posted 1 hour ago',
      body: 'Claims the OTC desk already notified their mailing list and is working with partners. Requests proof that reimbursements were processed but cautions against alert fatigue.',
      cpSupport: 620,
      cpTarget: 9000,
      sentimentLabel: 'provocative',
      sentimentVotes: 22,
      commentsCount: 3,
      comments: [],
    },
  ],
  comments: [
    {
      id: 'scam-c-1',
      numericId: 301,
      author: 'ConcernedHolder',
      role: 'Token Holder',
      createdAt: '1 hour ago',
      body: 'Lost 2,300 USDC to the impersonator. Support pinning this alert until verified wallets are added to Docs.',
      sentimentLabel: 'recommend',
    },
    {
      id: 'scam-c-2',
      numericId: 302,
      author: 'ProjectMod',
      role: 'Moderator',
      createdAt: '45 minutes ago',
      body: 'Moderation team is verifying the Counter Claim evidence now. Expect an update later today.',
      sentimentLabel: 'insightful',
    },
  ],
  author: {
    name: 'Watcher',
    handle: '@watcher-alerts',
    avatarFallback: 'W',
    role: 'Community Safety',
    postedAt: 'Posted 12 hours ago',
    editedAt: 'Edited 2 hours ago',
  },
  participation: {
    supportSteps: [
      'Confirm you reviewed the evidence and understand CP will be locked.',
      'Support the claim with CP or attach on-chain proof via secure upload.',
      'Ping moderators if the alert should also live on the project landing page.',
    ],
    counterSteps: [
      'Submit a Counter Claim describing remediation progress.',
      'Invite supporters to stake CP to reach the same 9,000 CP bar.',
      'Encourage OP to retract the claim if the incident is resolved.',
    ],
  },
  quickActions: [
    {
      label: 'Support This Claim',
      helper: 'Spend CP to reach alert threshold.',
    },
    {
      label: 'Counter This Claim',
      helper: 'Propose remediation with evidence.',
    },
    { label: 'Retract Your Claim', helper: 'Available to OP once mitigated.' },
  ],
  canRetract: true,
};

export const threadDataset: Record<string, ThreadDetailRecord> = {
  '1': generalThread,
  '2': {
    ...generalThread,
    id: '2',
    title: 'Project Alpha - Fund allocation transparency',
    summary:
      'Contributors want to know whether treasury expansions still map to the published KPIs. Thread compiles conflicting statements from multiple AMAs.',
    tags: ['Treasury', 'Transparency', 'DAO Votes'],
  },
  'p-1': {
    ...generalThread,
    id: 'p-1',
    title: 'Liquidity mining rewards delayed',
    summary:
      'Reward schedule for week 34 is overdue. Contributors request clarity on how payouts are queued.',
    categories: ['Customer Support & Comms'],
    tags: ['Liquidity', 'Rewards'],
  },
  '3': scamThread,
  'p-2': {
    ...scamThread,
    id: 'p-2',
    title: 'Need clarity on scam alerts',
    summary:
      'Token holders noticed multiple OTC impersonations and want a permanent alert banner.',
  },
};
