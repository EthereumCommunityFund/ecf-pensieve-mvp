import type { Meta, StoryObj } from '@storybook/react';

import { TableFooter } from '@/components/biz/table/Footer';

const meta: Meta<typeof TableFooter> = {
  title: 'Components/Biz/Table/Footer',
  component: TableFooter,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# TableFooter Component

A pure UI component for table footers that follows the design specifications from Figma.

## Features
- Pure UI component without business logic
- Consistent styling with other table components
- Optional CaretUp icon display
- Customizable content and styling
- Click handler support for interactive footers
- Spans across all table columns automatically

## Design Specifications
- Background: #EBEBEB with top border
- Typography: Open Sans, 600 weight, 16px, 60% opacity
- Layout: Row with 10px gap, padding 10px 20px 10px 30px
- Icon: CaretUp 18x18px
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TableFooter>;

// Basic Footer
export const Default: Story = {
  render: () => (
    <div className="w-full max-w-4xl">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr className="bg-[#F5F5F5]">
            <th className="border-b border-l border-black/10 p-[10px] text-left text-[14px] font-[600] text-black/60">
              Column 1
            </th>
            <th className="border-b border-l border-black/10 p-[10px] text-left text-[14px] font-[600] text-black/60">
              Column 2
            </th>
            <th className="border-x border-b border-black/10 p-[10px] text-left text-[14px] font-[600] text-black/60">
              Column 3
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border-b border-l border-black/10 p-[10px]">
              Data 1
            </td>
            <td className="border-b border-l border-black/10 p-[10px]">
              Data 2
            </td>
            <td className="border-x border-b border-black/10 p-[10px]">
              Data 3
            </td>
          </tr>
          <TableFooter />
        </tbody>
      </table>
    </div>
  ),
};

// Footer without icon
export const WithoutIcon: Story = {
  render: () => (
    <div className="w-full max-w-4xl">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr className="bg-[#F5F5F5]">
            <th className="border-b border-l border-black/10 p-[10px] text-left text-[14px] font-[600] text-black/60">
              Column 1
            </th>
            <th className="border-x border-b border-black/10 p-[10px] text-left text-[14px] font-[600] text-black/60">
              Column 2
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border-b border-l border-black/10 p-[10px]">
              Data 1
            </td>
            <td className="border-x border-b border-black/10 p-[10px]">
              Data 2
            </td>
          </tr>
          <TableFooter showIcon={false} />
        </tbody>
      </table>
    </div>
  ),
};

// Custom content footer
export const CustomContent: Story = {
  render: () => (
    <div className="w-full max-w-4xl">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr className="bg-[#F5F5F5]">
            <th className="border-b border-l border-black/10 p-[10px] text-left text-[14px] font-[600] text-black/60">
              Name
            </th>
            <th className="border-b border-l border-black/10 p-[10px] text-left text-[14px] font-[600] text-black/60">
              Value
            </th>
            <th className="border-x border-b border-black/10 p-[10px] text-left text-[14px] font-[600] text-black/60">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border-b border-l border-black/10 p-[10px]">
              Project A
            </td>
            <td className="border-b border-l border-black/10 p-[10px]">
              100
            </td>
            <td className="border-x border-b border-black/10 p-[10px]">
              Active
            </td>
          </tr>
          <TableFooter>Total: 3 items</TableFooter>
        </tbody>
      </table>
    </div>
  ),
};

// Interactive footer
export const Interactive: Story = {
  render: () => (
    <div className="w-full max-w-4xl">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr className="bg-[#F5F5F5]">
            <th className="border-b border-l border-black/10 p-[10px] text-left text-[14px] font-[600] text-black/60">
              Item
            </th>
            <th className="border-x border-b border-black/10 p-[10px] text-left text-[14px] font-[600] text-black/60">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border-b border-l border-black/10 p-[10px]">
              Item 1
            </td>
            <td className="border-x border-b border-black/10 p-[10px]">
              Description 1
            </td>
          </tr>
          <TableFooter onClick={() => alert('Footer clicked!')}>
            Click to expand
          </TableFooter>
        </tbody>
      </table>
    </div>
  ),
};

// Multiple footers example
export const MultipleSections: Story = {
  render: () => (
    <div className="w-full max-w-4xl">
      <table className="w-full border-separate border-spacing-0">
        <thead>
          <tr className="bg-[#F5F5F5]">
            <th className="border-b border-l border-black/10 p-[10px] text-left text-[14px] font-[600] text-black/60">
              Category
            </th>
            <th className="border-b border-l border-black/10 p-[10px] text-left text-[14px] font-[600] text-black/60">
              Count
            </th>
            <th className="border-x border-b border-black/10 p-[10px] text-left text-[14px] font-[600] text-black/60">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border-b border-l border-black/10 p-[10px]">
              Basics
            </td>
            <td className="border-b border-l border-black/10 p-[10px]">
              5
            </td>
            <td className="border-x border-b border-black/10 p-[10px]">
              Complete
            </td>
          </tr>
          <TableFooter>Basics Section</TableFooter>
          <tr>
            <td className="border-b border-l border-black/10 p-[10px]">
              Technical
            </td>
            <td className="border-b border-l border-black/10 p-[10px]">
              3
            </td>
            <td className="border-x border-b border-black/10 p-[10px]">
              Pending
            </td>
          </tr>
          <TableFooter>Technical Section</TableFooter>
        </tbody>
      </table>
    </div>
  ),
};
