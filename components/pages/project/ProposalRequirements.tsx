import { Button } from '@/components/base/button';
import { InfoIcon } from '@/components/icons';
import {
  ESSENTIAL_ITEM_LIST,
  ESSENTIAL_ITEM_WEIGHT_SUM,
} from '@/lib/constants';

// TODO: add tooltip，number logic
const ProposalRequirements = () => {
  return (
    <div className="flex flex-col gap-[14px] rounded-[10px] border border-black/10 bg-white p-[14px]">
      <div>
        <p className="font-mona text-[18px] font-[700] leading-[25px] text-black">
          Proposal Requirements
        </p>
        <p className="mt-[10px] text-[14px] leading-[18px] text-black/60">
          These are the current requirements:
        </p>
      </div>

      <div className="flex flex-col gap-[10px] rounded-[10px] border border-black/10 bg-white p-[10px] text-[14px] leading-[20px] text-black">
        <div className="flex flex-col gap-[10px]">
          <div className="flex items-center justify-between gap-[14px] opacity-50">
            <span className="text-[12px] font-[600]">
              For Project Proposals:
            </span>
            <Button isIconOnly className="size-[20px]">
              <InfoIcon size={20} />
            </Button>
          </div>

          <div className="flex items-center justify-between gap-[14px]">
            <span>Essential Items</span>
            <span className="font-mona font-[500]">
              {ESSENTIAL_ITEM_LIST.length}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-[10px] border-t border-black/10 pt-[10px]">
          <div className="flex items-center justify-between gap-[14px] opacity-50">
            <span className="text-[12px] font-[600]">
              Community Verification:
            </span>
            <Button isIconOnly className="size-[20px]">
              <InfoIcon size={20} />
            </Button>
          </div>
          <div className="flex items-center justify-between gap-[14px]">
            <span>Quorum Required</span>
            <p className="font-mona font-[500]">
              3 <span className="text-[11px] font-[400]">/per item</span>
            </p>
          </div>
          <div className="flex items-center justify-between gap-[14px]">
            <span>Weight Required</span>
            <span className="font-mona font-[500]">
              {ESSENTIAL_ITEM_WEIGHT_SUM}
            </span>
          </div>
        </div>
      </div>

      <div className="text-center text-[12px] text-black/45 ">
        Community Validation v0.0.1
      </div>
    </div>
  );
};

export default ProposalRequirements;
