import type { Meta, StoryObj } from '@storybook/react';

import { AccountabilityCol } from '@/components/biz/table';

const meta: Meta = {
  title: 'Components/Biz/Table/AccountabilityCol',
  component: AccountabilityCol.Header,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
AccountabilityCol provides specialized header and cell components for accountability metrics columns in tables.
It displays accountability metrics as styled tags with proper visual hierarchy.

## Components
- **AccountabilityCol.Header**: Table header with tooltip for accountability columns
- **AccountabilityCol.Cell**: Table cell that displays accountability metrics as tags

## Features
- Pure UI components without business logic
- Consistent styling with other table components
- Built-in tooltip support for accountability metrics
- Tag-based display following Figma design specifications
- Responsive layout with proper spacing
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AccountabilityCol.Header>;

// Header Stories
export const Header: Story = {
  render: () => (
    <table className="border-separate border-spacing-0">
      <thead>
        <tr className="bg-[#F5F5F5]">
          <AccountabilityCol.Header width={228} />
        </tr>
      </thead>
    </table>
  ),
};

export const HeaderWithCustomWidth: Story = {
  render: () => (
    <table className="border-separate border-spacing-0">
      <thead>
        <tr className="bg-[#F5F5F5]">
          <AccountabilityCol.Header width={300} />
        </tr>
      </thead>
    </table>
  ),
};

export const HeaderLast: Story = {
  render: () => (
    <table className="border-separate border-spacing-0">
      <thead>
        <tr className="bg-[#F5F5F5]">
          <AccountabilityCol.Header width={228} />
          <AccountabilityCol.Header width={200} isLast />
        </tr>
      </thead>
    </table>
  ),
};

// Cell Stories
export const CellWithSingleMetric: Story = {
  render: () => (
    <table className="border-separate border-spacing-0">
      <tbody>
        <tr>
          <AccountabilityCol.Cell
            width={228}
            accountability={['Transparency']}
          />
        </tr>
      </tbody>
    </table>
  ),
};

export const CellWithMultipleMetrics: Story = {
  render: () => (
    <table className="border-separate border-spacing-0">
      <tbody>
        <tr>
          <AccountabilityCol.Cell
            width={228}
            accountability={['Transparency', 'Performance', 'Participation']}
          />
        </tr>
      </tbody>
    </table>
  ),
};

export const CellEmpty: Story = {
  render: () => (
    <table className="border-separate border-spacing-0">
      <tbody>
        <tr>
          <AccountabilityCol.Cell width={228} accountability={[]} />
        </tr>
      </tbody>
    </table>
  ),
};

export const CellUndefined: Story = {
  render: () => (
    <table className="border-separate border-spacing-0">
      <tbody>
        <tr>
          <AccountabilityCol.Cell width={228} />
        </tr>
      </tbody>
    </table>
  ),
};

// Complete Table Example
export const CompleteTableExample: Story = {
  render: () => (
    <div className="w-full max-w-4xl">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr className="bg-[#F5F5F5]">
            <AccountabilityCol.Header width={200} />
            <AccountabilityCol.Header width={228} />
            <AccountabilityCol.Header width={150} isLast />
          </tr>
        </thead>
        <tbody>
          <tr>
            <AccountabilityCol.Cell
              width={200}
              accountability={['Transparency']}
            >
              Project Name
            </AccountabilityCol.Cell>
            <AccountabilityCol.Cell
              width={228}
              accountability={['Transparency', 'Performance']}
            />
            <AccountabilityCol.Cell
              width={150}
              accountability={['Participation']}
              isLast
            />
          </tr>
          <tr>
            <AccountabilityCol.Cell
              width={200}
              accountability={['Performance Eval']}
            >
              Launch Plan
            </AccountabilityCol.Cell>
            <AccountabilityCol.Cell
              width={228}
              accountability={['Transparency', 'Performance Eval']}
            />
            <AccountabilityCol.Cell width={150} accountability={[]} isLast />
          </tr>
          <tr>
            <AccountabilityCol.Cell
              width={200}
              accountability={['Transparency', 'Participation']}
              isLastRow
            >
              Ownership
            </AccountabilityCol.Cell>
            <AccountabilityCol.Cell
              width={228}
              accountability={['Transparency']}
              isLastRow
            />
            <AccountabilityCol.Cell
              width={150}
              accountability={['Community Acceptance']}
              isLast
              isLastRow
            />
          </tr>
        </tbody>
      </table>
    </div>
  ),
};

// Usage Examples
export const UsageExamples: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Basic Usage</h3>
        <div className="rounded border p-4">
          <pre className="text-sm">
            {`// Header
<AccountabilityCol.Header width={228} />

// Cell with accountability metrics
<AccountabilityCol.Cell accountability={['Transparency', 'Performance']} width={228} />

// Empty cell
<AccountabilityCol.Cell accountability={[]} width={228} />`}
          </pre>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">
          Common Accountability Metrics
        </h3>
        <div className="space-y-2">
          <AccountabilityCol.Cell
            accountability={['Transparency']}
            width={228}
          />
          <AccountabilityCol.Cell
            accountability={['Performance']}
            width={228}
          />
          <AccountabilityCol.Cell
            accountability={['Participation']}
            width={228}
          />
          <AccountabilityCol.Cell
            accountability={['Performance Eval']}
            width={228}
          />
          <AccountabilityCol.Cell
            accountability={['Community Acceptance']}
            width={228}
          />
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Multiple Metrics</h3>
        <div className="space-y-2">
          <AccountabilityCol.Cell
            accountability={['Transparency', 'Performance']}
            width={300}
          />
          <AccountabilityCol.Cell
            accountability={['Transparency', 'Performance Eval']}
            width={300}
          />
          <AccountabilityCol.Cell
            accountability={['Transparency', 'Participation']}
            width={300}
          />
        </div>
      </div>
    </div>
  ),
};
