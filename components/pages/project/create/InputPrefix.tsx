import { FC } from 'react';

interface InputPrefixProps {
  prefix: string;
}

const InputPrefix: FC<InputPrefixProps> = ({ prefix }) => {
  return (
    <div className="mr-[4px] flex h-full items-center rounded-l-lg bg-[#E1E1E1] px-[10px]">
      <span className="text-[14px]font-semibold text-black opacity-40">
        {prefix}
      </span>
    </div>
  );
};

export default InputPrefix;
