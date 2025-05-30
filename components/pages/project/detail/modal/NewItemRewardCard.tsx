const NewItemRewardCard = () => {
  return (
    <div className="rounded-[10px] border border-black/10 bg-white p-[14px]">
      <p className="text-[18px] font-[700] leading-[25px] text-black">
        <span className="font-[800] italic text-[#64C0A5]">
          ZERO-TO-ONE{` `}
        </span>
        <span>{` `}Rewards Promo</span>
      </p>
      <p className="mt-[10px] text-[14px] font-[400] leading-[18px] text-black/60">
        You will receive a zero-to-one reward after submitting this proposal
      </p>
    </div>
  );
};

export default NewItemRewardCard;
