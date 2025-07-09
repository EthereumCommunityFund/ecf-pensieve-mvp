import { NotificationItemData } from '@/components/notification/NotificationItem';

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

export const mockNotifications: NotificationItemData[] = Array.from(
  { length: 50 },
  (_, index) => {
    const id = (index + 1).toString();
    const isRead = getRandomBool();
    const timeAgo = getRandomItem(timeOptions);
    const projectName = getRandomItem(projects);
    const itemName = getRandomItem(items);
    const userName = getRandomItem(users);

    // 根据索引循环使用不同类型
    const types = [
      'itemProposalLostLeading',
      'itemProposalBecameLeading',
      'itemProposalSupported',
      'proposalPassed',
      'projectPublished',
      'contributionPoints',
      'systemUpdate',
      'newItemsAvailable',
      'default',
    ];

    const type = types[index % types.length] as NotificationItemData['type'];

    // 根据类型生成相应的通知内容
    switch (type) {
      case 'itemProposalLostLeading':
        return {
          id,
          type,
          title: 'Your input has lost sufficient support',
          itemName,
          projectName,
          timeAgo,
          isRead,
          buttonText: 'View in Project',
        };

      case 'itemProposalBecameLeading':
        return {
          id,
          type,
          title: 'Your input is now leading',
          itemName,
          projectName,
          timeAgo,
          isRead,
          buttonText: 'View Submissions',
          hasMultipleActions: getRandomBool(),
          secondaryButtonText: getRandomBool() ? 'Share Update' : undefined,
        };

      case 'itemProposalSupported':
        return {
          id,
          type,
          title: 'Your input has been supported',
          itemName,
          projectName,
          userName,
          timeAgo,
          isRead,
          buttonText: 'View Submission',
        };

      case 'proposalPassed':
        return {
          id,
          type,
          title: 'Your proposal has passed!',
          projectName,
          timeAgo,
          isRead,
          buttonText: 'View Proposal',
          hasMultipleActions: true,
          secondaryButtonText: 'View Published Project',
        };

      case 'projectPublished':
        return {
          id,
          type,
          title: 'Project has been published',
          projectName,
          timeAgo,
          isRead,
          buttonText: 'View Published Project',
          hasMultipleActions: getRandomBool(),
          secondaryButtonText: getRandomBool() ? 'Share Project' : undefined,
        };

      case 'contributionPoints':
        const points = [10, 25, 50, 100, 150, 200, 500];
        return {
          id,
          type,
          title: 'You have gained contribution points',
          itemName: getRandomItem(points).toString(),
          timeAgo,
          isRead,
          buttonText: 'View Contribution',
        };

      case 'systemUpdate':
        const updateMessages = [
          'New feature: Advanced voting mechanism',
          'Security update: Enhanced wallet integration',
          'Platform maintenance completed',
          'New project categories available',
          'Improved notification system',
        ];
        return {
          id,
          type,
          title: getRandomItem(updateMessages),
          timeAgo,
          isRead,
          buttonText: 'Learn More',
          hideButton: getRandomBool(),
        };

      case 'newItemsAvailable':
        return {
          id,
          type,
          title: 'New items available for contribution',
          projectName,
          timeAgo,
          isRead,
          buttonText: 'Explore Items',
        };

      default:
        const defaultMessages = [
          'Welcome to the platform!',
          'Your profile has been updated',
          'New community guidelines published',
          'Weekly digest available',
          'Platform usage statistics updated',
        ];
        return {
          id,
          type,
          title: getRandomItem(defaultMessages),
          timeAgo,
          isRead,
          buttonText: 'View Details',
          hideButton: getRandomBool(),
        };
    }
  },
).sort((a, b) => {
  // 按时间排序：最新的在前
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
