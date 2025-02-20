import { Image, cn } from '@heroui/react';
import NextImage from 'next/image';

import ECFTypography from '@/components/base/typography';

const Banner = () => {
	return (
		<div
			className={cn(
				'w-full h-[167px] mobile:h-[auto] overflow-hidden bg-white rounded-[10px] border border-[rgba(0,0,0,0.1)] p-5 relative ',
				'bg-[url(/images/home/BannerBg.png)] bg-no-repeat bg-right bg-[length:auto_100%]',
				'mobile:bg-none',
			)}
		>
			<div className="w-full h-full z-10">
				<div className="flex h-[25px]">
					<p className="h-[25px] bg-[rgba(0,0,0,0.1)] border border-[rgba(0,0,0,0.2)] rounded-md px-2.5 py-1 text-[14px] leading-[17px] tracking-[0.1] font-semibold">
						ALPHA 0.1.0
					</p>
				</div>

				<ECFTypography
					type={'title'}
					className="mt-2.5 mobile:text-[30px] mobile:leading-[42px]"
				>
					Welcome to{' '}
					<span className="text-[var(--primary-green)]">ecf.network,</span>{' '}
				</ECFTypography>

				<ECFTypography
					type={'subtitle2'}
					className="mt-2.5 mobile:text-base mobile:leading-[26px]"
				>
					A community-curated and governed platform to discover credible web3 projects.
				</ECFTypography>
			</div>

			<div
				className={cn(
					'lg:hidden pc:hidden tablet:hidden',
					'absolute top-[28px] left-[178px] bottom-0 right-0 opacity-40',
					'bg-[url(/images/home/Cube.png)] bg-repeat mobile:bg-[length:100px_100px] mix-blend-luminosity',
				)}
			/>
		</div>
	);
};

export default Banner;
