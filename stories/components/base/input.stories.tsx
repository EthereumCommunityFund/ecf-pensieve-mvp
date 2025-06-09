import type { Meta, StoryObj } from '@storybook/react';

import { Input, Textarea } from '@/components/base/input';

// Meta for Input
const inputMeta: Meta<typeof Input> = {
  title: 'Components/Base/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Input placeholder text',
      defaultValue: 'Enter text...',
    },
    label: {
      control: 'text',
      description: 'Input label',
    },
    description: {
      control: 'text',
      description: 'Helper text below the input',
    },
    errorMessage: {
      control: 'text',
      description: 'Error message to display',
    },
    isDisabled: {
      control: 'boolean',
      description: 'Disable input',
      defaultValue: false,
    },
    isRequired: {
      control: 'boolean',
      description: 'Mark input as required',
      defaultValue: false,
    },
    isInvalid: {
      control: 'boolean',
      description: 'Mark input as invalid',
      defaultValue: false,
    },
  },
};

export default inputMeta;
type InputStory = StoryObj<typeof Input>;

// Stories for Input
export const Default: InputStory = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: InputStory = {
  args: {
    label: 'Username',
    placeholder: 'Enter your username',
  },
};

export const WithDescription: InputStory = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    description: 'We will never share your email with anyone else.',
  },
};

export const WithError: InputStory = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    isInvalid: true,
    errorMessage: 'Password must be at least 8 characters long',
  },
};

export const Disabled: InputStory = {
  args: {
    label: 'Disabled Input',
    placeholder: 'This input is disabled',
    isDisabled: true,
  },
};

export const Required: InputStory = {
  args: {
    label: 'Required Field',
    placeholder: 'This field is required',
    isRequired: true,
  },
};

// Meta for Textarea
const textareaMeta: Meta<typeof Textarea> = {
  title: 'Components/Base/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Textarea placeholder text',
      defaultValue: 'Enter text...',
    },
    label: {
      control: 'text',
      description: 'Textarea label',
    },
    description: {
      control: 'text',
      description: 'Helper text below the textarea',
    },
    errorMessage: {
      control: 'text',
      description: 'Error message to display',
    },
    isDisabled: {
      control: 'boolean',
      description: 'Disable textarea',
      defaultValue: false,
    },
    isRequired: {
      control: 'boolean',
      description: 'Mark textarea as required',
      defaultValue: false,
    },
    isInvalid: {
      control: 'boolean',
      description: 'Mark textarea as invalid',
      defaultValue: false,
    },
  },
};

// Export Textarea meta as a named export
export { textareaMeta as TextareaMeta };

// Stories for Textarea
type TextareaStory = StoryObj<typeof Textarea>;

export const DefaultTextarea: TextareaStory = {
  render: (args) => <Textarea {...args} />,
  args: {
    placeholder: 'Enter text...',
  },
};

export const TextareaWithLabel: TextareaStory = {
  render: (args) => <Textarea {...args} />,
  args: {
    label: 'Comments',
    placeholder: 'Enter your comments',
  },
};

export const TextareaWithDescription: TextareaStory = {
  render: (args) => <Textarea {...args} />,
  args: {
    label: 'Feedback',
    placeholder: 'Enter your feedback',
    description: 'Your feedback helps us improve our service.',
  },
};

export const TextareaWithError: TextareaStory = {
  render: (args) => <Textarea {...args} />,
  args: {
    label: 'Bio',
    placeholder: 'Tell us about yourself',
    isInvalid: true,
    errorMessage: 'Bio must be between 10 and 200 characters',
  },
};

export const DisabledTextarea: TextareaStory = {
  render: (args) => <Textarea {...args} />,
  args: {
    label: 'Disabled Textarea',
    placeholder: 'This textarea is disabled',
    isDisabled: true,
  },
};

export const RequiredTextarea: TextareaStory = {
  render: (args) => <Textarea {...args} />,
  args: {
    label: 'Required Feedback',
    placeholder: 'This field is required',
    isRequired: true,
  },
};
