import type { Meta, StoryObj } from '@storybook/react';

import { ModalTableSkeleton } from '@/components/pages/project/detail/modal/ModalTableSkeleton';

const meta: Meta<typeof ModalTableSkeleton> = {
  title: 'Components/Pages/Project/Detail/Modal/ModalTableSkeleton',
  component: ModalTableSkeleton,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    rowCount: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Number of skeleton rows to display',
      defaultValue: 3,
    },
    showHeader: {
      control: 'boolean',
      description: 'Whether to show the table header',
      defaultValue: true,
    },
    columns: {
      control: false,
      description: 'Column configurations for the skeleton table',
    },
    className: {
      control: 'text',
      description: 'Custom className for the container',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ModalTableSkeleton>;

// Default skeleton table (useCommonColumnsOfModal structure)
export const Default: Story = {
  args: {
    rowCount: 3,
    showHeader: true,
  },
};

// Single row skeleton (for displayed items)
export const SingleRow: Story = {
  args: {
    rowCount: 1,
    showHeader: true,
  },
};

// Multiple rows skeleton (for submission queue)
export const MultipleRows: Story = {
  args: {
    rowCount: 5,
    showHeader: true,
  },
};

// Without header
export const WithoutHeader: Story = {
  args: {
    rowCount: 3,
    showHeader: false,
  },
};

// Custom columns for consensus log
export const ConsensusLogSkeleton: Story = {
  args: {
    rowCount: 4,
    showHeader: true,
    columns: [
      { header: 'Date / Time', width: 180 },
      { header: 'Input', width: 480 },
      { header: 'Submitter', width: 183 },
      { header: 'Weight-at-time', width: 200, isLast: true },
    ],
  },
};

// Loading state comparison
export const LoadingStateComparison: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">
          Default Loading (Common Columns)
        </h3>
        <ModalTableSkeleton rowCount={3} />
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">
          Single Row Loading (Displayed)
        </h3>
        <ModalTableSkeleton rowCount={1} />
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Consensus Log Loading</h3>
        <ModalTableSkeleton
          rowCount={4}
          columns={[
            { header: 'Date / Time', width: 180 },
            { header: 'Input', width: 480 },
            { header: 'Submitter', width: 183 },
            { header: 'Weight-at-time', width: 200, isLast: true },
          ]}
        />
      </div>
    </div>
  ),
};

// Different row counts
export const VariousRowCounts: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <h4 className="mb-2 text-sm font-medium">1 Row</h4>
        <ModalTableSkeleton rowCount={1} />
      </div>

      <div>
        <h4 className="mb-2 text-sm font-medium">3 Rows</h4>
        <ModalTableSkeleton rowCount={3} />
      </div>

      <div>
        <h4 className="mb-2 text-sm font-medium">5 Rows</h4>
        <ModalTableSkeleton rowCount={5} />
      </div>
    </div>
  ),
};
