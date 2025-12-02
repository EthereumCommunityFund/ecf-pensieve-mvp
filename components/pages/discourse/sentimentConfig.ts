import {
  ChartBar,
  ChatCircle,
  Eye,
  Star,
  ThumbsDown,
  ThumbsUp,
} from '@phosphor-icons/react';

export const DEFAULT_SENTIMENT_VALUE = 'all';

export type SentimentKey =
  | 'recommend'
  | 'agree'
  | 'insightful'
  | 'provocative'
  | 'disagree';

export type SentimentDefinition = {
  label: string;
  color: string;
  Icon: typeof ChartBar;
};

export const sentimentDefinitions: Record<SentimentKey, SentimentDefinition> = {
  recommend: { label: 'Recommend', color: '#3ec8a1', Icon: Star },
  agree: { label: 'Agree', color: '#5ca7ff', Icon: ThumbsUp },
  insightful: { label: 'Insightful', color: '#7058d6', Icon: Eye },
  provocative: { label: 'Provocative', color: '#eca048', Icon: ChatCircle },
  disagree: { label: 'Disagree', color: '#f26c6c', Icon: ThumbsDown },
};

export const defaultSentimentDisplay: SentimentDefinition = {
  label: 'Sentiment',
  color: '#7a7a7a',
  Icon: ChartBar,
};

export type SentimentMetric = {
  key: SentimentKey;
  percentage: number;
};
