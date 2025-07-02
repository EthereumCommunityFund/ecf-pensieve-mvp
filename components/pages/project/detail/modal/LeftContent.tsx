'use client';

import { FC, memo, useCallback, useEffect, useMemo, useState } from 'react';

import TabsLabel from '@/components/base/TabsLabel';
import { TabItemLabel } from '@/components/base/TabsLabel/types';
import { AllItemConfig } from '@/constants/itemConfig';
import { IPocItemKey } from '@/types/item';

import { useProjectDetailContext } from '../../context/projectDetailContext';

import AboutItem from './AboutItem';
import ConsensusLog from './ConsensusLog';
import Displayed from './Displayed';
import SubmissionQueue from './SubmissionQueue';

interface LeftContentProps {
  itemKey?: string;
  onSubmitEntry?: () => void;
}

const LeftContent: FC<LeftContentProps> = memo(({ itemKey, onSubmitEntry }) => {
  const { refetchProposalHistory, refetchProposalsByKey } =
    useProjectDetailContext();
  const [activeTab, setActiveTab] = useState('submission-queue');
  const [hasUserSelectedTab, setHasUserSelectedTab] = useState(false);

  // Get project detail context to access proposalsByProjectIdAndKey and displayProposalDataOfKey
  const {
    proposalsByProjectIdAndKey,
    displayProposalDataOfKey,
    isProposalsByKeyLoading,
  } = useProjectDetailContext();

  // useEffect(() => {
  //   if (displayProposalDataOfKey && !hasUserSelectedTab) {
  //     setActiveTab('displayed');
  //   }
  // }, [displayProposalDataOfKey, hasUserSelectedTab]);

  // Calculate submission queue count from proposalsByProjectIdAndKey.allItemProposals
  const submissionQueueCount = useMemo(() => {
    const len = proposalsByProjectIdAndKey?.allItemProposals?.length;
    if (!len) return 0;
    return len - 1;
  }, [proposalsByProjectIdAndKey?.allItemProposals]);

  // Generate tabs based on whether displayProposalDataOfKey has value
  const tabs: TabItemLabel[] = useMemo(() => {
    const baseTabs: TabItemLabel[] = [
      {
        key: 'submission-queue',
        label: 'Submission Queue',
        count: submissionQueueCount,
      },
      { key: 'consensus-log', label: 'Consensus Log' },
      { key: 'about-item', label: 'About This Item' },
    ];

    // Only show 'displayed' tab if displayProposalDataOfKey has value
    // if (displayProposalDataOfKey) {
    //   return [{ key: 'displayed', label: 'Displayed' }, ...baseTabs];
    // }

    return baseTabs;
  }, [submissionQueueCount]);

  // Ensure activeTab is always valid when tabs change
  useEffect(() => {
    const availableTabKeys = tabs.map((tab) => tab.key);
    if (!availableTabKeys.includes(activeTab)) {
      // If current activeTab is not available, set to the first available tab
      setActiveTab(availableTabKeys[0] || 'submission-queue');
      // This is a forced change due to tab availability, not user selection
      // Don't set hasUserSelectedTab to true here
    }
  }, [tabs, activeTab]);

  const onTabChange = useCallback(
    (tabKey: string) => {
      if (tabKey === 'consensus-log') {
        refetchProposalHistory();
      }
      setActiveTab(tabKey);
      setHasUserSelectedTab(true);
    },
    [refetchProposalHistory],
  );

  const { itemName, itemWeight } = useMemo(() => {
    const itemConfig = AllItemConfig[itemKey as IPocItemKey];
    return {
      itemName: itemConfig?.label || '',
      itemWeight: Number(itemConfig?.weight) || 0,
    };
  }, [itemKey]);

  const onViewSubmissions = useCallback(() => {
    setActiveTab('submission-queue');
    setHasUserSelectedTab(true);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      // case 'displayed':
      //   return (
      //     <Displayed
      //       itemName={itemName}
      //       itemWeight={itemWeight}
      //       itemKey={itemKey}
      //       onViewSubmissions={onViewSubmissions}
      //     />
      //   );
      case 'submission-queue':
        return (
          <SubmissionQueue
            itemName={itemName}
            itemWeight={itemWeight}
            itemKey={itemKey}
            onSubmitEntry={onSubmitEntry}
          />
        );
      case 'consensus-log':
        return <ConsensusLog itemKey={itemKey} />;
      case 'about-item':
        return <AboutItem itemKey={itemKey as IPocItemKey} />;
      default:
        // Return the first available tab content
        if (displayProposalDataOfKey) {
          return (
            <Displayed
              itemName={itemName}
              itemWeight={itemWeight}
              itemKey={itemKey}
              onViewSubmissions={onViewSubmissions}
            />
          );
        }
        return (
          <SubmissionQueue
            itemName={itemName}
            itemWeight={itemWeight}
            itemKey={itemKey}
          />
        );
    }
  };

  return (
    <div className="flex flex-col gap-5 p-5">
      {/* Tab Navigation */}
      <TabsLabel tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
});

LeftContent.displayName = 'LeftContent';

export default LeftContent;
