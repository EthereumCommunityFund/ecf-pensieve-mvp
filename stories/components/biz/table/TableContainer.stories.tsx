import type { Meta, StoryObj } from '@storybook/react';

import {
  ModalTableContainer,
  PageTableContainer,
  TableCell,
  TableContainer,
  TableHeader,
  TableRow,
} from '@/components/biz/table';

const meta: Meta<typeof TableContainer> = {
  title: 'Components/Biz/Table/TableContainer',
  component: TableContainer,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Smart table container that automatically handles border logic for tables.

## Features
- **Smart Border Logic**: Automatically configures borders based on container type
- **Pre-configured Variants**: ModalTableContainer and PageTableContainer for common use cases
- **Flexible Configuration**: Supports bordered, rounded, and background options
- **Automatic Context**: Passes border context to child TableHeader and TableCell components

## Usage
Use \`ModalTableContainer\` for tables in modals with borders and rounded corners.
Use \`PageTableContainer\` for tables in regular pages without borders.
Use \`TableContainer\` for custom configurations.

When using these containers, make sure to set \`isContainerBordered={true}\` on TableHeader and TableCell components for bordered containers.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    bordered: {
      control: 'boolean',
      description: 'Whether to show borders around the container',
      defaultValue: false,
    },
    rounded: {
      control: 'boolean',
      description: 'Whether to show rounded corners',
      defaultValue: false,
    },
    background: {
      control: 'select',
      options: ['white', 'transparent'],
      description: 'Background color variant',
      defaultValue: 'transparent',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TableContainer>;

// Sample table content for stories
const SampleTable = ({ isContainerBordered = false }) => (
  <table className="w-full border-separate border-spacing-0">
    <thead>
      <tr className="bg-[#F5F5F5]">
        <TableHeader
          width={200}
          isContainerBordered={isContainerBordered}
          className="h-auto bg-[#F5F5F5] px-2.5 py-4"
        >
          Property
        </TableHeader>
        <TableHeader
          width={300}
          isContainerBordered={isContainerBordered}
          className="h-auto bg-[#F5F5F5] px-2.5 py-4"
        >
          Value
        </TableHeader>
        <TableHeader
          width={150}
          isLast
          isContainerBordered={isContainerBordered}
          className="h-auto bg-[#F5F5F5] px-2.5 py-4"
        >
          Status
        </TableHeader>
      </tr>
    </thead>
    <tbody>
      <TableRow>
        <TableCell
          width={200}
          isContainerBordered={isContainerBordered}
          className="px-2.5"
        >
          Project Name
        </TableCell>
        <TableCell
          width={300}
          isContainerBordered={isContainerBordered}
          className="px-2.5"
        >
          ECF Pensieve MVP
        </TableCell>
        <TableCell
          width={150}
          isLast
          isContainerBordered={isContainerBordered}
          className="px-2.5"
        >
          Active
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell
          width={200}
          isContainerBordered={isContainerBordered}
          className="px-2.5"
        >
          Category
        </TableCell>
        <TableCell
          width={300}
          isContainerBordered={isContainerBordered}
          className="px-2.5"
        >
          Blockchain Infrastructure
        </TableCell>
        <TableCell
          width={150}
          isLast
          isLastRow
          isContainerBordered={isContainerBordered}
          className="px-2.5"
        >
          Verified
        </TableCell>
      </TableRow>
    </tbody>
  </table>
);

// Basic table container
export const Default: Story = {
  args: {
    bordered: false,
    rounded: false,
    background: 'transparent',
  },
  render: (args) => (
    <div className="w-full max-w-4xl">
      <TableContainer {...args}>
        <SampleTable isContainerBordered={false} />
      </TableContainer>
    </div>
  ),
};

// Bordered table container
export const Bordered: Story = {
  args: {
    bordered: true,
    rounded: false,
    background: 'white',
  },
  render: (args) => (
    <div className="w-full max-w-4xl">
      <TableContainer {...args}>
        <SampleTable isContainerBordered={true} />
      </TableContainer>
    </div>
  ),
};

// Bordered with rounded corners
export const BorderedRounded: Story = {
  args: {
    bordered: true,
    rounded: true,
    background: 'white',
  },
  render: (args) => (
    <div className="w-full max-w-4xl">
      <TableContainer {...args}>
        <SampleTable isContainerBordered={true} />
      </TableContainer>
    </div>
  ),
};

// Modal table container (pre-configured)
export const ModalContainer: Story = {
  render: () => (
    <div className="w-full max-w-4xl">
      <ModalTableContainer>
        <SampleTable isContainerBordered={true} />
      </ModalTableContainer>
    </div>
  ),
};

// Page table container (pre-configured)
export const PageContainer: Story = {
  render: () => (
    <div className="w-full max-w-4xl">
      <PageTableContainer>
        <SampleTable isContainerBordered={false} />
      </PageTableContainer>
    </div>
  ),
};

// Comparison of different containers
export const Comparison: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Page Table (No Borders)</h3>
        <PageTableContainer>
          <SampleTable isContainerBordered={false} />
        </PageTableContainer>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">
          Modal Table (Bordered & Rounded)
        </h3>
        <ModalTableContainer>
          <SampleTable isContainerBordered={true} />
        </ModalTableContainer>
      </div>
    </div>
  ),
};
