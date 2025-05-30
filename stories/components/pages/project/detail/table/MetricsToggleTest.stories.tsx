import { Button } from '@heroui/react';
import type { Meta, StoryObj } from '@storybook/react';
import { createColumnHelper } from '@tanstack/react-table';
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
  title: 'Components/Pages/Project/Detail/Table/MetricsToggleTest',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Simple test to verify that the Metrics toggle functionality works correctly.
This story directly tests the column visibility logic without complex table setup.
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// Mock data type
interface TestRowData {
  key: string;
  property: string;
  input: string;
  reference: any;
  submitter: any;
  accountability: string[];
  legitimacy: string[];
}

// Mock data
const mockData: TestRowData[] = [
  {
    key: 'name',
    property: 'Project Name',
    input: 'ECF Pensieve MVP',
    reference: null,
    submitter: {
      name: 'John Doe',
      avatarUrl: null,
      userId: 'test',
      address: '',
      weight: null,
      invitationCodeId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    accountability: ['Transparency'],
    legitimacy: [],
  },
  {
    key: 'categories',
    property: 'Categories',
    input: 'Development, Community',
    reference: null,
    submitter: {
      name: 'Jane Smith',
      avatarUrl: null,
      userId: 'test2',
      address: '',
      weight: null,
      invitationCodeId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    accountability: ['Transparency'],
    legitimacy: ['Community Participation'],
  },
  {
    key: 'adoption_plan',
    property: 'Adoption Plan',
    input: 'Community-driven adoption strategy...',
    reference: null,
    submitter: {
      name: 'Alice Brown',
      avatarUrl: null,
      userId: 'test3',
      address: '',
      weight: null,
      invitationCodeId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    accountability: ['Participation', 'Performance Eval'],
    legitimacy: ['Community Acceptance'],
  },
];

export const SimpleMetricsToggle: Story = {
  render: () => {
    const [showMetrics, setShowMetrics] = useState(false);
    const columnHelper = createColumnHelper<TestRowData>();

    // Define columns similar to ProjectDetailTableColumns
    const propertyColumn = columnHelper.accessor('property', {
      id: 'property',
      header: () => <PropertyCol.Header />,
      size: 200,
      cell: (info) => (
        <PropertyCol.Cell itemKey={info.row.original.key}>
          {info.getValue()}
        </PropertyCol.Cell>
      ),
    });

    const inputColumn = columnHelper.accessor('input', {
      id: 'input',
      header: () => <InputCol.Header />,
      size: 300,
      cell: (info) => (
        <InputCol.Cell
          value={info.getValue()}
          itemKey={info.row.original.key as any}
        />
      ),
    });

    const referenceColumn = columnHelper.accessor('reference', {
      id: 'reference',
      header: () => <ReferenceCol.Header />,
      size: 124,
      cell: () => <ReferenceCol.Cell hasReference={false} />,
    });

    const submitterColumn = columnHelper.accessor('submitter', {
      id: 'submitter',
      header: () => <SubmitterCol.Header />,
      size: 183,
      cell: (info) => (
        <SubmitterCol.Cell
          item={info.row.original}
          itemConfig={{ isEssential: true }}
          submitter={info.getValue()}
          data={new Date()}
        />
      ),
    });

    const accountabilityColumn = columnHelper.accessor('accountability', {
      id: 'accountability',
      header: () => <AccountabilityCol.Header />,
      size: 228,
      cell: (info) => (
        <AccountabilityCol.Cell accountability={info.getValue()} />
      ),
    });

    const legitimacyColumn = columnHelper.accessor('legitimacy', {
      id: 'legitimacy',
      header: () => <LegitimacyCol.Header />,
      size: 228,
      cell: (info) => <LegitimacyCol.Cell legitimacy={info.getValue()} />,
    });

    const actionsColumn = columnHelper.accessor('key', {
      id: 'actions',
      header: () => <ActionsCol.Header />,
      size: 195,
      cell: (info) => (
        <ActionsCol.Cell
          item={info.row.original}
          itemConfig={{ isEssential: true }}
          onView={() => console.log('View clicked')}
        />
      ),
    });

    // Build columns array based on showMetrics
    const baseColumns = [
      propertyColumn,
      inputColumn,
      referenceColumn,
      submitterColumn,
    ];
    const metricsColumns = showMetrics
      ? [accountabilityColumn, legitimacyColumn]
      : [];
    const actionColumns = [actionsColumn];
    const allColumns = [...baseColumns, ...metricsColumns, ...actionColumns];

    return (
      <div className="p-8">
        <div className="mb-6">
          <h2 className="mb-4 text-xl font-bold">Metrics Toggle Test</h2>
          <div className="mb-4 flex items-center gap-4">
            <Button
              size="sm"
              variant={showMetrics ? 'solid' : 'bordered'}
              color={showMetrics ? 'primary' : 'default'}
              onPress={() => setShowMetrics(!showMetrics)}
              className="text-[13px] font-[500]"
            >
              {showMetrics ? 'Hide Metrics' : 'Show Metrics'}
            </Button>
            <span className="text-sm text-gray-600">
              Columns: {allColumns.length} total
              {showMetrics && ' (including 2 metrics columns)'}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-[#F5F5F5]">
                {allColumns.map((column, index) => (
                  <th
                    key={column.id}
                    style={{ width: column.getSize() }}
                    className="border-b border-r border-gray-200 p-2 text-left last:border-r-0"
                  >
                    {typeof column.columnDef.header === 'function'
                      ? column.columnDef.header({} as any)
                      : column.columnDef.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockData.map((row, rowIndex) => (
                <tr key={row.key}>
                  {allColumns.map((column, colIndex) => (
                    <td
                      key={`${row.key}-${column.id}`}
                      style={{ width: column.getSize() }}
                      className="border-b border-r border-gray-200 p-2 last:border-r-0"
                    >
                      {typeof column.columnDef.cell === 'function'
                        ? column.columnDef.cell({
                            getValue: () => (row as any)[column.id],
                            row: { original: row },
                          } as any)
                        : (row as any)[column.id]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p>
            <strong>Current state:</strong> Metrics are{' '}
            {showMetrics ? 'visible' : 'hidden'}
          </p>
          <p>
            <strong>Expected behavior:</strong> Clicking the button should{' '}
            {showMetrics ? 'hide' : 'show'} the Accountability and Legitimacy
            columns
          </p>
        </div>
      </div>
    );
  },
};
