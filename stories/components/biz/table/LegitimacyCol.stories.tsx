import type { Meta, StoryObj } from '@storybook/react';

import { LegitimacyCol } from '@/components/biz/table';

const meta: Meta = {
  title: 'Components/Biz/Table/LegitimacyCol',
  component: LegitimacyCol.Header,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
LegitimacyCol provides specialized header and cell components for legitimacy metrics columns in tables.
It displays legitimacy metrics as styled tags with proper visual hierarchy.

## Components
- **LegitimacyCol.Header**: Table header with tooltip for legitimacy columns
- **LegitimacyCol.Cell**: Table cell that displays legitimacy metrics as tags

## Features
- Pure UI components without business logic
- Consistent styling with other table components
- Built-in tooltip support for legitimacy metrics
- Tag-based display following Figma design specifications
- Responsive layout with proper spacing
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LegitimacyCol.Header>;

// Header Stories
export const Header: Story = {
  render: () => (
    <table className="border-separate border-spacing-0">
      <thead>
        <tr className="bg-[#F5F5F5]">
          <LegitimacyCol.Header width={228} />
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
          <LegitimacyCol.Header width={300} />
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
          <LegitimacyCol.Header width={228} />
          <LegitimacyCol.Header width={200} isLast />
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
          <LegitimacyCol.Cell
            width={228}
            legitimacy={['Community Participation']}
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
          <LegitimacyCol.Cell
            width={300}
            legitimacy={[
              'Legitimacy by Process',
              'Community Acceptance',
              'Legitimacy by Performance',
            ]}
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
          <LegitimacyCol.Cell width={228} legitimacy={[]} />
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
          <LegitimacyCol.Cell width={228} />
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
            <LegitimacyCol.Header width={200} />
            <LegitimacyCol.Header width={300} />
            <LegitimacyCol.Header width={150} isLast />
          </tr>
        </thead>
        <tbody>
          <tr>
            <LegitimacyCol.Cell
              width={200}
              legitimacy={['Community Participation']}
            >
              Categories
            </LegitimacyCol.Cell>
            <LegitimacyCol.Cell
              width={300}
              legitimacy={['Legitimacy by Process']}
            />
            <LegitimacyCol.Cell
              width={150}
              legitimacy={['Community Acceptance']}
              isLast
            />
          </tr>
          <tr>
            <LegitimacyCol.Cell
              width={200}
              legitimacy={['Legitimacy by Performance']}
            >
              White Paper
            </LegitimacyCol.Cell>
            <LegitimacyCol.Cell
              width={300}
              legitimacy={['Legitimacy by Process', 'Community Acceptance']}
            />
            <LegitimacyCol.Cell width={150} legitimacy={[]} isLast />
          </tr>
          <tr>
            <LegitimacyCol.Cell
              width={200}
              legitimacy={['Community Acceptance']}
              isLastRow
            >
              Audit Status
            </LegitimacyCol.Cell>
            <LegitimacyCol.Cell
              width={300}
              legitimacy={['Legitimacy by Process']}
              isLastRow
            />
            <LegitimacyCol.Cell
              width={150}
              legitimacy={['Legitimacy by Performance']}
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
<LegitimacyCol.Header width={228} />

// Cell with legitimacy metrics
<LegitimacyCol.Cell legitimacy={['Community Participation', 'Legitimacy by Process']} width={300} />

// Empty cell
<LegitimacyCol.Cell legitimacy={[]} width={228} />`}
          </pre>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">
          Common Legitimacy Metrics
        </h3>
        <div className="space-y-2">
          <LegitimacyCol.Cell
            legitimacy={['Community Participation']}
            width={300}
          />
          <LegitimacyCol.Cell
            legitimacy={['Legitimacy by Process']}
            width={300}
          />
          <LegitimacyCol.Cell
            legitimacy={['Community Acceptance']}
            width={300}
          />
          <LegitimacyCol.Cell
            legitimacy={['Legitimacy by Performance']}
            width={300}
          />
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Multiple Metrics</h3>
        <div className="space-y-2">
          <LegitimacyCol.Cell
            legitimacy={['Community Participation', 'Legitimacy by Process']}
            width={350}
          />
          <LegitimacyCol.Cell
            legitimacy={['Legitimacy by Process', 'Community Acceptance']}
            width={350}
          />
          <LegitimacyCol.Cell
            legitimacy={['Community Acceptance', 'Legitimacy by Performance']}
            width={350}
          />
        </div>
      </div>
    </div>
  ),
};
