import type { Meta, StoryObj } from '@storybook/react';

import { DatePicker } from '@/components/base/datePicker';

const meta: Meta<typeof DatePicker> = {
  title: 'Components/Base/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'DatePicker label',
    },
    placeholder: {
      control: 'text',
      description: 'DatePicker placeholder text',
    },
    description: {
      control: 'text',
      description: 'Helper text below the date picker',
    },
    errorMessage: {
      control: 'text',
      description: 'Error message to display',
    },
    isDisabled: {
      control: 'boolean',
      description: 'Disable date picker',
      defaultValue: false,
    },
    isRequired: {
      control: 'boolean',
      description: 'Mark date picker as required',
      defaultValue: false,
    },
    isInvalid: {
      control: 'boolean',
      description: 'Mark date picker as invalid',
      defaultValue: false,
    },
    showTime: {
      control: 'boolean',
      description: 'Show time picker',
      defaultValue: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {
  args: {
    label: 'Select Date',
    placeholder: 'MM/DD/YYYY',
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Event Date',
    placeholder: 'MM/DD/YYYY',
    description: 'Select the date of your event',
  },
};

export const WithError: Story = {
  args: {
    label: 'Appointment Date',
    placeholder: 'MM/DD/YYYY',
    isInvalid: true,
    errorMessage: 'Please select a valid date',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Date Picker',
    placeholder: 'MM/DD/YYYY',
    isDisabled: true,
  },
};

export const Required: Story = {
  args: {
    label: 'Required Date',
    placeholder: 'MM/DD/YYYY',
    isRequired: true,
  },
};

export const WithTimePicker: Story = {
  args: {
    label: 'Date and Time',
    placeholder: 'MM/DD/YYYY HH:MM',
    showTime: true,
  },
};
