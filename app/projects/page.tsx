import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Projects | ECF',
	description: 'Explore projects and initiatives here or add your own to the list!',
};

const ProjectsPage = () => {
	return (
		<div className="w-full min-h-screen bg-white">
			<div className="max-w-[1200px] mx-auto px-5 py-8">
				<div className="flex items-center justify-between mb-8 mobile:flex-col mobile:items-start mobile:gap-4">
					<div>
						<h1 className="text-3xl font-bold text-black opacity-80">Projects</h1>
						<p className="mt-2 text-base text-black opacity-60">
							Explore projects and initiatives here or add your own to the list!
						</p>
					</div>
					<button className="px-6 py-2.5 bg-black text-white rounded-lg hover:opacity-80 transition-opacity mobile:w-full">
						Propose a Project
					</button>
				</div>
			</div>
		</div>
	);
};

export default ProjectsPage;
