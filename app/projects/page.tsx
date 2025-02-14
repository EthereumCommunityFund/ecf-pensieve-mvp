'use client';

export default function ProjectsPage() {
	return (
		<div className="min-h-screen">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<h1 className="text-4xl font-bold font-special">Projects</h1>
				<p className="mt-4 text-gray-600">
					A community-curated and governed platform to discover credible web3 projects.
				</p>
				{/* 项目列表占位 */}
				<div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					<div className="bg-white p-6 rounded-lg border border-gray-200">
						<h3 className="text-lg font-medium">Project Name</h3>
						<p className="mt-2 text-gray-600">Project description...</p>
					</div>
					{/* 更多项目卡片 */}
				</div>
			</div>
		</div>
	);
}
