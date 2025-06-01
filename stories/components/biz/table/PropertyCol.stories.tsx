import type { Meta, StoryObj } from '@storybook/react';

import { PropertyCol } from '@/components/biz/table';

const meta: Meta = {
  title: 'Components/Biz/Table/PropertyCol',
  component: PropertyCol.Header,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
PropertyCol provides specialized header and cell components for property columns in tables.
It includes built-in support for tooltips and weight indicators.

## Components
- **PropertyCol.Header**: Table header with tooltip for property columns
- **PropertyCol.Cell**: Table cell with optional weight indicator

## Features
- Pure UI components without business logic
- Consistent styling with other table components
- Built-in tooltip support for property names
- Optional weight indicators from ALL_POC_ITEM_MAP
- Responsive width and spacing
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PropertyCol.Header>;

// Header Stories
export const Header: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr className="bg-[#F5F5F5]">
            <PropertyCol.Header width={200} />
          </tr>
        </thead>
      </table>
    </div>
  ),
};

export const HeaderWithCustomWidth: Story = {
  render: () => (
    <table className="border-separate border-spacing-0">
      <thead>
        <tr className="bg-[#F5F5F5]">
          <PropertyCol.Header width={300} />
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
          <PropertyCol.Header width={200} />
          <PropertyCol.Header width={200} isLast />
        </tr>
      </thead>
    </table>
  ),
};

// Cell Stories
export const Cell: Story = {
  render: () => (
    <table className="border-separate border-spacing-0">
      <tbody>
        <tr>
          <PropertyCol.Cell width={200} itemKey="name">
            Project Name
          </PropertyCol.Cell>
        </tr>
      </tbody>
    </table>
  ),
};

export const CellWithoutWeight: Story = {
  render: () => (
    <table className="border-separate border-spacing-0">
      <tbody>
        <tr>
          <PropertyCol.Cell width={200} showWeight={false}>
            Custom Property
          </PropertyCol.Cell>
        </tr>
      </tbody>
    </table>
  ),
};

export const CellWithDifferentItems: Story = {
  render: () => (
    <table className="border-separate border-spacing-0">
      <tbody>
        <tr>
          <PropertyCol.Cell width={200} itemKey="name">
            Project Name
          </PropertyCol.Cell>
        </tr>
        <tr>
          <PropertyCol.Cell width={200} itemKey="tagline">
            Tagline
          </PropertyCol.Cell>
        </tr>
        <tr>
          <PropertyCol.Cell width={200} itemKey="founders">
            Founders
          </PropertyCol.Cell>
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
            <PropertyCol.Header width={200} />
            <PropertyCol.Header width={300} />
            <PropertyCol.Header width={150} isLast />
          </tr>
        </thead>
        <tbody>
          <tr>
            <PropertyCol.Cell width={200} itemKey="name">
              Project Name
            </PropertyCol.Cell>
            <PropertyCol.Cell width={300}>ECF Pensieve MVP</PropertyCol.Cell>
            <PropertyCol.Cell width={150} isLast>
              Active
            </PropertyCol.Cell>
          </tr>
          <tr>
            <PropertyCol.Cell width={200} itemKey="tagline">
              Tagline
            </PropertyCol.Cell>
            <PropertyCol.Cell width={300}>
              A decentralized knowledge management system
            </PropertyCol.Cell>
            <PropertyCol.Cell width={150} isLast>
              Draft
            </PropertyCol.Cell>
          </tr>
          <tr>
            <PropertyCol.Cell width={200} itemKey="founders" isLastRow>
              Founders
            </PropertyCol.Cell>
            <PropertyCol.Cell width={300} isLastRow>
              John Doe, Jane Smith
            </PropertyCol.Cell>
            <PropertyCol.Cell width={150} isLast isLastRow>
              Verified
            </PropertyCol.Cell>
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
<PropertyCol.Header width={200} />

// Cell with weight indicator
<PropertyCol.Cell itemKey="name" width={200}>
  Project Name
</PropertyCol.Cell>

// Cell without weight indicator
<PropertyCol.Cell showWeight={false} width={200}>
  Custom Property
</PropertyCol.Cell>`}
          </pre>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Props</h3>
        <div className="rounded border p-4">
          <div className="space-y-2 text-sm">
            <div>
              <strong>PropertyCol.Header:</strong>
            </div>
            <div>• width?: number | string</div>
            <div>• isLast?: boolean</div>
            <div>• className?: string</div>
            <div>• style?: React.CSSProperties</div>

            <div className="pt-4">
              <strong>PropertyCol.Cell:</strong>
            </div>
            <div>• children: ReactNode</div>
            <div>• itemKey?: string (for weight lookup)</div>
            <div>• showWeight?: boolean (default: true)</div>
            <div>• width?: number | string</div>
            <div>• isLast?: boolean</div>
            <div>• isLastRow?: boolean</div>
            <div>• minHeight?: number (default: 60)</div>
            <div>• className?: string</div>
            <div>• style?: React.CSSProperties</div>
          </div>
        </div>
      </div>
    </div>
  ),
};
