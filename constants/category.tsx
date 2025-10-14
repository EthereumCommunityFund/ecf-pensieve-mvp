import AppWindowIcon from '@/components/icons/AppWindow';
import BuildingsIcon from '@/components/icons/Buildings';
import CodeIcon from '@/components/icons/CodeIcon';
import UsersFourIcon from '@/components/icons/UsersFour';

export const AllCategories = [
  {
    value: 'Network State',
    label: 'Network State',
    icon: <BuildingsIcon size={24} />,
  },
  {
    value: 'ZuVillage',
    label: 'ZuVillage',
    icon: <BuildingsIcon size={24} />,
  },
  {
    value: 'Applications/dApps',
    label: 'Applications/dApps',
    icon: <AppWindowIcon />,
  },
  {
    value: 'Community & Coordination',
    label: 'Community & Coordination',
    icon: <UsersFourIcon />,
  },
  {
    value: 'Developer tools',
    label: 'Developer tools',
    icon: <CodeIcon />,
  },
  { value: 'Hubs', label: 'Hubs', icon: <BuildingsIcon size={24} /> },
  {
    value: 'Infrastructure',
    label: 'Infrastructure',
    icon: <BuildingsIcon size={24} />,
  },
  {
    value: 'Security & Privacy',
    label: 'Security & Privacy',
    icon: <BuildingsIcon size={24} />,
  },
  {
    value: 'Storage & Data',
    label: 'Storage & Data',
    icon: <BuildingsIcon size={24} />,
  },
  { value: 'Events', label: 'Events', icon: <BuildingsIcon size={24} /> },
  {
    value: 'Local Communities',
    label: 'Local Communities',
    icon: <BuildingsIcon size={24} />,
  },
  { value: 'Other', label: 'Other', icon: <BuildingsIcon size={24} /> },
];
