'use client';

import { Image, cn, Link } from '@heroui/react';
import NextImage from 'next/image';

import { formatNumber, formatTimeAgo } from '@/lib/utils';

import { IProject } from './homeList';

interface IProjectCardProps {
	project: IProject;
	showBorder?: boolean;
}

const ProjectCard = ({ project, showBorder = false }: IProjectCardProps) => {
	return (
		<div
			className={cn(
				showBorder && 'border-t border-[rgba(0, 0, 0, 0.1)]',
				'mt-[10px] pt-[10px]',
			)}
		>
			<Link
				href={`/project/${project.id}`}
				className="flex items-center justify-start gap-5 cursor-pointer p-2.5 rounded-[10px] transition-colors duration-200 hover:bg-[rgba(0,0,0,0.05)]"
			>
				<div className="flex-1 flex items-start gap-[14px]">
					<div className="w-[100px] h-[100px] rounded-[10px] overflow-hidden border border-[rgba(0, 0, 0, 0.1)]">
						<Image
							src={project.image}
							as={NextImage}
							alt={project.name}
							width={100}
							height={100}
							className="object-cover"
						/>
					</div>

					<div className="flex-1">
						<p className="text-base text-black font-semibold">{project.name}</p>
						<p className="mt-[6px] text-sm text-black opacity-65">
							{project.description}
						</p>
						<p className="mt-[6px] text-[11px] leading-[14px] text-[rgba(0, 0, 0, 0.8)]">
							by:{' '}
							<span className="mx-[6px] underline font-bold">@{project.admin}</span>{' '}
							<span>{formatTimeAgo(project.time)}</span>
						</p>
						<div className="mt-[10px] flex flex-wrap gap-[8px]">
							{project.tags.map((tag) => (
								<span
									key={tag}
									className="px-3 py-1 text-[12px] text-black font-semibold rounded-[6px] bg-[rgba(0,0,0,0.05)]"
								>
									{tag}
								</span>
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
