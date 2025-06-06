interface ProgressLineProps {
  /**
   * formatted percentage of the progress line
   */
  percentage?: string;
}

const ProgressLine = ({ percentage }: ProgressLineProps) => {
  return (
    <div className="flex h-[10px] flex-1 items-center justify-start rounded-[10px] bg-[#D7D7D7] p-[2px]">
      <div
        className="h-[6px] rounded-[10px] bg-black"
        style={{ width: percentage || '0%' }}
      />
    </div>
  );
};

export default ProgressLine;
