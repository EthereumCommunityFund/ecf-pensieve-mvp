import { FC } from 'react';

interface IProps {
  title: string;
  description: string;
}

const TableSectionHeader: FC<IProps> = ({ title, description }) => {
  return (
    <div className="flex flex-col gap-[5px]">
      <p className="text-[20px] font-[700] leading-[27px] text-black">
        {title}
      </p>
      <p className="text-[14px] font-[600] leading-[19px] text-black/40">
        {description}
      </p>
    </div>
  );
};

export default TableSectionHeader;
