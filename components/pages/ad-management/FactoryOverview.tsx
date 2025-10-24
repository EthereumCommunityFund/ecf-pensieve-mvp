import { AddressValidator } from '@/lib/utils/addressValidation';

function FactoryOverview({
  slotIdCounter,
  treasury,
  governance,
}: {
  slotIdCounter: bigint;
  treasury: `0x${string}`;
  governance: `0x${string}`;
}) {
  const formattedSlotCounter = slotIdCounter.toString();
  const displayTreasury = AddressValidator.shortenAddress(treasury);
  const displayGovernance = AddressValidator.shortenAddress(governance);

  return (
    <div className="grid grid-cols-1 gap-3 rounded-[12px] border border-black/10 bg-white px-5 py-4 text-[13px] text-black/70 md:grid-cols-3">
      <div className="flex flex-col gap-[4px]">
        <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-black/50">
          Slot Counter
        </span>
        <span className="font-semibold text-black/80">
          {formattedSlotCounter}
        </span>
      </div>
      <div className="flex flex-col gap-[4px]">
        <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-black/50">
          Treasury
        </span>
        <span className="font-mono text-[13px] text-black/80">
          {displayTreasury}
        </span>
      </div>
      <div className="flex flex-col gap-[4px]">
        <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-black/50">
          Governance
        </span>
        <span className="font-mono text-[13px] text-black/80">
          {displayGovernance}
        </span>
      </div>
    </div>
  );
}

export default FactoryOverview;
