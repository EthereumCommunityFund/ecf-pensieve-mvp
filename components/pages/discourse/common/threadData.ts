import {
  SentimentKey,
  type SentimentMetric,
} from './sentiment/sentimentConfig';

export type DetailedSentimentMetric = {
  key: SentimentKey;
  percentage: number;
  votes: number;
};

export type AnswerItem = {
  id: string;
  numericId: number;
  author: string;
  authorAvatar?: string | null;
  role: string;
  createdAt: string;
  body: string;
  cpSupport: number;
  cpTarget?: number;
  sentimentLabel: SentimentKey;
  sentimentVotes: number;
  sentimentBreakdown?: SentimentMetric[];
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
  commentId?: number;
  author: string;
  authorAvatar?: string | null;
  role: string;
  createdAt: string;
  body: string;
  sentimentLabel?: SentimentKey;
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
  post: string;
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
    avatarUrl?: string | null;
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
