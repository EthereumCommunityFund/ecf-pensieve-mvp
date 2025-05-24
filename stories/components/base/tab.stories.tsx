import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import Tab from '@/components/base/Tab';
import { TabItem } from '@/components/base/Tab/types';

const meta: Meta<typeof Tab> = {
  title: 'Components/Tab',
  component: Tab,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const TabWrapper = ({ tabs }: { tabs: TabItem[] }) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.key || '');

  return (
    <div className="w-[400px]">
      <Tab tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export const Default: Story = {
  render: () => (
    <TabWrapper
      tabs={[
        { key: 'displayed', label: 'Displayed' },
        { key: 'submission-queue', label: 'Submission Queue', count: 3 },
        { key: 'consensus-log', label: 'Consensus Log' },
      ]}
    />
  ),
};

export const WithoutCount: Story = {
  render: () => (
    <TabWrapper
      tabs={[
        { key: 'tab1', label: 'Tab 1' },
        { key: 'tab2', label: 'Tab 2' },
        { key: 'tab3', label: 'Tab 3' },
      ]}
    />
  ),
};

export const TwoTabs: Story = {
  render: () => (
    <TabWrapper
      tabs={[
        { key: 'active', label: 'Active' },
        { key: 'inactive', label: 'Inactive', count: 5 },
      ]}
    />
  ),
};

export const LongLabels: Story = {
  render: () => (
    <TabWrapper
      tabs={[
        { key: 'very-long-tab-name', label: 'Very Long Tab Name' },
        { key: 'another-long-name', label: 'Another Long Name', count: 99 },
        { key: 'short', label: 'Short' },
      ]}
    />
  ),
};
