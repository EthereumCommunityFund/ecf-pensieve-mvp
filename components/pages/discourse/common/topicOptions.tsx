import {
  ChartLine,
  Code,
  Dna,
  GlobeSimple,
  HandPointing,
  Headset,
  NewspaperClipping,
  Question,
  Scales,
  UsersFour,
  Warning,
} from '@phosphor-icons/react';
import { ReactNode } from 'react';

export type DiscourseTopicOption = {
  value: string;
  label: string;
  icon: ReactNode;
  cpRequirement?: number;
};

export const SCAM_CP_REQUIREMENT = 9000;

export const discourseTopicOptions: DiscourseTopicOption[] = [
  {
    value: 'general',
    label: 'General Issue',
    icon: <Question size={20} weight="fill" className="opacity-50" />,
  },
  {
    value: 'financial',
    label: 'Financial Loss / Token Issues',
    icon: <ChartLine size={20} weight="fill" className="opacity-50" />,
  },
  {
    value: 'scam',
    label: 'Scam & Fraud Concerns',
    icon: <Warning size={20} weight="fill" className="opacity-50" />,
    cpRequirement: SCAM_CP_REQUIREMENT,
  },
  {
    value: 'governance',
    label: 'Governance & DAO',
    icon: <Scales size={20} weight="fill" className="opacity-50" />,
  },
  {
    value: 'technical',
    label: 'Technical Failures / Security',
    icon: <Code size={20} weight="fill" className="opacity-50" />,
  },
  {
    value: 'support',
    label: 'Customer Support & Comms',
    icon: <Headset size={20} weight="fill" className="opacity-50" />,
  },
  {
    value: 'marketing',
    label: 'Marketing & Transparency',
    icon: <NewspaperClipping size={20} weight="fill" className="opacity-50" />,
  },
  {
    value: 'ux',
    label: 'User Experience & Usability',
    icon: <HandPointing size={20} weight="fill" className="opacity-50" />,
  },
  {
    value: 'regulatory',
    label: 'Regulatory & Compliance',
    icon: <GlobeSimple size={20} weight="fill" className="opacity-50" />,
  },
  {
    value: 'community',
    label: 'Community & Reputation',
    icon: <UsersFour size={20} weight="fill" className="opacity-50" />,
  },
  {
    value: 'ethics',
    label: 'Ethical & Value Concerns',
    icon: <Dna size={20} weight="fill" className="opacity-50" />,
  },
  {
    value: 'misc',
    label: 'Misc',
    icon: <Question size={20} weight="fill" className="opacity-50" />,
  },
] as const;
