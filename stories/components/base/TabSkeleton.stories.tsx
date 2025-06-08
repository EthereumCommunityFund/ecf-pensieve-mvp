import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import Tab, { TabSkeleton } from '@/components/base/Tab';
import { TabItem } from '@/components/base/Tab/types';

const meta: Meta<typeof TabSkeleton> = {
  title: 'Components/Base/TabSkeleton',
  component: TabSkeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    tabCount: {
      control: { type: 'number', min: 1, max: 5 },
      description: 'Number of tab placeholders to show',
      defaultValue: 2,
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic skeleton examples
export const Default: Story = {
  args: {
    tabCount: 2,
  },
  render: (args) => (
    <div className="w-[400px]">
      <TabSkeleton {...args} />
    </div>
  ),
};

export const ThreeTabs: Story = {
  args: {
    tabCount: 3,
  },
  render: (args) => (
    <div className="w-[400px]">
      <TabSkeleton {...args} />
    </div>
  ),
};

// Comparison with real tabs
const TabWrapper = ({ tabs }: { tabs: TabItem[] }) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.key || '');

  return (
    <div className="w-[400px]">
      <Tab tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export const LoadingStateComparison: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">
          Loading State (Button with Text Skeleton)
        </h3>
        <div className="w-[400px]">
          <TabSkeleton tabCount={2} />
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Loaded State (Real Tabs)</h3>
        <TabWrapper
          tabs={[
            {
              key: 'submission-queue',
              label: 'Submission Queue',
              count: 5,
            },
            { key: 'consensus-log', label: 'Consensus Log' },
          ]}
        />
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">
          With Displayed Tab (3 tabs skeleton)
        </h3>
        <div className="w-[400px]">
          <TabSkeleton tabCount={3} />
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">
          Real 3 Tabs for Comparison
        </h3>
        <TabWrapper
          tabs={[
            { key: 'displayed', label: 'Displayed' },
            {
              key: 'submission-queue',
              label: 'Submission Queue',
              count: 5,
            },
            { key: 'consensus-log', label: 'Consensus Log' },
          ]}
        />
      </div>
    </div>
  ),
};

// Different tab counts
export const VariousTabCounts: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <h4 className="mb-2 text-sm font-medium">1 Tab</h4>
        <div className="w-[400px]">
          <TabSkeleton tabCount={1} />
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-medium">2 Tabs (Default)</h4>
        <div className="w-[400px]">
          <TabSkeleton tabCount={2} />
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-medium">3 Tabs</h4>
        <div className="w-[400px]">
          <TabSkeleton tabCount={3} />
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-medium">4 Tabs</h4>
        <div className="w-[400px]">
          <TabSkeleton tabCount={4} />
        </div>
      </div>
    </div>
  ),
};
