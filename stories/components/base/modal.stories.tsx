import { Button } from '@heroui/react';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import {
  CommonModalHeader,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
} from '@/components/base/modal';

const meta: Meta<typeof Modal> = {
  title: 'Components/Base/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Controls whether the modal is open',
    },
    onOpenChange: {
      action: 'onOpenChange',
      description: 'Callback when modal open state changes',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl', 'full'],
      description: 'Modal size',
    },
    placement: {
      control: { type: 'select' },
      options: ['center', 'top', 'bottom', 'auto'],
      description: 'Modal placement',
    },
    isDismissable: {
      control: 'boolean',
      description: 'Whether the modal can be dismissed by clicking outside',
      defaultValue: true,
    },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

// Define props interface for ModalExample
interface ModalExampleProps {
  title?: string;
  content?: string;
  [key: string]: any; // For other props passed via ...args
}

// Interactive modal example with state
const ModalExample = ({
  title = 'Modal Title',
  content = 'Modal content goes here. This is a basic modal example.',
  ...args
}: ModalExampleProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button onPress={() => setIsOpen(true)}>Open Modal</Button>
      <Modal isOpen={isOpen} onOpenChange={setIsOpen} {...args}>
        <ModalContent>
          <CommonModalHeader title={title} onClose={() => setIsOpen(false)} />
          <ModalBody>{content}</ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={() => setIsOpen(false)}>
              Confirm
            </Button>
            <Button onPress={() => setIsOpen(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export const Default: Story = {
  render: (args) => <ModalExample {...args} />,
};

export const WithLongContent: Story = {
  render: (args) => (
    <ModalExample
      {...args}
      content={`
        This modal contains a longer content section.

        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pulvinar risus non risus hendrerit venenatis.
        Pellentesque sit amet hendrerit risus, sed porttitor quam.

        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pulvinar risus non risus hendrerit venenatis.
        Pellentesque sit amet hendrerit risus, sed porttitor quam.

        Magna exercitation reprehenderit magna aute tempor cupidatat consequat elit dolor adipisicing. Mollit dolor
        eiusmod sunt ex incididunt cillum quis. Velit duis sit officia eiusmod Lorem aliqua enim laboris do dolor eiusmod.
      `}
    />
  ),
};

export const CustomTitle: Story = {
  render: (args) => <ModalExample {...args} title="Custom Modal Title" />,
};

export const NonDismissable: Story = {
  render: (args) => (
    <ModalExample
      {...args}
      isDismissable={false}
      title="Cannot Close by Clicking Outside"
      content="This modal can only be closed using the buttons or close icon."
    />
  ),
};
