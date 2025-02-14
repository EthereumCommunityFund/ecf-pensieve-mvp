'use client';

export default function ContributePage() {
	return (
		<div className="min-h-screen">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<h1 className="text-4xl font-bold font-special">Contribute</h1>
				<p className="mt-4 text-gray-600">
					Propose projects, participate with the community to verify on proposals, then
					contribute on project pages and gain rewards!
				</p>
				{/* 贡献部分占位 */}
				<div className="mt-8 grid gap-6 md:grid-cols-2">
					<div className="bg-white p-6 rounded-lg border border-gray-200">
						<h3 className="text-lg font-medium">Propose a Project</h3>
						<p className="mt-2 text-gray-600">Submit your project proposal...</p>
						<button className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
							Start Proposal
						</button>
					</div>
					<div className="bg-white p-6 rounded-lg border border-gray-200">
						<h3 className="text-lg font-medium">Review Proposals</h3>
						<p className="mt-2 text-gray-600">Help verify community proposals...</p>
						<button className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
							View Proposals
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
