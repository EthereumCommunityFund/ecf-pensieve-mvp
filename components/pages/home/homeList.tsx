import { ECFButton } from '@/components/base/button';
import ECFTypography from '@/components/base/typography';

import ProjectList from './projectList';

export interface IProject {
  id: number;
  name: string;
  description: string;
  image: string;
  link: string;
  admin: string;
  time: number;
  tags: string[];
  hasVoted: boolean;
  voteCount: number;
  memberCount: number;
}

// TODO: get data from backend
export const MockProjectListData: IProject[] = [
  {
    id: 1,
    name: 'Ethereum Community Fund',
    description:
      'Status is a messenger, crypto wallet, and Web3 browser built with state of the art technology.',
    image:
      'https://framerusercontent.com/images/DR52ReCNMmZcc4aFYNUYxdKXU.jpg?scale-down-to=1024',
    link: 'https://via.placeholder.com/150',
    admin: 'drivenfast',
    time: 1739780943631,
    tags: ['Protocol', 'DAO'],
    voteCount: 6900,
    memberCount: 820,
    hasVoted: false,
  },
  {
    id: 2,
    name: 'Ethereum Community Fund',
    description:
      'Status is a messenger, crypto wallet, and Web3 browser built with state of the art technology.',
    image:
      'https://framerusercontent.com/images/DR52ReCNMmZcc4aFYNUYxdKXU.jpg?scale-down-to=1024',
    link: 'https://via.placeholder.com/150',
    admin: 'Admin 2',
    time: 1719780444631,
    tags: ['Tag 3', 'Tag 4'],
    voteCount: 55000,
    memberCount: 24000,
    hasVoted: true,
  },
  {
    id: 3,
    name: 'Ethereum Community Fund',
    description:
      'Status is a messenger, crypto wallet, and Web3 browser built with state of the art technology.',
    image:
      'https://framerusercontent.com/images/DR52ReCNMmZcc4aFYNUYxdKXU.jpg?scale-down-to=1024',
    link: 'https://via.placeholder.com/150',
    admin: 'Admin 3',
    time: 1639730943631,
    tags: ['Tag 5', 'Tag 6'],
    voteCount: 13498,
    memberCount: 3409,
    hasVoted: false,
  },
];

interface ISectionProps {
  title: string;
  description: string;
  buttonText?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

const SectionList = (props: ISectionProps) => {
  return (
    <div>
      <div
        className="mt-5 flex h-[65px] items-center
				justify-between px-[20px] mobile:h-auto
				mobile:flex-col mobile:items-start
				mobile:gap-2.5"
      >
        <div className="h-[57px] mobile:h-auto">
          <ECFTypography type={'subtitle1'} className="font-bold opacity-80">
            {props.title}
          </ECFTypography>
          <ECFTypography
            type={'body2'}
            className="mt-[5px] font-normal leading-[19px] opacity-80"
          >
            {props.description}
          </ECFTypography>
        </div>
        {props.buttonText && (
          <ECFButton
            $size={'small'}
            onPress={props.onClick}
            className="h-[31px] px-2.5 mobile:h-[31px] mobile:w-full"
          >
            {props.buttonText}
          </ECFButton>
        )}
      </div>
      {props.children}
    </div>
  );
};

const HomeList = () => {
  const viewAllProject = () => {
    console.log('view all project');
  };

  return (
    <div className="mt-5">
      <SectionList
        title="Top Transparent Projects"
        description="Page Completion Rate (Transparency) * User Supported Votes"
        buttonText="View All Projects"
        onClick={viewAllProject}
      >
        <ProjectList projectList={MockProjectListData} />
      </SectionList>
      <SectionList title="Top Secure Projects" description="LIST COMING SOON" />
      <SectionList
        title="Top Accountable Projects"
        description="LIST COMING SOON"
      />
      <SectionList
        title="Top Privacy Projects"
        description="LIST COMING SOON"
      />
    </div>
  );
};

export default HomeList;
