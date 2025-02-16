import { Image } from '@heroui/react';
import NextImage from 'next/image';

const Bannar = () => {
	return (
		<div
			className="w-full h-[167px] bg-white rounded-[10px] border border-[rgba(0,0,0,0.1)] p-5 relative bg-[url(/images/home/BannarBg.png)] bg-no-repeat"
			style={{ backgroundPosition: 'right center', backgroundSize: 'auto 100%' }}
		>
			<div className="z-10 w-full h-full">
				<div>
					<span className="bg-[rgba(0,0,0,0.1)] border border-[rgba(0,0,0,0.2)] rounded-md px-2.5 py-1 text-[14px] font-semibold">
						ALPHA 0.1.0
					</span>
				</div>

				<p className="mt-2.5 font-saria text-black text-[38px] font-semibold">
					Welcome to{' '}
					<span className="text-[var(--primary-green)]">ecf.network,</span>{' '}
				</p>

				<div className="mt-[10px] text-black text-[18px]">
					A community-curated and governed platform to discover credible web3 projects.
				</div>
			</div>
		</div>
	);
};

export default Bannar;
