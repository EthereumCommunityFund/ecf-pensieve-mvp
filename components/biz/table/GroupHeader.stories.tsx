import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { GroupHeader } from './GroupHeader';

const meta: Meta<typeof GroupHeader> = {
  title: 'Components/Biz/Table/GroupHeader',
  component: GroupHeader,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
GroupHeader component for table grouping functionality.

Used to display group headers within table rows to visually separate
related items into logical groups while maintaining table structure.

## Features
- Visual separation of grouped items
- Maintains table structure with proper colspan
- Supports optional description text
- Consistent styling with table theme

## Usage
Use this component to create visual groupings within tables, especially
when implementing the table grouping feature for project data.
        `,
      },
    },
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'The group title to display',
    },
    description: {
      control: 'text',
      description: 'Optional description text for the group',
    },
    colSpan: {
      control: 'number',
      description: 'Number of columns to span across',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic group header
export const Default: Story = {
  args: {
    title: 'Project Links',
    description: 'External links and resources',
    colSpan: 4,
  },
};

// Group header without description
export const WithoutDescription: Story = {
  args: {
    title: 'Team Details',
    colSpan: 4,
  },
};

// Group header with different styling
export const CustomStyling: Story = {
  args: {
    title: 'Code Audits',
    description: 'Security audit information',
    colSpan: 5,
    className: 'bg-blue-50',
  },
};

// Interactive group header with expand/collapse
export const Interactive: Story = {
  render: function InteractiveRender() {
    const [isExpanded, setIsExpanded] = React.useState(true);

    return (
      <div className="w-full max-w-4xl">
        <h3 className="mb-3 text-lg font-semibold">Interactive Group Header</h3>
        <table className="w-full border border-gray-300">
          <GroupHeader
            title="Project Links"
            description="Click to expand/collapse"
            colSpan={3}
            isExpanded={isExpanded}
            onToggle={() => setIsExpanded(!isExpanded)}
            isClickable={true}
          />
          <tbody>
            {isExpanded && (
              <>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">
                    Website URL
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    https://example.com
                  </td>
                  <td className="border border-gray-300 px-3 py-2">View</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2">App URL</td>
                  <td className="border border-gray-300 px-3 py-2">
                    https://app.example.com
                  </td>
                  <td className="border border-gray-300 px-3 py-2">View</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
        <p className="mt-2 text-sm text-gray-600">
          Current state: {isExpanded ? 'Expanded' : 'Collapsed'}
        </p>
      </div>
    );
  },
};

// Table example with group headers
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
              Input
            </th>
            <th className="h-[30px] border-b border-r border-black/10 px-[10px] text-left text-[14px] font-[600] text-black/60">
              Reference
            </th>
            <th className="h-[30px] border-b border-black/10 px-[10px] text-left text-[14px] font-[600] text-black/60">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Regular rows */}
          <tr className="bg-white hover:bg-[#F5F5F5]">
            <td className="border-b border-r border-black/10 px-[10px] py-[8px]">
              Project Name
            </td>
            <td className="border-b border-r border-black/10 px-[10px] py-[8px]">
              Example Project
            </td>
            <td className="border-b border-r border-black/10 px-[10px] py-[8px]">
              -
            </td>
            <td className="border-b border-black/10 px-[10px] py-[8px]">
              View
            </td>
          </tr>

          {/* Group header */}
          <GroupHeader
            title="Project Links"
            description="External links and resources"
            colSpan={4}
          />

          {/* Grouped rows */}
          <tr className="bg-white hover:bg-[#F5F5F5]">
            <td className="border-b border-r border-black/10 px-[10px] py-[8px]">
              Website URL
            </td>
            <td className="border-b border-r border-black/10 px-[10px] py-[8px]">
              https://example.com
            </td>
            <td className="border-b border-r border-black/10 px-[10px] py-[8px]">
              -
            </td>
            <td className="border-b border-black/10 px-[10px] py-[8px]">
              View
            </td>
          </tr>
          <tr className="bg-white hover:bg-[#F5F5F5]">
            <td className="border-b border-r border-black/10 px-[10px] py-[8px]">
              App URL
            </td>
            <td className="border-b border-r border-black/10 px-[10px] py-[8px]">
              https://app.example.com
            </td>
            <td className="border-b border-r border-black/10 px-[10px] py-[8px]">
              -
            </td>
            <td className="border-b border-black/10 px-[10px] py-[8px]">
              View
            </td>
          </tr>

          {/* Another group header */}
          <GroupHeader
            title="Project Dates"
            description="Important project timeline dates"
            colSpan={4}
          />

          {/* More grouped rows */}
          <tr className="bg-white hover:bg-[#F5F5F5]">
            <td className="border-b border-r border-black/10 px-[10px] py-[8px]">
              Date Founded
            </td>
            <td className="border-b border-r border-black/10 px-[10px] py-[8px]">
              2023-01-01
            </td>
            <td className="border-b border-r border-black/10 px-[10px] py-[8px]">
              -
            </td>
            <td className="border-b border-black/10 px-[10px] py-[8px]">
              View
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  ),
};
