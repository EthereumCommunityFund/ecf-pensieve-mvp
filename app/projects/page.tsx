'use client';

import { Image } from '@heroui/react';

import ECFButton from '@/components/base/button';
import ECFTypography from '@/components/base/typography';
import ProjectCard from '@/components/pages/home/projectCard';
import { MockProjectListData } from '@/components/pages/home/homeList';
import RewardCard from '@/components/pages/projects/rewardCard';

const ProjectsPage = () => {
	const handleProposeProject = () => {
		console.log('Propose a Project');
	};

	return (
		<div className="pb-10">
			<div className="flex justify-start items-start gap-5 bg-white w-full p-5 rounded-[10px] border border-[rgba(0, 0, 0, 0.1)]">
				<Image
					src="/images/projects/logo.png"
					alt="ECF project Logo"
					width={63}
					height={63}
				/>
				<div className="flex-1">
					<ECFTypography type={'title'}>Projects</ECFTypography>
					<ECFTypography type={'subtitle2'} className="mt-2.5">
						Explore projects and initiatives here or add your own to the list!
					</ECFTypography>
					<ECFButton onPress={handleProposeProject} className="mt-2.5">
						Propose a Project
					</ECFButton>
				</div>
			</div>

			<div className="mt-5 px-2.5 flex justify-between items-start gap-10 mobile:flex-col mobile:gap-5">
				<div className="lg:hidden pc:hidden tablet:hidden w-full flex justify-end items-center gap-2.5">
					<ECFButton $size="small">Sort</ECFButton>
					<ECFButton $size="small">Filter</ECFButton>
				</div>

				<div className="flex-1">
					<div className="opacity-80 px-2.5 py-2">
						<ECFTypography type={'subtitle1'}>Recent Projects</ECFTypography>
						<ECFTypography type={'body2'} className="mt-[5px]">
							Page Completion Rate (Transparency) * User Supported Votes
						</ECFTypography>
					</div>
					<div className="pb-2.5">
						{MockProjectListData.map((project) => (
							<ProjectCard key={project.id} project={project} showBorder={true} />
						))}
					</div>
				</div>

				<div className="mobile:hidden">
					<div className="flex h-[73px] justify-start items-start gap-5 w-[300px]">
						<ECFButton $size="small" className="px-2.5 min-w-0">
							Sort
						</ECFButton>
						<ECFButton $size="small" className="px-2.5 min-w-0">
							Filter
						</ECFButton>
					</div>

					<RewardCard />
				</div>

				<div className="lg:hidden pc:hidden tablet:hidden mt-5 w-full">
					<RewardCard />
				</div>
			</div>
		</div>
	);
};

export default ProjectsPage;
