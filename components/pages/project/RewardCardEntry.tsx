import { Button } from '@/components/base/button';

const RewardCard = () => {
  return (
    <div className="mobile:w-full w-[300px] rounded-[10px] border border-black/10 bg-white p-[14px]">
      <p className="text-[18px] font-[700] leading-[25px] text-black">
        <span className="font-[800] italic text-[#64C0A5]">
          ZERO-TO-ONE{` `}
        </span>
        <span>{` `}Rewards Promo</span>
      </p>
      <p className="mt-[10px] text-[14px] font-[400] leading-[18px] text-black/60">
        Proposing new projects will certainly received a reward even if their
        proposal does not pass.
      </p>
      <div className="mt-[20px]">
        <Button
          className="w-full rounded-[8px] border-none bg-black/5"
          onPress={() => {
            window.open(
              'https://ethereum-community-fund.gitbook.io/the-ecf-pensieve-decentralised-social-consensus',
              '_blank',
            );
          }}
        >
          Learn More
        </Button>
      </div>
    </div>
  );
};

export default RewardCard;
