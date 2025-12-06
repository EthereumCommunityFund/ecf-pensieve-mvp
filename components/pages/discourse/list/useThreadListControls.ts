import { useCallback, useState } from 'react';

import { DEFAULT_SENTIMENT_VALUE } from '../common/sentiment/sentimentConfig';

type ThreadListControlsOptions = {
  statusTabs: string[];
  sortOptions: string[];
  initialStatus?: string;
  initialSort?: string;
  initialSentiment?: string;
};

export const useThreadListControls = ({
  statusTabs,
  sortOptions,
  initialStatus,
  initialSort,
  initialSentiment,
}: ThreadListControlsOptions) => {
  const [activeStatus, setActiveStatus] = useState(
    initialStatus ?? statusTabs[0],
  );
  const [activeSort, setActiveSort] = useState(initialSort ?? sortOptions[0]);
  const [activeSentiment, setActiveSentiment] = useState<string>(
    initialSentiment ?? DEFAULT_SENTIMENT_VALUE,
  );
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const toggleTopic = useCallback((topic: string, selected: boolean) => {
    setSelectedTopics((prev) => {
      if (selected) {
        return prev.includes(topic) ? prev : [...prev, topic];
      }
      return prev.filter((item) => item !== topic);
    });
  }, []);

  const clearTopics = useCallback(() => setSelectedTopics([]), []);

  return {
    activeStatus,
    setActiveStatus,
    activeSort,
    setActiveSort,
    activeSentiment,
    setActiveSentiment,
    selectedTopics,
    toggleTopic,
    clearTopics,
  };
};
