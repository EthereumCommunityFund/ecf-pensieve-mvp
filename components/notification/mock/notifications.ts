import {
  FrontendNotificationType,
  NotificationItemData,
} from '@/components/notification/NotificationItem';

const projects = [
  'DeFi Protocol Alpha',
  'Web3 Gaming Platform',
  'NFT Marketplace Beta',
  'Cross-chain Bridge',
  'DAO Governance Tool',
  'Metaverse World',
  'Layer 2 Solution',
  'Privacy Network',
  'Social DApp',
  'AI Trading Bot',
  'Smart Contract Audit',
  'Token Launchpad',
  'Yield Farming Protocol',
  'DEX Aggregator',
  'Oracle Network',
  'Identity Management',
  'Staking Platform',
  'Insurance Protocol',
  'Lending Platform',
  'Prediction Market',
];

const items = [
  'Project Name',
  'Token Symbol',
  'Whitepaper',
  'Team Information',
  'Roadmap',
  'Tokenomics',
  'Smart Contract',
  'Website URL',
  'Social Media',
  'Documentation',
  'GitHub Repository',
  'Audit Report',
  'Partnership',
  'Funding Round',
  'Use Cases',
  'Technology Stack',
];

const users = [
  'Alice Chen',
  'Bob Smith',
  'Carol Wang',
  'David Lee',
  'Emma Johnson',
  'Frank Zhang',
  'Grace Kim',
  'Henry Wilson',
  'Ivy Liu',
  'Jack Brown',
  'Kate Davis',
  'Leo Garcia',
  'Mia Rodriguez',
  'Noah Taylor',
  'Olivia Martinez',
  'Paul Anderson',
  'Quinn Thompson',
  'Rachel White',
  'Sam Harris',
  'Tina Clark',
];

const timeOptions = [
  '1m ago',
  '5m ago',
  '15m ago',
  '30m ago',
  '1h ago',
  '2h ago',
  '3h ago',
  '5h ago',
  '8h ago',
  '12h ago',
  '1d ago',
  '2d ago',
  '3d ago',
  '5d ago',
  '1w ago',
  '2w ago',
  '1mo ago',
];

const getRandomItem = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];
const getRandomBool = () => Math.random() > 0.5;
const getRandomId = () => Math.floor(Math.random() * 1000) + 1;

const notificationTypes: FrontendNotificationType[] = [
  'itemProposalLostLeading',
  'itemProposalBecameLeading',
  'itemProposalSupported',
  'itemProposalPassed',
  'itemProposalPass',
  'proposalPassed',
  'projectPublished',
  'proposalSupported',
  'createProposal',
  'createItemProposal',
  'contributionPoints',
  'systemUpdate',
  'newItemsAvailable',
  'default',
];

export const mockNotifications: NotificationItemData[] = notificationTypes
  .map((type, index) => {
    const id = (index + 1).toString();
    const isRead = getRandomBool();
    const timeAgo = getRandomItem(timeOptions);
    const projectName = getRandomItem(projects);
    const itemName = getRandomItem(items);
    const userName = getRandomItem(users);
    const projectId = getRandomId();
    const proposalId = getRandomId();

    const baseData = {
      id,
      timeAgo,
      isRead,
      projectName,
      projectId,
    };

    switch (type) {
      case 'itemProposalLostLeading':
        return {
          ...baseData,
          type,
          title: `Your input has lost sufficient support ${itemName} in ${projectName}`,
          itemName,
          buttonText: 'View Submission',
        } as NotificationItemData;

      case 'itemProposalBecameLeading':
        return {
          ...baseData,
          type,
          title: `Your input for ${itemName} in ${projectName} is now leading`,
          itemName,
          buttonText: 'View Submission',
          hasMultipleActions: getRandomBool(),
        } as NotificationItemData;

      case 'itemProposalSupported':
        return {
          ...baseData,
          type,
          title: `${userName} has supported your input for ${itemName} in ${projectName}`,
          itemName,
          userName,
          buttonText: 'View Submission',
        } as NotificationItemData;

      case 'proposalSupported':
        return {
          ...baseData,
          type,
          proposalId,
          title: `${userName} has supported your proposal for ${projectName}`,
          userName,
          buttonText: 'View Proposal',
        } as NotificationItemData;

      case 'itemProposalPassed':
        return {
          ...baseData,
          type,
          title: `Your item proposal for ${itemName} in ${projectName} has passed!`,
          itemName,
          buttonText: 'View Submission',
        } as NotificationItemData;

      case 'proposalPassed':
        return {
          ...baseData,
          type,
          proposalId,
          title: `Your proposal for ${projectName} has passed!`,
          buttonText: 'View Proposal',
          hasMultipleActions: true,
          secondaryButtonText: 'View Published Project',
        } as NotificationItemData;

      case 'projectPublished':
        return {
          ...baseData,
          type,
          title: `The pending project ${projectName} you have contributed to has now been published`,
          buttonText: 'View Published Project',
          hasMultipleActions: getRandomBool(),
        } as NotificationItemData;

      case 'contributionPoints':
      case 'createProposal':
      case 'proposalPass':
      case 'createItemProposal':
      case 'itemProposalPass':
        const points = [10, 25, 50, 100, 150, 200, 500];
        const pointValue = getRandomItem(points);
        return {
          ...baseData,
          type,
          title: `You have gained ${pointValue} Contribution Points for ${projectName}`,
          itemName: pointValue.toString(),
          buttonText: 'View Contribution',
          hideButton: true,
        } as NotificationItemData;

      case 'systemUpdate':
        const updateMessages = [
          'New feature: Advanced voting mechanism',
          'Security update: Enhanced wallet integration',
          'Platform maintenance completed',
          'New project categories available',
          'Improved notification system',
        ];
        return {
          ...baseData,
          type,
          title: getRandomItem(updateMessages),
          buttonText: 'Learn More',
          hideButton: true,
        } as NotificationItemData;

      case 'newItemsAvailable':
        return {
          ...baseData,
          type,
          title: 'New items available for contribution',
          buttonText: 'Explore Items',
          hideButton: true,
        } as NotificationItemData;

      default:
        const defaultMessages = [
          'Welcome to the platform!',
          'Your profile has been updated',
          'New community guidelines published',
          'Weekly digest available',
          'Platform usage statistics updated',
        ];
        return {
          ...baseData,
          type: 'default',
          title: getRandomItem(defaultMessages),
          buttonText: 'View Details',
          hideButton: true,
        } as NotificationItemData;
    }
  })
  .sort((a, b) => {
    const timeToMinutes = (timeStr: string): number => {
      const num = parseInt(timeStr);
      if (timeStr.includes('m')) return num;
      if (timeStr.includes('h')) return num * 60;
      if (timeStr.includes('d')) return num * 24 * 60;
      if (timeStr.includes('w')) return num * 7 * 24 * 60;
      if (timeStr.includes('mo')) return num * 30 * 24 * 60;
      return 0;
    };

    return timeToMinutes(a.timeAgo) - timeToMinutes(b.timeAgo);
  });
