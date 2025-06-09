import { Skeleton } from '@heroui/react';
import type { Meta, StoryObj } from '@storybook/react';

import { TableCellSkeleton } from '@/components/biz/table/CellSkeleton';

const meta: Meta<typeof TableCellSkeleton> = {
  title: 'Components/Biz/Table/CellSkeleton',
  component: TableCellSkeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    width: {
      control: { type: 'number' },
      description: 'Cell width in pixels',
    },
    isLast: {
      control: 'boolean',
      description:
        'Whether this is the last cell in the row (removes right border)',
      defaultValue: false,
    },
    isLastRow: {
      control: 'boolean',
      description: 'Whether this is in the last row (removes bottom border)',
      defaultValue: false,
    },
    minHeight: {
      control: { type: 'number' },
      description: 'Minimum height of the cell content area in pixels',
      defaultValue: 60,
    },
    skeletonHeight: {
      control: { type: 'number' },
      description: 'Height of the skeleton element in pixels',
      defaultValue: 20,
    },
    skeletonWidth: {
      control: 'text',
      description: 'Width class for the skeleton element',
      defaultValue: 'w-full',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes for the cell',
    },
    skeletonClassName: {
      control: 'text',
      description: 'Additional CSS classes for the skeleton element',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TableCellSkeleton>;

// Basic skeleton cell examples
export const Default: Story = {
  args: {
    width: 200,
  },
  render: (args) => (
    <table className="border-separate border-spacing-0">
      <tbody>
        <tr>
          <TableCellSkeleton {...args} />
        </tr>
      </tbody>
    </table>
  ),
};

export const CustomSkeletonSize: Story = {
  args: {
    width: 200,
    skeletonHeight: 30,
    skeletonWidth: 'w-3/4',
  },
  render: (args) => (
    <table className="border-separate border-spacing-0">
      <tbody>
        <tr>
          <TableCellSkeleton {...args} />
        </tr>
      </tbody>
    </table>
  ),
};

export const LastCell: Story = {
  args: {
    width: 200,
    isLast: true,
  },
  render: (args) => (
    <table className="border-separate border-spacing-0">
      <tbody>
        <tr>
          <TableCellSkeleton {...args} />
        </tr>
      </tbody>
    </table>
  ),
};

export const LastRowCell: Story = {
  args: {
    width: 200,
    isLastRow: true,
  },
  render: (args) => (
    <table className="border-separate border-spacing-0">
      <tbody>
        <tr>
          <TableCellSkeleton {...args} />
        </tr>
      </tbody>
    </table>
  ),
};

export const CustomHeight: Story = {
  args: {
    width: 200,
    minHeight: 100,
    skeletonHeight: 40,
  },
  render: (args) => (
    <table className="border-separate border-spacing-0">
      <tbody>
        <tr>
          <TableCellSkeleton {...args} />
        </tr>
      </tbody>
    </table>
  ),
};

export const CustomSkeletonContent: Story = {
  args: {
    width: 200,
  },
  render: (args) => (
    <table className="border-separate border-spacing-0">
      <tbody>
        <tr>
          <TableCellSkeleton {...args}>
            <div className="flex items-center gap-2">
              <Skeleton className="size-[24px] rounded-full" />
              <Skeleton className="h-[16px] w-[100px] rounded" />
            </div>
          </TableCellSkeleton>
        </tr>
      </tbody>
    </table>
  ),
};

// Table example with multiple skeleton cells
export const SkeletonTableExample: Story = {
  render: () => (
    <div className="w-full max-w-4xl">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr className="bg-[#F5F5F5]">
            <th className="h-[30px] border-b border-r border-black/10 px-[10px] text-left text-[14px] font-[600] text-black/60">
              Property
            </th>
            <th className="h-[30px] border-b border-r border-black/10 px-[10px] text-left text-[14px] font-[600] text-black/60">
              Value
            </th>
            <th className="h-[30px] border-b border-black/10 px-[10px] text-left text-[14px] font-[600] text-black/60">
              Reference
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <TableCellSkeleton width={200} skeletonWidth="w-3/4" />
            <TableCellSkeleton width={300} />
            <TableCellSkeleton width={150} isLast skeletonWidth="w-1/2" />
          </tr>
          <tr>
            <TableCellSkeleton width={200} skeletonWidth="w-2/3" />
            <TableCellSkeleton width={300} skeletonHeight={40} />
            <TableCellSkeleton width={150} isLast skeletonWidth="w-3/4" />
          </tr>
          <tr>
            <TableCellSkeleton width={200} isLastRow skeletonWidth="w-1/2" />
            <TableCellSkeleton width={300} isLastRow skeletonHeight={25} />
            <TableCellSkeleton
              width={150}
              isLast
              isLastRow
              skeletonWidth="w-2/3"
            />
          </tr>
        </tbody>
      </table>
    </div>
  ),
};

// Loading state comparison
export const LoadingStateComparison: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Loading State (Skeleton)</h3>
        <table className="w-full max-w-2xl border-separate border-spacing-0">
          <thead>
            <tr className="bg-[#F5F5F5]">
              <th className="h-[30px] border-b border-r border-black/10 px-[10px] text-left text-[14px] font-[600] text-black/60">
                Property
              </th>
              <th className="h-[30px] border-b border-black/10 px-[10px] text-left text-[14px] font-[600] text-black/60">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 3 }).map((_, index) => (
              <tr key={`skeleton-${index}`}>
                <TableCellSkeleton
                  width={200}
                  isLastRow={index === 2}
                  skeletonWidth="w-3/4"
                />
                <TableCellSkeleton width={300} isLast isLastRow={index === 2} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">
          Loaded State (Actual Content)
        </h3>
        <table className="w-full max-w-2xl border-separate border-spacing-0">
          <thead>
            <tr className="bg-[#F5F5F5]">
              <th className="h-[30px] border-b border-r border-black/10 px-[10px] text-left text-[14px] font-[600] text-black/60">
                Property
              </th>
              <th className="h-[30px] border-b border-black/10 px-[10px] text-left text-[14px] font-[600] text-black/60">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                className="border-b border-r border-black/10 hover:bg-[#EBEBEB]"
                style={{ width: '200px', boxSizing: 'border-box' }}
              >
                <div className="flex min-h-[60px] w-full items-center overflow-hidden whitespace-normal break-words px-[10px]">
                  Project Name
                </div>
              </td>
              <td
                className="border-b border-black/10 hover:bg-[#EBEBEB]"
                style={{ width: '300px', boxSizing: 'border-box' }}
              >
                <div className="flex min-h-[60px] w-full items-center overflow-hidden whitespace-normal break-words px-[10px]">
                  ECF Pensieve MVP
                </div>
              </td>
            </tr>
            <tr>
              <td
                className="border-b border-r border-black/10 hover:bg-[#EBEBEB]"
                style={{ width: '200px', boxSizing: 'border-box' }}
              >
                <div className="flex min-h-[60px] w-full items-center overflow-hidden whitespace-normal break-words px-[10px]">
                  Description
                </div>
              </td>
              <td
                className="border-b border-black/10 hover:bg-[#EBEBEB]"
                style={{ width: '300px', boxSizing: 'border-box' }}
              >
                <div className="flex min-h-[60px] w-full items-center overflow-hidden whitespace-normal break-words px-[10px]">
                  A comprehensive project management system
                </div>
              </td>
            </tr>
            <tr>
              <td
                className="border-r border-black/10 hover:bg-[#EBEBEB]"
                style={{ width: '200px', boxSizing: 'border-box' }}
              >
                <div className="flex min-h-[60px] w-full items-center overflow-hidden whitespace-normal break-words px-[10px]">
                  Category
                </div>
              </td>
              <td
                className="hover:bg-[#EBEBEB]"
                style={{ width: '300px', boxSizing: 'border-box' }}
              >
                <div className="flex min-h-[60px] w-full items-center overflow-hidden whitespace-normal break-words px-[10px]">
                  Infrastructure
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  ),
};
