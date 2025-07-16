import { TableCell } from '@/components/biz/table/Cell';
import { TableHeader } from '@/components/biz/table/Header';
import { TableRow } from '@/components/biz/table/Row';
import { TableContainer } from '@/components/biz/table/TableContainer';

import { IColumnConfig } from './GenericFormItemTable'; // Reusing the column config

interface GenericTableDisplayProps<T> {
  data: T[];
  columns: IColumnConfig<T>[];
}

export function GenericTableDisplay<T extends Record<string, any>>({
  data,
  columns,
}: GenericTableDisplayProps<T>) {
  if (!Array.isArray(data) || data.length === 0) {
    return null; // Or some placeholder for empty data
  }

  return (
    <div className="w-full">
      <TableContainer bordered rounded background="white">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-[#F5F5F5]">
              {columns.map((col, index) => (
                <TableHeader
                  key={String(col.accessor)}
                  isLast={index === columns.length - 1}
                  isContainerBordered
                >
                  <div className="flex items-center gap-[5px]">
                    <span>{col.header}</span>
                  </div>
                </TableHeader>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, rowIndex) => (
              <TableRow key={rowIndex} isLastRow={rowIndex === data.length - 1}>
                {columns.map((col, colIndex) => (
                  <TableCell
                    key={String(col.accessor)}
                    isLast={colIndex === columns.length - 1}
                    isContainerBordered
                    isLastRow={rowIndex === data.length - 1}
                  >
                    {item[col.accessor]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </tbody>
        </table>
      </TableContainer>
    </div>
  );
}
