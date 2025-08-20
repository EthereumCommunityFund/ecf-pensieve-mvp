import type { Meta, StoryObj } from '@storybook/react';

import { LocaleDatePicker } from '@/components/base/localeDatePicker';

const meta: Meta<typeof LocaleDatePicker> = {
  title: 'Components/Base/LocaleDatePicker',
  component: LocaleDatePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    locale: {
      control: 'select',
      options: ['en-CA', 'ja-JP', 'zh-CN', 'ko-KR', 'en-US', 'sv-SE', 'lt-LT'],
      description: 'Locale for date formatting',
      defaultValue: 'en-CA',
    },
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
    showMonthAndYearPickers: {
      control: 'boolean',
      description: 'Show month and year dropdown pickers',
      defaultValue: true,
    },
  },
};

export default meta;
type Story = StoryObj<typeof LocaleDatePicker>;

export const Default: Story = {
  args: {
    label: 'Select Date',
    locale: 'en-CA',
    showMonthAndYearPickers: true,
  },
};

export const CanadianEnglish: Story = {
  args: {
    label: 'Date (Canadian Format)',
    locale: 'en-CA',
    description: 'Format: YYYY-MM-DD',
    showMonthAndYearPickers: true,
  },
};

export const Japanese: Story = {
  args: {
    label: 'Date (Japanese Format)',
    locale: 'ja-JP',
    description: 'Format: YYYY/MM/DD',
    showMonthAndYearPickers: true,
  },
};

export const Chinese: Story = {
  args: {
    label: 'Date (Chinese Format)',
    locale: 'zh-CN',
    description: 'Format: YYYY/M/D',
    showMonthAndYearPickers: true,
  },
};

export const Korean: Story = {
  args: {
    label: 'Date (Korean Format)',
    locale: 'ko-KR',
    description: 'Format: YYYY. MM. DD.',
    showMonthAndYearPickers: true,
  },
};

export const Swedish: Story = {
  args: {
    label: 'Date (Swedish ISO Format)',
    locale: 'sv-SE',
    description: 'Format: YYYY-MM-DD',
    showMonthAndYearPickers: true,
  },
};

export const USEnglish: Story = {
  args: {
    label: 'Date (US Format)',
    locale: 'en-US',
    description: 'Format: MM/DD/YYYY',
    showMonthAndYearPickers: true,
  },
};

export const WithError: Story = {
  args: {
    label: 'Appointment Date',
    locale: 'en-CA',
    isInvalid: true,
    errorMessage: 'Please select a valid date',
    showMonthAndYearPickers: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Date Picker',
    locale: 'en-CA',
    isDisabled: true,
    showMonthAndYearPickers: true,
  },
};

export const Required: Story = {
  args: {
    label: 'Required Date',
    locale: 'en-CA',
    isRequired: true,
    showMonthAndYearPickers: true,
  },
};