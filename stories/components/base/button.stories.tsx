import type { Meta, StoryObj } from '@storybook/react';

import { Button, ECFButton } from '@/components/base/button';

// Meta for ECFButton
const ecfButtonMeta: Meta<typeof ECFButton> = {
  title: 'Components/Base/ECFButton',
  component: ECFButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    $size: {
      control: { type: 'select' },
      options: ['small', 'normal', 'large'],
      description: 'Button size',
      defaultValue: 'normal',
    },
    children: {
      control: 'text',
      description: 'Button content',
      defaultValue: 'Button',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable button',
      defaultValue: false,
    },
  },
};

export default ecfButtonMeta;
type ECFButtonStory = StoryObj<typeof ECFButton>;

// Stories for ECFButton
export const Default: ECFButtonStory = {
  args: {
    children: 'Default Button',
    $size: 'normal',
  },
};

export const Small: ECFButtonStory = {
  args: {
    children: 'Small Button',
    $size: 'small',
  },
};

export const Large: ECFButtonStory = {
  args: {
    children: 'Large Button',
    $size: 'large',
  },
};

export const Disabled: ECFButtonStory = {
  args: {
    children: 'Disabled Button',
    $size: 'normal',
    disabled: true,
  },
};

// Meta for Button (extended variant)
const buttonMeta: Meta<typeof Button> = {
  title: 'Components/Base/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'Button content',
      defaultValue: 'Button',
    },
    color: {
      control: { type: 'select' },
      options: ['primary', 'secondary'],
      description: 'Button color variant',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
    radius: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'full'],
      description: 'Button border radius',
    },
    border: {
      control: 'boolean',
      description: 'Show border',
    },
    isIconOnly: {
      control: 'boolean',
      description: 'Icon only button',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable button',
    },
  },
};

// Export Button meta as a named export
export { buttonMeta as ButtonMeta };

// Stories for Button
type ButtonStory = StoryObj<typeof Button>;

export const Primary: ButtonStory = {
  render: (args) => <Button {...args} />,
  args: {
    children: 'Primary Button',
    color: 'primary',
    size: 'md',
  },
};

export const Secondary: ButtonStory = {
  render: (args) => <Button {...args} />,
  args: {
    children: 'Secondary Button',
    color: 'secondary',
    size: 'md',
  },
};

export const SmallButton: ButtonStory = {
  render: (args) => <Button {...args} />,
  args: {
    children: 'Small Button',
    size: 'sm',
  },
};

export const LargeButton: ButtonStory = {
  render: (args) => <Button {...args} />,
  args: {
    children: 'Large Button',
    size: 'lg',
  },
};

export const RoundedButton: ButtonStory = {
  render: (args) => <Button {...args} />,
  args: {
    children: 'Rounded Button',
    radius: 'full',
  },
};

export const IconOnlyButton: ButtonStory = {
  render: (args) => <Button {...args} />,
  args: {
    children: '🔍',
    isIconOnly: true,
  },
};

export const DisabledButton: ButtonStory = {
  render: (args) => <Button {...args} />,
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};
