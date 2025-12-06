import {
  ChartBarIcon,
  ChatCircleIcon,
  EyeIcon,
  StarIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  type Icon,
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
  Icon: Icon;
};

export const sentimentDefinitions: Record<SentimentKey, SentimentDefinition> = {
  recommend: { label: 'Recommend', color: '#3ec8a1', Icon: StarIcon },
  agree: { label: 'Agree', color: '#5ca7ff', Icon: ThumbsUpIcon },
  insightful: { label: 'Insightful', color: '#7058d6', Icon: EyeIcon },
  provocative: { label: 'Provocative', color: '#eca048', Icon: ChatCircleIcon },
  disagree: { label: 'Disagree', color: '#f26c6c', Icon: ThumbsDownIcon },
};

export const defaultSentimentDisplay: SentimentDefinition = {
  label: 'Sentiment',
  color: '#000',
  Icon: ChartBarIcon,
};

export type SentimentMetric = {
  key: SentimentKey;
  percentage: number;
};

export const fallbackSentiments: SentimentMetric[] = [
  { key: 'recommend', percentage: 25 },
  { key: 'agree', percentage: 25 },
  { key: 'insightful', percentage: 25 },
  { key: 'provocative', percentage: 15 },
  { key: 'disagree', percentage: 10 },
];
