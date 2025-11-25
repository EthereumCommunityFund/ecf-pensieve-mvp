import {
  ChatTeardrop,
  CurrencyCircleDollar,
  GlobeHemisphereWest,
  Headphones,
  Lightning,
  MegaphoneSimple,
  NotePencil,
  Question,
  Scales,
  ShieldWarning,
  UsersThree,
} from '@phosphor-icons/react';
import { ReactNode } from 'react';

export type DiscourseTopicOption = {
  value: string;
  label: string;
  icon: ReactNode;
  cpRequirement?: string;
};

export const discourseTopicOptions: DiscourseTopicOption[] = [
  { value: 'general', label: 'General Issue', icon: <Question size={18} /> },
  {
    value: 'financial',
    label: 'Financial Loss / Token Issues',
    icon: <CurrencyCircleDollar size={18} />,
  },
  {
    value: 'scam',
    label: 'Scam & Fraud Concerns',
    icon: <ShieldWarning size={18} />,
    cpRequirement: '0000 CP',
  },
  {
    value: 'governance',
    label: 'Governance & DAO',
    icon: <NotePencil size={18} />,
  },
  {
    value: 'technical',
    label: 'Technical Failures / Security',
    icon: <Lightning size={18} />,
  },
  {
    value: 'support',
    label: 'Customer Support & Comms',
    icon: <Headphones size={18} />,
  },
  {
    value: 'marketing',
    label: 'Marketing & Transparency',
    icon: <MegaphoneSimple size={18} />,
  },
  {
    value: 'ux',
    label: 'User Experience & Usability',
    icon: <ChatTeardrop size={18} />,
  },
  {
    value: 'regulatory',
    label: 'Regulatory & Compliance',
    icon: <Scales size={18} />,
  },
  {
    value: 'community',
    label: 'Community & Reputation',
    icon: <UsersThree size={18} />,
  },
  {
    value: 'ethics',
    label: 'Ethical & Value Concerns',
    icon: <GlobeHemisphereWest size={18} />,
  },
  { value: 'misc', label: 'Misc', icon: <Question size={18} /> },
] as const;
