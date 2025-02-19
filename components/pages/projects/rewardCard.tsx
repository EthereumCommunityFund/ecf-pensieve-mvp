import ECFButton from '@/components/base/button';
import ECFTypography from '@/components/base/typography';

const RewardCard = () => {
	return (
		<div className="bg-white w-[300px] mobile:w-full p-5 rounded-[10px] border border-[rgba(0, 0, 0, 0.1)]">
			<ECFTypography type={'subtitle2'} className="text-[var(--primary-green)]">
				ZERO-TO-ONE Rewards Promo
			</ECFTypography>
			<ECFTypography type={'body2'} className="mt-2.5 mb-2.5 opacity-60">
				Proposing new projects will certainly recieved a reward even if their proposal does
				not pass.
			</ECFTypography>
			<ECFButton className="w-full h-[35px] text-sm text-[var(--primary-green)] hover:text-[var(--primary-green)]">
				Start gaining rewards!
			</ECFButton>
		</div>
	);
};

export default RewardCard;
