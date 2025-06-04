import type { Meta, StoryObj } from '@storybook/react';

import ECFTypography from '@/components/base/typography';

const meta: Meta<typeof ECFTypography> = {
  title: 'Components/Base/Typography',
  component: ECFTypography,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: [
        'title',
        'subtitle1',
        'subtitle2',
        'body1',
        'body2',
        'caption',
        'caption1',
      ],
      description: 'Typography style variant',
      defaultValue: 'body1',
    },
    children: {
      control: 'text',
      description: 'Text content',
      defaultValue: 'Typography Example',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ECFTypography>;

export const Title: Story = {
  args: {
    type: 'title',
    children: 'Title Typography',
  },
};

export const Subtitle1: Story = {
  args: {
    type: 'subtitle1',
    children: 'Subtitle 1 Typography',
  },
};

export const Subtitle2: Story = {
  args: {
    type: 'subtitle2',
    children: 'Subtitle 2 Typography',
  },
};

export const Body1: Story = {
  args: {
    type: 'body1',
    children:
      'Body 1 Typography - This is the default style for text content in the application.',
  },
};

export const Body2: Story = {
  args: {
    type: 'body2',
    children:
      'Body 2 Typography - Slightly smaller than Body 1, used for secondary content.',
  },
};

export const Caption: Story = {
  args: {
    type: 'caption',
    children: 'Caption Typography - Used for captions and small text elements.',
  },
};

export const Caption1: Story = {
  args: {
    type: 'caption1',
    children:
      'Caption 1 Typography - The smallest text style, used for very minor details.',
  },
};

export const CustomStyle: Story = {
  args: {
    type: 'body1',
    children: 'Custom Styled Typography',
    className: 'text-blue-500 italic underline',
  },
};

export const AllTypographyVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <ECFTypography type="title">Title Typography</ECFTypography>
      <ECFTypography type="subtitle1">Subtitle 1 Typography</ECFTypography>
      <ECFTypography type="subtitle2">Subtitle 2 Typography</ECFTypography>
      <ECFTypography type="body1">Body 1 Typography</ECFTypography>
      <ECFTypography type="body2">Body 2 Typography</ECFTypography>
      <ECFTypography type="caption">Caption Typography</ECFTypography>
      <ECFTypography type="caption1">Caption 1 Typography</ECFTypography>
    </div>
  ),
};
