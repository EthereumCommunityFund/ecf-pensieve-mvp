import { Button } from '@heroui/react';
import type { Meta, StoryObj } from '@storybook/react';

import { addToast } from '@/components/base/toast';

// Define props interface for ToastDemo
interface ToastDemoProps {
  title?: string;
  description?: string;
  type?: 'default' | 'success' | 'info' | 'warning' | 'error';
  timeout?: number;
}

// Create a wrapper component to demonstrate toast functionality
const ToastDemo = ({
  title = 'Toast Title',
  description = 'This is a toast message',
  type = 'default',
  timeout = 1500,
}: ToastDemoProps) => {
  const handleShowToast = () => {
    // Map the type to a valid color for HeroUI toast
    let color: 'success' | 'warning' | 'danger' | undefined;

    switch (type) {
      case 'success':
        color = 'success';
        break;
      case 'info':
        color = undefined; // Use default color for info
        break;
      case 'warning':
        color = 'warning';
        break;
      case 'error':
        color = 'danger';
        break;
      default:
        color = undefined;
    }

    addToast({
      title,
      description,
      color,
      timeout,
    });
  };

  return <Button onPress={handleShowToast}>Show {type} Toast</Button>;
};

const meta: Meta<typeof ToastDemo> = {
  title: 'Components/Base/Toast',
  component: ToastDemo,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Toast title',
      defaultValue: 'Toast Title',
    },
    description: {
      control: 'text',
      description: 'Toast description',
      defaultValue: 'This is a toast message',
    },
    type: {
      control: { type: 'select' },
      options: ['default', 'success', 'info', 'warning', 'error'],
      description: 'Toast type',
      defaultValue: 'default',
    },
    timeout: {
      control: { type: 'number', min: 500, max: 10000, step: 500 },
      description: 'Time in milliseconds before toast disappears',
      defaultValue: 1500,
    },
  },
};

export default meta;
type Story = StoryObj<typeof ToastDemo>;

export const Default: Story = {
  args: {
    type: 'default',
    title: 'Default Toast',
    description: 'This is a default toast message',
  },
};

export const Success: Story = {
  args: {
    type: 'success',
    title: 'Success!',
    description: 'Operation completed successfully',
  },
};

export const Info: Story = {
  args: {
    type: 'info',
    title: 'Information',
    description: 'Here is some information for you',
  },
};

export const Warning: Story = {
  args: {
    type: 'warning',
    title: 'Warning',
    description: 'Please be careful with this action',
  },
};

export const Error: Story = {
  args: {
    type: 'error',
    title: 'Error',
    description: 'Something went wrong. Please try again.',
  },
};

export const LongTimeout: Story = {
  args: {
    type: 'info',
    title: 'Long Timeout',
    description: 'This toast will stay visible for 5 seconds',
    timeout: 5000,
  },
};

export const ShortTimeout: Story = {
  args: {
    type: 'info',
    title: 'Short Timeout',
    description: 'This toast will disappear quickly',
    timeout: 500,
  },
};
