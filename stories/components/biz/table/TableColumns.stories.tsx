import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import {
  ActionsCol,
  InputCol,
  PropertyCol,
  ReferenceCol,
  SubmitterCol,
  SupportCol,
} from '@/components/biz/table';

const meta: Meta = {
  title: 'Components/Biz/Table/TableColumns',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Complete table column components library for project proposal tables.
All components are pure UI components without business logic dependencies.

## Available Column Components
- **PropertyCol**: Property name with weight indicator
- **InputCol**: Input values with expandable content support
- **ReferenceCol**: Reference buttons and empty states
- **SubmitterCol**: Submitter information with avatar, name and date
- **ActionsCol**: Action buttons (View, Menu) for table rows
- **SupportCol**: Vote/support functionality with progress indicators
- **FieldTypeCol**: Field type information (reserved for future use)

## Features
- Pure UI components without business logic
- Consistent styling across all components
- Full TypeScript support
- Responsive design
- Accessible interactions
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// Mock data for examples
const mockProject = {
  id: 1,
  name: 'Test Project',
} as any;

const mockProposal = {
  id: 1,
  projectId: 1,
} as any;

const mockProposalItem = {
  key: 'name',
  property: 'Project Name',
  input: 'ECF Pensieve MVP',
  reference: 'Reference content',
} as any;

// Complete Table Example with All Column Types
const CompleteTableExampleComponent = () => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleExpand = (key: string) => {
    setExpandedRows((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const data = [
    {
      key: 'name',
      property: 'Project Name',
      input: 'ECF Pensieve MVP',
      hasReference: true,
      isExpandable: false,
    },
    {
      key: 'tagline',
      property: 'Tagline',
      input: 'A decentralized knowledge management system',
      hasReference: true,
      isExpandable: true,
    },
    {
      key: 'mainDescription',
      property: 'Main Description',
      input:
        'This is a comprehensive description of the project that can be expanded to show more details...',
      hasReference: false,
      isExpandable: true,
    },
  ];

  return (
    <div className="w-full max-w-6xl">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr className="bg-[#F5F5F5]">
            <PropertyCol.Header width={200} />
            <InputCol.Header width={300} />
            <ReferenceCol.Header width={124} />
            <SubmitterCol.Header width={183} />
            <ActionsCol.Header width={195} isLast />
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={row.key}>
              <PropertyCol.Cell
                width={200}
                itemKey={row.key}
                isLastRow={index === data.length - 1}
              >
                {row.property}
              </PropertyCol.Cell>

              <InputCol.Cell
                width={300}
                value={row.input}
                itemKey={row.key as any}
                isExpandable={row.isExpandable}
                isExpanded={expandedRows[row.key]}
                onToggleExpand={() => toggleExpand(row.key)}
                isLastRow={index === data.length - 1}
              />

              <ReferenceCol.Cell
                width={124}
                hasReference={row.hasReference}
                onShowReference={() => alert(`Show reference for ${row.key}`)}
                isLastRow={index === data.length - 1}
              />

              <SubmitterCol.Cell
                width={183}
                submitter={{
                  name: 'Username',
                  date: '12/25/2024',
                }}
                isLastRow={index === data.length - 1}
              />

              <ActionsCol.Cell
                width={195}
                onView={() => alert(`View ${row.key}`)}
                onMenu={() => alert(`Menu for ${row.key}`)}
                isLast
                isLastRow={index === data.length - 1}
              />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const CompleteTableExample: Story = {
  render: () => <CompleteTableExampleComponent />,
};

// Individual Column Examples
export const PropertyColumnExample: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr className="bg-[#F5F5F5]">
            <PropertyCol.Header width={200} isLast />
          </tr>
        </thead>
        <tbody>
          <tr>
            <PropertyCol.Cell width={200} itemKey="name" isLast isLastRow>
              Project Name
            </PropertyCol.Cell>
          </tr>
        </tbody>
      </table>
    </div>
  ),
};

const InputColumnExampleComponent = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full max-w-md">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr className="bg-[#F5F5F5]">
            <InputCol.Header width={300} isLast />
          </tr>
        </thead>
        <tbody>
          <tr>
            <InputCol.Cell
              width={300}
              value="This is expandable content"
              itemKey="tagline"
              isExpandable={true}
              isExpanded={isExpanded}
              onToggleExpand={() => setIsExpanded(!isExpanded)}
              isLast
              isLastRow
            />
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export const InputColumnExample: Story = {
  render: () => <InputColumnExampleComponent />,
};

export const ReferenceColumnExample: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr className="bg-[#F5F5F5]">
            <ReferenceCol.Header width={124} isLast />
          </tr>
        </thead>
        <tbody>
          <tr>
            <ReferenceCol.Cell
              width={124}
              hasReference={true}
              onShowReference={() => alert('Show reference')}
              isLast
              isLastRow
            />
          </tr>
        </tbody>
      </table>
    </div>
  ),
};

export const SubmitterColumnExample: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr className="bg-[#F5F5F5]">
            <SubmitterCol.Header width={183} isLast />
          </tr>
        </thead>
        <tbody>
          <tr>
            <SubmitterCol.Cell
              width={183}
              submitter={{
                name: 'John Doe',
                date: '12/25/2024',
              }}
              isLast
              isLastRow
            />
          </tr>
        </tbody>
      </table>
    </div>
  ),
};

export const ActionsColumnExample: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr className="bg-[#F5F5F5]">
            <ActionsCol.Header width={195} isLast />
          </tr>
        </thead>
        <tbody>
          <tr>
            <ActionsCol.Cell
              width={195}
              onView={() => alert('View action triggered')}
              onMenu={() => alert('Menu action triggered')}
              isLast
              isLastRow
            />
          </tr>
        </tbody>
      </table>
    </div>
  ),
};

export const SupportColumnExample: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr className="bg-[#F5F5F5]">
            <SupportCol.Header width={220} isLast />
          </tr>
        </thead>
        <tbody>
          <tr>
            <SupportCol.Cell
              width={220}
              fieldKey="name"
              project={mockProject}
              proposal={mockProposal}
              proposalItem={mockProposalItem}
              itemPoints={8}
              itemPointsNeeded={10}
              isReachQuorum={true}
              isReachPointsNeeded={false}
              isValidated={false}
              votedMemberCount={3}
              isUserVoted={true}
              isLoading={false}
              onVoteAction={async () => {
                alert('Vote action triggered');
              }}
              isLast
              isLastRow
            />
          </tr>
        </tbody>
      </table>
    </div>
  ),
};

// Migration Example
export const MigrationExample: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">
          Migration from columnHelper
        </h3>
        <div className="rounded border p-4">
          <h4 className="mb-2 font-semibold">Before (columnHelper pattern):</h4>
          <pre className="text-sm text-gray-600">
            {`const propertyColumn = columnHelper.accessor('property', {
  id: 'property',
  header: () => <TooltipTh title="Property" />,
  size: 220,
  cell: (info) => {
    const rowKey = info.row.original.key;
    return (
      <div className="flex w-full items-center justify-between">
        <div>{info.getValue()}</div>
        <TooltipItemWeight itemWeight={ESSENTIAL_ITEM_MAP[rowKey].weight} />
      </div>
    );
  },
});`}
          </pre>

          <h4 className="mb-2 mt-4 font-semibold">
            After (Pure UI components):
          </h4>
          <pre className="text-sm text-gray-600">
            {`// Header
<PropertyCol.Header width={220} />

// Cell
<PropertyCol.Cell itemKey={rowKey} width={220}>
  {propertyValue}
</PropertyCol.Cell>`}
          </pre>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Benefits</h3>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>Pure UI components without business logic</li>
          <li>Better testability and maintainability</li>
          <li>Reusable across different table implementations</li>
          <li>Type-safe with full TypeScript support</li>
          <li>Consistent styling and behavior</li>
          <li>No dependency on table library internals</li>
        </ul>
      </div>
    </div>
  ),
};
