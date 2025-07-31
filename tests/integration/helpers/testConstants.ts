// Test user weights configuration
export const TEST_USER_WEIGHTS = [0, 70, 40, 60, 80];

// Test data descriptions
export const TEST_DESCRIPTIONS = {
  projects: {
    basic: 'Basic Test Project',
    voteSwitch: 'Vote Switch Test Project',
    noVote: 'No Vote to Switch Test Project',
    alreadyVoted: 'Already Voted Test Project',
    alreadyVotedKey: 'Already Voted Key Test Project',
    leading: 'Leading Proposal Test Project',
    switchToLeading: 'Switch to Leading Test Project',
    endToEnd: 'End-to-End Test Project',
  },

  proposals: {
    roadmap: {
      option1: 'Q1: Launch, Q2: Scale, Q3: Expand',
      option2: 'Q1: Beta, Q2: Production, Q3: Enterprise',
    },
    audit: {
      certik: 'Audited by CertiK in Q4 2023',
      openzeppelin: 'Audited by OpenZeppelin in Q1 2024',
    },
  },

  errors: {
    projectNotFound: 'Project not found',
    itemNotFound: 'Item not found',
    keyEmpty: 'Key cannot be empty',
    itemProposalNotFound: 'Item proposal not found',
    targetNotFound: 'Target item proposal not found',
    noVoteToSwitch: 'No conflicting vote found to switch',
    alreadyVoted:
      'You have already voted for this key in the target item proposal',
    alreadyVotedForKey: 'You have already voted for this key in this project',
  },
};

// Test verification helpers
export const QUORUM_AMOUNT = 3;
export const REWARD_MULTIPLIER = 0.2; // 20% reward
