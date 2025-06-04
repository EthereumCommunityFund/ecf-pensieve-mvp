import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { groupTableRows } from '@/components/biz/table/utils';

const meta: Meta = {
  title: 'Components/Biz/Table/GroupingUtils',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Table Grouping Utilities

Utilities for implementing table grouping functionality that allows organizing
related table rows into collapsible/expandable groups with visual distinction.

## groupTableRows Function

Takes an array of table rows and groups them by their group property,
maintaining the original order while inserting group headers where needed.

### Features
- Maintains original item order
- Inserts group headers automatically
- Supports mixed grouped and ungrouped items
- Type-safe with TypeScript generics

### Example Usage
\`\`\`typescript
const rows = [
  { key: 'name', property: 'Project Name', group: undefined },
  { key: 'websiteUrl', property: 'Website URL', group: 'ProjectLinks', groupTitle: 'Project Links' },
  { key: 'appUrl', property: 'App URL', group: 'ProjectLinks', groupTitle: 'Project Links' },
  { key: 'dateFounded', property: 'Date Founded', group: 'ProjectDates', groupTitle: 'Project Dates' },
];

const groupedRows = groupTableRows(rows);
// Result includes group headers inserted at appropriate positions
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data for testing
const mockTableRows = [
  { key: 'name', property: 'Project Name', input: 'Example Project' },
  { key: 'tagline', property: 'Tagline', input: 'A great project' },
  {
    key: 'websiteUrl',
    property: 'Website URL',
    input: 'https://example.com',
    group: 'ProjectLinks',
    groupTitle: 'Project Links',
  },
  {
    key: 'appUrl',
    property: 'App URL',
    input: 'https://app.example.com',
    group: 'ProjectLinks',
    groupTitle: 'Project Links',
  },
  {
    key: 'whitePaper',
    property: 'White Paper',
    input: 'https://docs.example.com',
    group: 'ProjectLinks',
    groupTitle: 'Project Links',
  },
  { key: 'tags', property: 'Tags', input: 'DeFi, Web3' },
  {
    key: 'dateFounded',
    property: 'Date Founded',
    input: '2023-01-01',
    group: 'ProjectDates',
    groupTitle: 'Project Dates',
  },
  {
    key: 'dateLaunch',
    property: 'Date Launch',
    input: '2023-06-01',
    group: 'ProjectDates',
    groupTitle: 'Project Dates',
  },
];

export const BasicGrouping: Story = {
  render: function BasicGroupingRender() {
    const groupedRows = groupTableRows(mockTableRows);

    return (
      <div className="w-full max-w-4xl">
        <h3 className="text-lg font-semibold mb-4">Table Grouping Example</h3>

        <div className="mb-6">
          <h4 className="text-md font-medium mb-2">Original Data:</h4>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
            {JSON.stringify(
              mockTableRows.map((row) => ({
                key: row.key,
                group: row.group || 'none',
              })),
              null,
              2,
            )}
          </pre>
        </div>

        <div className="mb-6">
          <h4 className="text-md font-medium mb-2">Grouped Result:</h4>
          <div className="bg-gray-100 p-3 rounded">
            {groupedRows.map((row, index) => (
              <div key={index} className="mb-1">
                {'isGroupHeader' in row ? (
                  <div className="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    📁 GROUP: {row.groupTitle}
                  </div>
                ) : (
                  <div className="pl-4 text-gray-700">
                    • {row.property} {row.group && `(${row.group})`}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-md font-medium mb-2">
            Visual Table Representation:
          </h4>
          <table className="w-full border-separate border-spacing-0 border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left">
                  Property
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left">
                  Input
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left">
                  Group
                </th>
              </tr>
            </thead>
            <tbody>
              {groupedRows.map((row, index) =>
                'isGroupHeader' in row ? (
                  <tr key={index} className="bg-blue-50">
                    <td
                      colSpan={3}
                      className="border border-gray-300 px-3 py-2 font-semibold text-blue-700"
                    >
                      📁 {row.groupTitle}
                    </td>
                  </tr>
                ) : (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-3 py-2">
                      {row.property}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {row.input}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-500">
                      {row.group || '-'}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
};

export const EmptyData: Story = {
  render: function EmptyDataRender() {
    const emptyRows: any[] = [];
    const groupedRows = groupTableRows(emptyRows);

    return (
      <div className="w-full max-w-2xl">
        <h3 className="text-lg font-semibold mb-4">Empty Data Test</h3>
        <p className="text-gray-600 mb-4">
          Testing groupTableRows with empty array input.
        </p>
        <div className="bg-gray-100 p-3 rounded">
          <strong>Input:</strong> []
          <br />
          <strong>Output:</strong> {JSON.stringify(groupedRows)}
          <br />
          <strong>Length:</strong> {groupedRows.length}
        </div>
      </div>
    );
  },
};

export const NoGroupsData: Story = {
  render: function NoGroupsDataRender() {
    const noGroupRows = [
      { key: 'name', property: 'Project Name', input: 'Example Project' },
      { key: 'tagline', property: 'Tagline', input: 'A great project' },
      {
        key: 'description',
        property: 'Description',
        input: 'Project description',
      },
    ];
    const groupedRows = groupTableRows(noGroupRows);

    return (
      <div className="w-full max-w-2xl">
        <h3 className="text-lg font-semibold mb-4">No Groups Test</h3>
        <p className="text-gray-600 mb-4">
          Testing groupTableRows with data that has no group information.
        </p>
        <div className="bg-gray-100 p-3 rounded">
          <div className="mb-2">
            <strong>Input rows:</strong> {noGroupRows.length}
          </div>
          <div className="mb-2">
            <strong>Output rows:</strong> {groupedRows.length}
          </div>
          <div>
            <strong>Group headers added:</strong>{' '}
            {groupedRows.filter((row) => 'isGroupHeader' in row).length}
          </div>
        </div>
      </div>
    );
  },
};

export const InteractiveGrouping: Story = {
  render: function InteractiveGroupingRender() {
    const [groupExpanded, setGroupExpanded] = React.useState<
      Record<string, boolean>
    >({
      ProjectLinks: true,
      ProjectDates: true,
    });

    const toggleGroup = (groupKey: string) => {
      setGroupExpanded((prev) => ({
        ...prev,
        [groupKey]: prev[groupKey] === false ? true : false,
      }));
    };

    const groupedRows = groupTableRows(mockTableRows, groupExpanded);

    return (
      <div className="w-full max-w-4xl">
        <h2 className="text-2xl font-bold mb-6">
          Interactive Group Expand/Collapse Demo
        </h2>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Group Controls</h3>
          <div className="flex gap-4">
            <button
              onClick={() => toggleGroup('ProjectLinks')}
              className={`px-4 py-2 rounded ${
                groupExpanded.ProjectLinks !== false
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Project Links:{' '}
              {groupExpanded.ProjectLinks !== false ? 'Expanded' : 'Collapsed'}
            </button>
            <button
              onClick={() => toggleGroup('ProjectDates')}
              className={`px-4 py-2 rounded ${
                groupExpanded.ProjectDates !== false
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Project Dates:{' '}
              {groupExpanded.ProjectDates !== false ? 'Expanded' : 'Collapsed'}
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Current State</h3>
          <div className="bg-gray-100 p-3 rounded">
            <div className="mb-2">
              <strong>Total rows (including headers):</strong>{' '}
              {groupedRows.length}
            </div>
            <div className="mb-2">
              <strong>Group headers:</strong>{' '}
              {groupedRows.filter((row) => 'isGroupHeader' in row).length}
            </div>
            <div className="mb-2">
              <strong>Data rows:</strong>{' '}
              {groupedRows.filter((row) => !('isGroupHeader' in row)).length}
            </div>
            <div>
              <strong>Visible groups:</strong>{' '}
              {Object.entries(groupExpanded)
                .filter(([_, expanded]) => expanded !== false)
                .map(([key]) => key)
                .join(', ')}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Visual Result</h3>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border-b border-gray-300 px-4 py-3 text-left font-semibold">
                    Property
                  </th>
                  <th className="border-b border-gray-300 px-4 py-3 text-left font-semibold">
                    Input
                  </th>
                  <th className="border-b border-gray-300 px-4 py-3 text-left font-semibold">
                    Group
                  </th>
                </tr>
              </thead>
              <tbody>
                {groupedRows.map((item, index) =>
                  'isGroupHeader' in item ? (
                    <tr key={`group-${index}`} className="bg-blue-50">
                      <td
                        colSpan={3}
                        className="border-b border-gray-200 px-4 py-3 font-semibold text-blue-700"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`transform transition-transform ${item.isExpanded ? 'rotate-90' : 'rotate-0'}`}
                          >
                            ▶
                          </span>
                          📁 {item.groupTitle} (
                          {item.isExpanded ? 'Expanded' : 'Collapsed'})
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border-b border-gray-200 px-4 py-3">
                        {item.property}
                      </td>
                      <td className="border-b border-gray-200 px-4 py-3">
                        {item.input}
                      </td>
                      <td className="border-b border-gray-200 px-4 py-3 text-sm text-gray-500">
                        {item.group || '-'}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  },
};
