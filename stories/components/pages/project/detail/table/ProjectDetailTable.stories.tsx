import type { Meta, StoryObj } from '@storybook/react';

import { ProjectDetailProvider } from '@/components/pages/project/context/projectDetail';
import ProjectData from '@/components/pages/project/detail/table/ProjectDetailTable';

const meta: Meta<typeof ProjectData> = {
  title: 'Components/Pages/Project/Detail/Table/ProjectDetailTable',
  component: ProjectData,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
ProjectDetailTable component displays project data in a table format using pure UI components.

## Features
- Uses TableHeader, TableRow, TableCell components for consistent styling
- Supports skeleton loading states with TableRowSkeleton and TableCellSkeleton
- Maintains all existing functionality while using pure UI components
- Responsive design with proper hover states
- Expandable rows for certain content types

## Refactoring
This component has been refactored to use pure UI table components:
- TableHeader replaces native <th> elements
- TableRow replaces native <tr> elements  
- TableCell replaces native <td> elements
- TableRowSkeleton and TableCellSkeleton for loading states
        `,
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ProjectDetailProvider projectId={1}>
        <Story />
      </ProjectDetailProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ProjectData>;

// Mock project data for testing
const mockProject = {
  id: 1,
  name: 'ECF Pensieve MVP',
  tagline: 'A decentralized knowledge management system',
  mainDescription:
    'This is a comprehensive project description that demonstrates the expandable content feature.',
  logoUrl: 'https://example.com/logo.png',
  websiteUrl: 'https://example.com',
  appUrl: 'https://app.example.com',
  categories: ['DeFi', 'Infrastructure'],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15'),
  refs: [
    { key: 'name', value: 'Reference for project name' },
    { key: 'tagline', value: 'Reference for tagline' },
  ],
};

// Basic story with loading state
export const Loading: Story = {
  args: {
    projectId: 1,
    isProposalsLoading: true,
    isProposalsFetched: false,
    onSubmitProposal: () => console.log('Submit proposal clicked'),
  },
};

// Story with project data
export const WithData: Story = {
  args: {
    projectId: 1,
    isProposalsLoading: false,
    isProposalsFetched: true,
    onSubmitProposal: () => console.log('Submit proposal clicked'),
  },
  parameters: {
    docs: {
      description: {
        story:
          'ProjectDetailTable with actual project data showing the refactored table components in action.',
      },
    },
  },
};

// Story demonstrating the table structure
export const TableStructure: Story = {
  render: () => (
    <div className="p-4">
      <h3 className="mb-4 text-lg font-semibold">
        Refactored Table Components
      </h3>
      <div className="space-y-4">
        <div>
          <h4 className="mb-2 font-medium">Before (Native HTML):</h4>
          <pre className="rounded bg-gray-100 p-2 text-sm">
            {`<th className="h-[30px] border-b border-r...">
  <div className="flex items-center">
    {content}
  </div>
</th>`}
          </pre>
        </div>
        <div>
          <h4 className="mb-2 font-medium">After (Pure UI Components):</h4>
          <pre className="rounded bg-gray-100 p-2 text-sm">
            {`<TableHeader 
  width={header.getSize()}
  isLast={index === headerGroup.headers.length - 1}
>
  {content}
</TableHeader>`}
          </pre>
        </div>
      </div>
    </div>
  ),
};
