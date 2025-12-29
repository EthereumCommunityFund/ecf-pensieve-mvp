'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { DEFAULT_SENTIMENT_VALUE } from '../common/sentiment/sentimentConfig';

type ThreadListControlsOptions = {
  statusTabs: string[];
  sortOptions: string[];
  initialStatus?: string;
  initialSort?: string;
  initialSentiment?: string;
  initialIsScam?: boolean;
  initialAlertOnly?: boolean;
};

const SENTIMENT_OPTIONS = [
  DEFAULT_SENTIMENT_VALUE,
  'recommend',
  'agree',
  'insightful',
  'provocative',
  'disagree',
];

export const useThreadListControls = ({
  statusTabs,
  sortOptions,
  initialStatus,
  initialSort,
  initialSentiment,
  initialIsScam,
  initialAlertOnly,
}: ThreadListControlsOptions) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const defaultStatus = initialStatus ?? statusTabs[0];
  const defaultSort = initialSort ?? sortOptions[0];
  const defaultSentiment = initialSentiment ?? DEFAULT_SENTIMENT_VALUE;
  const defaultIsScam = initialIsScam ?? false;
  const defaultAlertOnly = initialAlertOnly ?? false;

  const normalizeParam = useCallback(
    (value: string | null, allowed: string[], fallback: string) => {
      if (!value) return fallback;
      const normalized = value.toLowerCase();
      const matched = allowed.find(
        (option) => option.toLowerCase() === normalized,
      );
      return matched ?? fallback;
    },
    [],
  );

  const parseTopicsFromParams = useCallback(() => {
    if (!searchParams) return [];
    const topicParams = searchParams.getAll('topic');
    if (topicParams.length) {
      return Array.from(new Set(topicParams.filter(Boolean)));
    }
    const csv = searchParams.get('topics');
    return csv
      ? csv
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : [];
  }, [searchParams]);

  const initialState = useMemo(() => {
    const status = normalizeParam(
      searchParams?.get('status'),
      statusTabs,
      defaultStatus,
    );
    const sort = normalizeParam(
      searchParams?.get('sort'),
      sortOptions,
      defaultSort,
    );
    const sentiment = normalizeParam(
      searchParams?.get('sentiment'),
      SENTIMENT_OPTIONS,
      defaultSentiment,
    );
    const topics = parseTopicsFromParams();
    const isScamParam = normalizeParam(
      searchParams?.get('isScam'),
      ['true', 'false'],
      defaultIsScam ? 'true' : 'false',
    );
    const alertOnlyParam = normalizeParam(
      searchParams?.get('alertOnly'),
      ['true', 'false'],
      defaultAlertOnly ? 'true' : 'false',
    );

    return {
      status,
      sort,
      sentiment,
      topics,
      isScam: isScamParam === 'true',
      alertOnly: alertOnlyParam === 'true',
    };
  }, [
    defaultAlertOnly,
    defaultIsScam,
    defaultSentiment,
    defaultSort,
    defaultStatus,
    normalizeParam,
    parseTopicsFromParams,
    searchParams,
    sortOptions,
    statusTabs,
  ]);

  const [activeStatus, setActiveStatus] = useState(initialState.status);
  const [activeSort, setActiveSort] = useState(initialState.sort);
  const [activeSentiment, setActiveSentiment] = useState<string>(
    initialState.sentiment,
  );
  const [selectedTopics, setSelectedTopics] = useState<string[]>(
    initialState.topics,
  );
  const [isScamFilter, setIsScamFilter] = useState<boolean>(
    initialState.isScam,
  );
  const [alertOnlyFilter, setAlertOnlyFilter] = useState<boolean>(
    initialState.alertOnly,
  );

  const syncToUrl = useCallback(
    (
      overrides?: Partial<{
        status: string;
        sort: string;
        sentiment: string;
        topics: string[];
        isScam: boolean;
        alertOnly: boolean;
      }>,
    ) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      const nextStatus = overrides?.status ?? activeStatus ?? defaultStatus;
      const nextSort = overrides?.sort ?? activeSort ?? defaultSort;
      const nextSentiment =
        overrides?.sentiment ?? activeSentiment ?? defaultSentiment;
      const nextTopics = overrides?.topics ?? selectedTopics;
      const nextIsScam =
        overrides?.isScam ?? isScamFilter ?? defaultIsScam ?? false;
      const nextAlertOnly =
        overrides?.alertOnly ?? alertOnlyFilter ?? defaultAlertOnly ?? false;

      if (nextStatus) params.set('status', nextStatus);
      if (nextSort) params.set('sort', nextSort);
      if (nextSentiment) params.set('sentiment', nextSentiment);
      if (nextTopics?.length) {
        params.set('topics', nextTopics.join(','));
      } else {
        params.delete('topics');
        params.delete('topic');
      }
      const shouldPersistScam =
        nextAlertOnly || nextIsScam || overrides?.alertOnly === true;
      if (shouldPersistScam) {
        params.set('isScam', 'true');
      } else {
        params.delete('isScam');
      }
      if (nextAlertOnly) {
        params.set('alertOnly', 'true');
      } else {
        params.delete('alertOnly');
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [
      activeSentiment,
      activeSort,
      activeStatus,
      alertOnlyFilter,
      defaultAlertOnly,
      defaultIsScam,
      defaultSentiment,
      defaultSort,
      defaultStatus,
      isScamFilter,
      pathname,
      router,
      searchParams,
      selectedTopics,
    ],
  );

  const toggleTopic = useCallback(
    (topic: string, selected: boolean) => {
      setSelectedTopics((prev) => {
        const next = selected
          ? prev.includes(topic)
            ? prev
            : [...prev, topic]
          : prev.filter((item) => item !== topic);
        syncToUrl({ topics: next });
        return next;
      });
    },
    [syncToUrl],
  );

  const clearTopics = useCallback(() => {
    setSelectedTopics([]);
    syncToUrl({ topics: [] });
  }, [syncToUrl]);

  const handleSetStatus = useCallback(
    (value: string) => {
      setActiveStatus(value);
      setIsScamFilter(false);
      setAlertOnlyFilter(false);
      syncToUrl({
        status: value,
        alertOnly: false,
        isScam: false,
      });
    },
    [syncToUrl],
  );

  const handleSetSort = useCallback(
    (value: string) => {
      setActiveSort(value);
      setIsScamFilter(false);
      setAlertOnlyFilter(false);
      syncToUrl({
        sort: value,
        alertOnly: false,
        isScam: false,
      });
    },
    [syncToUrl],
  );

  const handleSetSentiment = useCallback(
    (value: string) => {
      setActiveSentiment(value);
      setIsScamFilter(false);
      setAlertOnlyFilter(false);
      syncToUrl({
        sentiment: value,
        alertOnly: false,
        isScam: false,
      });
    },
    [syncToUrl],
  );

  const handleSetIsScam = useCallback(
    (value: boolean) => {
      setIsScamFilter(value);
      if (!value) {
        setAlertOnlyFilter(false);
      }
      syncToUrl({ isScam: value, alertOnly: false });
    },
    [syncToUrl],
  );

  const handleSetAlertOnly = useCallback(
    (value: boolean) => {
      setAlertOnlyFilter(value);
      syncToUrl({ alertOnly: value, isScam: value || isScamFilter });
    },
    [syncToUrl, isScamFilter],
  );

  useEffect(() => {
    const status = normalizeParam(
      searchParams?.get('status'),
      statusTabs,
      defaultStatus,
    );
    const sort = normalizeParam(
      searchParams?.get('sort'),
      sortOptions,
      defaultSort,
    );
    const sentiment = normalizeParam(
      searchParams?.get('sentiment'),
      SENTIMENT_OPTIONS,
      defaultSentiment,
    );
    const topics = parseTopicsFromParams();
    const isScamParam = normalizeParam(
      searchParams?.get('isScam'),
      ['true', 'false'],
      defaultIsScam ? 'true' : 'false',
    );
    const alertOnlyParam = normalizeParam(
      searchParams?.get('alertOnly'),
      ['true', 'false'],
      defaultAlertOnly ? 'true' : 'false',
    );
    const isScam = isScamParam === 'true';
    const alertOnly = alertOnlyParam === 'true';

    setActiveStatus(status);
    setActiveSort(sort);
    setActiveSentiment(sentiment);
    setSelectedTopics(topics);
    setIsScamFilter(isScam);
    setAlertOnlyFilter(alertOnly);
  }, [
    defaultAlertOnly,
    defaultIsScam,
    defaultSentiment,
    defaultSort,
    defaultStatus,
    normalizeParam,
    parseTopicsFromParams,
    searchParams,
    sortOptions,
    statusTabs,
  ]);

  return {
    activeStatus,
    setActiveStatus: handleSetStatus,
    activeSort,
    setActiveSort: handleSetSort,
    activeSentiment,
    setActiveSentiment: handleSetSentiment,
    selectedTopics,
    toggleTopic,
    clearTopics,
    isScamFilter,
    setIsScamFilter: handleSetIsScam,
    alertOnlyFilter,
    setAlertOnlyFilter: handleSetAlertOnly,
  };
};
