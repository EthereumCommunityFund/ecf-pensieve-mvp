import type { Meta, StoryObj } from '@storybook/react';

import { AddressDisplay, AddressListDisplay } from '@/components/base';

const meta = {
  title: 'Base/AddressDisplay',
  component: AddressDisplay,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    address: {
      control: 'text',
      description: 'Ethereum address to display',
    },
    startLength: {
      control: 'number',
      description: 'Number of characters to show at the start',
    },
    endLength: {
      control: 'number',
      description: 'Number of characters to show at the end',
    },
    showCopy: {
      control: 'boolean',
      description: 'Whether to show copy button in tooltip',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof AddressDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f89593',
    showCopy: true,
  },
};

export const CustomLength: Story = {
  args: {
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f89593',
    startLength: 8,
    endLength: 6,
    showCopy: true,
  },
};

export const NoCopyButton: Story = {
  args: {
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f89593',
    showCopy: false,
  },
};

export const WithCustomStyle: Story = {
  args: {
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f89593',
    className: 'text-blue-600 font-bold',
    showCopy: true,
  },
};

const AddressListMeta = {
  title: 'Base/AddressListDisplay',
  component: AddressListDisplay,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    addresses: {
      control: 'object',
      description: 'Array of Ethereum addresses',
    },
    layout: {
      control: 'radio',
      options: ['inline', 'vertical'],
      description: 'Display layout',
    },
    separator: {
      control: 'text',
      description: 'Separator for inline layout',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes for container',
    },
    itemClassName: {
      control: 'text',
      description: 'Additional CSS classes for each address',
    },
  },
} satisfies Meta<typeof AddressListDisplay>;

type ListStory = StoryObj<typeof AddressListMeta>;

export const VerticalList: ListStory = {
  render: (args) => <AddressListDisplay {...args} />,
  args: {
    addresses: [
      '0x742d35Cc6634C0532925a3b844Bc9e7595f89593',
      '0x1234567890123456789012345678901234567890',
      '0xabcdef0123456789abcdef0123456789abcdef01',
    ],
    layout: 'vertical',
  },
};

export const InlineList: ListStory = {
  render: (args) => <AddressListDisplay {...args} />,
  args: {
    addresses: [
      '0x742d35Cc6634C0532925a3b844Bc9e7595f89593',
      '0x1234567890123456789012345678901234567890',
      '0xabcdef0123456789abcdef0123456789abcdef01',
    ],
    layout: 'inline',
    separator: ' • ',
  },
};

export const EmptyList: ListStory = {
  render: (args) => <AddressListDisplay {...args} />,
  args: {
    addresses: [],
    layout: 'vertical',
  },
};

export const SingleAddress: ListStory = {
  render: (args) => <AddressListDisplay {...args} />,
  args: {
    addresses: ['0x742d35Cc6634C0532925a3b844Bc9e7595f89593'],
    layout: 'vertical',
  },
};

export const SmartContractExample: ListStory = {
  render: () => (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold">Smart Contract Addresses by Chain</h3>
      <div className="space-y-3">
        <div>
          <div className="text-sm font-medium mb-1">Ethereum:</div>
          <div className="pl-4">
            <AddressListDisplay
              addresses={[
                '0x742d35Cc6634C0532925a3b844Bc9e7595f89593',
                '0x1234567890123456789012345678901234567890',
              ]}
              layout="vertical"
            />
          </div>
        </div>
        <div>
          <div className="text-sm font-medium mb-1">Polygon:</div>
          <div className="pl-4">
            <AddressListDisplay
              addresses={['0xabcdef0123456789abcdef0123456789abcdef01']}
              layout="vertical"
            />
          </div>
        </div>
      </div>
    </div>
  ),
};