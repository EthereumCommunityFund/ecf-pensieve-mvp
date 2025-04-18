import ECFButton from '@/components/base/button';
import ECFTypography from '@/components/base/typography';

const RewardCard = () => {
  return (
    <div className="border-[rgba(0, 0, 0.1)] w-[300px] rounded-[10px] border bg-white p-5 mobile:w-full">
      <ECFTypography
        type={'subtitle2'}
        className="font-bold leading-[25px] text-[var(--primary-green)]"
      >
        ZERO-TO-ONE Rewards Promo
      </ECFTypography>
      <ECFTypography
        type={'body2'}
        className="mb-5 mt-2.5 leading-[18px] opacity-60"
      >
        Proposing new projects will certainly recieved a reward even if their
        proposal does not pass.
      </ECFTypography>
      <ECFButton className="h-[35px] w-full text-sm text-[var(--primary-green)] hover:text-[var(--primary-green)]">
        Start gaining rewards!
      </ECFButton>
    </div>
  );
};

export default RewardCard;
