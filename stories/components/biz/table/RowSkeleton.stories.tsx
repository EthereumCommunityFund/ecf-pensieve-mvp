import type { Meta, StoryObj } from '@storybook/react';

import { TableCellSkeleton } from '@/components/biz/table/CellSkeleton';
import { TableHeader } from '@/components/biz/table/Hearder';
import { TableRowSkeleton } from '@/components/biz/table/RowSkeleton';

const meta: Meta<typeof TableRowSkeleton> = {
  title: 'Components/Biz/Table/RowSkeleton',
  component: TableRowSkeleton,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: false,
      description: 'Row content (typically TableCellSkeleton components)',
    },
    isLastRow: {
      control: 'boolean',
      description: 'Whether this is the last row in the table',
      defaultValue: false,
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TableRowSkeleton>;

// Basic skeleton row examples
export const Default: Story = {
  render: (args) => (
    <table className="w-full border-separate border-spacing-0">
      <tbody>
        <TableRowSkeleton {...args}>
          <TableCellSkeleton width={200} skeletonWidth="w-3/4" />
          <TableCellSkeleton width={300} />
          <TableCellSkeleton width={150} isLast skeletonWidth="w-1/2" />
        </TableRowSkeleton>
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
        <TableRowSkeleton>
          <TableCellSkeleton width={200} skeletonWidth="w-3/4" />
          <TableCellSkeleton width={300} />
          <TableCellSkeleton width={150} isLast skeletonWidth="w-1/2" />
        </TableRowSkeleton>
        <TableRowSkeleton {...args}>
          <TableCellSkeleton width={200} isLastRow skeletonWidth="w-3/4" />
          <TableCellSkeleton width={300} isLastRow />
          <TableCellSkeleton
            width={150}
            isLast
            isLastRow
            skeletonWidth="w-1/2"
          />
        </TableRowSkeleton>
      </tbody>
    </table>
  ),
};

// Complete skeleton table example
export const SkeletonTableExample: Story = {
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
          {Array.from({ length: 4 }).map((_, index) => (
            <TableRowSkeleton key={index} isLastRow={index === 3}>
              <TableCellSkeleton
                width={200}
                isLastRow={index === 3}
                skeletonWidth="w-3/4"
              />
              <TableCellSkeleton width={300} isLastRow={index === 3} />
              <TableCellSkeleton
                width={150}
                isLast
                isLastRow={index === 3}
                skeletonWidth="w-1/2"
              />
            </TableRowSkeleton>
          ))}
        </tbody>
      </table>
    </div>
  ),
};

// Loading state with different skeleton patterns
export const VariedSkeletonPatterns: Story = {
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
          <TableRowSkeleton>
            <TableCellSkeleton width={200} skeletonWidth="w-full" />
            <TableCellSkeleton width={300} skeletonWidth="w-2/3" />
            <TableCellSkeleton width={150} isLast skeletonWidth="w-1/3" />
          </TableRowSkeleton>
          <TableRowSkeleton>
            <TableCellSkeleton width={200} skeletonWidth="w-3/4" />
            <TableCellSkeleton width={300} skeletonWidth="w-full" />
            <TableCellSkeleton width={150} isLast skeletonWidth="w-1/2" />
          </TableRowSkeleton>
          <TableRowSkeleton>
            <TableCellSkeleton width={200} skeletonWidth="w-1/2" />
            <TableCellSkeleton width={300} skeletonWidth="w-3/4" />
            <TableCellSkeleton width={150} isLast skeletonWidth="w-full" />
          </TableRowSkeleton>
          <TableRowSkeleton isLastRow>
            <TableCellSkeleton width={200} isLastRow skeletonWidth="w-2/3" />
            <TableCellSkeleton width={300} isLastRow skeletonWidth="w-1/2" />
            <TableCellSkeleton
              width={150}
              isLast
              isLastRow
              skeletonWidth="w-3/4"
            />
          </TableRowSkeleton>
        </tbody>
      </table>
    </div>
  ),
};
