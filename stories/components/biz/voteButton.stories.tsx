import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { VoteButton } from '@/components/biz/voteButton';

// Meta for VoteButton
const meta: Meta<typeof VoteButton> = {
  title: 'Components/Biz/VoteButton',
  component: VoteButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    isVote: {
      control: 'boolean',
      description: 'Whether the user has voted',
      defaultValue: false,
    },
    voteCount: {
      control: { type: 'number' },
      description: 'The number of votes',
      defaultValue: 0,
    },
    voterCount: {
      control: { type: 'number' },
      description: 'The number of voters',
      defaultValue: 0,
    },
    isLoading: {
      control: 'boolean',
      description: 'Whether the button is in a loading state',
      defaultValue: false,
    },
    onVote: {
      action: 'voted',
      description: 'Callback when the vote button is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof VoteButton>;

// Basic stories
export const NotVoted: Story = {
  args: {
    isVote: false,
    voteCount: 6900,
    voterCount: 820,
  },
};

export const Voted: Story = {
  args: {
    isVote: true,
    voteCount: 6901,
    voterCount: 821,
  },
};

export const Loading: Story = {
  args: {
    isVote: false,
    voteCount: 6900,
    voterCount: 820,
    isLoading: true,
  },
};

// Interactive example with isVote
const InteractiveVoteButton = () => {
  const [isVote, setIsVote] = useState(false);
  const [voteCount, setVoteCount] = useState(6900);
  const [voterCount, setVoterCount] = useState(820);
  const [isLoading, setIsLoading] = useState(false);

  const handleVote = () => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (!isVote) {
        // 未投票 -> 已投票
        setIsVote(true);
        setVoteCount(voteCount + 1);
        setVoterCount(voterCount + 1);
      } else {
        // 已投票 -> 未投票
        setIsVote(false);
        setVoteCount(voteCount - 1);
        // We don't decrease voter count when retracting a vote
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-lg font-semibold">Interactive Example</h3>
      <p className="text-sm text-gray-600">
        Click the button to toggle between states
      </p>
      <div className="flex items-center gap-8">
        <div>
          <p className="mb-2 text-center font-semibold">
            Current State:{' '}
            {isVote ? 'Voted (Retract Vote)' : 'Not Voted (Add Vote)'}
          </p>
          <VoteButton
            isVote={isVote}
            voteCount={voteCount}
            voterCount={voterCount}
            isLoading={isLoading}
            onVote={handleVote}
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-semibold">State changes on click:</p>
          <ul className="list-disc pl-5 text-sm">
            <li>Not Voted → Voted</li>
            <li>Voted → Not Voted</li>
          </ul>
          <p className="mt-2 text-sm text-gray-600">
            Vote count: {voteCount} ({!isVote ? '+1 on click' : '-1 on click'})
          </p>
          <p className="text-sm text-gray-600">
            Voter count: {voterCount} (
            {!isVote ? '+1 on click' : 'no change on click'})
          </p>
        </div>
      </div>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveVoteButton />,
};
