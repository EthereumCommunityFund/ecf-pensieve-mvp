import { Image } from '@heroui/react';
import NextImage from 'next/image';

const CardListData = [
	{
		title: 'Propose a project',
		description:
			'Propose projects, participate with the community to verify on proposals, then contribute on project pages and gain rewards! ',
		bgImage: '/images/home/PenNib.png',
		actionName: 'Propose a Project',
	},
	{
		title: 'Explore the Index',
		description:
			'Use your gained experience around the index to support quality contributors and boost projects you care about.',
		bgImage: '/images/home/PuzzlePiece.png',
		actionName: 'Explore The Index',
	},
	{
		title: 'Coming soon',
		description:
			'Any web3 projects you contributed to is part of web3 history and illuminating for future. Find the project and claim your contributions here.',
		bgImage: '/images/home/Sword.png',
		actionName: 'Coming Soon',
	},
];

const CardList = () => {
	const proposeProject = () => {
		console.log('propose project');
	};

	const exploreIndex = () => {
		console.log('explore index');
	};

	return (
		<div className="mt-5 w-full">
			<div className="flex flex-nowrap gap-5 tablet:overflow-x-auto mobile:overflow-x-auto tablet:pb-5 scrollbar-hide">
				<CardItem
					title={CardListData[0].title}
					description={CardListData[0].description}
					bgImage={CardListData[0].bgImage}
				>
					<CardAction title={CardListData[0].title} onClick={proposeProject} />
				</CardItem>
				<CardItem
					title={CardListData[1].title}
					description={CardListData[1].description}
					bgImage={CardListData[1].bgImage}
				>
					<CardAction title={CardListData[1].title} onClick={exploreIndex} />
				</CardItem>
				<CardItem
					title={CardListData[2].title}
					description={CardListData[2].description}
					bgImage={CardListData[2].bgImage}
					disabled={true}
				>
					<CardAction title={CardListData[2].title} />
				</CardItem>
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
			className="group relative mobile:w-[300px] tablet:w-[373px] lg:flex-1 pc:flex-1 min-h-[245px] bg-white rounded-md p-5 border border-[rgba(0,0,0,0.1)] hover:border-[rgba(0,0,0,0.2)] overflow-hidden"
			style={{
				cursor: props.disabled ? 'not-allowed' : 'pointer',
			}}
		>
			{/* 背景图片容器 */}
			<div className="absolute right-[-40px] bottom-[-40px] w-[193px] h-[193px] transition-transform duration-300 ease-in-out group-hover:scale-120 mobile:hidden tablet:block">
				<Image
					src={props.bgImage}
					alt={props.title}
					as={NextImage}
					width={193}
					height={193}
					className="w-full h-full object-contain"
				/>
			</div>

			{/* 内容区域 */}
			<div className="relative z-10">
				<div className="text-[var(--primary-green)] font-saria text-2xl font-semibold">
					{props.title}
				</div>
				<div className="mt-[14px] min-h-[137px] text-base text-black font-semibold opacity-80">
					{props.description}
				</div>
				{props.children}
			</div>
		</div>
	);
};

interface ICardActionProps {
	title: string;
	onClick?: () => void;
}

const CardAction = (props: ICardActionProps) => {
	return (
		<div className="flex items-center justify-start w-full gap-2">
			{!props.onClick && (
				<div className="w-[8px] h-[8px] bg-[rgba(0,0,0,0.5)] rounded-[8px]"></div>
			)}
			<div className="text-base text-black font-bold">{props.title}</div>
			{props.onClick && (
				<Image
					src="/images/common/ArrowRight.png"
					alt="arrow-right"
					width={24}
					height={24}
					className="transition-transform duration-300 ease-in-out group-hover:translate-x-5"
				/>
			)}
		</div>
	);
};
