import type { Meta, StoryObj } from '@storybook/react';

import { Select, SelectItem } from '@/components/base/select';

const meta: Meta<typeof Select> = {
  title: 'Components/Base/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Select label',
    },
    placeholder: {
      control: 'text',
      description: 'Select placeholder text',
    },
    description: {
      control: 'text',
      description: 'Helper text below the select',
    },
    errorMessage: {
      control: 'text',
      description: 'Error message to display',
    },
    isDisabled: {
      control: 'boolean',
      description: 'Disable select',
      defaultValue: false,
    },
    isRequired: {
      control: 'boolean',
      description: 'Mark select as required',
      defaultValue: false,
    },
    isInvalid: {
      control: 'boolean',
      description: 'Mark select as invalid',
      defaultValue: false,
    },
    select: {
      control: { type: 'select' },
      options: ['default', 'invalid'],
      description: 'Select variant',
      defaultValue: 'default',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

// Helper component to render Select with items
const SelectWithItems = (args: any) => (
  <Select {...args}>
    <SelectItem key="option1" value="option1">
      Option 1
    </SelectItem>
    <SelectItem key="option2" value="option2">
      Option 2
    </SelectItem>
    <SelectItem key="option3" value="option3">
      Option 3
    </SelectItem>
  </Select>
);

export const Default: Story = {
  render: (args) => <SelectWithItems {...args} />,
  args: {
    label: 'Select an option',
    placeholder: 'Select an option',
  },
};

export const WithDescription: Story = {
  render: (args) => <SelectWithItems {...args} />,
  args: {
    label: 'Select an option',
    placeholder: 'Select an option',
    description: 'Choose one of the available options',
  },
};

export const WithError: Story = {
  render: (args) => <SelectWithItems {...args} />,
  args: {
    label: 'Select an option',
    placeholder: 'Select an option',
    isInvalid: true,
    errorMessage: 'Please select a valid option',
    select: 'invalid',
  },
};

export const Disabled: Story = {
  render: (args) => <SelectWithItems {...args} />,
  args: {
    label: 'Disabled Select',
    placeholder: 'Cannot select',
    isDisabled: true,
  },
};

export const Required: Story = {
  render: (args) => <SelectWithItems {...args} />,
  args: {
    label: 'Required Select',
    placeholder: 'Must select an option',
    isRequired: true,
  },
};

export const WithManyOptions: Story = {
  render: (args) => (
    <Select {...args}>
      <SelectItem key="option1" value="option1">
        Option 1
      </SelectItem>
      <SelectItem key="option2" value="option2">
        Option 2
      </SelectItem>
      <SelectItem key="option3" value="option3">
        Option 3
      </SelectItem>
      <SelectItem key="option4" value="option4">
        Option 4
      </SelectItem>
      <SelectItem key="option5" value="option5">
        Option 5
      </SelectItem>
      <SelectItem key="option6" value="option6">
        Option 6
      </SelectItem>
      <SelectItem key="option7" value="option7">
        Option 7
      </SelectItem>
      <SelectItem key="option8" value="option8">
        Option 8
      </SelectItem>
    </Select>
  ),
  args: {
    label: 'Select with many options',
    placeholder: 'Select an option',
  },
};
