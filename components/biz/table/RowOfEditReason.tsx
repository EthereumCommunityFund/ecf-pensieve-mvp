export const TableRowOfEditReason = ({
  reason,
  colspan,
}: {
  reason: string;
  colspan: number;
}) => {
  return (
    <tr className="bg-[#EBEBEB]">
      <td colSpan={colspan} className="min-h-0 border-0 px-[10px] py-[8px]">
        <p className="text-[13px] text-black">
          <span className="text-black/50">Edit Reason:</span> {reason}
        </p>
      </td>
    </tr>
  );
};
