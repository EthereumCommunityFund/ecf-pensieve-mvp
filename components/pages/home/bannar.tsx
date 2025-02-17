import { Image, cn } from '@heroui/react';
import NextImage from 'next/image';

const Bannar = () => {
	return (
		<div
			className={cn(
				'w-full h-[167px] overflow-hidden bg-white rounded-[10px] border border-[rgba(0,0,0,0.1)] p-5 relative bg-[url(/images/home/BannarBg.png)] bg-no-repeat ',
				'mobile:h-[auto] mobile:bg-none',
			)}
			style={{ backgroundPosition: 'right center', backgroundSize: 'auto 100%' }}
		>
			<div className="w-full h-full z-10">
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

			<div
				className={cn(
					'lg:hidden pc:hidden tablet:hidden absolute top-[28px] left-[178px] w-[500px] h-[300px] opacity-20 z-5',
					'bg-[url(/images/home/Cube.png)] bg-repeat bg-[length:100px_100px] bg-white grayscale-25',
				)}
			/>
		</div>
	);
};

export default Bannar;
