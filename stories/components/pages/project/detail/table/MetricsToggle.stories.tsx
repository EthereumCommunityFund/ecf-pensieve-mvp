import { Button } from '@heroui/react';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import {
  AccountabilityCol,
  ActionsCol,
  InputCol,
  LegitimacyCol,
  PropertyCol,
  ReferenceCol,
  SubmitterCol,
} from '@/components/biz/table';

const meta: Meta = {
  title: 'Components/Pages/Project/Detail/Table/MetricsToggle',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Demonstration of the Metrics toggle functionality in ProjectDetailTable.
Shows how the "Show Metrics" / "Hide Metrics" button controls the visibility of 
Accountability and Legitimacy columns in the project detail table.

## Features
- Toggle button to show/hide metrics columns
- Smooth column addition/removal
- Consistent table layout with and without metrics
- Real-world data examples
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// Mock data for demonstration
const mockData = [
  {
    property: 'Project Name',
    input: 'ECF Pensieve MVP',
    hasReference: true,
    submitter: { name: 'John Doe', date: '15/11/2024' },
    accountability: ['Transparency'],
    legitimacy: [],
  },
  {
    property: 'Categories',
    input: 'Development, Community',
    hasReference: false,
    submitter: { name: 'Jane Smith', date: '14/11/2024' },
    accountability: ['Transparency'],
    legitimacy: ['Community Participation'],
  },
  {
    property: 'White Paper',
    input: 'https://example.com/whitepaper.pdf',
    hasReference: true,
    submitter: { name: 'Bob Wilson', date: '13/11/2024' },
    accountability: ['Transparency'],
    legitimacy: ['Legitimacy by Process'],
  },
  {
    property: 'Adoption Plan',
    input: 'Community-driven adoption strategy with phased rollout...',
    hasReference: true,
    submitter: { name: 'Alice Brown', date: '12/11/2024' },
    accountability: ['Participation', 'Performance Eval'],
    legitimacy: ['Community Acceptance'],
  },
];

export const MetricsToggleDemo: Story = {
  render: () => {
    const [metricsVisible, setMetricsVisible] = useState(false);

    const toggleMetrics = () => {
      setMetricsVisible(!metricsVisible);
    };

    // Define base columns
    const baseColumns = [
      {
        key: 'property',
        header: <PropertyCol.Header width={200} />,
        width: 200,
      },
      { key: 'input', header: <InputCol.Header width={300} />, width: 300 },
      {
        key: 'reference',
        header: <ReferenceCol.Header width={124} />,
        width: 124,
      },
      {
        key: 'submitter',
        header: <SubmitterCol.Header width={183} />,
        width: 183,
      },
    ];

    // Define metrics columns
    const metricsColumns = [
      {
        key: 'accountability',
        header: <AccountabilityCol.Header width={228} />,
        width: 228,
      },
      {
        key: 'legitimacy',
        header: <LegitimacyCol.Header width={228} />,
        width: 228,
      },
    ];

    // Define actions column
    const actionsColumns = [
      {
        key: 'actions',
        header: <ActionsCol.Header width={195} isLast />,
        width: 195,
      },
    ];

    // Combine columns based on metrics visibility
    const allColumns = [
      ...baseColumns,
      ...(metricsVisible ? metricsColumns : []),
      ...actionsColumns,
    ];

    return (
      <div className="w-full max-w-6xl space-y-4">
        {/* Toggle Button */}
        <div className="flex justify-end">
          <Button
            size="sm"
            variant={metricsVisible ? 'solid' : 'bordered'}
            color={metricsVisible ? 'primary' : 'default'}
            onPress={toggleMetrics}
            className="text-[13px] font-[500]"
          >
            {metricsVisible ? 'Hide Metrics' : 'Show Metrics'}
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-[#F5F5F5]">
                {allColumns.map((col, index) => (
                  <th key={col.key} style={{ width: col.width }}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <PropertyCol.Cell
                    width={200}
                    isLastRow={rowIndex === mockData.length - 1}
                  >
                    {row.property}
                  </PropertyCol.Cell>
                  <InputCol.Cell
                    width={300}
                    value={row.input}
                    itemKey="name"
                    isLastRow={rowIndex === mockData.length - 1}
                  />
                  <ReferenceCol.Cell
                    width={124}
                    hasReference={row.hasReference}
                    isLastRow={rowIndex === mockData.length - 1}
                  />
                  <SubmitterCol.Cell
                    width={183}
                    item={{ createdAt: new Date() }}
                    itemConfig={{ isEssential: true }}
                    submitter={{
                      name: row.submitter.name,
                      avatarUrl: null,
                      userId: 'test',
                      address: '',
                      weight: null,
                      invitationCodeId: null,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                    }}
                    data={new Date()}
                    isLastRow={rowIndex === mockData.length - 1}
                  />
                  {metricsVisible && (
                    <>
                      <AccountabilityCol.Cell
                        width={228}
                        accountability={row.accountability}
                        isLastRow={rowIndex === mockData.length - 1}
                      />
                      <LegitimacyCol.Cell
                        width={228}
                        legitimacy={row.legitimacy}
                        isLastRow={rowIndex === mockData.length - 1}
                      />
                    </>
                  )}
                  <ActionsCol.Cell
                    width={195}
                    item={{ key: 'test' }}
                    itemConfig={{ isEssential: true }}
                    isLast
                    isLastRow={rowIndex === mockData.length - 1}
                  />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Status Information */}
        <div className="text-sm text-gray-600">
          <p>
            <strong>Status:</strong> Metrics columns are currently{' '}
            <span
              className={metricsVisible ? 'text-green-600' : 'text-red-600'}
            >
              {metricsVisible ? 'visible' : 'hidden'}
            </span>
          </p>
          <p>
            <strong>Columns shown:</strong> {allColumns.length} total
            {metricsVisible && ' (including 2 metrics columns)'}
          </p>
        </div>
      </div>
    );
  },
};

export const ButtonStatesDemo: Story = {
  render: () => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Button States</h3>

        <div className="flex gap-4">
          <div className="text-center">
            <Button
              size="sm"
              variant="bordered"
              color="default"
              className="text-[13px] font-[500]"
            >
              Show Metrics
            </Button>
            <p className="mt-2 text-sm text-gray-600">Hidden State</p>
          </div>

          <div className="text-center">
            <Button
              size="sm"
              variant="solid"
              color="primary"
              className="text-[13px] font-[500]"
            >
              Hide Metrics
            </Button>
            <p className="mt-2 text-sm text-gray-600">Visible State</p>
          </div>
        </div>

        <div className="mt-6 rounded border p-4">
          <h4 className="mb-2 font-medium">Usage</h4>
          <pre className="text-sm">
            {`<Button
  size="sm"
  variant={metricsVisible ? "solid" : "bordered"}
  color={metricsVisible ? "primary" : "default"}
  onPress={toggleMetricsVisible}
  className="text-[13px] font-[500]"
>
  {metricsVisible ? "Hide Metrics" : "Show Metrics"}
</Button>`}
          </pre>
        </div>
      </div>
    );
  },
};
