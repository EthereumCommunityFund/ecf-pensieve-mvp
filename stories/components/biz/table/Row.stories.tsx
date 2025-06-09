import type { Meta, StoryObj } from '@storybook/react';

import { TableCell } from '@/components/biz/table/Cell';
import { TableHeader } from '@/components/biz/table/Hearder';
import { TableRow } from '@/components/biz/table/Row';

const meta: Meta<typeof TableRow> = {
  title: 'Components/Biz/Table/Row',
  component: TableRow,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: false,
      description: 'Row content (typically TableCell components)',
    },
    isLastRow: {
      control: 'boolean',
      description: 'Whether this is the last row in the table',
      defaultValue: false,
    },
    isActive: {
      control: 'boolean',
      description: 'Whether the row is in active/selected state',
      defaultValue: false,
    },
    isHoverable: {
      control: 'boolean',
      description: 'Whether the row should have hover effects',
      defaultValue: true,
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler for the row',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TableRow>;

// Basic row examples
export const Default: Story = {
  args: {
    isHoverable: true,
  },
  render: (args) => (
    <table className="w-full border-separate border-spacing-0">
      <tbody>
        <TableRow {...args}>
          <TableCell width={200}>Project Name</TableCell>
          <TableCell width={300}>ECF Pensieve MVP</TableCell>
          <TableCell width={150} isLast>
            Active
          </TableCell>
        </TableRow>
      </tbody>
    </table>
  ),
};

export const ActiveRow: Story = {
  args: {
    isActive: true,
    isHoverable: true,
  },
  render: (args) => (
    <table className="w-full border-separate border-spacing-0">
      <tbody>
        <TableRow {...args}>
          <TableCell width={200}>Project Name</TableCell>
          <TableCell width={300}>ECF Pensieve MVP</TableCell>
          <TableCell width={150} isLast>
            Active
          </TableCell>
        </TableRow>
      </tbody>
    </table>
  ),
};

export const NonHoverableRow: Story = {
  args: {
    isHoverable: false,
  },
  render: (args) => (
    <table className="w-full border-separate border-spacing-0">
      <tbody>
        <TableRow {...args}>
          <TableCell width={200}>Project Name</TableCell>
          <TableCell width={300}>ECF Pensieve MVP</TableCell>
          <TableCell width={150} isLast>
            Static
          </TableCell>
        </TableRow>
      </tbody>
    </table>
  ),
};

export const ClickableRow: Story = {
  args: {
    isHoverable: true,
    onClick: () => alert('Row clicked!'),
  },
  render: (args) => (
    <table className="w-full border-separate border-spacing-0">
      <tbody>
        <TableRow {...args}>
          <TableCell width={200}>Project Name</TableCell>
          <TableCell width={300}>ECF Pensieve MVP (Click me!)</TableCell>
          <TableCell width={150} isLast>
            Clickable
          </TableCell>
        </TableRow>
      </tbody>
    </table>
  ),
};

export const LastRow: Story = {
  args: {
    isLastRow: true,
  },
  render: (args) => (
    <table className="w-full border-separate border-spacing-0">
      <tbody>
        <TableRow>
          <TableCell width={200}>Project Name</TableCell>
          <TableCell width={300}>ECF Pensieve MVP</TableCell>
          <TableCell width={150} isLast>
            Regular Row
          </TableCell>
        </TableRow>
        <TableRow {...args}>
          <TableCell width={200} isLastRow>
            Last Project
          </TableCell>
          <TableCell width={300} isLastRow>
            Final Entry
          </TableCell>
          <TableCell width={150} isLast isLastRow>
            Last Row
          </TableCell>
        </TableRow>
      </tbody>
    </table>
  ),
};

// Complete table example
export const CompleteTableExample: Story = {
  render: () => (
    <div className="w-full max-w-4xl">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr className="bg-[#F5F5F5]">
            <TableHeader width={200}>Property</TableHeader>
            <TableHeader width={300}>Value</TableHeader>
            <TableHeader width={150} isLast>
              Status
            </TableHeader>
          </tr>
        </thead>
        <tbody>
          <TableRow isHoverable>
            <TableCell width={200}>Project Name</TableCell>
            <TableCell width={300}>ECF Pensieve MVP</TableCell>
            <TableCell width={150} isLast>
              Active
            </TableCell>
          </TableRow>
          <TableRow isActive isHoverable>
            <TableCell width={200}>Selected Project</TableCell>
            <TableCell width={300}>This row is selected</TableCell>
            <TableCell width={150} isLast>
              Selected
            </TableCell>
          </TableRow>
          <TableRow isHoverable onClick={() => alert('Clicked!')}>
            <TableCell width={200}>Clickable Project</TableCell>
            <TableCell width={300}>Click this row</TableCell>
            <TableCell width={150} isLast>
              Clickable
            </TableCell>
          </TableRow>
          <TableRow isLastRow>
            <TableCell width={200} isLastRow>
              Final Project
            </TableCell>
            <TableCell width={300} isLastRow>
              Last entry
            </TableCell>
            <TableCell width={150} isLast isLastRow>
              Complete
            </TableCell>
          </TableRow>
        </tbody>
      </table>
    </div>
  ),
};

// State comparison
export const StateComparison: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Default State</h3>
        <table className="w-full max-w-2xl border-separate border-spacing-0">
          <tbody>
            <TableRow>
              <TableCell width={200}>Default Row</TableCell>
              <TableCell width={300} isLast>
                Hover to see effect
              </TableCell>
            </TableRow>
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Active State</h3>
        <table className="w-full max-w-2xl border-separate border-spacing-0">
          <tbody>
            <TableRow isActive>
              <TableCell width={200}>Active Row</TableCell>
              <TableCell width={300} isLast>
                This row is selected
              </TableCell>
            </TableRow>
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Non-hoverable State</h3>
        <table className="w-full max-w-2xl border-separate border-spacing-0">
          <tbody>
            <TableRow isHoverable={false}>
              <TableCell width={200}>Static Row</TableCell>
              <TableCell width={300} isLast>
                No hover effect
              </TableCell>
            </TableRow>
          </tbody>
        </table>
      </div>
    </div>
  ),
};
