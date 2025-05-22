import type { Meta, StoryObj } from '@storybook/react';

import { TableCell } from '@/components/biz/table/Cell';

const meta: Meta<typeof TableCell> = {
  title: 'Components/Biz/Table/Cell',
  component: TableCell,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'Cell content',
      defaultValue: 'Cell content',
    },
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
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TableCell>;

// Basic cell examples
export const Default: Story = {
  args: {
    children: 'Default cell content',
    width: 200,
    isLast: true,
  },
  render: (args) => (
    <table className="border-separate border-spacing-0">
      <tbody>
        <tr>
          <TableCell {...args} />
        </tr>
      </tbody>
    </table>
  ),
};

export const WithLongText: Story = {
  args: {
    children:
      'This is a very long text content that should wrap properly within the cell boundaries and demonstrate the text wrapping behavior.',
    width: 200,
  },
  render: (args) => (
    <table className="border-separate border-spacing-0">
      <tbody>
        <tr>
          <TableCell {...args} />
        </tr>
      </tbody>
    </table>
  ),
};

export const LastCell: Story = {
  args: {
    children: 'Last cell (no right border)',
    width: 200,
    isLast: true,
  },
  render: (args) => (
    <table className="border-separate border-spacing-0">
      <tbody>
        <tr>
          <TableCell {...args} />
        </tr>
      </tbody>
    </table>
  ),
};

export const LastRowCell: Story = {
  args: {
    children: 'Last row cell (no bottom border)',
    width: 200,
    isLastRow: true,
  },
  render: (args) => (
    <table className="border-separate border-spacing-0">
      <tbody>
        <tr>
          <TableCell {...args} />
        </tr>
      </tbody>
    </table>
  ),
};

export const CustomHeight: Story = {
  args: {
    children: 'Cell with custom height',
    width: 200,
    minHeight: 100,
  },
  render: (args) => (
    <table className="border-separate border-spacing-0">
      <tbody>
        <tr>
          <TableCell {...args} />
        </tr>
      </tbody>
    </table>
  ),
};

// Table example with multiple cells
export const TableExample: Story = {
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
            <TableCell width={200}>Project Name</TableCell>
            <TableCell width={300}>ECF Pensieve MVP</TableCell>
            <TableCell width={150} isLast>
              <button className="rounded bg-gray-200 px-3 py-1 text-sm">
                Reference
              </button>
            </TableCell>
          </tr>
          <tr>
            <TableCell width={200}>Description</TableCell>
            <TableCell width={300}>
              A comprehensive project management and proposal system for the
              Ethereum Community Fund
            </TableCell>
            <TableCell width={150} isLast>
              <span className="text-sm italic text-gray-400">empty</span>
            </TableCell>
          </tr>
          <tr>
            <TableCell width={200} isLastRow>
              Category
            </TableCell>
            <TableCell width={300} isLastRow>
              Infrastructure
            </TableCell>
            <TableCell width={150} isLast isLastRow>
              <button className="rounded bg-gray-200 px-3 py-1 text-sm">
                Reference
              </button>
            </TableCell>
          </tr>
        </tbody>
      </table>
    </div>
  ),
};

// Hover effect demonstration
export const HoverEffect: Story = {
  render: () => (
    <div className="w-full max-w-2xl">
      <p className="mb-4 text-sm text-gray-600">
        Hover over the cells to see the hover effect
      </p>
      <table className="w-full border-separate border-spacing-0">
        <tbody>
          <tr>
            <TableCell width={200}>Hover over me</TableCell>
            <TableCell width={200} isLast>
              And me too!
            </TableCell>
          </tr>
        </tbody>
      </table>
    </div>
  ),
};
