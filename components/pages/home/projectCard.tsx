'use client';

import { Image, cn, Link } from '@heroui/react';
import NextImage from 'next/image';

import { formatNumber, formatTimeAgo } from '@/lib/utils';
import ECFTypography from '@/components/base/typography';

import { IProject } from './homeList';

interface IProjectCardProps {
	project: IProject;
	showBorder?: boolean;
}

const ProjectCard = ({ project, showBorder = false }: IProjectCardProps) => {
	return (
		<div
			className={cn(
				showBorder && 'border-b border-[rgba(0, 0, 0, 0.1)]',
				'pb-[10px] pt-[10px]',
			)}
		>
			<Link
				href={`/project/${project.id}`}
				className="flex items-center justify-start mobile:items-start gap-5 cursor-pointer p-2.5 rounded-[10px] transition-colors duration-200 hover:bg-[rgba(0,0,0,0.05)]"
			>
				<div className="flex-1 flex items-start gap-[14px]">
					<div className="mobile:hidden w-[100px] h-[100px] rounded-[10px] overflow-hidden border border-[rgba(0, 0, 0, 0.1)]">
						<Image
							src={project.image}
							as={NextImage}
							alt={project.name}
							className="object-cover"
							width={100}
							height={100}
						/>
					</div>

					<div className="lg:hidden pc:hidden tablet:hidden w-[60px] h-[60px] rounded-[5px] overflow-hidden border border-[rgba(0, 0, 0, 0.1)]">
						<Image
							src={project.image}
							as={NextImage}
							alt={project.name}
							className="object-cover"
							width={60}
							height={60}
						/>
					</div>

					<div className="flex-1 max-w-[440px] mobile:max-w-full">
						<ECFTypography type={'body1'} className="leading-[18px] font-semibold">
							{project.name}
						</ECFTypography>
						<ECFTypography
							type={'body2'}
							className="mt-[6px] leading-[18px] opacity-65"
						>
							{project.description}
						</ECFTypography>
						<p className="mt-[6px] text-[11px] leading-[18px] text-[rgba(0, 0, 0, 0.8)]">
							<span className="opacity-60">by: </span>
							<span className="mx-[6px] underline font-bold">
								@{project.admin}
							</span>{' '}
							<span className="opacity-60">{formatTimeAgo(project.time)}</span>
						</p>
						<div className="mt-[10px] flex flex-wrap gap-[8px]">
							{project.tags.map((tag) => (
								<div
									key={tag}
									className="h-[22px] px-3 flex items-center justify-center rounded-[6px] bg-[rgba(0,0,0,0.05)]"
								>
									<span className='text-[12px] leading-[12px] text-black font-semibold'>{tag}</span>
								</div>
							))}
						</div>
					</div>
				</div>

				<div className="flex-col items-center justify-center gap-[4px] text-center">
					<div
						className={cn(
							'mx-auto flex items-center justify-center w-[40px] h-[40px] rounded-lg',
							project.hasVoted
								? 'bg-[var(--primary-green)]'
								: 'bg-[rgba(0,0,0,0.05)] hover:bg-[rgba(0,0,0,0.1)]',
						)}
					>
						<Image
							src={
								project.hasVoted
									? '/images/common/CaretUpLight.png'
									: '/images/common/CaretUpDark.png'
							}
							as={NextImage}
							alt={'vote'}
							width={24}
							height={24}
						/>
					</div>
					<p className="text-[13px] leading-[20px] text-black font-semibold font-saria opacity-60">
						{formatNumber(project.voteCount)}
					</p>
					<p className="text-[11px] leading-[17px] text-[rgba(0, 0, 0, 0.7)] font-semibold font-saria opacity-60">
						{formatNumber(project.memberCount)}
					</p>
				</div>
			</Link>
		</div>
	);
};

export default ProjectCard;
