import { Image } from '@heroui/react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';

const CardListData = [
  {
    title: 'Add Your Favorite Projects',
    description:
      'Help expand the Web3 knowledge base. Propose new pages for the projects you use, love, or want others to discover.',
    bgImage: '/images/home/CardBgPenNib.png',
    actionName: 'Propose a Project',
  },
  {
    title: 'Vote For Trusted Projects',
    description:
      'Contribute by validating info, reviewing new entries, and endorsing the projects you trust. Community votes power publication.',
    bgImage: '/images/home/CardBgPuzzlePiece.png',
    actionName: 'Explore The Index',
  },
  {
    title: 'Claim Rewards',
    description:
      'Your contributions count. Earn rewards for adding or verifying project pages.',
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
        <div className="flex min-w-fit flex-nowrap items-stretch gap-5">
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
      className="pc:w-auto pc:flex-1 tablet:w-[373px] mobile:w-[300px] mobile:gap-[10px] group relative flex shrink-0 flex-col gap-[10px]
				overflow-hidden 
				rounded-md
				border border-black/10 
				bg-white px-[19px] py-5 hover:border-black/20 lg:w-auto lg:flex-1"
      style={{
        cursor: props.disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <div className="flex flex-col gap-[10px]">
        <p className="font-mona text-[18px] font-[700] leading-[25px] text-black">
          {props.title}
        </p>
        <p className="text-[14px] font-[400] leading-[1.6] text-black/80">
          {props.description}
        </p>
      </div>

      <div
        className="absolute bottom-0 right-0 size-[140px] bg-cover bg-center bg-no-repeat opacity-80"
        style={{
          backgroundImage: `url(${props.bgImage})`,
        }}
      />

      <div className="mt-auto">{props.children}</div>
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
      className="inset-x-0 flex h-[24px] w-full items-center justify-start gap-2"
      style={{
        opacity: !props.onClick ? '0.5' : '1',
      }}
      onClick={props.onClick}
    >
      {!props.onClick && (
        <div className="size-[8px] rounded-[8px] bg-black"></div>
      )}
      <p className="text-[14px] font-[700] text-black">{props.title}</p>
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
