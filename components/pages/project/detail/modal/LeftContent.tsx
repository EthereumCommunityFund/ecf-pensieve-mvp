'use client';

import { FC, useMemo, useState } from 'react';

import Tab from '@/components/base/Tab';
import { TabItem } from '@/components/base/Tab/types';

import { useProjectDetailContext } from '../../context/projectDetailContext';

import ConsensusLog from './ConsensusLog';
import Displayed from './Displayed';
import SubmissionQueue from './SubmissionQueue';

interface LeftContentProps {
  itemName?: string;
  itemWeight?: number;
  itemKey?: string;
}

const LeftContent: FC<LeftContentProps> = ({
  itemName = 'ItemName',
  itemWeight = 22,
  itemKey,
}) => {
  const [activeTab, setActiveTab] = useState('submission-queue');

  // Get project detail context to access proposalsByProjectIdAndKey
  const { proposalsByProjectIdAndKey } = useProjectDetailContext();

  // Calculate submission queue count from proposalsByProjectIdAndKey.allItemProposals
  const submissionQueueCount = useMemo(() => {
    if (!proposalsByProjectIdAndKey?.allItemProposals) return 0;
    return proposalsByProjectIdAndKey.allItemProposals.length;
  }, [proposalsByProjectIdAndKey?.allItemProposals]);

  const tabs: TabItem[] = [
    { key: 'displayed', label: 'Displayed' },
    {
      key: 'submission-queue',
      label: 'Submission Queue',
      count: submissionQueueCount,
    },
    { key: 'consensus-log', label: 'Consensus Log' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'displayed':
        return (
          <Displayed
            itemName={itemName}
            itemWeight={itemWeight}
            itemKey={itemKey}
          />
        );
      case 'submission-queue':
        return (
          <SubmissionQueue
            itemName={itemName}
            itemWeight={itemWeight}
            itemKey={itemKey}
          />
        );
      case 'consensus-log':
        return (
          <ConsensusLog
            itemName={itemName}
            itemWeight={itemWeight}
            itemKey={itemKey}
          />
        );
      default:
        return (
          <Displayed
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
      <Tab tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default LeftContent;
