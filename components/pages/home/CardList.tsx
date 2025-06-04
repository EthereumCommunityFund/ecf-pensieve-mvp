import { Image } from '@heroui/react';
import { useRouter } from 'next/navigation';

import ECFTypography from '@/components/base/typography';
import { useAuth } from '@/context/AuthContext';

const CardListData = [
  {
    title: 'Propose & Contribute to Projects',
    description:
      'Propose projects, participate with the community to verify on proposals, then contribute on project pages and gain rewards! ',
    bgImage: '/images/home/CardBgPenNib.png',
    actionName: 'Propose a Project',
  },
  {
    title: 'Explore the Index',
    description:
      'Use your gained experience around the index to support quality contributors and boost projects you care about.',
    bgImage: '/images/home/CardBgPuzzlePiece.png',
    actionName: 'Explore The Index',
  },
  {
    title: 'Coming soon',
    description:
      'Any web3 projects you contributed to is part of web3 history and illuminating for future. Find the project and claim your contributions here.',
    bgImage: '/images/home/CardBgTreasureChest.png',
    actionName: 'Coming Soon',
  },
];

const CardList = () => {
  const { profile, showAuthPrompt } = useAuth();
  const router = useRouter();
  const proposeProject = () => {
    if (!profile) {
      showAuthPrompt();
      return;
    }
    router.push('/project/create');
  };

  const exploreIndex = () => {
    router.push('/projects');
  };

  return (
    <div className="mt-5 w-full">
      <div className="scrollbar-hide overflow-x-auto">
        <div className="flex min-w-fit flex-nowrap gap-5">
          <CardItem
            title={CardListData[0].title}
            description={CardListData[0].description}
            bgImage={CardListData[0].bgImage}
          >
            <CardAction
              title={CardListData[0].actionName}
              onClick={proposeProject}
            />
          </CardItem>
          <CardItem
            title={CardListData[1].title}
            description={CardListData[1].description}
            bgImage={CardListData[1].bgImage}
          >
            <CardAction
              title={CardListData[1].actionName}
              onClick={exploreIndex}
            />
          </CardItem>
          <CardItem
            title={CardListData[2].title}
            description={CardListData[2].description}
            bgImage={CardListData[2].bgImage}
            disabled={true}
          >
            <CardAction title={CardListData[2].actionName} />
          </CardItem>
        </div>
      </div>
    </div>
  );
};

export default CardList;

interface ICardItemProps {
  title: string;
  description: string;
  bgImage: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

const CardItem = (props: ICardItemProps) => {
  return (
    <div
      className="pc:w-auto pc:flex-1 tablet:w-[373px] mobile:w-[300px] group relative min-h-[245px] shrink-0 overflow-hidden rounded-md border border-[rgba(0,0,0,0.1)]
				bg-white 
				px-[19px]
				py-5 hover:border-[rgba(0,0,0,0.2)] 
				lg:w-auto lg:flex-1"
      style={{
        cursor: props.disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <div className="relative">
        <ECFTypography
          type={'subtitle1'}
          className="font-saria text-[var(--primary-green)]"
        >
          {props.title}
        </ECFTypography>
        <ECFTypography
          type={'body1'}
          className="mobile:min-h-0 mt-[14px] min-h-[130px] leading-[25.6px] text-[rgba(0,0,0,0.8)]"
        >
          {props.description}
        </ECFTypography>

        <div className="h-[24px]"></div>
      </div>

      <div
        className="absolute bottom-0 right-0 size-[140px] bg-cover bg-center bg-no-repeat opacity-80"
        style={{
          backgroundImage: `url(${props.bgImage})`,
        }}
      />

      {props.children}
    </div>
  );
};

interface ICardActionProps {
  title: string;
  onClick?: () => void;
}

const CardAction = (props: ICardActionProps) => {
  return (
    <div
      className="absolute inset-x-0 bottom-[19px] flex h-[24px] w-full items-center justify-start gap-2 px-5"
      style={{
        opacity: !props.onClick ? '0.5' : '1',
      }}
      onClick={props.onClick}
    >
      {!props.onClick && (
        <div className="size-[8px] rounded-[8px] bg-black"></div>
      )}
      <ECFTypography type={'body1'} className="font-bold">
        {props.title}
      </ECFTypography>
      {props.onClick && (
        <Image
          src="/images/common/ArrowRight.png"
          alt="arrow-right"
          width={24}
          height={24}
          className="transition-transform duration-300 ease-in-out group-hover:translate-x-[6px]"
        />
      )}
    </div>
  );
};
